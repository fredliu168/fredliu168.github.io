---
title: misc签到Halo
date: 2022-03-22 17:15:33
tags: ctf
---
## Misc-Halo

题目:

```
aWdxNDs6NDFSOzFpa1I1MWliT08w
```

请提交flag{}形式的答案 （这题没多难，这题只是缺德）

##### 解题：

base64后:

igq4;:41R;1ikR51ibOO0

后来尝试多种后，想到之前看到过的base64和异或，于是尝试了下：

```
python
from base64 import *

    b = b64decode("aWdxNDs6NDFSOzFpa1I1MWliT08w").decode()
    print(b)

    data = list(b)

    print(data)
    for k in range(0, 200):

        key = ""

        for i in range(len(data)):
            key += chr(ord(data[i]) ^ k)

        print(key)
```

输出:

```
igq4;:41R;1ikR51ibOO0
hfp5:;50S:0hjS40hcNN1
kes69863P93kiP73k`MM2
jdr78972Q82jhQ62jaLL3
mcu0?>05V?5moV15mfKK4
lbt1>?14W>4lnW04lgJJ5
oaw2=<27T=7omT37odII6
n`v3<=36U<6nlU26neHH7
aoy<32<9Z39acZ=9ajGG8
`nx=23=8[28`b[<8`kFF9
cm{>10>;X1;caX?;chEE:
blz?01?:Y0:b`Y>:biDD;
ek}8768=^7=eg^9=enCC<
dj|9679<_6<df_8<doBB=
igq4;:41R;1ikR51ibOO0
hfp5:;50S:0hjS40hcNN1
kes69863P93kiP73k`MM2
jdr78972Q82jhQ62jaLL3
mcu0?>05V?5moV15mfKK4
lbt1>?14W>4lnW04lgJJ5
oaw2=<27T=7omT37odII6
n`v3<=36U<6nlU26neHH7
aoy<32<9Z39acZ=9ajGG8
`nx=23=8[28`b[<8`kFF9
cm{>10>;X1;caX?;chEE:
blz?01?:Y0:b`Y>:biDD;
ek}8768=^7=eg^9=enCC<
dj|9679<_6<df_8<doBB=
....
```

看到唯一一个没有特殊字符的：

```
jdr78972Q82jhQ62jaLL3
```

提交,即flag~
