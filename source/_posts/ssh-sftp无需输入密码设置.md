---
title: ssh/sftp无需输入密码设置
date: 2019-10-30 15:47:06
tags:
---

Linux系统有一个钥匙环(keyring)的管理程序．钥匙环受到用户登录密码的保护．当你登录Linux系统时，会自动解开钥匙环的密码，从而可访问钥匙环．SSH的密钥和公钥也存储在钥匙环．所以初次使用SSH密钥登录远程Linux服务器时需要输入一次SSH密钥的密码．而将来使用SSH密钥登录时不再输入密码。Ubuntu的钥匙环程序是seahorse．
SSH密钥就好比是你的身份证明．远程Linux服务器用你生成的SSH公钥来加密一条消息，而只有你的SSH密钥可以解开这条消息．所以其他人如果没有你的SSH密钥，是无法解开加密消息的，从而也就无法登录你的Linux服务器．

检查一下你有没有 ssh key
```
ls ~/.ssh
```
如果有包含下面这两个文件，则说明你有ssh key
```
id_rsaid_rsa.pub
```

<!-- more -->

有 .pub 后缀的是公钥，没有的是私钥。公钥可以让别人知道，私钥就像你的密码一样，不要给别人。

如果没有 ssh key，可以用 ssh-keygen -t rsa 命令 来生成
然后一路回车，就可以生成 ssh key 了

然后，再一个命令，把公钥上传到服务器
```
ssh-copy-id username@remote-server
```

这样公钥就会上传到服务器的 ~/.ssh/authorized_keys 位置中
大功告成，以后在本机不用输入密码就可以用ssh连接服务器了
