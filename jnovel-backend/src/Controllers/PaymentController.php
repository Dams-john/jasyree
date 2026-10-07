<?php

require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../Utils/Response.php';
require_once __DIR__ . '/../Utils/Validator.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

class PaymentController
{
    private function body(): array
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    private function stripeRequest(string $method, string $path, array $params = []): array
    {
        $secret = appConfig()['stripe']['secret_key'] ?? '';
        if ($secret === '') {
            Response::error('Stripe is not configured.', 503);
        }

        $ch = curl_init('https://api.stripe.com/v1' . $path);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERPWD => $secret . ':',
            CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_POSTFIELDS => http_build_query($params),
        ]);
        $raw = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $json = json_decode($raw ?: '', true);
        if ($code >= 400 || !is_array($json)) {
            $msg = is_array($json) ? ($json['error']['message'] ?? 'Stripe error') : 'Stripe request failed';
            Response::error($msg, 502);
        }
        return $json;
    }

    /** GET /api/payments/coin-packages */
    public function listCoinPackages(): void
    {
        $pdo = Database::connection();
        $rows = $pdo->query("
            SELECT id, coins, price, currency, bonus, is_popular, is_best_value, image
            FROM coin_packages WHERE is_active = 1 ORDER BY sort_order ASC, id ASC
        ")->fetchAll();

        Response::success(array_map(fn($r) => [
            'id' => (int) $r['id'],
            'coins' => (int) $r['coins'],
            'price' => (float) $r['price'],
            'currency' => $r['currency'],
            'bonus' => (int) $r['bonus'],
            'isPopular' => (bool) $r['is_popular'],
            'isBestValue' => (bool) $r['is_best_value'],
            'image' => $r['image'],
        ], $rows));
    }

    /** GET /api/payments/subscription-plans */
    public function listSubscriptionPlans(): void
    {
        $pdo = Database::connection();
        $rows = $pdo->query("
            SELECT id, name, slug, price, currency, period, monthly_coins, features, color, is_popular, is_best_value
            FROM subscription_plans WHERE is_active = 1 ORDER BY sort_order ASC, id ASC
        ")->fetchAll();

        Response::success(array_map(function ($r) {
            $features = json_decode($r['features'] ?? '[]', true);
            return [
                'id' => (int) $r['id'],
                'name' => $r['name'],
                'slug' => $r['slug'],
                'price' => (float) $r['price'],
                'currency' => $r['currency'],
                'period' => $r['period'],
                'monthlyCoins' => (int) $r['monthly_coins'],
                'features' => is_array($features) ? $features : [],
                'color' => $r['color'],
                'isPopular' => (bool) $r['is_popular'],
                'isBestValue' => (bool) $r['is_best_value'],
            ];
        }, $rows));
    }

    /** POST /api/payments/checkout  body: { type: 'coin_package'|'subscription', id: number } */
    public function checkout(): void
    {
        $userId = AuthMiddleware::requireUserId();
        $data = $this->body();

        (new Validator($data))
            ->required('type', 'Type')
            ->required('id', 'Package or plan id')
            ->validate();

        $type = $data['type'];
        $refId = (int) $data['id'];
        if (!in_array($type, ['coin_package', 'subscription'], true)) {
            Response::error('type must be coin_package or subscription.', 422);
        }

        $pdo = Database::connection();
        if ($type === 'coin_package') {
            $stmt = $pdo->prepare("SELECT * FROM coin_packages WHERE id = ? AND is_active = 1");
            $stmt->execute([$refId]);
            $item = $stmt->fetch();
            if (!$item) {
                Response::error('Coin package not found.', 404);
            }
            $name = ((int) $item['coins'] + (int) $item['bonus']) . ' Coins';
            $amount = (float) $item['price'];
            $currency = strtolower($item['currency'] ?: 'ngn');
        } else {
            $stmt = $pdo->prepare("SELECT * FROM subscription_plans WHERE id = ? AND is_active = 1");
            $stmt->execute([$refId]);
            $item = $stmt->fetch();
            if (!$item) {
                Response::error('Subscription plan not found.', 404);
            }
            $name = $item['name'] . ' (' . $item['period'] . ')';
            $amount = (float) $item['price'];
            $currency = strtolower($item['currency'] ?: 'ngn');
        }

        // Stripe expects amount in the smallest currency unit (kobo for NGN)
        $unitAmount = (int) round($amount * 100);
        $frontend = explode(',', appConfig()['app']['frontend_url'])[0] ?? 'https://jasyre.com';
        $frontend = rtrim(trim($frontend), '/');

        $session = $this->stripeRequest('POST', '/checkout/sessions', [
            'mode' => 'payment',
            'success_url' => $frontend . '/wallet?payment=success',
            'cancel_url' => $frontend . '/wallet?payment=cancelled',
            'client_reference_id' => (string) $userId,
            'metadata[user_id]' => (string) $userId,
            'metadata[type]' => $type,
            'metadata[reference_id]' => (string) $refId,
            'line_items[0][quantity]' => 1,
            'line_items[0][price_data][currency]' => $currency,
            'line_items[0][price_data][unit_amount]' => $unitAmount,
            'line_items[0][price_data][product_data][name]' => $name,
        ]);

        $ins = $pdo->prepare("
            INSERT INTO payment_transactions (user_id, type, reference_id, amount, currency, provider, provider_ref, status)
            VALUES (?, ?, ?, ?, ?, 'stripe', ?, 'pending')
        ");
        $ins->execute([
            $userId,
            $type,
            $refId,
            $amount,
            strtoupper($currency),
            $session['id'] ?? null,
        ]);

        Response::success([
            'checkoutUrl' => $session['url'] ?? null,
            'sessionId' => $session['id'] ?? null,
        ]);
    }

    /** POST /api/payments/webhook — Stripe webhook (no auth) */
    public function webhook(): void
    {
        $payload = file_get_contents('php://input');
        $event = json_decode($payload ?: '', true);
        if (!is_array($event)) {
            Response::error('Invalid payload.', 400);
        }

        // Optional: verify signature when STRIPE_WEBHOOK_SECRET is set
        $whSecret = appConfig()['stripe']['webhook_secret'] ?? '';
        if ($whSecret !== '') {
            $sig = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
            if (!$this->verifyStripeSignature($payload, $sig, $whSecret)) {
                Response::error('Invalid signature.', 400);
            }
        }

        $type = $event['type'] ?? '';
        if ($type !== 'checkout.session.completed') {
            Response::success(['ignored' => true]);
        }

        $session = $event['data']['object'] ?? [];
        $sessionId = $session['id'] ?? '';
        $meta = $session['metadata'] ?? [];
        $userId = (int) ($meta['user_id'] ?? $session['client_reference_id'] ?? 0);
        $payType = $meta['type'] ?? '';
        $refId = (int) ($meta['reference_id'] ?? 0);

        if (!$sessionId || !$userId || !in_array($payType, ['coin_package', 'subscription'], true)) {
            Response::success(['skipped' => true]);
        }

        $pdo = Database::connection();
        $pdo->beginTransaction();
        try {
            $txStmt = $pdo->prepare("SELECT * FROM payment_transactions WHERE provider_ref = ? LIMIT 1 FOR UPDATE");
            $txStmt->execute([$sessionId]);
            $tx = $txStmt->fetch();

            if ($tx && $tx['status'] === 'successful') {
                $pdo->commit();
                Response::success(['already' => true]);
            }

            if ($tx) {
                $pdo->prepare("UPDATE payment_transactions SET status = 'successful' WHERE id = ?")
                    ->execute([$tx['id']]);
            } else {
                $amount = isset($session['amount_total']) ? ((float) $session['amount_total'] / 100) : 0;
                $currency = strtoupper($session['currency'] ?? 'NGN');
                $pdo->prepare("
                    INSERT INTO payment_transactions (user_id, type, reference_id, amount, currency, provider, provider_ref, status)
                    VALUES (?, ?, ?, ?, ?, 'stripe', ?, 'successful')
                ")->execute([$userId, $payType, $refId, $amount, $currency, $sessionId]);
            }

            if ($payType === 'coin_package') {
                $pkg = $pdo->prepare("SELECT coins, bonus FROM coin_packages WHERE id = ?");
                $pkg->execute([$refId]);
                $p = $pkg->fetch();
                $credit = $p ? ((int) $p['coins'] + (int) $p['bonus']) : 0;
                if ($credit > 0) {
                    $u = $pdo->prepare("SELECT coins FROM users WHERE id = ? FOR UPDATE");
                    $u->execute([$userId]);
                    $user = $u->fetch();
                    $newBal = (int) ($user['coins'] ?? 0) + $credit;
                    $pdo->prepare("UPDATE users SET coins = ? WHERE id = ?")->execute([$newBal, $userId]);
                    $pdo->prepare("
                        INSERT INTO coin_transactions (user_id, type, description, amount, balance_after, reference_type, reference_id)
                        VALUES (?, 'purchase', ?, ?, ?, 'coin_package', ?)
                    ")->execute([$userId, "Purchased {$credit} coins", $credit, $newBal, $refId]);
                }
            } else {
                $plan = $pdo->prepare("SELECT id, monthly_coins FROM subscription_plans WHERE id = ?");
                $plan->execute([$refId]);
                $pl = $plan->fetch();
                if ($pl) {
                    $end = date('Y-m-d H:i:s', strtotime('+30 days'));
                    $pdo->prepare("
                        INSERT INTO user_subscriptions (user_id, plan_id, status, started_at, current_period_end)
                        VALUES (?, ?, 'active', NOW(), ?)
                    ")->execute([$userId, $pl['id'], $end]);

                    $bonus = (int) $pl['monthly_coins'];
                    if ($bonus > 0) {
                        $u = $pdo->prepare("SELECT coins FROM users WHERE id = ? FOR UPDATE");
                        $u->execute([$userId]);
                        $user = $u->fetch();
                        $newBal = (int) ($user['coins'] ?? 0) + $bonus;
                        $pdo->prepare("UPDATE users SET coins = ? WHERE id = ?")->execute([$newBal, $userId]);
                        $pdo->prepare("
                            INSERT INTO coin_transactions (user_id, type, description, amount, balance_after, reference_type, reference_id)
                            VALUES (?, 'reward', ?, ?, ?, 'subscription_bonus', ?)
                        ")->execute([$userId, 'Subscription monthly coins', $bonus, $newBal, $refId]);
                    }
                }
            }

            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }

        Response::success(['ok' => true]);
    }

    private function verifyStripeSignature(string $payload, string $header, string $secret): bool
    {
        // Stripe-Signature: t=timestamp,v1=signature
        $parts = [];
        foreach (explode(',', $header) as $piece) {
            [$k, $v] = array_pad(explode('=', trim($piece), 2), 2, null);
            if ($k && $v) {
                $parts[$k] = $v;
            }
        }
        if (empty($parts['t']) || empty($parts['v1'])) {
            return false;
        }
        $signed = $parts['t'] . '.' . $payload;
        $expected = hash_hmac('sha256', $signed, $secret);
        return hash_equals($expected, $parts['v1']);
    }
}
