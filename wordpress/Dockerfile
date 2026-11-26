# Custom WordPress image for the Live Bid headless CMS.
# We extend the official image because we want wp-cli baked in for the
# automated first-boot setup, and the required plugins baked in too.
FROM wordpress:7.1-php8.4-apache

RUN apt-get update && apt-get install -y --no-install-recommends \
        less \
        default-mysql-client \
        curl \
        unzip \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL -o /usr/local/bin/wp https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x /usr/local/bin/wp

# Bake the required plugins into the image.
# Only the uploads volume and the database are persistent, so anything
# installed at container start would vanish on the next recreate. Installing
# here makes the files part of the image; only the "active" flag lives in the
# database. These are unpinned downloads for now, so pin versions later.
RUN set -eux; \
    for plugin in wp-graphql advanced-media-offloader; do \
        curl -fsSL "https://downloads.wordpress.org/plugin/${plugin}.zip" -o "/tmp/${plugin}.zip"; \
        unzip -q "/tmp/${plugin}.zip" -d /usr/src/wordpress/wp-content/plugins/; \
        rm "/tmp/${plugin}.zip"; \
    done; \
    chown -R www-data:www-data /usr/src/wordpress/wp-content/plugins

# PHP upload limits. The official image keeps PHP's tiny defaults (2 MB per
# file), which silently rejects normal images in the media uploader. If a
# reverse proxy goes in front of the admin panel later, its max body size
# has to match this 64M.
RUN printf 'upload_max_filesize = 64M\npost_max_size = 64M\nmemory_limit = 256M\n' \
    > /usr/local/etc/php/conf.d/uploads.ini

# No-op command whose name satisfies the official entrypoint's "apache2*"
# check. We run the official entrypoint with it as the argument, so it does
# its init work (copy core, write wp-config.php) and exits instead of
# starting Apache. Our own entrypoint starts Apache once setup is done.
RUN printf '#!/bin/sh\nexit 0\n' > /usr/local/bin/apache2-init-done \
    && chmod +x /usr/local/bin/apache2-init-done

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint-livebid.sh
RUN chmod +x /usr/local/bin/docker-entrypoint-livebid.sh

ENTRYPOINT ["docker-entrypoint-livebid.sh"]
CMD ["apache2-foreground"]
