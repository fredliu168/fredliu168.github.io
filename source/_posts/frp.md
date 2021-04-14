---
layout: imac
title: iMac如何使用frp实现内网穿透
date: 2017-12-19 15:56:15
tags: frp 
---

有时需要把内网部署的站点映射到外网，让其别人也能访问到，例如做微信相关开发时需要把内网映射到外网，让微信服务器能访问到你的开发环境，方便开发调试。可以使用花生壳或者ngrok，前面这两种我都使用过，花生壳用起来很不稳定，花了钱还不能解决问题，ngrok现在已经很久没更新了，国内的可以在https://www.ngrok.cc 注册，免费用户仅能使用一个转发，由于是使用香港的服务器经常连接不上，最后狠下心来研究了下内网穿透，发现frp使用起来还可以，本文就介绍在iMac下如何用阿里云用frp做内网穿透，Windows的应该流程也类似。

>frp开源地址:https://github.com/fatedier/frp
 
### 一.服务器配置
##### 1.使用终端ssh远程连接阿里云服务器

```   
ssh -t root@xxx.xxx.xxx.xxx -p 22
```
进入到/home目录，创建文件夹
```
mkdir frp
```

##### 2.下载对应的frp发布版本

先查看服务器型号

```
    cat /proc/version
```
本人服务器信息:

```
    Linux version 4.4.0-101-generic (buildd@lcy01-amd64-006)  
```
    
下载frp

```
sudo wget  https://github.com/fatedier/frp/releases/download/v0.13.0/frp_0.13.0_linux_amd64.tar.gz
```
我的阿里云服务器下载不了frp文件，就先下载文件到本地，然后用ssh远程上传到阿里云服务器。
```
scp -r frp_0.13.0_linux_amd64.tar.gz root@xxx.xxx.xxx.xxx:/home/frp/ 
```
##### 3.配置frp服务端
解压到当前目录
```
sudo tar xvf frp_0.13.0_linux_amd64.tar.gz
```
解压之后进入目录会看到以下文件

<!-- more -->

```
# ls
LICENSE  frpc  frpc.ini  frpc_full.ini  frps  frps.ini  frps_full.ini
```
打开frps.ini文件，配置成如下：
```
bind_addr = xxx.xxx.xxx.xxx
bind_port = 7000
vhost_http_port = 80
vhost_https_port = 443
dashboard_port = 7500
dashboard_user = 你的仪表盘用户名
dashboard_pwd = 你的仪表盘密码
privilege_token = frp
```
其中bind_port是自己设定的frp服务端端口  
vhost_http_port是自己设定的http访问端口  
vhost_https_port是自己设定的https访问端口
[ssh]部分是ssh反向代理  
listen_port是自己设定的ssh访问端口  
custom_domains是自定义域名，如果有自己的域名就写到这里  
privilege_token是验证凭据，服务端和客户端的凭据必须一样才能连接，当然为了安全还是设置长一点。dashborad的三个配置是仪表盘功能的端口以及用户名和密码，为了安全也要设置的长一点。

保存上面的配置后，使用以下指令启动frp服务端。
```
./frps -c ./frps.ini
```
查看frps.log然后应该会显示类似下面的文本，说明服务端启动成功
``` 
Start frps success
PrivilegeMode is enabled, you should pay more attention to security issues
```
### 二.客户端配置
iMac下载对应的frp版本frp_0.13.0_darwin_amd64.tar.gz
解压后有对应的文件
```
# ls
LICENSE  frpc  frpc.ini  frpc_full.ini  frps  frps.ini  frps_full.ini
```
frpc和frpc.ini、frpc_full.ini 是客户端对应的配置文件
我的frpc.ini配置对应如下：
```
[common]
server_addr = xxx.xxx.xxx.xxx
server_port = 7000  
# console or real logFile path like ./frpc.log
log_file = ./frpc.log 
# trace, debug, info, warn, error
log_level = trace 
log_max_days = 3 
# for authentication
privilege_token = #######
 
# connections will be established in advance, default value is zero
pool_count = 5 
# if tcp stream multiplexing is used, default is true, it must be same with frps
tcp_mux = true 
# your proxy name will be changed to {user}.{proxy}
user = qzcool 
# decide if exit program when first login failed, otherwise continuous relogin to frps
# default is true
login_fail_exit = true 
[weixin]
type = http
local_ip = 127.0.0.1
local_port = 8080
use_encryption = false
use_compression = false 
subdomain = weixin
[ssh] # 远程登录ssh
type = tcp
local_port = 22
remote_port = 2222
```
server_addr：对应的时阿里云的公网地址
server_port：服务端端口
privilege_token：token需要和服务端一致
最底下是配置站点信息
subdomain：子域名，假设服务器配置泛解析，子域名配置weixin，那么可以通过weixin.youdomin.com访问到你内网的8080端口

启动服务 :
```
macdeiMac:frp_0.13.0_darwin_amd64 fred$ sudo ./frpc -c ./frpc.ini 
```
然后使用浏览器访问weixin.youdomin.com就能访问到你的站点了。


### 三.frp开机启动和后台运行

使用systemd配置开机自启，适用于 centos7 Ubuntu 16 或 debian 8。 
vi /etc/systemd/system/frps.service 新建此文件，并写入以下内容:
```
[Unit]

Description=frps daemon

After=syslog.target network.target

Wants=network.target

[Service]

Type=simple

ExecStart=/root/frp_0.13.0_linux_amd64/frps -c /root/frp_0.13.0_linux_amd64/frps_my.ini

Restart= always

RestartSec=1min

[Install]

WantedBy=multi-user.target
```
启动并设为开机自启。
```
systemctl start frps //启动 
systemctl status frps //状态查询 
systemctl enable frps //开机启动
```