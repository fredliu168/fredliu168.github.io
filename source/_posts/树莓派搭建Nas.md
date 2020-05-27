---
title: 树莓派搭建Nas
date: 2020-05-27 15:39:12
tags:
---

Step 1: 更新系统

```
sudo apt-get update
sudo apt-get upgrade
```

Step 2: 安装 Samba

```
sudo apt-get install samba samba-common-bin

```

Step 3: 挂载移动硬盘

Step 4: 使用 Samba 共享文件夹

```
sudo nano /etc/samba/smb.conf
```

在文件的身份验证下面添加上这一行

```
security = user
```

Step 5: 设置共享文件夹

还是在刚刚那个配置文件上，在结尾添加：

```
[MyNas]
path = /home/pi/shared
writeable=Yes
create mask=0777
directory mask=0777
public=no
```

MyNas: 这定义了与共享文件夹有关的地址和其他配置。例如，共享文件夹将是以下地址：\ raspberrypi \ MyNas。
path：共享文件夹目录；
valid users：有效用户；
read only：是否只读；
create mask：创建文件的权限；
directory mask：创建文件夹的权限；
guest ok：是否允许访客访问；
browseable：是否可见。

添加完成后保存就行了，CTRL + X 然后按 Y and 最后敲个回车

Step 6: 添加用户到 Samba

sudo smbpasswd -a pi
这一步会让你输入密码，这个密码是等会用来登陆 nas 用的，不是系统的那个密码。

pi 是树莓派默认的用户，如果你想改个名也可以，新建用户就完事了。
sudo adduser username
sudo smbpasswd -a username

这一步可能要重启 Samba 才能生效-----------------注：samba 默认开机自启，无需为重启担心。

```
sudo samba restart

```

挂载 ntfs 格式硬盘

```
sudo apt-get install ntfs-3g
```

```
sudo umount /dev/sda2
```

格式化 NTFS

```
sudo mkfs.ntfs -f /dev/sda2
```

```
sudo mount -t ntfs-3g -o permissions /dev/sda2 /home/ubuntu/share

```

自动挂载设备

查看要指定加载储存设备的 UUID

```
sudo blkid
```

结果如下：

```
/dev/mmcblk0p1: LABEL=”boot” UUID=”CDD4-B453” TYPE=”vfat” PARTUUID=”daf17199-01”
/dev/mmcblk0p2: LABEL=”rootfs” UUID=”72bfc10d-73ec-4d9e-a54a-1cc507ee7ed2” TYPE=”ext4” PARTUUID=”daf17199-02”
/dev/mmcblk0: PTUUID=”daf17199” PTTYPE=”dos”
/dev/sda1: LABEL=”piusb” UUID=”3EFBF3DF518ACC17” TYPE=”ntfs” PARTLABEL=”Basic data partition” PARTUUID=”5cb848ac-2940-462f-8600-e881ce428606”
```

```
// 编辑设备管理
sudo vim /etc/fstab
// 在最后一行添加你要挂载的设备
// 针对非 ntfs 格式的移动硬盘
UUID=3EFBF3DF518ACC17 /media/piusb auto defaults,noexec,umask=0000 0 0

// 针对 ntfs 格式的移动硬盘
UUID=7AE83E6917B75C04 /home/ubuntu/share ntfs-3g defaults,noexec,umask=0000 0 0

```

作者：HarryZhang6
链接：https://juejin.im/post/5e5c02dc6fb9a07ccb7e9b58
来源：掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

<!-- more -->
