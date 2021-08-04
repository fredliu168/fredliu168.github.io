---
title: 为iterm2设置代理
date: 2021-07-29 14:55:08
tags:
---

1. 设置终端代理
最新的 ShadowsocksX-NG 已经支持终端代理, 我们可以如下图复制得出:

```
export http_proxy=http://127.0.0.1:1081;export https_proxy=http://127.0.0.1:1081;
```

{% asset_img 1.png This is an image %}


为了方便, 我们可以制作一下别名

```
alias setproxy='export http_proxy="http://127.0.0.1:8001"; export HTTP_PROXY="http://127.0.0.1:8001"; export https_proxy="http://127.0.0.1:8001"; export HTTPS_PROXY="http://127.0.0.1:8001"' # 设置终端代理

alias unproxy='unset http_proxy https_proxy' # 取消终端代理

alias ip='curl cip.cc' # 测试

```

安装配置iterm2和oh my zsh

https://segmentfault.com/a/1190000016952262