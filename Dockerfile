# Northstar Education — static site for Fly.io
FROM nginx:alpine

RUN apk add --no-cache apache2-utils

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html ko.html /usr/share/nginx/html/
COPY pathway /usr/share/nginx/html/pathway
COPY blog /usr/share/nginx/html/blog
COPY map /usr/share/nginx/html/map
COPY data /usr/share/nginx/html/data
COPY team /usr/share/nginx/html/team
COPY scripts/create-team-auth.sh /docker-entrypoint.d/40-create-team-auth.sh

EXPOSE 8080
