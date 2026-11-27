<?php
/**
 * Plugin Name: Live Bid GraphQL gate
 * Description: Only NestJS (shared secret) or a logged-in admin may call /graphql.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('graphql_process_http_request', function () {
    // Editors using the GraphiQL IDE inside wp-admin are logged in, let them through.
    if (is_user_logged_in() && current_user_can('manage_options')) {
        return;
    }

    $secret = (string) getenv('LIVEBID_GRAPHQL_SECRET');
    $sent   = (string) ($_SERVER['HTTP_X_LIVEBID_SECRET'] ?? '');

    // Fail closed: with no secret configured nobody but admins gets in.
    if ($secret !== '' && hash_equals($secret, $sent)) {
        // The secret proves this call is from Nest, so the visitor info it
        // forwards can be trusted. Without this, every comment would be stored
        // with Nest's IP and WordPress flood control would treat all visitors
        // as one person.
        $ip = trim((string) ($_SERVER['HTTP_X_LIVEBID_CLIENT_IP'] ?? ''));
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            $_SERVER['REMOTE_ADDR'] = $ip;
        }

        $agent = trim((string) ($_SERVER['HTTP_X_LIVEBID_CLIENT_USER_AGENT'] ?? ''));
        if ($agent !== '') {
            // Comment agent is stored as-is, so keep it to a sane length.
            $_SERVER['HTTP_USER_AGENT'] = substr($agent, 0, 254);
        }

        return;
    }

    status_header(403);
    header('Content-Type: application/json; charset=utf-8');
    echo wp_json_encode(['errors' => [['message' => 'Forbidden']]]);
    exit;
});
