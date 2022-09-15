#!/bin/bash
WORK_PATH='/www/client/lowcode'
cd $WORK_PATH
echo "先清除老代码"
git reset --hard origin/master
git clean -f
echo "拉取最新代码"
git pull origin master
echo "安装依赖"
yarn
echo "编译"
yarn build
echo "开始执行构建"
docker build -t lowcode:1.0
echo "停止旧容器并删除旧容器"
docker stop lowcode-container
docker rm lowcode-container
echo "启动新容器"
docker run -p 80:80 --name lowcode-container -d lowcode:1.0
