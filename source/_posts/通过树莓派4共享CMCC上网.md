---
title: 通过树莓派4共享CMCC上网
date: 2020-04-17 17:06:52
tags:
---

由于没有其他网络，只能通过cmcc上网，想通过共享的方式提供给其他设备上网。手头刚好有个闲置的树莓派4，树莓派装了ubuntu的系统，设置一下有线网口的IP，192.168.1.2，做一下下nat转发，然后把小米路由器的地址上网设置成静态IP，网关设置树莓派的IP。
树莓派设置：

```sh
ifconfig eth0 192.168.1.2/24
sysctl net.ipv4.ip_forward=1
iptables -t nat -A POSTROUTING -s 192.168.1.0/24 -j MASQUERADE
iptables -t nat -nL
```

路由器设置：

```
192.168.1.3
255.255.255.0
网关：192.168.1.2
DNS：8.8.8.8
```