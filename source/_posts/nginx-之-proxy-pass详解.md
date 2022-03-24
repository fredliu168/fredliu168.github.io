---
title: nginx 之 proxy_pass详解
date: 2021-04-14 11:06:40
tags:
---
在nginx中配置proxy_pass代理转发时，如果在proxy_pass后面的url加/，表示绝对根路径；如果没有/，表示相对路径，把匹配的路径部分也给代理走。

假设下面四种情况分别用 http://192.168.1.1/proxy/test.html 进行访问。

## 第一种：

```
location /proxy/ {
proxy_pass http://127.0.0.1/;
}
```
代理到URL：http://127.0.0.1/test.html

第二种（相对于第一种，最后少一个 / ）
```
location /proxy/ {
proxy_pass http://127.0.0.1;
}
```
代理到URL：http://127.0.0.1/proxy/test.html

第三种：
```
location /proxy/ {
proxy_pass http://127.0.0.1/aaa/;
}
```
代理到URL：http://127.0.0.1/aaa/test.html

第四种（相对于第三种，最后少一个 / ）
```
location /proxy/ {
proxy_pass http://127.0.0.1/aaa;
}
```
代理到URL：http://127.0.0.1/aaatest.html

nginx中有两个模块都有proxy_pass指令。

ngx_http_proxy_module的proxy_pass：
语法: proxy_pass URL;场景: location, if in location, limit_except说明: 设置后端代理服务器的协议(protocol)和地址(address),以及location中可以匹配的一个可选的URI。协议可以是"http"或"https"。地址可以是一个域名或ip地址和端口，或者一个 unix-domain socket 路径。  详见官方文档: http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_passURI的匹配，本文第四部分重点讨论。
ngx_stream_proxy_module的proxy_pass：
语法: proxy_pass address;场景: server说明: 设置后端代理服务器的地址。这个地址(address)可以是一个域名或ip地址和端口，或者一个 unix-domain socket路径。  详见官方文档: http://nginx.org/en/docs/stream/ngx_stream_proxy_module.html#proxy_pass

## 二、两个proxy_pass的关系和区别

在两个模块中，两个proxy_pass都是用来做后端代理的指令。
ngx_stream_proxy_module模块的proxy_pass指令只能在server段使用使用, 只需要提供域名或ip地址和端口。可以理解为端口转发，可以是tcp端口，也可以是udp端口。
ngx_http_proxy_module模块的proxy_pass指令需要在location段，location中的if段，limit_except段中使用，处理需要提供域名或ip地址和端口外，还需要提供协议，如"http"或"https"，还有一个可选的uri可以配置。

## 三、proxy_pass的具体用法

ngx_stream_proxy_module模块的proxy_pass指令
```
server {
    listen 127.0.0.1:12345;
    proxy_pass 127.0.0.1:8080;
}
 
server {
    listen 12345;
    proxy_connect_timeout 1s;
    proxy_timeout 1m;
    proxy_pass example.com:12345;
}
 
server {
    listen 53 udp;
    proxy_responses 1;
    proxy_timeout 20s;
    proxy_pass dns.example.com:53;
}
 
server {
    listen [::1]:12345;
    proxy_pass unix:/tmp/stream.socket;
}
```
ngx_http_proxy_module模块的proxy_pass指令
```
server {
    listen      80;
    server_name www.test.com;
 
    # 正常代理，不修改后端url的
    location /some/path/ {
        proxy_pass http://127.0.0.1;
    }
 
    # 修改后端url地址的代理（本例后端地址中，最后带了一个斜线)
    location /testb {
        proxy_pass http://www.other.com:8801/;
    }
 
    # 使用 if in location
    location /google {
        if ( $geoip_country_code ~ (RU|CN) ) {
            proxy_pass http://www.google.hk;
        }
    }
 
    location /yongfu/ {
        # 没有匹配 limit_except 的，代理到 unix:/tmp/backend.socket:/uri/
        proxy_pass http://unix:/tmp/backend.socket:/uri/;;
 
        # 匹配到请求方法为: PUT or DELETE, 代理到9080
        limit_except PUT DELETE {
            proxy_pass http://127.0.0.1:9080;
        }
    }
 
}
```

