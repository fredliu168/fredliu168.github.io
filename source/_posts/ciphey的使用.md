---
title: ciphey的使用
date: 2022-03-24 10:15:14
tags: ctf
---
## Misc-签到

题目:EwzB3KQcFGnVmxPsPK8xBX9GMgR7RUFJcdXLtxKXM

使用base64解不出,使用ciphey一下子就出来了.ciphey在不知道密钥或密码的情况下自动解密加密、解码编码和破解哈希.

> 介绍: https://github.com/Ciphey/Ciphey

Mac安装ciphey

```
brew reinstall ciphey
```

使用

```ssh
ciphey -t "EwzB3KQcFGnVmxPsPK8xBX9GMgR7RUFJcdXLtxKXM"
```

返回:

```

The plaintext is a Capture The Flag (CTF) Flag               │
│ Formats used:                                                │
│    atbash                                                    │
│    reverse                                                   │
│    atbash                                                    │
│    base58_bitcoinPlaintext: "flag{Welc0me_to_p1ay_th3_g4me}"
```
