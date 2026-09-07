FROM php:8.2-apache

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN docker-php-ext-install mysqli pdo pdo_mysql \
	&& apt-get update \
	&& apt-get install -y --no-install-recommends curl \
	&& rm -rf /var/lib/apt/lists/* \
	&& a2enmod rewrite headers \
	&& sed -ri -e "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" \
		/etc/apache2/sites-available/*.conf \
		/etc/apache2/apache2.conf \
	&& printf '%s\n' \
		'<Directory /var/www/html/public>' \
		'    AllowOverride All' \
		'    Options FollowSymLinks' \
		'    Require all granted' \
		'</Directory>' \
		> /etc/apache2/conf-available/jnovel-public.conf \
	&& a2enconf jnovel-public

COPY . /var/www/html/

RUN chown -R www-data:www-data /var/www/html

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
	CMD curl --fail http://localhost/api/health || exit 1

EXPOSE 80
