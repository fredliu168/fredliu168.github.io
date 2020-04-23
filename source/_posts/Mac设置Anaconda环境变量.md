---
title: Mac设置Anaconda环境变量
date: 2020-04-23 11:42:04
tags:
---

## 设置环境变量

打开mac终端，输入 conda --version

返回是 conda command not found....命令不存在哇。

是需要把anaconda的路径配置到系统环境变量中。

然后是，在mac终端用命令行的形式，添加并激活anaconda的环境变量：

添加命令：

```
echo 'export PATH="/Users/software/anaconda3/bin:$PATH"' >> ~/.zshrc
```

解释说明：echo是返回字符串的命令，~/目录是家目录，即/Users/<个人用户名>。两个>(英文半角下的大于号)表示不改变后面文件中的原有内容，添加引号中的内容，有这个文件会自动新建。为什么是.zshrc文件呢，因为我的终端打开用的是-zsh工具。

总之就是，将单引号中的内容写到~/目录下的.ashrc文件中。

激活命令：
```
source ~/.zshrc
```

目录下查看文件，结果如下图所示。（怎么显示隐藏文件：在终端中输命令
“
```
defaults write com.apple.finder AppleShowAllFiles -boolean true;killall Finder
```
”即可）


## 新建虚拟环境

还想新建一个独立于默认base的编程环境，安装python3.6，和tf1.15.0

首先，创建命令：

```
conda create -n py36tf1 numpy pandas python=3.6
```

py36tf1是我给新建环境的命名，可改成自己的。numpy pandas是可以同时下载的包。指定python3.6版本。

然后，激活新环境命令：

```
source activate py36tf1
```

再，可以使用命令：

```
conda env list
```

看看现在有哪些编程环境了。 

退出当前环境，使用命令：
```
conda deactivate(同时也切换到另一环境)
```