---
title: 树莓派不带图形化界面系统安装桌面GUI及其管理服务
date: 2021-04-14 09:04:13
tags:
---

树莓派P4桌面无法登录处理.   

## 1、依次安装Xorg、xinit，加-y参数安装过程自动确认

```
sudo apt-get install --no-install-recommends xserver-xorg -y
sudo apt-get install --no-install-recommends xinit -y
```
## 2、安装桌面GUI类型
```
Raspberry Pi Desktop (RPD) GUI

sudo apt-get install raspberrypi-ui-mods -y
```
LXDE GUI
```
sudo apt-get install lxde-core lxappearance  -y
```
XFCE GUI
```
sudo apt-get install xfce4 xfce4-terminal -y
```
## 3、安装登陆管理器
```
sudo apt-get install lightdm
```
## 4、设置自动进入桌面
```
sudo raspi-config
```

1. System Options -> S5.Boot/Auto Login -> B4.Desktop AutoLogin Desktop GUI  


这里建议选择B4，启动免登陆进入桌面（以pi账户登陆）
B3 则需要在登陆界面输入账户及密码登陆。
B1进入命令行界面
B2免登陆进入命令行界面
