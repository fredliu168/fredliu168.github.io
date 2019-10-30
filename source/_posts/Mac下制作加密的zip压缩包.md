---
title: Mac下制作加密的zip压缩包
date: 2019-10-30 15:00:00
tags:
---

Mac下创建加密的zip文件，无需第三方软件，直接在终端中 敲入几行命令就能搞定。
方法一： 

选择压缩包保存路径：
```
$ cd yourPath
```

### 1. 只压缩单个文件

```
zip -e yourZipFileName.zip yourSourceFile
```

回车 ，分别输入密码（回车）和确认密码（回车）就OK了。

### 2. 压缩文件夹

```
zip -e -r yourZipFileName.zip yourSourceFileDir
```

其余同上。(-r 表示将文件夹中所有的文件进行压缩)

### 方法二：可以通过一行命令搞定

```
zip -r -P yourPassword yourZipFileName.zip yourSourceFileDir
```

回车就OK了，但是这种方法只输入一次密码，万一压缩时输错密码，再想打开可就悲剧了。

> 注意: -P 需要大写

> Encryption:
  -e        use standard (weak) PKZip 2.0 encryption, prompt for password
  -P pswd   use standard encryption, password is pswd
 
————————————————
> 版权声明：本文为CSDN博主「yooozooo」的原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/yooozooo/article/details/42496735