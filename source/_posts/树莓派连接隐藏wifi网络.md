---
title: 树莓派连接隐藏wifi网络
date: 2020-08-21 15:20:20
tags: 树莓派
---

使用 nano 编辑器打开 wpa-supplicant 配置文件

```
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf
```

在文件底部添加：

```
network={
ssid=”wifi_name”
scan_ssid=1
psk=”wifi_password”
}
```

关键是 ssid_scan=1 这一句，加上后才能扫描到隐藏的 wifi 网络。之后保存退出（ctrl+o 保存，ctrl+x 退出）nano 编辑器，reboot 重启即可。

相关 network 的配置信息：
network：是一个连接一个 WiFi 网络的配置，可以有多个，wpa_supplicant 会按照 priority 指定的优先级（数字越大越先连接）来连接，当然，在这个列表里面隐藏 WiFi 不受 priority 的影响，隐藏 WiFi 总是在可见 WiFi 不能连接时才开始连接。

```
ssid:网络的ssid
psk:密码
priority:连接优先级，越大越优先
scan_ssid:连接隐藏WiFi时需要指定该值为1
```
