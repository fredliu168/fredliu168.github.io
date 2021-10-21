---
title: nginx安全配置
date: 2021-10-21 11:39:27
tags:
---

# 如何避免CRLF注入攻击配置

CR 和 LF 字符将在 $request_uri 中编码为 %0D%0A。
 可以通过在服务器块顶部附近放置一个 if 块来检测它们：  

```nginx
if ( $request_uri ~* "%0A|%0D" ) 
{ 
    return 403; 
}

```