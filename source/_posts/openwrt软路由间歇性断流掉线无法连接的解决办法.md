---
title: openwrt软路由间歇性断流掉线无法连接的解决办法
date: 2020-04-24 16:30:07
tags:
---

问题
树莓派 openwrt 作为软旁路由（网关）提供设备“出国访问”。但是经常性会发生断流，掉线的情况。

解决办法
openwrt 网络–》接口–》编辑 eth0 网口–》高级设置物理接口–》取消掉桥接
openwrt 网络–》防火墙–》自定义规则，添加如下规则，iptables -t nat -I POSTROUTING -o eth0 -j MASQUERADE，然后重启即可。

通过设置好像有改善了。

参考：http://blog.sinovale.com/2576.html
