---
title: iOS指纹解锁Touch ID使用说明文档
date: 2016-09-30 16:47:53
tags: iOS
categories: iOS
---
## iOS指纹解锁Touch ID使用说明文档
> 时间:2016-09-21


### 前言
使用方法可以参考提供的demo项目"DemoTouchID",项目使用obj c++语言xcode 版本8.0开发.
下载地址:http://pan.baidu.com/s/1pLIVKtd

### 一.支持系统和机型
iOS系统的指纹识别功能最低支持的机型为iPhone 5s，最低支持系统为iOS 8。 

<!-- more -->

### 二.依赖框架
在使用前需要导入 LocalAuthentication.framework 这个库 

```objc++
#import <LocalAuthentication/LocalAuthentication.h>
```

### 三.错误类型
目前Touch ID的错误类型如下: 
```
typedef NS_ENUM(NSInteger, LAError)

{

    /// Authentication was not successful, because user failed to provide valid credentials.
  // 用户未提供有效证书,(3次机会失败 --身份验证失败)。
 LAErrorAuthenticationFailed = kLAErrorAuthenticationFailed, 

    /// Authentication was canceled by user (e.g. tapped Cancel button).

    LAErrorUserCancel           = kLAErrorUserCancel, 

    /// Authentication was canceled, because the user tapped the fallback button (Enter Password).

    LAErrorUserFallback         = kLAErrorUserFallback, 

    /// Authentication was canceled by system (e.g. another application went to foreground).

    LAErrorSystemCancel         = kLAErrorSystemCancel, 

    /// Authentication could not start, because passcode is not set on the device.

    LAErrorPasscodeNotSet       = kLAErrorPasscodeNotSet, 

    /// Authentication could not start, because Touch ID is not available on the device.

    LAErrorTouchIDNotAvailable  = kLAErrorTouchIDNotAvailable,     

    /// Authentication could not start, because Touch ID has no enrolled fingers.

    LAErrorTouchIDNotEnrolled = kLAErrorTouchIDNotEnrolled, 

    /// Authentication was not successful, because there were too many failed Touch ID attempts and

    /// Touch ID is now locked. Passcode is required to unlock Touch ID, e.g. evaluating

    /// LAPolicyDeviceOwnerAuthenticationWithBiometrics will ask for passcode as a prerequisite.

    LAErrorTouchIDLockout   NS_ENUM_AVAILABLE(10_11, 9_0) __WATCHOS_AVAILABLE(3.0) __TVOS_AVAILABLE(10.0) = kLAErrorTouchIDLockout,  

    /// Authentication was canceled by application (e.g. invalidate was called while

    /// authentication was in progress).

    LAErrorAppCancel        NS_ENUM_AVAILABLE(10_11, 9_0) = kLAErrorAppCancel, 

    /// LAContext passed to this call has been previously invalidated.

    LAErrorInvalidContext   NS_ENUM_AVAILABLE(10_11, 9_0) = kLAErrorInvalidContext

} NS_ENUM_AVAILABLE(10_10, 8_0) __WATCHOS_AVAILABLE(3.0) __TVOS_AVAILABLE(10.0);
```

iOS 9 新增了3种错误类型: 
> * LAErrorTouchIDLockout:是在8.0中也会出现的情况，但并未归为单独的错误类型，这个错误出现，源自用户多次连续使用Touch ID失败，Touch ID被锁，需要用户输入密码解锁

> * LAErrorAppCancel和LAErrorSystemCancel相似，都是当前软件被挂起取消了授权，但是前者是用户不能控制的挂起，例如突然来了电话，电话应用进入前台，APP被挂起。后者是用户自己切到了别的应用，例如按home键挂起。
> * LAErrorInvalidContext很好理解，就是授权过程中,LAContext对象被释放掉了，造成的授权失败。

### 四.代码
首先判断系统版本，iOS 8及以上版本执行-(void)authByTouchID方法，方法自动判断设备是否支持和开启Touch ID。
```

-(void)AuthByTouchID

{//通过指纹验证

    LAContext *context = [[LAContext alloc] init];

    context.localizedFallbackTitle = @"手势解锁";//不设置默认显示"输入密码"    

    NSError *error = nil; 

    BOOL isTouchIdAvailable = [context canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:&error];  

    if (isTouchIdAvailable)

    {

        [context evaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics

                localizedReason:@"通过Home键验证已有手机指纹" reply:^(BOOL success, NSError *error) { 

                    if (success) {

                        //验证成功，主线程处理UI

                        dispatch_async (dispatch_get_main_queue(), ^{

                            //在主线程更新 UI,不然会卡主

                            NSLog(@"Authentication success");

                        }); 

                    }

                    else

                    {

                        NSLog(@"%@ %ld",error.localizedDescription,(long)error.code);

                        switch (error.code) {

                            case kLAErrorAuthenticationFailed:

                            {

                                NSLog(@"Authentication was not successful, because user failed to provide valid credentials");

                                //超过尝试次数,认证失败

                                break;

                            }

                            case LAErrorSystemCancel:

                            {

                                NSLog(@"Authentication was cancelled by the system");

                                //切换到其他APP，系统取消验证Touch ID

                                break;

                            }

                            case LAErrorUserCancel:

                            {

                                NSLog(@"Authentication was cancelled by the user");

                                //用户取消验证Touch ID

                                break;

                            }

                            case LAErrorUserFallback:

                            {

                                NSLog(@"User selected to enter custom password");

                                [[NSOperationQueue mainQueue] addOperationWithBlock:^{

                                    //用户选择输入密码，切换主线程处理

                                }];

                                break;

                            }

                            default:

                            {

                                [[NSOperationQueue mainQueue] addOperationWithBlock:^{

                                    //其他情况，切换主线程处理

                                    NSLog(@"%@",error.localizedDescription);

                                }];

                                break;

                            }

                        }

                    }                     

                }];

    }

    else

    {

        //不支持指纹识别，LOG出错误详情 

        switch (error.code) {

            case LAErrorTouchIDNotEnrolled:

            {

                NSLog(@"TouchID is not  ");

                break;

            }

            case LAErrorPasscodeNotSet:

            {

                NSLog(@"A passcode has not been set");

                break;

            }

            case LAErrorTouchIDLockout:

            {//touchid已被锁定

                NSLog(@"LAErrorTouchIDLockout");

                break;

            }

            default:

            {

                NSLog(@"TouchID not available");

                break;

            }

        } 

        NSLog(@"%@",error.localizedDescription);

    }

}  
```

