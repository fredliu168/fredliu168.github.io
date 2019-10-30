---
title: H5发送短信
date: 2016-06-20 10:46:05
tags: h5
---

特殊符号需要url编码,比如#号写成%23

Android 系统发送短信:

```htm
<a href="sms:139603558**?body=*%23123">发短信(Android)</a> 
```

iOS系统发送短信:

```htm
<a href="sms:139603558**&body=*%23123">发短信(iOS)</a>
```

