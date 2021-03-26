---
title: c# 判断远程服务器端口是否可以连接 超时设置
date: 2017-08-17 11:01:01
tags: Socket
categories: c#
---
## 判断远程服务器是否可以连接

How to configure socket connect timeout

```c#

private static void IsServerUp(string server, int port, int timeout)
        {
            try
            {
                Socket socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
                IAsyncResult result = socket.BeginConnect(server, port, null, null);

                try
                {
                    bool success = result.AsyncWaitHandle.WaitOne(timeout, true);

                    if (!success)
                    {
                        // NOTE, MUST CLOSE THE SOCKET                         
                        throw new SocketException();
                    }

                }
                finally
                {
                    socket.Close();
                }

            }
            catch (SocketException e)
            {
                Trace.WriteLine(string.Format("TCP connection to server {0} failed.", server));
                MessageBox.Show("连接失败,可能你所在的网络无法连接服务器,请更换网络后重试!", "错误提示",
    MessageBoxButtons.OK, MessageBoxIcon.Error);

            }

        }


private  static void ThreadCheckSever()
   { 
      string ipAddress = "www.qzcool.com";
      int portNum = 2000;
      IPHostEntry ipHost = Dns.GetHostEntry(ipAddress); 
      IsServerUp(ipHost.AddressList[0].ToString(), portNum, 4000);

   }

private void Form1_Load(object sender, EventArgs e)
   {
      Thread th = new Thread(ThreadCheckSever);
      th.Start();
   }

```