## 四、proxy_pass后，后端服务器的url(request_uri)情况分析


```
server {
    listen      80;
    server_name www.test.com;
 
    # 情形A
    # 访问 http://www.test.com/testa/aaaa
    # 后端的request_uri为: /testa/aaaa
    location ^~ /testa/ {
        proxy_pass http://127.0.0.1:8801;
    }
    
    # 情形B
    # 访问 http://www.test.com/testb/bbbb
    # 后端的request_uri为: /bbbb
    location ^~ /testb/ {
        proxy_pass http://127.0.0.1:8801/;
    }
 
    # 情形C
    # 下面这段location是正确的
    location ~ /testc {
        proxy_pass http://127.0.0.1:8801;
    }
 
    # 情形D
    # 下面这段location是错误的
    #
    # nginx -t 时，会报如下错误: 
    #
    # nginx: [emerg] "proxy_pass" cannot have URI part in location given by regular 
    # expression, or inside named location, or inside "if" statement, or inside 
    # "limit_except" block in /opt/app/nginx/conf/vhost/test.conf:17
    # 
    # 当location为正则表达式时，proxy_pass 不能包含URI部分。本例中包含了"/"
    location ~ /testd {
        proxy_pass http://127.0.0.1:8801/;   # 记住，location为正则表达式时，不能这样写！！！
    }
 
    # 情形E
    # 访问 http://www.test.com/ccc/bbbb
    # 后端的request_uri为: /aaa/ccc/bbbb
    location /ccc/ {
        proxy_pass http://127.0.0.1:8801/aaa$request_uri;
    }
 
    # 情形F
    # 访问 http://www.test.com/namea/ddd
    # 后端的request_uri为: /yongfu?namea=ddd
    location /namea/ {
        rewrite    /namea/([^/]+) /yongfu?namea=$1 break;
        proxy_pass http://127.0.0.1:8801;
    }
 
    # 情形G
    # 访问 http://www.test.com/nameb/eee
    # 后端的request_uri为: /yongfu?nameb=eee
    location /nameb/ {
        rewrite    /nameb/([^/]+) /yongfu?nameb=$1 break;
        proxy_pass http://127.0.0.1:8801/;
    }
 
    access_log /data/logs/www/www.test.com.log;
}
 
server {
    listen      8801;
    server_name www.test.com;
    
    root        /data/www/test;
    index       index.php index.html;
 
    rewrite ^(.*)$ /test.php?u=$1 last;
 
    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_pass unix:/tmp/php-cgi.sock;
        fastcgi_index index.php;
        include fastcgi.conf;
    }
 
    access_log /data/logs/www/www.test.com.8801.log;
}
 
```
文件: /data/www/test/test.php
```
<?php
echo '$_SERVER[REQUEST_URI]:' . $_SERVER['REQUEST_URI'];
通过查看 $_SERVER['REQUEST_URI'] 的值，我们可以看到每次请求的后端的request_uri的值，进行验证。
```

## 小结

情形A和情形B进行对比，可以知道proxy_pass后带一个URI,可以是斜杠(/)也可以是其他uri，对后端request_uri变量的影响。
情形D说明，当location为正则表达式时，proxy_pass不能包含URI部分。
情形E通过变量($request_uri, 也可以是其他变量)，对后端的request_uri进行改写。
情形F和情形G通过rewrite配合break标志,对url进行改写，并改写后端的request_uri。需要注意，proxy_pass地址的URI部分在情形G中无效，不管如何设置，都会被忽略。


作者：金星show
链接：https://www.jianshu.com/p/b010c9302cd0
来源：简书
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。