---
title: RSA加密在Vue和Python中的使用
date: 2021-11-17 11:08:14
tags:


---
## 一.Python下使用RSA

安装rsa包

`pip install rsa`

使用在线网站生成RSA公钥和匙钥

http://www.metools.info/code/c80.html

密钥格式使用PKCS#1


RsaUtil.py代码

```python
# -*- coding: UTF-8 -*-
# ! /usr/bin/env python
import base64
import rsa
from rsa import common


# 使用 rsa库进行RSA签名和加解密
class RsaUtil(object):

    # 初始化key
    def __init__(self):

        self.company_public_key = rsa.PublicKey.load_pkcs1("""-----BEGIN RSA PUBLIC KEY-----\n
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvYXgihiiYlfPVEnEyqoR
Vba7m5pD3Us2Nv7BDRBKyP7wMNX5egRwl9h++4HaRzVnTz8uYIXr1S27gNNbuyNn
TtNSx9KnUBctyRTMFRVAWt68xTzT0UGsM3GKhYWU+H+b0q3pmu+xVZ0Q3xzGIiHO
edFCZkSfbvttcEq4CbkYxZRySCgsQWfPuetWKMKWw+9D8rNVJBkvB1/6yh325fJq
1LLcPlA4/Oc0A5Zbd5iKPpAVrdQRsLe3q12pbC0VTekxPWsPYcafhEnJVI3xWwne
41WExxiAwo8iGB7gONkO0YsQXCYRb/aQTFQ3tmms/Vho2CUVLAyzByyMj7jMGwEl
1QIDAQAB\n
-----END RSA PUBLIC KEY-----
""")

        self.company_private_key = rsa.PrivateKey.load_pkcs1("""-----BEGIN RSA PRIVATE KEY-----\n
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC9heCKGKJiV89U
ScTKqhFVtrubmkPdSzY2/sENEErI/vAw1fl6BHCX2H77gdpHNWdPPy5ghevVLbuA
01u7I2dO01LH0qdQFy3JFMwVFUBa3rzFPNPRQawzcYqFhZT4f5vSrema77FVnRDf
HMYiIc550UJmRJ9u+21wSrgJuRjFlHJIKCxBZ8+561YowpbD70Pys1UkGS8HX/rK
Hfbl8mrUstw+UDj85zQDllt3mIo+kBWt1BGwt7erXalsLRVN6TE9aw9hxp+ESclU
jfFbCd7jVYTHGIDCjyIYHuA42Q7RixBcJhFv9pBMVDe2aaz9WGjYJRUsDLMHLIyP
uMwbASXVAgMBAAECggEAFLnST2fYQkb2DnKuybcFhEkihSa+qzGxcRw1Ane4pfhz
TfPof3aC1ahAYsLVmxn0/U6chMPAgaSpr7Htgy6g+pbTo7SexXxzbl0O4HNdgVKA
dFVtmKHE8i9FhcqQ+wgBg22vcVkrHIC7upqL9GmcCehfiY2RnfJzCmexbqbGVbzw
vcllb7lYkEoQaDrZ15+qFS7HQCwjL6lpc9KRwTo+sfQV/udceent0FTRkfqpuDN4
sQws2alzRkRGuvJqCt7OF1aDVijPVbjZVXu2bnrLhpDeD+sjMZg88dxguiPoojfk
WjUVVkpdB5KHZqCmyycBGrcw/bjnzOvvNFvBgw00wQKBgQD0iieqxvwc2I9+RqUD
MD7/3HIL6swuwZinCrZAhhmy8eLxmiXOVk+mxyS0WgckwBpyAf5GPxFVXu2PKo5N
Nc2kTRrrQECggRccMmr0gVgbxtaCJ6HHcVaW+wLnMYjtOAWDtIYoxzcN0n0cyF73
AqsignLPKsnWeErrPHpxgrHWxQKBgQDGZ6ng6nGwduSWZjtdH7CiNnFrjUNO7v7C
ZcjiR9fdIlQv1HIFKZiGnmY55KipFGb2aguFJ3xqhi0hCPbdn2rrjdA997oFfpDU
jji1QxgGtwoUIgvZC6j36Tu97i394DogK/wUsAum1yeeDLkKpBCZ0hiVe78J7YLc
yYwVaeKD0QKBgQDJD/Lvgq52FUVeYT158qhJ/Xoz/Dkn1HvsFG2nfdsRe7rKRaEC
F4tkKGcwdrla6SyVQrhMD7zzwZp31ViteSh9B/yzIuBAWAOlZnr0UIkeRY3H9Egb
UUAN4ZMQfnUD/sTh9oM8chf9IG1IRiN221XUiQdW+Op9keifo9lVDU2ltQKBgGLY
xLcMtqWPJmWT+2Fy52J5s1o9H9qUkZIyebnaxz4h20WVF1VhGt9+zTlspWbPhlig
DqtBN+gufw9lUvCpevBuT+B/qksQeoGbdb9A9RhrWvca20JAX+dbaOtAXeONMghT
QZzg9H0j1lYUyp/1i1vHY34eD9iXX0o2k7cbcMHxAoGBAJsDR0YcqOXLHsBRvOR4
/OLdViw61DSuyvmYcuBLUE0TYsysJfq/bXDiF8ttxMu0S2XMXzTuILM8VaucteWM
hM5f+Dci1o1Lp1C1oftLnl/VkG3so1ck0kTe2fqK5HdKE8iFrfPqkA+gFyJT6mx4
raQC/GelBXiDOaDVf/lLYDwq\n
-----END RSA PRIVATE KEY-----
""")

    def get_max_length(self, rsa_key, encrypt=True):
        """加密内容过长时 需要分段加密 换算每一段的长度.
            :param rsa_key: 钥匙.
            :param encrypt: 是否是加密.
        """
        blocksize = common.byte_size(rsa_key.n)
        reserve_size = 11  # 预留位为11
        if not encrypt:  # 解密时不需要考虑预留位
            reserve_size = 0
        maxlength = blocksize - reserve_size
        return maxlength

    # 加密 支付方公钥
    def encrypt_by_public_key(self, message):
        """使用公钥加密.
            :param message: 需要加密的内容.
            加密之后需要对接过进行base64转码
        """
        encrypt_result = b''
        max_length = self.get_max_length(self.company_public_key)
        while message:
            input = message[:max_length]
            message = message[max_length:]
            out = rsa.encrypt(input.encode(), self.company_public_key)
            #print(out)
            encrypt_result += out
            # print(encrypt_result)
        encrypt_result = base64.b64encode(encrypt_result)

        return encrypt_result

    def decrypt_by_private_key(self, message):
        """使用私钥解密.
            :param message: 需要加密的内容.
            解密之后的内容直接是字符串，不需要在进行转义
        """
        decrypt_result = b""

        max_length = self.get_max_length(self.company_private_key, False)
        decrypt_message = base64.b64decode(message)
        while decrypt_message:
            input = decrypt_message[:max_length]
            decrypt_message = decrypt_message[max_length:]
            out = rsa.decrypt(input, self.company_private_key)
            decrypt_result += out
        return decrypt_result


    # 签名 商户私钥 base64转码
    def sign_by_private_key(self, data):
        """私钥签名.
            :param data: 需要签名的内容.
            使用SHA-1 方法进行签名（也可以使用MD5）
            签名之后，需要转义后输出
        """
        signature = rsa.sign(str(data), priv_key=self.company_private_key, hash='SHA-1')
        return base64.b64encode(signature)

    def verify_by_public_key(self, message, signature):
        """公钥验签.
            :param message: 验签的内容.
            :param signature: 对验签内容签名的值（签名之后，会进行b64encode转码，所以验签前也需转码）.
        """
        signature = base64.b64decode(signature)
        return rsa.verify(message, signature, self.company_public_key)

if __name__ == '__main__':
    message = 'hell world'
    # print("明文内容：>>> ")
    # print(message)
    rsaUtil = RsaUtil()
    encrypy_result = rsaUtil.encrypt_by_public_key(message)
    print("加密结果：>>> ")
    print(encrypy_result.decode())

    decrypt_result = rsaUtil.decrypt_by_private_key(encrypy_result)
    print("解密结果：>>> ")
    print(decrypt_result.decode())

    # key = rsa.newkeys(1024)#生成随机秘钥
    # privateKey = key[1]#私钥
    # publicKey = key[0]#公钥
    # print(publicKey)
    # print(privateKey)
```

