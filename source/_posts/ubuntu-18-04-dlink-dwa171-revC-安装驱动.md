---
title: ubuntu 18.04 - dlink dwa171 (revC)安装驱动
date: 2019-11-15 10:30:01
tags:
---

```
sudo apt update
sudo apt install build-essential git dkms
git clone https://github.com/brektrou/rtl8821CU.git
cd rtl8821CU
chmod +x dkms-install.sh
sudo ./dkms-install.sh

sudo modprobe 8821cu
```

Problem of not being able to use D-Link AC600 (DWA 171 Revision C) as WiFi USB as it is recognised as USB Flush Memory (storing Windows driver files). Note that this is NOT about DWA 171 revision A.

## Cause

As per Problem with Wi-Fi USB Adapter D-Link DWA-171:

A DWA-171 Revision C became available in 2018, and is marked as such on the dongle label. The revA is a straightforward wifi dongle -- with the correct Linux driver installed, plug in the dongle and you're off to the races. But the revC first enumerates as USB Storage, and as such contains a Setup.exe to install Windows drivers.

lsusb shows the DWA 171 Revision C as Realtek flash drive.

Bus 003 Device 005: ID 0bda:1a2b Realtek Semiconductor Corp.    <----- USB Flash memory mode of DWA 171

## Solution

As per Automatically use usb_modeswitch for Wifi USB, run usb_modeswitch as below (after , and confirm with lsusb and ip commands.

```
$ lsusb
...
Bus 003 Device 005: ID 0bda:1a2b Realtek Semiconductor Corp.

$ /usr/sbin/usb_modeswitch -K -v 0bda -p 1a2b
$ lsusb
...
Bus 003 Device 006: ID 2001:331d D-Link Corp.  <--- Changed from Realtek

$ ip link show
...
```
3: wlx58d56e015102: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state 

UP mode DORMANT group default qlen 1000
    link/ether 58:d5:6e:01:51:02 brd ff:ff:ff:ff:ff:ff
Explanation
The REFERENCE document included in the usb-modeswitch-data package says -K means ejecting the device.

StandardEject <0/1> -K
Sends a specific bulk message sequence representing the SCSI commands "ALLOW MEDIUM REMOVAL" and "START STOP UNIT", basically an eject action. Many modems are using this for mode switching. Can be combined with one additional 'MessageContent'

## Conclusion

To use the D-Link AC 600 (DWA 171 Revision C) as USB WiFi.

Compile, install, and load the 8821cu module (NOT 8821au).
Verify the module is loaded with lsmod.
Eject the USB flash drive with usb_modeswitch -K.
Verify the USB WiFi D-Link is displayed with lsusb.

## References

[USB_ModeSwitch - Handling Mode-Switching USB Devices on Linux](http://www.draisberghof.de/usb_modeswitch/)