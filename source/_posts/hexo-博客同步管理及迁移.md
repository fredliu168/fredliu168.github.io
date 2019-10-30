---
title: hexo 博客同步管理及迁移
date: 2019-10-30 13:20:37
tags:
---
 
背景：一台电脑上已有一个在用的博客，又新用了一台电脑，实现原电脑和新电脑都可以提交更新博客，实现同步或者说博客的版本管理。

步骤：

1.在原电脑上操作，给 username.github.io 博客仓库创建hexo分支，并设为默认分支。（具体可参考这篇文章的操作，有图示）

2.如果未给你的 github 账号添加过当前电脑生成的 ssh key，需要创建 ssh key 并添加到 github 账号上。（如何创建和添加 github help 就有）

3.随便一个目录下，命令行执行 git clone git@github.com:username/username.github.io.git 把仓库 clone 到本地。

4.显示所有隐藏文件和文件夹，进入刚才 clone 到本地的仓库，删掉除了 .git 文件夹以外的所有内容。

5.命令行 cd 到 clone 的仓库，git add -A ，git commit -m "--"，git push origin hexo，把刚才删除操作引起的本地仓库变化更新到远程，此时刷新下 github 端博客hexo分支，应该已经被清空了。

6.将上述 .git 文件夹复制到本机本地博客根目录下（即含有 themes、source 等文件夹的那个目录），现在可以把上述 clone 的本地仓库删掉了，因为它已经没有用了，本机博客目录已经变成可以和 hexo 分支相连的仓库了。

<!-- more -->

7.将博客目录下 themes 文件夹下每个主题文件夹里面的 .git .gitignore 删掉。 

8.cd 到博客目录，git add -A ，git commit -m "--"，git push origin hexo，将博客目录下所有文件更新到 hexo 分支。如果上一步没有删掉 .git .gitignore，主题文件夹下内容将传不上去。至此原电脑上的操作结束。

9.在新电脑上操作，先把新电脑上环境安装好，node.js、git、hexo，ssh key 也创建和添加好。

10.选好博客安装的目录， git clone git@github.com:username/username.github.io.git 。

11.cd 到博客目录，npm install、hexo g && hexo s，安装依赖，生成和启动博客服务。正常的话，浏览器打开 localhost:4000 可以看到博客了。至此新电脑操作完毕。

12以后无论在哪台电脑上，更新以及提交博客，依次执行，git pull，git add -A ，git commit -m "--"，git push origin hexo，hexo clean && hexo g && hexo d 即可。

作者：容与
链接：https://www.zhihu.com/question/21193762/answer/369050999
来源：知乎
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。