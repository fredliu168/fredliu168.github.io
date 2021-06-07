---
title: Ubuntu,MacOS和Windows10 配置双网卡路由
date: 2019-11-15 15:09:58
tags:
---

## 一、MacOS 配置双网卡路由

# 1、设置网卡地址

```
sudo ifconfig en4 ether 11:1C:29:1A:12:0D

```

# 2、用 networksetup 设置固定的路由

networksetup 是在系统偏好设置中对网络设定进行配置的工具。 networksetup 命令最少需要 admin 权限。 大多数的配置命令都需要 root 权限。
在任何需要密码的地方，可以用 - 代替，表示从标准输入读入密码。

## 查看网络服务

-listnetworkserviceorder

按照与一个连接的相关性列出网络服务及其对应的 Port 。含有 \* 说明这个服务不可用。如：

```
networksetup -listnetworkserviceorder

An asterisk (*) denotes that a network service is disabled.
(1) Wi-Fi
(Hardware Port: Wi-Fi, Device: en1)

(2) AX88179 USB 3.0 to Gigabit Ethernet
(Hardware Port: AX88179 USB 3.0 to Gigabit Ethernet, Device: en4)

(3) Ethernet
(Hardware Port: Ethernet, Device: en0)

(4) Bluetooth PAN
(Hardware Port: Bluetooth PAN, Device: en5)

```

## 设置附加的路由

```
-setadditionalroutes networkservice [dest1 mask1 gate1] [dest2 mask2 gate2] … [destN maskN gateN]

```

```
networksetup -setadditionalroutes "AX88179 USB 3.0 to Gigabit Ethernet" 192.168.0.0 255.255.255.0 10.0.0.129 
```

## 查看路由配置

```
 netstat -rn

```

## 删除路由

```
sudo  route delete 192.168.8/24

```

## 二、ubuntu 配置双网卡路由

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

2.添加内网 ip 路由

```
sudo route add -net 10.0.0.0 netmask 255.255.255.0 gw 10.0.0.0 eno1
sudo route add -net 192.168.0.0 netmask 255.255.255.0 gw 10.0.0.0 eno1
sudo route add -net 192.168.8.0 netmask 255.255.255.0 gw 10.0.0.0 eno1
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

## 三、windows 配置双网卡路由

查看网卡信息

```
ipconfig

13 有线网口

25 无线网口

```

查看路由配置

```
route print
```

1.删除默认路由

```
route delete 0.0.0.0
```

2.添加内网路由

```
route  -p add   192.168.0.0 mask 255.255.255.0   10.0.0.0  if 13
route  -p add   10.0.0.0 mask 255.255.255.0   10.0.0.0  if 13

```

3.添加外网路由

```
route -p add 0.0.0.0 mask 0.0.0.0 192.168.31.1 if 25

```
