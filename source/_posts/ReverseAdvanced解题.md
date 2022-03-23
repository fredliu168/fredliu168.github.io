---
title: ReverseAdvanced解题
date: 2022-03-24 00:18:20
tags: ctf
---
# 春秋网鼎杯网络安全大赛advanced题目writeup


[附件下载:scr](ReverseAdvanced解题/src)

file命令查看是一个64位的ELF文件    运行后无交互动作   只输出

welcome, here is your identification, please keep it in your pocket: **4b404c4b5648725b445845734c735949405c414d5949725c45495a51**

```shell
$ file /home/kali/Desktop/src                                    
/home/kali/Desktop/src: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=c87b49d516e19f9b4d01673c90ac79283f6672a2, stripped

```

```shell
$ ./src                                                                                127 ⨯
welcome, here is your identification, please keep it in your pocket: 4b404c4b5648725b445845734c735949405c414d5949725c45495a51

```


到这里  平常的思路是打开IDA 进行分析(当时我就是这么做的。。。)

而大佬们则是一眼看出这是异或flag{********}之后得到的

于是上python     挑出前几位 **f l a g {** 与最后一位 **} **分别与对应位置的十六进制进行异或

```
  print(ord('f') ^ 0x4b)
  45
  print(ord('l') ^ 0x40)
  44
  print(ord('a') ^ 0x4c)
  45
  print(ord('g') ^ 0x4b)
  44
```


然后就可以发现有规律  每次得到的结果只会是44或者45

根据异或的性质    我们将奇数位与45异或    偶数位与44异或  就可以得到flag

代码如下：

```python
    enc = '4b404c4b5648725b445845734c735949405c414d5949725c45495a51'

    array_enc = []
    for i in range(0, len(enc), 2):
        array_enc.append(enc[i:i + 2])


    print(ord('f') ^ 0x4b)
    print(ord('l') ^ 0x40)
    print(ord('a') ^ 0x4c)
    print(ord('g') ^ 0x4b)
  
    flag = []
    for i in range(len(array_enc)): 
        if i % 2 == 0:
            # print(chr(int(array_enc[i], 16) ^ 45))
            flag.append(chr(int(array_enc[i], 16) ^ 45))
        if i % 2 == 1:
            # print(chr(int(array_enc[i], 16) ^ 44))
            flag.append(chr(int(array_enc[i], 16) ^ 44))
  
    print(''.join(flag)) # flag{d_with_a_template_phew}
```
