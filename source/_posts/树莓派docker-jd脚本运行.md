---
title: 树莓派docker jd脚本运行
date: 2021-04-11 23:10:22
tags:
---

脚本本地路径
```
/home/pi/jd/jd_scripts
```

# 获取cookies

```js
var CV ='{cookies}';//大括号里面放jd的cookies
var CookieValue = CV.match(/pt_pin=.+?;/) + CV.match(/pt_key=.+?;/);
copy(CookieValue);
```


# 安装docker-compose

```
sudo apt install docker-compose
```

jd docker地址
```
https://hub.docker.com/r/lxk0301/jd_scripts
```

安装jd_scirpts

```
docker pull lxk0301/jd_scripts
```

目录文件配置好之后在 jd_scripts目录执行。
docker-compose 命令:
```
docker-compose up -d 启动（修改docker-compose.yml后需要使用此命令使更改生效）；
docker-compose logs 打印日志；
docker-compose logs -f 打印日志，-f表示跟随日志； docker logs -f jd_scripts 和上面两条相比可以显示汉字； docker-compose pull 更新镜像；
docker-compose stop 停止容器；
docker-compose restart 重启容器；
docker-compose down 停止并删除容器；
```

来源:https://gitee.com/lxk0301/jd_docker/blob/master/docker/Readme.md
