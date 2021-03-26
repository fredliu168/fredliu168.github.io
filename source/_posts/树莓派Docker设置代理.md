---
title: 树莓派Docker设置代理
date: 2020-04-24 14:31:44
tags:
---

Docker 无法访问到仓库，网上找的方法都无效，发现 Docker 是通过 snap 安装的，通过下面的方法实现了代理访问

```
sudo vim /etc/systemd/system/snap.docker.dockerd.service

```

添加

```
[Service]
...
Environment="HTTPS_PROXY=socks5://127.0.0.1:1080"
```

然后执行

```
sudo systemctl daemon-reload
sudo snap restart docker
```

然后执行

```
docker login
```

可以正常访问到仓库了。

其他（上面的设置突然无效了,使用下面有效）

写入代理设置

```cmd
sudo mkdir /lib/systemd/system/docker.service.d
cat > /lib/systemd/system/docker.service.d/socks5-proxy.conf <<EOF
[Service]
Environment="ALL_PROXY=socks5://127.0.0.1:1080"
EOF
```

重新加载配置

```cmd
systemctl daemon-reload
systemctl restart docker
```

<!-- more -->
