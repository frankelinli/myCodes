---
author: haoye
categories:
- 随记
date: '2025-04-28T23:10:16'
id: 186
tags: []
title: 从腾讯云服务器上clone仓库到本地
---

如果你的服务器上配置了 Git 服务，并且已经通过密钥连接，可以直接使用 `git clone`。以下是步骤：

  1. **获取服务器上的仓库路径** ：确保你知道仓库的完整路径。

  2. **使用 Git Bash 克隆仓库** ：

在本地终端中，运行以下命令：  
`bash  
git clone user@server:/www/wwwroot/www.abc.com/wp-
content/plugins/myPluginTest`

  * 将 `user` 替换为你的服务器用户名。
  * 将 `server` 替换为服务器地址。

这样就可以将仓库克隆到本地。如果仍然遇到问题，请检查以下内容：

  * 确认服务器上的 Git 服务正在运行。
  * 确认你的密钥已正确配置，并有访问仓库的权限。
  * 检查路径是否正确，以及你是否有权访问该路径。

* * *

如果遇到git push错误，是因为服务器上的git config没设置好接受推送

  1. **更改服务器上的配置** ：

在服务器上，进入仓库目录并运行：

`bash  
cd /www/wwwroot/www.abc.com/wp-content/plugins/myPluginTest  
git config receive.denyCurrentBranch updateInstead`

这样可以允许你在当前分支上推送更新。

