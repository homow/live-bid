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
        return;
    }

    status_header(403);
    header('Content-Type: application/json; charset=utf-8');
    echo wp_json_encode(['errors' => [['message' => 'Forbidden']]]);
    exit;
});
