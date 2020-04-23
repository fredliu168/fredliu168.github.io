---
title: iOS开发知识点小结
date: 2016-06-20 11:01:01
tags: iOS
categories: iOS
---
## 前言
主要记录日常开发常用到得一些功能记录,包括URL Schemes,NSDictionary,UITableView等.
 
## NSDate
获取时间戳:
```objc
 NSDate *datenow = [NSDate date]; 
 NSString *timeSp = [NSString stringWithFormat:@"%ld", 
 (long)[datenow timeIntervalSince1970]];

```

## 获取应用版本号
```objc
NSString *app_Version = [[[NSBundle mainBundle] infoDictionary]
objectForKey:@"CFBundleShortVersionString"]; 
 
int currentCode = [[[[NSBundle mainBundle] infoDictionary]
objectForKey:@"CFBundleVersion"] intValue];
```

<!-- more -->

## URL Schemes
### 适配ios9出现的问题：-canOpenURL: failed for URL
除了要在项目info URL Types中设置URL Schemes，还需要在info.plist里面增加可信任的调用app，否则回报如下错误

```objc
-canOpenURL: failed for URL: "wtloginmqq2://qzapp" 
- error: "This app is not allowed to query for scheme wtloginmqq2"
```

info.plist加入

```objc
<key>LSApplicationQueriesSchemes</key>
<array>
<string>urlscheme</string>
<string>urlscheme2</string>
<string>urlscheme3</string> 
</array>
```


## NSDictionary的使用
### 用NSDictionary来解析Json数据
假设json数据格式如下:

```json

{
    "value": [
        {
            "biz_code": "501100000228416",
            "biz_name": "圣湖东兴商住楼H",
            "biz_lng": "118.605877",
            "biz_lat": "24.903232",
        },

        {
            "biz_code": "501100000625763",
            "biz_name": "丰泽圣湖家园",
            "biz_lng": "118.962019",
            "biz_lat": "24.964523",
        }],
     "code":10000,
     "message":"获取数据成功"
 }   

```

如何解析该数据呢?

如果json是NSData数据类型,直接用NSJSONSerialization系列化,如果是NSString类型的,先转成NSData数据类型

代码如下:

```objc

//json数据

NSString *json = @"{\"value\":[{\"biz_code\":\"501100000228416\",...},...],"code":10000,\"message\":\"获取数据成功\"}";

//转成NSData

NSData *json_data =  [json dataUsingEncoding:NSUTF8StringEncoding];

//转成字典 
NSError *error; 
NSDictionary *jsonDic = [NSJSONSerialization JSONObjectWithData:json_data options:NSJSONReadingMutableLeaves error:&error];

NSArray  *value      = [jsonDic objectForKey:@"value"];  
int      code        = [[jsonDic objectForKey:@"code"] intValue];
NSString *message    = [jsonDic objectForKey:@"message"]; 

if(code == 10000) 
{    
	for(NSDictionary *dicObj in value)
	{ 

    NSString *biz_code = [dicObj objectForKey:@"biz_code"];
    NSString *biz_name = [dicObj objectForKey:@"biz_name"];
    NSString *biz_lng = [dicObj objectForKey:@"biz_lng"];
    NSString *biz_lat=  [dicObj objectForKey:@"biz_lat"]; 
     NSLog(@"biz_code:%@ biz_name:%@ biz_lng:%@ biz_lat:%@",biz_code,biz_name,biz_lng,biz_lat);

 }  
 } 

```

如果josn NSData 数据类型如果要转成NSString查看,用如下方法:

```objc

NSString *strJson = [[NSString alloc]initWithData:json_data encoding:NSUTF8StringEncoding];
NSLog(@"json:%@",json);
```


## 点击-UITableView-隐藏键盘

在 UITableView 上加手势

```objc

UITapGestureRecognizer *gestureRecognizer = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(hideKeyboard)];
[self.tableView addGestureRecognizer:gestureRecognizer];

```



```objc

- (void) hideKeyboard {

    [textField1 resignFirstResponder];

    [textField2 resignFirstResponder];

    ...

    ...

} 

```


ps:加上这句不会影响你 tableview 上的 action (button,cell selected...)

```objc
gestureRecognizer.cancelsTouchesInView = NO;

```




