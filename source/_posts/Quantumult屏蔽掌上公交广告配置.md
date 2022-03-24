---
title: Quantumult屏蔽掌上公交广告配置
date: 2021-08-26 11:02:52
tags:
---

掌上公交提供了实时的公交查询,功能做的挺好的,就是广告超级多,体验超级差,有开屏广告,弹窗广告,后台却换广告,暂时没找到可以替代的软件,而已没有提供会员去广告的功能,希望该软件能出一个会员免广告版本,我可以考虑充个会员,无奈只能想办法怎么去屏蔽一下广告,经过摸索发现Quantumult可以设置屏蔽相关站点.瞬间清爽了,设置如下.

[TCP]
HOST,api-access.pangolin-sdk-toutiao.com,REJECT
HOST,telemetry.sdk.inmobi.cn,REJECT
HOST,dg.k.jd.com,REJECT
HOST,kepler.jd.com,REJECT
HOST,baichuan-sdk.taobao.com,REJECT
HOST,qzs.qq.com,REJECT
HOST,cpu-openapi.baidu.com,REJECT
HOST,log-api.pangolin-sdk-toutiao.com,REJECT
HOST,caclick.baidu.com,REJECT
HOST,publish-pic-cpu.baidu.com,REJECT
IP-CIDR,112.49.27.244/24,REJECT
HOST,www.huyue.best,REJECT
HOST,toblog.ctobsnssdk.com,REJECT
HOST,mobads.baidu.com,REJECT
HOST,mobads-logs.baidu.com,REJECT
HOST,sf3-fe-tos.pglstatp-toutiao.com,REJECT
HOST,ulogs.umengcloud.com,REJECT
HOST,mi.gdt.qq.com,REJECT
HOST,ulogs.umeng.com,REJECT
HOST,v2.gdt.qq.com,REJECT
HOST,errlog.umeng.com,REJECT
HOST,ios.bugly.qq.com,REJECT
HOST,sdk.e.qq.com,REJECT
HOST,userlink.alicdn.com,REJECT
HOST,api.lytaohuitao.com,REJECT
HOST,audid-api.taobao.com,REJECT
HOST,sdkm.w.inmobi.cn,REJECT
HOST,adashbc.ut.taobao.com,REJECT

<!-- more -->