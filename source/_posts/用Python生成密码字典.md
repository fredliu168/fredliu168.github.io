---
title: 用Python生成密码字典
date: 2022-03-23 16:59:26
tags: ctf
---


题目:

我只记得RAR的密码是 abcdefg 中不重复的6个字母随机排列组成的。但是其中是不是有哪些字母转为了大写,我已经已经记不得了。一切都靠你自己了。
密码举例 cAeGfb

[附件:本压缩包密码需要进行破解3.rar](用Python生成密码字典/本压缩包密码需要进行破解3.rar)


使用python生成密码字典,然后用ARCHPR破解,解密密码: D***,解压后获取flag

flag{158e02c09eac01316960696ff0d8e123}

```pyrhon
 import itertools, string

    words = 'abcdefgABCDEFG'


    def generatePassword(repeat):
        with open('pwd.txt','w') as f:
            for item in itertools.product(words, repeat=repeat):
                # print(item)
                tmp = [x.lower() for x in item]
                #print(tmp)
                set_lst = set(tmp)
                if len(set_lst) == len(tmp):
                    # 没有重复元素
                    # print(''.join(item))
                    f.write(''.join(item)+'\n')


    def generatePasswordForRepeat(min, max):
        for i in range(max - min):
            generatePassword(min + i)


    passwords = generatePassword(6)
```