## 二.Vue下使用RSA


### 1.现在[vue](https://so.csdn.net/so/search?from=pc_blog_highlight&q=vue)项目中安装依赖包**jsencrypt**

`npm install jsencrypt --save-dev`

### 2.使用rsa加解密过程中会出现待加密和待解密字符串过长情况，需要用到分段加解密需要进入依赖包中修改jsencrypt.js 文件中方法，具体方法如下：

```javascript
//任意长度RSA Key分段加密解密长字符串

    //获取RSA key 长度
    JSEncrypt.prototype.getkeylength = function() {
        return ((this.key.n.bitLength() + 7) >> 3);
    };

    // 分段加密，支持中文
    JSEncrypt.prototype.encryptUnicodeLong = function(string) {
        var k = this.getKey();
        //根据key所能编码的最大长度来定分段长度。key size - 11：11字节随机padding使每次加密结果都不同。
        var maxLength = ((k.n.bitLength() + 7) >> 3) - 11;
        try {
            var subStr = "",
                encryptedString = "";
            var subStart = 0,
                subEnd = 0;
            var bitLen = 0,
                tmpPoint = 0;
            for (var i = 0, len = string.length; i < len; i++) {
                //js 是使用 Unicode 编码的，每个字符所占用的字节数不同
                var charCode = string.charCodeAt(i);
                if (charCode <= 0x007f) {
                    bitLen += 1;
                } else if (charCode <= 0x07ff) {
                    bitLen += 2;
                } else if (charCode <= 0xffff) {
                    bitLen += 3;
                } else {
                    bitLen += 4;
                }
                //字节数到达上限，获取子字符串加密并追加到总字符串后。更新下一个字符串起始位置及字节计算。
                if (bitLen > maxLength) {
                    subStr = string.substring(subStart, subEnd)
                    encryptedString += k.encrypt(subStr);
                    subStart = subEnd;
                    bitLen = bitLen - tmpPoint;
                } else {
                    subEnd = i;
                    tmpPoint = bitLen;
                }
            }
            subStr = string.substring(subStart, len)
            encryptedString += k.encrypt(subStr);
            return hex2b64(encryptedString);
        } catch (ex) {
            return false;
        }
    };

    // 分段解密，支持中文
    JSEncrypt.prototype.decryptUnicodeLong = function(string) {
        var k = this.getKey();
        //解密长度=key size.hex2b64结果是每字节每两字符，所以直接*2
        var maxLength = ((k.n.bitLength() + 7) >> 3) * 2;
        try {
            var hexString = b64tohex(string);
            var decryptedString = "";
            var rexStr = ".{1," + maxLength + "}";
            var rex = new RegExp(rexStr, 'g');
            var subStrArray = hexString.match(rex);
            if (subStrArray) {
                subStrArray.forEach(function(entry) {
                    decryptedString += k.decrypt(entry);
                });
                return decryptedString;
            }
        } catch (ex) {
            return false;
        }
    };

```



### 3.main.js中引用依赖

```javascript
import JSEncrypt from 'jsencrypt';
/* eslint-disable */


let privKey = `-----BEGIN RSA PRIVATE KEY-----
..............
-----END RSA PRIVATE KEY-----`; // ES6 模板字符串 引用 rsa 公钥

Vue.prototype.$getRsaDescrypt = function(str) { // 注册方法
    let encryptStr = new JSEncrypt();
    encryptStr.setPrivateKey(privKey);
    let data = encryptStr.decryptUnicodeLong(str); //解密
    return data;
}

Vue.prototype.$getRsaEncrypt = function(str) { // 注册方法

    let encryptStr = new JSEncrypt();
    encryptStr.setPrivateKey(privKey);
    let data = encryptStr.encryptUnicodeLong(str); //加密
    return data;
}
```


### 4、使用RSA

```javascript
this.$getRsaEncrypt('需要加密内容')

```
