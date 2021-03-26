---
title: ubutun安装go
date: 2021-03-15 16:07:30
tags:
---

```
wget -c https://dl.google.com/go/go1.16.2.linux-amd64.tar.gz

rm -rf /usr/local/go && tar -C /usr/local -xzf go1.16.2.linux-amd64.tar.gz
```

测试是否安装成功

```
go version
```

输出：

```
go version go1.16.1 windows/amd64

```