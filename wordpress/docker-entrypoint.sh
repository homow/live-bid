#!/usr/bin/env bash
set -euo pipefail

# Entrypoint for the Live Bid WordPress container.
# Order matters here:
#   1. The official entrypoint does its init first (core files, wp-config.php),
#      without starting Apache.
#   2. Every wp-cli command runs as www-data, never root, so WordPress never
#      ends up with root-owned files.
#   3. Ownership fixes run after all wp-cli work.
#   4. Apache takes over last and becomes PID 1.

WP_PATH=/var/www/html
WP_USER=www-data

# Plugins that must be present and active. They are baked into the image.
REQUIRED_PLUGINS=(wp-graphql advanced-media-offloader)

# Custom plugins that are bind-mounted from the repo (add names here later).
# We never chown these, since that would change file owners in the
# developer's working copy.
BIND_MOUNTED_PLUGINS=()

# Run a wp-cli command as the web user.
wp_as_user() {
  runuser -u "$WP_USER" -- wp --path="$WP_PATH" "$@"
}

# Non-critical wp-cli step: warn and keep going. One optional setting should
# never take the whole container down.
wp_step() {
  echo "→ Running: wp $*"
  if ! wp_as_user "$@"; then
    echo "⚠️  WARNING: step failed and was skipped: wp $*" >&2
  fi
}

# Check the database through PHP (mysqli), the same driver WordPress itself
# uses. `wp db check` shells out to the mysql CLI instead, and newer builds
# of it insist on verified TLS, which fails against MySQL 8's self-signed
# cert even though WordPress connects fine.
db_is_up() {
  # shellcheck disable=SC2016
  php -r '
    mysqli_report(MYSQLI_REPORT_OFF);
    $c = mysqli_connect(getenv("WORDPRESS_DB_HOST"), getenv("WORDPRESS_DB_USER"), getenv("WORDPRESS_DB_PASSWORD"), getenv("WORDPRESS_DB_NAME"));
    if (!$c) { fwrite(STDERR, mysqli_connect_error() . "\n"); exit(1); }
  '
}

is_bind_mounted() {
  local name="$1" p
  for p in "${BIND_MOUNTED_PLUGINS[@]}"; do
    [ "$p" = "$name" ] && return 0
  done
  return 1
}

# Fail early with a clear message instead of serving broken image links.
if [ -n "${S3_BUCKET:-}" ]; then
  for var in S3_ENDPOINT S3_ACCESS_KEY S3_SECRET_KEY S3_PUBLIC_URL; do
    if [ -z "${!var:-}" ]; then
      echo "ERROR: S3_BUCKET is set but $var is empty." >&2
      exit 1
    fi
  done
fi

# ---------------------------------------------------------------------------
# Step 1: init without starting Apache
# ---------------------------------------------------------------------------
echo "Initializing WordPress (core files + wp-config.php)..."
/usr/local/bin/docker-entrypoint.sh apache2-init-done

# ---------------------------------------------------------------------------
# Step 2: wait for the database
# ---------------------------------------------------------------------------
# The compose healthcheck only proves MySQL answers a ping. wp-cli needs a
# real connection, and `wp db check` is the cheapest way to prove we have one.
echo "Waiting for the database to accept connections..."
db_ready=0
db_error=""
for _ in $(seq 1 30); do
  if db_error="$(db_is_up 2>&1)"; then
    db_ready=1
    break
  fi
  sleep 2
done

if [ "$db_ready" -ne 1 ]; then
  # Not fatal: the container stays up, and since everything below is
  # idempotent, the next start simply retries.
  echo "⚠️  WARNING: database never became reachable; skipping setup. Last error: ${db_error}" >&2
fi

