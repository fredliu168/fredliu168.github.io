---
title: Navicat 16 for MySQL 修改注册表 永久试用
date: 2022-09-09 17:09:09
tags:
---

navicat for mysql 16 无限试用

1. win+R打开运行,输入 regedit 打开注册表
2. HKEY_CURRENT_USER\SOFTWARE\PremiumSoft\Navicat\Registration16XCS
   **删除 Registration16XCS 中所有的内容, Registration16XCS不删除**
3. 如果存在 HKEY_CURRENT_USER\SOFTWARE\PremiumSoft\Navicat\Update
   删除 Update
4. HKEY_CURRENT_USER\Software\Classes\CLSID{xxx-xxx-xxx-xxx-xxx}
   找到一个包含Info的 , 删除 Info

脚本如下:

```
@echo off

echo Delete HKEY_CURRENT_USER\Software\PremiumSoft\NavicatPremium\Registration[version and language]
for /f %%i in ('"REG QUERY "HKEY_CURRENT_USER\Software\PremiumSoft\NavicatPremium" /s | findstr /L Registration"') do (
    reg delete %%i /va /f
)
echo.

echo Delete Info folder under HKEY_CURRENT_USER\Software\Classes\CLSID
for /f %%i in ('"REG QUERY "HKEY_CURRENT_USER\Software\Classes\CLSID" /s | findstr /E Info"') do (
    reg delete %%i /va /f
)
echo.

echo Finish

pause

```
