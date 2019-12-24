---
title: ubuntu 和 windows10 配置双网卡路由
date: 2019-11-15 15:09:58
tags:
---

## ubuntu配置双网卡路由

1.显示当前默认路由

```
route

default         XiaoQiang       0.0.0.0         UG    600    0        0 wlxf48ceb4c4436
default         _gateway        0.0.0.0         UG    20100  0        0 eno1

```

删除当前默认路由

```
sudo route delete default

```

2.添加内网ip路由

```
sudo route add -net 10.49.28.0 netmask 255.255.255.0 gw 10.49.76.129 eno1
sudo route add -net 192.168.14.0 netmask 255.255.255.0 gw 10.49.76.129 eno1
sudo route add -net 192.168.8.0 netmask 255.255.255.0 gw 10.49.76.129 eno1
```

3.添加外网路由

```
sudo route add -net 0.0.0.0 netmask 0.0.0.0 gw 192.168.31.1 wlxf48ceb4c4436
```

删除配置的路由

```
sudo route del -net 192.168.8.0 netmask 255.255.255.0
sudo route del -net  0.0.0.0 netmask 255.255.255.0
```


## windows 配置双网卡路由

查看网卡信息

```
ipconfig

13 有线网口

25 无线网口

```

1.删除默认路由

```
route delete 0.0.0.0
```
2.添加内网路由

```
route  -p add   192.168.14.0 mask 255.255.255.0   10.49.76.129  if 13
route  -p add   10.49.28.0 mask 255.255.255.0   10.49.76.129  if 13

```

3.添加外网路由

```
route -p add 0.0.0.0 mask 0.0.0.0 192.168.31.1 if 25

```
