---
title: certbot-auto错误处理
date: 2020-08-27 15:15:55
tags:
---

使用 cerbot-auto 时提示如下错误：

```
UnicodeEncodeError: 'ascii' codec can't encode character u'\u4e0e' in position 2870: ordinal not in range(128)
```

查看日志

```
 /var/log/letsencrypt/letsencrypt.log
```

错误原因：
在 python2.7 下将字符串写入到文件时会出现"UnicodeEncodeError: 'ascii' codec can't encode character u'\xa0' in position"的错误,原因是由于 python 基于 ASCII 处理字符的，当出现不属于 ASCII 的字符时，会出现错误信息。

解决办法：
指定文件字符集为 utf-8

在 letsencryp 头文件

```
vim /opt/eff.org/certbot/venv/bin/letsencrypt
```

加入以下代码：

```
import sys
reload(sys)
sys.setdefaultencoding('utf-8')
```
