---
title: iMac如何通过快捷键连接AirPods耳机
date: 2020-01-14 11:32:49
tags:
---

> 每次从手机切换耳机到电脑都要手动去点击一下,很麻烦,找到了通过快捷键切换的方法,
该方法适用于其他蓝牙耳机

## 1 .安装BluetoothConnector:

[BluetoothConnector](https://github.com/lapfelix/BluetoothConnector)

```
brew install bluetoothconnector
```
安装成功后打开Terminals输入以下命令,查看蓝牙耳机mac地址:

```
bluetoothconnector
```
返回本机连接的蓝牙设备列表

```
Get the MAC address from the list below (if your device is missing, pair it with your computer first):
f8-70-c0-7a-eb-bf - alp的AirPods
......
```
输入下列命令进行测试:

```
BluetoothConnector f8-70-c0-7a-eb-bf  --notify
```

执行成功就会弹出通知,如果已经连接则会断开,记得把mac地址改为你自己的蓝牙设备

### 2.设置键盘快捷键

1.打开“启动台”-》“other”-》“自动操作”
新建-》快速操作
把运行AppleScript拖动到工作路程,输入以下代码
```
on run {input, parameters}v
	do shell script "/usr/local/bin/BluetoothConnector f8-70-c0-7a-eb-bf --notify"
	return input
end run
```
测试运行成功,保存,名称可以自己命名

2.设置键盘快捷键
打开“系统偏好”-》“键盘”-》“快捷键”-》“服务”-》找到刚才保存的服务,设置你想要的快捷键.至此大功告成
