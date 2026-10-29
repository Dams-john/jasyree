<?php

class BunnyStorage
{
    public static function upload(string $relativePath, string $localTmpPath, string $mime): string
    {
        $zone = getenv('BUNNY_STORAGE_ZONE') ?: ($_ENV['BUNNY_STORAGE_ZONE'] ?? '');
        $key  = getenv('BUNNY_STORAGE_KEY') ?: ($_ENV['BUNNY_STORAGE_KEY'] ?? '');
        $cdn  = rtrim(getenv('BUNNY_CDN_BASE') ?: ($_ENV['BUNNY_CDN_BASE'] ?? ''), '/');

        if ($zone === '' || $key === '' || $cdn === '') {
            Response::error('Image storage is not configured.', 500);
        }

        $relativePath = ltrim(str_replace('\\', '/', $relativePath), '/');
        $url = 'https://storage.bunnycdn.com/' . rawurlencode($zone) . '/' . $relativePath;

        $body = file_get_contents($localTmpPath);
        if ($body === false) {
            Response::error('Could not read uploaded file.', 500);
        }

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST => 'PUT',
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'AccessKey: ' . $key,
                'Content-Type: ' . $mime,
            ],
        ]);
        $response = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);

        if ($response === false || $code < 200 || $code >= 300) {
            error_log('Bunny upload failed: HTTP ' . $code . ' ' . $err . ' ' . $response);
            Response::error('Failed to upload image to CDN.', 500);
        }

        return $cdn . '/' . $relativePath;
    }
}
