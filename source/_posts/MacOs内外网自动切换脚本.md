---
title: MacOs内外网自动切换脚本
date: 2021-10-19 16:42:13
tags:
---

```sh
#!/bin/bash
# chmod +x ./switch_net.sh  使脚本具有执行权限
echo "#################################"
echo "#网络切换，1:OA，2:Wlan"
echo "#请输入需要切换的网络，回车默认Wlan，IP获取为DHCP模式"
echo "#################################"

read  -p "please enter you choise: "

if [[ "$REPLY" == 1 ]]
then
  echo "网络切换为OA"
  sudo ifconfig en10 ether 11:1C:29:1A:12:AD
  networksetup -setmanual "AX88179 USB 3.0 to Gigabit Ethernet" 110.149.197.269 255.255.255.0 
  echo "切换成功"
else
  echo "网络切换为Wlan"
  sudo networksetup -setdhcp "AX88179 USB 3.0 to Gigabit Ethernet"
  echo "切换成功"
fi
```
执行以下语句使脚本具有执行权限
```
chmod +x ./switch_net.sh  
```
<!-- more -->