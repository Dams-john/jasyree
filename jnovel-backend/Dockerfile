FROM php:8.2-apache

RUN docker-php-ext-install mysqli pdo pdo_mysql

COPY . /var/www/html/

RUN sed -i 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

RUN a2enmod rewrite

RUN printf '%s\n' '<Directory /var/www/html/public>' '    AllowOverride All' '    Require all granted' '</Directory>' > /etc/apache2/conf-available/jnovel-public.conf \
	&& a2enconf jnovel-public

RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
