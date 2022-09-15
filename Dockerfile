FROM nginx
LABEL name="lowcode"
LABEL version="1.0"
COPY ./dist /www/client/lowcode/dist/lowcode
EXPOSE 80