# Northstar Education — static site for Fly.io
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html ko.html /usr/share/nginx/html/

EXPOSE 8080
