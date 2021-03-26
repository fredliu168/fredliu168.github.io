---
title: 树莓派Docker中使用openwrt做旁路网关
date: 2020-04-24 15:57:19
tags:
---

首先我们说一下 openwrt,说白了你可以你理解为路由器系统的一种。
OpenWrt 是面向嵌入型设备的 Linux 发行版，所以 OpenWrt 系统运行时的资源占用率会很低。而树莓派的硬件性能要比普通路由器要高很多。虽然树莓派在硬件配置上的绝对优势能让 OpenWrt 有更大的施展空间，但相应的，硬件上的优势也带来了资源的浪费（OpenWrt 在树莓派上正常运行时，资源占用率只有不到 1/10）。再加上 OpenWrt 的可扩展性不是很强，所以很多能在 Raspbian/Debian 上能做的事情在 OpenWrt 上往往无法实现。
总不可能直接用树莓派只刷个 openwrt 就没了吧，那怕是有点奢侈了。那有什么方式呢？
没错就是 Docker,这样就可以让 linux 和 openwrt 共存了。树莓派就不这么吃灰了。
旁路网关
那么什么又是旁路网关呢？其实他跟 spring cloud 有那么几分相似之处。
普通路由器就像一开始的单机模式，什么都是它一台机器负责，比如信号转发、DNS、网关等，其中的“网关”角色负责路由器内部数据的处理。但因为一般家用的路由器硬件性能很有限，在运行一些比较吃资源的应用（如酸酸乳、去广告等）时，几乎会占满所有硬件资源，导致路由器网络/系统不稳定等诸多问题。这个时候我们把网关的这个角色划分出去单独的在树莓派上跑，是不是分担了主路由的压力，是不是有点微服务那个味道。这样子每个角色各司其职，树莓派也结束了它吃灰的命运了，更好的验证了那句 买前生产力，买后旁路由。

注意：

本文 docker 镜像只适用于树莓派 2B/3B/3B+/4B，在其他设备上理论上不能正常使用
在 Docker 中运行 OpenWrt ，树莓派将工作在旁路网关模式下，在这种工作模式下，树莓派的板载无线网卡不会工作（同时在 OpenWrt 的控制面板中也找不到有关 WIFI 的设置）。所以，需要将树莓派与路由器通过网线连接来使用。

具体步骤

Step 1: 打开网卡混杂模式

sudo ip link set eth0 promisc on
复制代码
Step 2 :创建 docker 网络\*\*

注意了，这里需要结合自己的网络修改，不能照搬！！ sudo ifconfig 可以查看树莓派 IP 地址，不过刚刚不是都知道了嘛 [汗]，多一种方式嘛
刚刚登陆 ssh 的 ip 地址 192.168.31.7 那么说明树莓派处在 192.168.31.x 网段，那么下面的命令中的
--subnet=192.168.x.0/24 和--gateway=192.168.x.1 将要替换成对应网段的地址。(此处的 x 请根据自己的网络进行修改)
替换后：

```
docker network create -d macvlan --subnet=192.168.31.0/24 --gateway=192.168.31.1 -o parent=eth0 macnet

```

这是我们 docker network ls 就可以查看到刚刚创建的网络

```
pi@raspbian:~$ docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
e5988f578007        bridge              bridge              local
107c16227dd4        docker_gwbridge     bridge              local
3ceb60d85b9c        host                host                local
b1929166e45c        macnet              macvlan             local
93ad7ae8da72        none                null                local
```

这里我还特意去查了一下 macvlan
macvlan 是一种虚拟网卡的解决方案：

macvlan 并不创建网络，只创建虚拟网卡。
macvlan 会共享物理网卡所链接的外部网络，实现的效果跟桥接模式是一样的。

想要了解更多等会文末会附上个参考链接。

Step 3 :拉取镜像。

```
docker pull harryzhang6/openwrt:latest
```

复制代码我们可以通过 docker images 查看本地的镜像

```
pi@raspbian:~$ docker images
REPOSITORY            TAG                 IMAGE ID            CREATED             SIZE
harryzhang6/openwrt   latest              5c354d2e6f6f        3 hours ago         235MB

```

这里也就说明镜像拉取成功了。

Step 4 :创建并启动容器

```
docker run --restart always --name openwrt -d --network macnet --privileged harryzhang6/openwrt:latest /sbin/init
```

复制代码
--restart always 参数表示容器退出时始终重启，使服务尽量保持始终可用；
--name openwrt 参数定义了容器的名称；
-d 参数定义使容器运行在 Daemon 模式；
--network macnet 参数定义将容器加入 maxnet 网络；
--privileged 参数定义容器运行在特权模式下；

我们 docker ps 确认一下容器是否启动成功

```
pi@raspbian:~$ docker ps
CONTAINER ID        IMAGE                        COMMAND             CREATED             STATUS              PORTS               NAMES
755d018206fd        harryzhang6/openwrt:latest   "/sbin/init"        2 minutes ago
```

确认启动成功，下一步就是进入容器配置了

Step 5 :进入容器并修改相关参数

注意：这一步的某些配置也跟上面一样，不能照搬
docker exec -it openwrt bash
复制代码执行此命令后我们便进入 OpenWrt 的命令行界面，首先，我们需要编辑 OpenWrt 的网络配置文件：
vim /etc/config/network
复制代码我们需要更改 Lan 口设置：

```
config interface 'lan'
        option type 'bridge'
        option ifname 'eth0'
        option proto 'static'
        option ipaddr '192.168.31.100' //需要更改处
        option netmask '255.255.255.0'
        option ip6assign '60'
        option gateway '192.168.31.1' //需要更改处
        option broadcast '192.168.123.255'
        option dns '192.168.31.1' //需要更改处
```

这里是我配置好的，需要自行更改。option gateway 和 option dns 填写路由器的 IP，若树莓派获得的 IP 为 192.168.31.154，路由器 IP 为 192.168.31.1.
option ipaddr 项目定义了 OpenWrt 的 IP 地址，在完成网段设置后，IP 最后一段可根据自己的爱好修改（前提是符合规则且不和现有已分配 IP 冲突）。

Step 6 :重启网络

/etc/init.d/network restart
复制代码
Step 7 : 进入 openwrt 管理页面

在浏览器输入刚刚 Step 5 中定义的 option ipaddr,我这里是 192.168.31.1,就可以看到后台的管理界面

用户名：root

密码：password

Step 8 :关闭 DHCP 服务

在 “网络 - 接口 - Lan - 修改” 界面中，勾选下方的 “忽略此接口（不在此接口提供 DHCP 服务）”，并“保存&应用”
Step 9: 主路由 DHCP 设置

这里不非必要的，
进入路由器后台中，将主路由的 DHCP 的默认网关和 DNS 服务器设置为第 5 步中 option ipaddr 项目中的 IP。
由于不想每台设备都通过这个 opwrt，只有自己设置的设备才走 openwrt 这个网关。
如果你修改了主路由 DHCP 请重启路由器。
到这里也差不多了教程，下面附上手动指定网关的教程
手动指定网关
如果路由器固件不支持自定义 DHCP 服务的网关及 DNS 地址（常见于路由器官方固件），或者只希望局域网下的个别设备接入旁路网关时，须在接入设备上做以下配置：

作者：HarryZhang6
链接：https://juejin.im/post/5e62711fe51d4526e91f5a1b
来源：掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
