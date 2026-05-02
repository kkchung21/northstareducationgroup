# Northstar Education — static site for Fly.io
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html ko.html /usr/share/nginx/html/
COPY pathway /usr/share/nginx/html/pathway

EXPOSE 8080
