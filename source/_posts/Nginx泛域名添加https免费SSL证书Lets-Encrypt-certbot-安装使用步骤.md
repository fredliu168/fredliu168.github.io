---
title: |
  Nginx泛域名添加https免费SSL证书Lets Encrypt(certbot)安装使用步骤
date: 2020-03-16 16:39:28
tags:
---

本文介绍如何在 nginx 服务器上使用免费的 Let’s Encrypt 凭证，提供 HTTPS 的安全加密网页。

本教程的安装环境是:

> 阿里云Ubuntu 16.04.3 LTS (GNU/Linux 4.4.0-105-generic x86_64)

## `STEP 1`

从`Certbot`官方网站下载 `certbot-auto` 指令，並设定其执行权限：
```
wget https://dl.eff.org/certbot-auto
chmod a+x certbot-auto
```
`certbot-auto` 要放在哪裡都可以，建議一開始就找一個適合的地方放好，例如建立一個 `/opt/letsencrypt` 目錄，把 `certbot-auto` 放在這裡：
```
mkdir /opt/letsencrypt
mv certbot-auto /opt/letsencrypt/
```
## `STEP 2`

執行 `certbot-auto`，讓它自動安裝所有相依套件： 
```
/opt/letsencrypt/certbot-auto
```
在执行安装` certbot-auto `过程中，阿里云服务器会提示下列错误:

> OSError: Command /opt/eff.org/certbot/venv/bin/python2.7 - setuptools pkg_resources pip wheel failed with error code 2  

错误的原因是` certbot-auto `使用python2.7，但调用了python3的virtualenv，由于系统安装了多个版本的python的virtualenv，那么怎么删除呢？

解决方法：
 
```
apt-get purge python-virtualenv python3-virtualenv virtualenv

pip install virtualenv
```
然后在执行安装 ` certbot-auto `，终于安装成功！！！

## `STEP 3`

执行`certbot-auto`生成泛域名证书
```
sudo ./certbot-auto certonly \
--server https://acme-v02.api.letsencrypt.org/directory \
 --manual --preferred-challenges dns -d *.qzcool.com
```
执行后会要求验证DNS TXT，提示信息如下:
```
lease deploy a DNS TXT record under the name
_acme-challenge.qzcool.com with the following value:

QcvPzuizmydLs1AmJF-J9eWOfOW7T89i******

Before continuing, verify the record is deployed.
```
泛域名解析需要验证`DNS TXT`，需要到域名提供商里面设置，子域名设置为`_acme-challenge`，记录类型选`TXT`记录，把`QcvPzuizmydLs1AmJF-J9eWOfOW7T89i******`填在记录值那一栏，
配置后可以执行下面命令，看是否正确返回。
```
dig _acme-challenge.qzcool.com txt
```
`DNS TXT` 配置完后，按回车继续执行。

```
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/qzcool.com/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/qzcool.com/privkey.pem
   Your cert will expire on 2018-12-19. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot-auto
   again. To non-interactively renew *all* of your certificates, run
   "certbot-auto renew"
```
然后获取证书成功，记住证书生成的目录，需要到Nginx里面配置
```
 /etc/letsencrypt/live/qzcool.com/fullchain.pem
  /etc/letsencrypt/live/qzcool.com/privkey.pem
```

**补充一下`花生壳`的坑**
>当时为了能内网映射公网，把域名转到`花生壳`网站，结果遇到了一系列的坑，原来免费的东西，在这里各种要钱，下面列举下：
泛域名解析10元/年
可添加无限子域名 20元/年
TXT记录 10元/年
CNAME记录设置 10元/年
URL跳转设置 10元/年
奉劝大家不要用花生壳的域名服务器，太坑了，使用内网映射服务可以使用免费的frp，我的另外一篇文章frp使用教程可以参考。

## `STEP 4`

如果你是第一次使用`nginx`，可以用`certbot`帮你自动生成主域名`nginx`配置，然后在修改相关证书配置。
访问https://certbot.eff.org/，选择你使用的软件和系统，在这里我们选择nginx和Ubuntu 16.04.

