---
title: Nginx废除支持TSL1.0和TSL1.1导致Python3网络请求时出现CERTIFICATE_VERIFY_FAILED处理
date: 2021-10-19 15:45:19
tags:
---

nginx配置不支持TSL1.0和TSL1.1后出现:



```
error: [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: certificate has expired 
```

把代码中的 
 
```python
AsyncHTTPClient(max_clients=config.async_http_client_max_clients).fetch(
                HTTPRequest(url=url,
                            method=method,
                            body=body,
                            headers=self.headers,
                            ssl_options={"ssl_version": ssl.PROTOCOL_TLSv1}, 
                            follow_redirects=False),
                self._on_proxy)
```
```
ssl_options={"ssl_version": ssl.PROTOCOL_TLSv1}
```
改为:
```
ssl_options={"ssl_version": ssl.PROTOCOL_SSLv23}
```