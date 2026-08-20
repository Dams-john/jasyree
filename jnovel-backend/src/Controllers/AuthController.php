<?php

require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Utils/Validator.php';
require_once __DIR__ . '/../Utils/TokenService.php';
require_once __DIR__ . '/../Utils/Mailer.php';
require_once __DIR__ . '/../Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

class AuthController
{
    private function body(): array
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    /** POST /api/auth/register */
    public function register(): void
    {
        $data = $this->body();

        (new Validator($data))
            ->required('name', 'Name')
            ->maxLength('name', 100)
            ->required('email', 'Email')
            ->email('email')
            ->required('password', 'Password')
            ->minLength('password', 8)
            ->validate();

        if (User::findByEmail($data['email'])) {
            Response::error('An account with this email already exists.', 409);
        }

        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);
        $userId = User::create(trim($data['name']), strtolower(trim($data['email'])), $passwordHash);

        $this->issueAndSendVerificationEmail($userId, $data['email'], $data['name']);

        $user = User::findById($userId);
        $tokens = TokenService::issueTokenPair($userId, 'reader');

        Response::success([
            'user' => User::toApiShape($user),
            'tokens' => $tokens,
        ], 'Account created. Please check your email to verify your account.', 201);
    }

    /** POST /api/auth/login */
    public function login(): void
    {
        $data = $this->body();

        (new Validator($data))
            ->required('email', 'Email')
            ->email('email')
            ->required('password', 'Password')
            ->validate();

        $user = User::findByEmail(strtolower(trim($data['email'])));

        if (!$user || empty($user['password_hash']) || !password_verify($data['password'], $user['password_hash'])) {
            Response::error('Incorrect email or password.', 401);
        }

        if ($user['status'] !== 'active') {
            Response::error('This account has been suspended. Contact support.', 403);
        }

        $tokens = TokenService::issueTokenPair((int) $user['id'], $user['role']);

        Response::success([
            'user' => User::toApiShape($user),
            'tokens' => $tokens,
        ], 'Logged in successfully.');
    }

    /** POST /api/auth/refresh */
    public function refresh(): void
    {
        $data = $this->body();
        (new Validator($data))->required('refresh_token', 'Refresh token')->validate();

        $tokens = TokenService::rotateRefreshToken($data['refresh_token']);
        if (!$tokens) {
            Response::error('Invalid or expired refresh token. Please log in again.', 401);
        }

        Response::success(['tokens' => $tokens], 'Token refreshed.');
    }

    /** POST /api/auth/logout */
    public function logout(): void
    {
        $data = $this->body();
        if (!empty($data['refresh_token'])) {
            TokenService::revokeRefreshToken($data['refresh_token']);
        }
        Response::success(null, 'Logged out.');
    }

    /** GET /api/auth/me — requires auth */
    public function me(): void
    {
        $userId = AuthMiddleware::requireUserId();
        $user = User::findById($userId);
        if (!$user) {
            Response::error('User not found.', 404);
        }
        Response::success(User::toApiShape($user));
    }

    /** POST /api/auth/forgot-password */
    public function forgotPassword(): void
    {
        $data = $this->body();
        (new Validator($data))->required('email', 'Email')->email('email')->validate();

        $user = User::findByEmail(strtolower(trim($data['email'])));

        // Always return success even if the email doesn't exist — don't leak account existence.
        if ($user) {
            $tokenPlain = bin2hex(random_bytes(32));
            $tokenHash = hash('sha256', $tokenPlain);
            $expiresAt = date('Y-m-d H:i:s', time() + 3600); // 1 hour

            $pdo = Database::connection();
            $stmt = $pdo->prepare("
                INSERT INTO password_resets (user_id, token_hash, expires_at)
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$user['id'], $tokenHash, $expiresAt]);

            $frontendUrl = appConfig()['app']['frontend_url'];
            $resetUrl = "{$frontendUrl}/reset-password?token={$tokenPlain}&email=" . urlencode($user['email']);
            Mailer::sendPasswordResetEmail($user['email'], $user['name'], $resetUrl);
        }

        Response::success(null, 'If an account with that email exists, a password reset link has been sent.');
    }

    /** POST /api/auth/reset-password */
    public function resetPassword(): void
    {
        $data = $this->body();
        (new Validator($data))
            ->required('token', 'Token')
            ->required('email', 'Email')
            ->required('password', 'Password')
            ->minLength('password', 8)
            ->required('password_confirmation', 'Password confirmation')
            ->matches('password_confirmation', 'password', 'password')
            ->validate();

        $user = User::findByEmail(strtolower(trim($data['email'])));
        if (!$user) {
            Response::error('Invalid or expired reset link.', 400);
        }

        $tokenHash = hash('sha256', $data['token']);
        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            SELECT id FROM password_resets
            WHERE user_id = ? AND token_hash = ? AND used_at IS NULL AND expires_at > NOW()
            ORDER BY id DESC LIMIT 1
        ");
        $stmt->execute([$user['id'], $tokenHash]);
        $resetRow = $stmt->fetch();

        if (!$resetRow) {
            Response::error('Invalid or expired reset link.', 400);
        }

        User::updatePassword((int) $user['id'], password_hash($data['password'], PASSWORD_BCRYPT));

        $markUsedStmt = $pdo->prepare("UPDATE password_resets SET used_at = NOW() WHERE id = ?");
        $markUsedStmt->execute([$resetRow['id']]);

        // Invalidate all existing sessions for security
        TokenService::revokeAllForUser((int) $user['id']);

        Response::success(null, 'Password reset successfully. Please log in with your new password.');
    }

    /** POST /api/auth/verify-email */
    public function verifyEmail(): void
    {
        $data = $this->body();
        (new Validator($data))->required('code', 'Code')->required('email', 'Email')->validate();

        $user = User::findByEmail(strtolower(trim($data['email'])));
        if (!$user) {
            Response::error('Invalid verification code.', 400);
        }

        if ($user['email_verified_at']) {
            Response::success(null, 'Email already verified.');
        }

        $codeHash = hash('sha256', trim($data['code']));
        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            SELECT id FROM email_verifications
            WHERE user_id = ? AND token_hash = ? AND expires_at > NOW()
            ORDER BY id DESC LIMIT 1
        ");
        $stmt->execute([$user['id'], $codeHash]);
        $row = $stmt->fetch();

        if (!$row) {
            Response::error('Invalid or expired verification code.', 400);
        }

        User::markEmailVerified((int) $user['id']);
        Response::success(null, 'Email verified successfully.');
    }

    /** POST /api/auth/resend-verification */
    public function resendVerification(): void
    {
        $data = $this->body();
        (new Validator($data))->required('email', 'Email')->email('email')->validate();

        $user = User::findByEmail(strtolower(trim($data['email'])));

        if ($user && !$user['email_verified_at']) {
            $this->issueAndSendVerificationEmail((int) $user['id'], $user['email'], $user['name']);
        }

        Response::success(null, 'If an unverified account with that email exists, a new verification link has been sent.');
    }

    /** POST /api/auth/google — accepts a Google ID token, verifies it, logs in/registers */
    public function google(): void
    {
        $data = $this->body();
        (new Validator($data))->required('id_token', 'Google ID token')->validate();

        $clientId = appConfig()['google']['client_id'];
        if (empty($clientId)) {
            Response::error('Google login is not configured yet.', 501);
        }

        // Verify the token with Google's tokeninfo endpoint
        $verifyUrl = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($data['id_token']);
        $context = stream_context_create(['http' => ['timeout' => 5]]);
        $response = @file_get_contents($verifyUrl, false, $context);
        $payload = $response ? json_decode($response, true) : null;

        if (!$payload || ($payload['aud'] ?? '') !== $clientId) {
            Response::error('Invalid Google token.', 401);
        }

        $user = User::findOrCreateBySocialId(
            'google',
            $payload['sub'],
            $payload['name'] ?? explode('@', $payload['email'])[0],
            $payload['email'],
            $payload['picture'] ?? null
        );

        $tokens = TokenService::issueTokenPair((int) $user['id'], $user['role']);
        Response::success(['user' => User::toApiShape($user), 'tokens' => $tokens], 'Logged in with Google.');
    }

    /** POST /api/auth/apple — accepts an Apple identity token, verifies it, logs in/registers */
    public function apple(): void
    {
        $data = $this->body();
        (new Validator($data))->required('identity_token', 'Apple identity token')->validate();

        $clientId = appConfig()['apple']['client_id'];
        if (empty($clientId)) {
            Response::error('Apple login is not configured yet.', 501);
        }

        // Apple identity tokens are JWTs signed by Apple's keys (JWKS at appleid.apple.com/auth/keys).
        // Full signature verification requires fetching & caching Apple's public keys — wire in once
        // APPLE_CLIENT_ID is set, following the same pattern as the Google flow above.
        Response::error('Apple login verification not yet fully implemented — add APPLE_CLIENT_ID and JWKS verification.', 501);
    }

    private function issueAndSendVerificationEmail(int $userId, string $email, string $name): void
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $codeHash = hash('sha256', $code);
        $expiresAt = date('Y-m-d H:i:s', time() + 900); // 15 minutes

        $pdo = Database::connection();
        $stmt = $pdo->prepare("
            INSERT INTO email_verifications (user_id, token_hash, expires_at)
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$userId, $codeHash, $expiresAt]);

        Mailer::sendVerificationEmail($email, $name, $code);
    }
}