安装相关软件
 
```
$ sudo apt-get update
$ sudo apt-get install software-properties-common
$ sudo add-apt-repository ppa:certbot/certbot
$ sudo apt-get update
$ sudo apt-get install python-certbot-nginx 
```
生成证书
```
$ sudo certbot --nginx
```
根据提示输入要添加https的域名，最后提示生成成功，访问你的域名，发现能使用https访问。

使用
```
nginx -t
```
查看`nginx`的配置目录，我服务器上的配置目录`/etc/nginx/nginx.conf`，修改配置文件：
``` 
vim /etc/nginx/sites-enabled/default 
```
记得把` try_files $uri $uri/ =404;`这个注释掉，否则访问会出错，暂时没查这个是什么问题，修改配置如下。
```
# /etc/nginx/sites-enabled/default 
server_name *.qzcool.com; # managed by Certbot 
location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404. 
                proxy_pass http://172.17.0.1:8080;
                proxy_set_header    Host            $host:80;
                proxy_set_header    X-Real-IP       $remote_addr;
                proxy_set_header    X-Forwarded-For           $proxy_add_x_forwarded_for;
                proxy_hide_header   X-Powered-By; 
    #  try_files $uri $uri/ =404;
        } 
    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/dhbmw.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/dhbmw.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot 
}

server {
        listen 80 ;
        server_name www.qzcool.com;
        rewrite ^(.*)$ https://$host$1 permanent;
}
```

nginx从新加载配置文件
```
 nginx -s reload 
```

## 证书定时更新
Let’s Encrypt 的憑證使用期限只有三個月，在憑證到期前的一個月可以使用 certbot-auto 來更新憑證，在實際更新之前我們可以加入 --dry-run 參數，先進行測試：
```
/opt/letsencrypt/certbot-auto renew --dry-run
```
若測試沒問題，就可以使用正式指令來更新：
```
/opt/letsencrypt/certbot-auto renew --quiet --no-self-upgrade
```
而為了方便起見，可以將這個更新指令寫在 /opt/letsencrypt/renew.sh 指令稿中：
```
#!/bin/sh
/opt/letsencrypt/certbot-auto renew --quiet --no-self-upgrade --post-hook "service nginx reload"
```
這裡我又加上一個 --post-hook 的設定，讓憑證更新完後，可以自動重新載入 nginx 伺服器的設定，讓憑證生效。

接著把這個 /opt/letsencrypt/renew.sh 指令稿寫進 crontab 中，
键入` crontab  -e` 编辑crontab服务文件

```
# m h  dom mon dow   command
30 2 * * 0 /opt/letsencrypt/renew.sh
```
官方的建議是這個指令可以一天執行兩次，讓伺服器的憑證隨時保持在最新的狀態，這裡我是設定讓伺服器每週日凌晨兩點半進行憑證的檢查與更新，Certbot 只有在憑證到期前一個月才會進行更新，如果憑證尚未到期，就不會更新。

**crontab相关命令**: 
>查看该用户下的crontab服务是否创建成功， 用` crontab  -l `命令   
启动crontab服务 `sudo service crond start` 
查看服务是否已经运行用 `ps -ax | grep cron `


### 413 Request Entity Too Large报错处理
打开nginx主配置文件nginx.conf，一般在
vim /etc/nginx/nginx.conf
这个位置，找到http{}段并修改以下内容：
```
client_max_body_size 2m;
```
当中的2m修改成你需要的允许文件大小。

参考:
[1.NGINX 使用 Let’s Encrypt 免費 SSL 憑證設定 HTTPS 安全加密網頁教學](https://blog.gtwang.org/linux/secure-nginx-with-lets-encrypt-ssl-certificate-on-ubuntu-and-debian/ "NGINX 使用 Let’s Encrypt 免費 SSL 憑證設定 HTTPS 安全加密網頁教學") 

[2.Certbot nginx下配置SSL](https://certbot.eff.org/lets-encrypt/ubuntuxenial-nginx)