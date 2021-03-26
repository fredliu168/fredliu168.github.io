---
title: Docker常用操作命令
date: 2020-04-10 11:21:18
tags:
---

1、docker服务自动重启设置

```
systemctl enable docker.service

```

2、docker容器自动启动设置

在运行docker容器时可以加如下参数来保证每次docker服务重启后容器也自动重启：

``` 
docker run --restart=always 
```
如果已经启动了则可以使用如下命令：

```
docker update --restart=always <CONTAINER ID>
```


3.进入docker 容器 

```
docker exec -it 2a81dcba834f /bin/bash
```

文件拷贝
 
容器->主机
docker cp 2a81dcba834f:/usr/local/etc/php/php.ini /Users/fredliu/Documents/PHP

主机->容器
docker cp /Users/fredliu/Documents/PHP/php.ini 2a81dcba834f:/usr/local/etc/php

