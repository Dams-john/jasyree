<?php

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../vendor/phpmailer/src/Exception.php';
require_once __DIR__ . '/../../vendor/phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/../../vendor/phpmailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

class Mailer
{
    /**
     * Sends an email via SMTP. Returns true on success, false on failure
     * (failures are logged, never thrown — auth flows shouldn't 500 just because SMTP hiccuped).
     */
    public static function send(string $toEmail, string $toName, string $subject, string $htmlBody): bool
    {
        $config = appConfig()['mail'];

        // No SMTP configured yet (e.g. local dev) — log instead of failing silently.
        if (empty($config['host'])) {
            $preview = trim(strip_tags($htmlBody));
            error_log("[Mailer] SMTP not configured. Would have sent to $toEmail: $subject\n$preview");
            return true;
        }

        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = $config['host'];
            $mail->SMTPAuth = true;
            $mail->Username = $config['user'];
            $mail->Password = $config['pass'];
            $mail->SMTPSecure = 'tls';
            $mail->Port = $config['port'];

            $mail->setFrom($config['from_address'], $config['from_name']);
            $mail->addAddress($toEmail, $toName);

            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;
            $mail->AltBody = strip_tags($htmlBody);

            $mail->send();
            return true;
        } catch (PHPMailerException $e) {
            error_log('[Mailer] Failed to send email: ' . $mail->ErrorInfo);
            return false;
        }
    }

    public static function sendVerificationEmail(string $toEmail, string $toName, string $code): bool
    {
        $subject = 'Your JNovel verification code';
        $body = "
            <div style='font-family: sans-serif; max-width: 480px; margin: 0 auto;'>
                <h2>Welcome to JNovel, {$toName}!</h2>
                <p>Enter this code in the app to verify your email address:</p>
                <p style='font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px; background: #f5f5f5; border-radius: 8px;'>{$code}</p>
                <p>This code expires in 15 minutes.</p>
            </div>
        ";
        return self::send($toEmail, $toName, $subject, $body);
    }

    public static function sendPasswordResetEmail(string $toEmail, string $toName, string $resetUrl): bool
    {
        $subject = 'Reset your JNovel password';
        $body = "
            <div style='font-family: sans-serif; max-width: 480px; margin: 0 auto;'>
                <h2>Password Reset Request</h2>
                <p>Hi {$toName}, we received a request to reset your password.</p>
                <p><a href='{$resetUrl}' style='display:inline-block;padding:12px 24px;background:#e91e8c;color:#fff;border-radius:8px;text-decoration:none;'>Reset Password</a></p>
                <p>Or copy this link: {$resetUrl}</p>
                <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
            </div>
        ";
        return self::send($toEmail, $toName, $subject, $body);
    }
}
