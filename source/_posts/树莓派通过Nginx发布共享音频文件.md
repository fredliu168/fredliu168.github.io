---
title: 树莓派通过Nginx发布共享音频文件
date: 2020-08-18 15:41:34
tags:
---

我们想通过局域网共享一下存放在树莓派里面的音频文件，树莓派安装了树莓派自带的系统。

1、安装 Nginx

```
sudo apt-get update
sudo apt-get install nginx
```

2.测试是否安装成功（nginx 默认是 80 端口）

浏览 127.0.0.1 看网页是否正确显示

3.设置配置文件

获取 nginx 配置文件路径

```
sudo nginx -t
```

输出：

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

<!-- more -->

我们知道了默认路径 /etc/nginx

进入 /etc/nginx/sites-available

```
cd /etc/nginx/sites-available
```

编辑 default 配置文件

```
sudo nano default
```

在空白处粘贴以下内容，可以改成自己需要：

```
server {
        listen       8080;
        server_name  localhost;
        root /home/iflyos/iflyos_sound;
        location / {
            autoindex on;
            autoindex_exact_size off;
            autoindex_localtime on;
        }

     }
```

按 CTRL+O 保存退出

4.重新加载 nginx 配置

先测试配置文件是否有误

```
sudo nginx -t
```

没有提示错误的话进行下一步操作，如果有提示错误，根据错误进行修改

从新加载配置

```
sudo nginx -s reload
```

没有提示错误的话就可以通过浏览器进行访问

```
http://127.0.0.1:8080/xx/xxx.mp3
```
