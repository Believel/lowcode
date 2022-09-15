FROM nginx
LABEL name="lowcode"
LABEL version="1.0"
ADD ./dist /www/dist/lowcode
ADD ./lowcode.conf /etc/nginx/default.d/lowcode.conf
EXPOSE 80