---
title: 树莓派chromium设置sock5代理访问
date: 2020-08-21 17:20:43
tags:
---

由于在特定网络环境下 chromium 需要通过代理访问,可以用如下方法

```
chromium-browser --proxy-server="socks5://192.168.31.5:1080"
```

经过测试使用 127.0.0.1 无法代理，必须使用设备 ip。

<!-- more -->
