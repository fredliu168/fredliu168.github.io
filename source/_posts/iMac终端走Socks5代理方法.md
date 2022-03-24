---
title: iMac终端走Socks5代理方法
date: 2020-08-19 17:44:16
tags: iMac
---
1.找到代理地址和端口
本人的 Socks5 的监听地址是 127.0.0.1，端口 1086

2. 打开终端添加配置

（我的终端是 zsh）打开终端，输入以下代码打开 vim

```
vim ~/.zshrc
```

按下键盘上的字母「i」，进入编辑模式，输入以下代码，第二行末尾改成自己的代理地址和端口

```
# proxy list
alias proxy='export all_proxy=socks5://127.0.0.1:1081'
alias unproxy='unset all_proxy'
```

按下键盘上的「esc」，退出编辑模式。输入以下代码保存修改并退出 vim

```
:wq
```

初始化配置

```
source ~/.zshrc
```

3. 执行

开启代理模式，查看 ip，看看 brew update 命令顺畅与否

```
proxy
brew update
```

如果不想走代理了则使用 unproxy 命令

```
unproxy
```

开启代理模式前后可以查看 ip

```
curl cip.cc
```

<!-- more -->
