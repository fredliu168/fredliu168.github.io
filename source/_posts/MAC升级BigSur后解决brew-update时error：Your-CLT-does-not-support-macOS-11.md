---
title: MAC升级BigSur后解决brew update时error：Your CLT does not support macOS 11.
date: 2021-03-22 09:57:35
tags:
---

最近MacOS升级了Big Sur后安装ffmpeg时遇到version too old问题，执行brew update时遇到错误：

```
Your CLT does not support macOS 11.

```

命令行输入：
```
  sudo rm -rf /Library/Developer/CommandLineTools
  sudo xcode-select --install
```
后问题解决。

再次brew update