---
title: nginx设置https
date: 2021-08-03 20:12:56
tags:
---

## SSH into the server

SSH into the server running your HTTP website as a user with sudo privileges.

## Install snapd

You'll need to install snapd and make sure you follow any instructions to enable classic snap support.
Follow these instructions on snapcraft's site to install snapd.
 
Ensure that your version of snapd is up to date
Execute the following instructions on the command line on the machine to ensure that you have the latest version of snapd.

```

sudo snap install core; 

sudo snap refresh core
```
Remove certbot-auto and any Certbot OS packages
If you have any Certbot packages installed using an OS package manager like apt, dnf, or yum, you should remove them before installing the Certbot snap to ensure that when you run the command certbot the snap is used rather than the installation from your OS package manager. The exact command to do this depends on your OS, but common examples are sudo apt-get remove certbot, sudo dnf remove certbot, or sudo yum remove certbot.

If you previously used Certbot through the certbot-auto script, you should also remove its installation by following the instructions here.

## Install Certbot

Run this command on the command line on the machine to install Certbot.
```
sudo snap install --classic certbot
```
Prepare the Certbot command
Execute the following instruction on the command line on the machine to ensure that the certbot command can be run.
```
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```
Choose how you'd like to run Certbot
Either get and install your certificates...
Run this command to get a certificate and have Certbot edit your Nginx configuration automatically to serve it, turning on HTTPS access in a single step.
```
sudo certbot --nginx
```
Or, just get a certificate
If you're feeling more conservative and would like to make the changes to your Nginx configuration by hand, run this command.
```
sudo certbot certonly --nginx
```

<!-- more -->

## Test automatic renewal

The Certbot packages on your system come with a cron job or systemd timer that will renew your certificates automatically before they expire. You will not need to run Certbot again, unless you change your configuration.

You can test automatic renewal for your certificates by running this command:
```
sudo certbot renew --dry-run
```
If that command completes without errors, your certificates will renew automatically in the background.