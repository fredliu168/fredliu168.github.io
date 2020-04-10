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