# ---------------------------------------------------------------------------
# Step 3: idempotent setup (safe to run on every start)
# ---------------------------------------------------------------------------
if [ "$db_ready" -eq 1 ]; then

  # 3a. WordPress core. If this fails the container exits and the restart
  # policy retries, which is fine because every step here is idempotent.
  if ! wp_as_user core is-installed; then
    echo "WordPress is not installed; running first-time install..."
    wp_as_user core install \
      --url="${WORDPRESS_SITE_URL:-http://localhost:8080}" \
      --title="Live Bid CMS" \
      --admin_user="${WP_ADMIN_USER:-admin}" \
      --admin_password="${WP_ADMIN_PASSWORD:?WP_ADMIN_PASSWORD is required for the first install}" \
      --admin_email="${WP_ADMIN_EMAIL:-admin@example.com}" \
      --skip-email
    echo "WordPress installed. Admin user: ${WP_ADMIN_USER:-admin}"
  else
    echo "WordPress is already installed."
  fi

  # 3b. Keep the canonical URLs in line with this environment.
  if [ -n "${WORDPRESS_SITE_URL:-}" ]; then
    wp_step option update home "$WORDPRESS_SITE_URL"
    wp_step option update siteurl "$WORDPRESS_SITE_URL"
  else
    echo "WARNING: WORDPRESS_SITE_URL is empty; keeping existing WordPress URLs." >&2
  fi

  # 3c. Restore baked-in plugins that a stale webroot volume can hide.
  # The webroot is a named volume, so after an image rebuild it can still hold
  # an older copy that lacks the plugins baked in at build time. We only copy
  # what is missing and never overwrite, so a plugin that already updated
  # itself is not downgraded.
  for plugin in "${REQUIRED_PLUGINS[@]}"; do
    baked="plugins/$plugin"
    if [ ! -e "$WP_PATH/wp-content/$baked" ] && [ -e "/usr/src/wordpress/wp-content/$baked" ]; then
      echo "Restoring baked-in $baked (missing from the webroot)..."
      mkdir -p "$WP_PATH/wp-content/plugins"
      cp -a "/usr/src/wordpress/wp-content/$baked" "$WP_PATH/wp-content/$baked"
      chown -R "$WP_USER":"$WP_USER" "$WP_PATH/wp-content/$baked"
    fi
  done

  # 3d. Pretty permalinks (/%postname%/), needed for clean REST URLs.
  if [ "$(wp_as_user option get permalink_structure 2>/dev/null || true)" != "/%postname%/" ]; then
    wp_step rewrite structure '/%postname%/'
    wp_step rewrite flush
  fi

  # 3e. Required plugins: present AND active. The activation flag is a
  # database row, so it survives container recreation.
  activated_any=0
  for plugin in "${REQUIRED_PLUGINS[@]}" "${BIND_MOUNTED_PLUGINS[@]}"; do
    if ! wp_as_user plugin is-installed "$plugin"; then
      # Self-heal fallback, needs internet at runtime, so non-fatal.
      wp_step plugin install "$plugin"
    fi
    if ! wp_as_user plugin is-active "$plugin"; then
      wp_step plugin activate "$plugin"
      activated_any=1
    fi
  done
  # Plugins can register rewrite rules (WPGraphQL's /graphql endpoint), so
  # flush once after activating anything new.
  if [ "$activated_any" -eq 1 ]; then
    wp_step rewrite flush
  fi

  # 3f. Media storage. The ADVMO_MINIO_* constants (set in compose through
  # WORDPRESS_CONFIG_EXTRA) only carry credentials. Which provider is active
  # is a saved setting, and without it the offloader does nothing. So when
  # S3_BUCKET is set we pick the S3-compatible provider and turn on
  # auto-offload. retention_policy is only seeded when missing, so a later
  # choice in wp-admin is kept (1 = delete generated thumbnails locally,
  # keep the originals).
  # shellcheck disable=SC2016
  if [ -n "${S3_BUCKET:-}" ]; then
    wp_step eval '
      $s = get_option("advmo_settings", []);
      if (!is_array($s)) { $s = []; }
      $s["cloud_provider"] = "minio";
      $s["auto_offload_uploads"] = 1;
      if (!isset($s["retention_policy"])) { $s["retention_policy"] = 1; }
      update_option("advmo_settings", $s);
    '
  else
    # No bucket (dev): a database copied from production may still have
    # auto-offload switched on, so turn it off.
    # shellcheck disable=SC2016
    wp_step eval '
      $s = get_option("advmo_settings", []);
      if (is_array($s) && !empty($s["auto_offload_uploads"])) {
        $s["auto_offload_uploads"] = 0;
        update_option("advmo_settings", $s);
      }
    '
  fi

  # 3g. Comments wait for approval by default. Seeded ONCE per database
  # (marker option), not enforced on every start, so a later choice in
  # wp-admin > Settings > Discussion is kept. Value and marker are written
  # in a single eval so they always go together.
  if [ "$(wp_as_user option get livebid_comment_moderation_seeded 2>/dev/null || true)" != "1" ]; then
    wp_step eval '
      update_option("comment_moderation", "1");
      update_option("livebid_comment_moderation_seeded", "1", false);
    '
  fi

fi

# ---------------------------------------------------------------------------
# Step 4: ownership, after all wp-cli work
# ---------------------------------------------------------------------------
# Docker creates fresh named-volume mount points as root, which breaks
# uploads and plugin updates. Running this last, on every start, self-heals
# even a volume that was recreated. Non-fatal on purpose.
echo "Fixing ownership of writable directories..."
chown -R "$WP_USER":"$WP_USER" \
  "$WP_PATH/wp-content/uploads" \
  "$WP_PATH/wp-content/upgrade" \
  "$WP_PATH/wp-content/languages" \
  "$WP_PATH/wp-content/themes" \
  2>/dev/null || true

for plugin_dir in "$WP_PATH"/wp-content/plugins/*/; do
  name="$(basename "$plugin_dir")"
  if is_bind_mounted "$name"; then
    continue
  fi
  chown -R "$WP_USER":"$WP_USER" "$plugin_dir" 2>/dev/null || true
done

# ---------------------------------------------------------------------------
# Step 5: Apache becomes PID 1
# ---------------------------------------------------------------------------
# exec replaces this script, so `docker stop` signals reach Apache directly.
exec apache2-foreground
