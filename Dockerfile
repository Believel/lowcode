FROM nginx
LABEL name="lowcode"
LABEL version="1.0"
COPY ./dist /www/dist/lowcode
COPY ./lowcode.conf /etc/nginx/default.d/lowcode.conf
EXPOSE 80