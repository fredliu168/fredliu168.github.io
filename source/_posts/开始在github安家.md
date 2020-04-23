---
title: 开始在github安家
date: 2016-06-19 23:24:28
tags: 日记
---
   
## 前言

从最开始自己买空间,到后来使用百度云,后来百度云开始收费,就转向新浪云,最近新浪云也开始收费了,一直再找合适的地方,在同事的推荐下开始转向免费的github,经过几天的折腾终于差不多完工了.使用了hexo来搭建静态blog,使用nexT博客模板,使用MWeb Lite编辑博客,搭建过程中参考了以下网站.
    

> [hexo.io 中文文档](https://hexo.io/zh-cn/docs/)
> [theme-next 使用文档](http://theme-next.iissnan.com/)

<!-- more -->

## 设置文章标签:

 
> [设置文章标签](https://github.com/iissnan/hexo-theme-next/wiki/%E5%88%9B%E5%BB%BA%E6%A0%87%E7%AD%BE%E4%BA%91%E9%A1%B5%E9%9D%A2)
 

## 绑定域名:
绑定自己的域名两步走。
1.但是在绑定之前，你需要已经生成了你的github主页（如：你的用户名.github.io）。
2.在/source目录下创建一个CNAME文件（文件名叫CNAME，没有文件后缀），并上传至你的主页项目中。
文件内容:
```
qzcool.com 
```
3.前往你的DNS服务商新建一个CNAME解析至你的github page个人主页地址（如：fredliu168.github.io）。

然后就 sudo hexo d -g 试试吧。

## 启用 HTTPS

其他:[为绑定域名的 GitHub Pages 启用 HTTPS](https://mazhuang.org/2016/05/21/enable-https-for-github-pages/)

## 设置友情链接

在站点 _config.yml 中设置以下代码

```
# Blogrolls
links_title: 友情链接
links_layout: block
#links_layout: inline
links:
  淡水网志: https://www.restran.net/
```

在 NexT 主题更新后，但是网页却没有更新，还是老样子，在本地查看则确实更新了，后来我执行了 hexo clean ，再次 deploy 就 ok 了。

## 常用命令
sudo hexo d -g 一键发布网站
sudo hexo clean 清除缓存
sudo hexo server 开启本地服务
sudo hexo generate 本地生成
hexo deploy 发布到Git

