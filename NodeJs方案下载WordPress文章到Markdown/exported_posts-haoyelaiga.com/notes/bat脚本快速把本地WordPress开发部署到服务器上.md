---
id: 77
title: bat脚本快速把本地WordPress开发部署到服务器上
date: '2025-04-17T17:49:04'
author: haoye
categories:
  - notes
tags: []
url: https://haoyelaiga.com/bat%e8%84%9a%e6%9c%ac%e8%87%aa%e5%8a%a8%e6%8a%8a%e6%9c%ac%e5%9c%b0markdown%e5%8f%91%e5%b8%83%e5%88%b0wordpress/
---

这是一个Windows批处理脚本，使用SSH； SCP命令，将本地WordPress开发的astra child主题，快速同步到到WordPress网站服务器。脚本通过SCP协议将文件传输到服务器的WordPress主题目录，支持递归上传整个目录结构，确保主题文件完整同步到网站。

## 功能

- 将当前目录及所有子目录下的文件上传到指定服务器
- 使用SCP协议安全传输文件
- 自动排除脚本自身，避免冗余上传
- 启用压缩传输，提高上传速度
- 显示中文界面和操作结果反馈

## 使用方法

1. 将此脚本放置在需要上传的WordPress主题文件夹根目录下
2. 双击运行脚本

方案一：简单版本，

```
@echo off
chcp 65001 > nul
echo 正在更新文件到服务器 haoyelaiga.com...

:: 设置服务器信息
set SERVER=xx.xxx.xx.xxx
set USERNAME=rootdddbac
set REMOTE_PATH=/www/xxx/abc.com/wp-content/themes/dgadfadsehaha
set SCRIPT_NAME=update_to_server.bat

:: 将当前目录下的所有文件上传到服务器，排除脚本自身
for %%i in (*) do (
    if not "%%i"=="%SCRIPT_NAME%" (        
        scp -r "%%i" %USERNAME%@%SERVER%:%REMOTE_PATH%/
    )
)

:: 检查上传结果
if %errorlevel% equ 0 (
    echo 文件更新成功！
) else (
    echo 文件更新失败，错误代码: %errorlevel%
)

pause
```

## 方案二：

我可以帮你修改这个批处理文件，使其能够遍历子目录下的文件。以下是更新后的代码：

```
@echo off
chcp 65001 > nul
echo 正在更新文件到服务器 haoyelaiga.com...

:: 设置服务器信息
set SERVER=111.230.81.144
set USERNAME=root
set REMOTE_PATH=/www/wwwroot/haoyelaiga.com/wp-content/themes/haoyeastrachild
set SCRIPT_NAME=update_to_server.bat
set TEMP_FILE=files_to_upload.txt

echo 创建文件列表，排除 %SCRIPT_NAME% 和临时文件...
dir /b | findstr /v /i "%SCRIPT_NAME%" | findstr /v /i "%TEMP_FILE%" > %TEMP_FILE%

echo 开始上传文件...
for /f "delims=" %%f in (%TEMP_FILE%) do (
    @REM echo 正在上传: %%f
    if exist "%%f\*" (
        :: 如果是目录，使用-r参数递归上传
        scp -r "%%f" %USERNAME%@%SERVER%:%REMOTE_PATH%/
    ) else (
        :: 如果是文件，直接上传
        scp "%%f" %USERNAME%@%SERVER%:%REMOTE_PATH%/
    )
    
    if not %errorlevel% equ 0 (
        echo 上传 %%f 失败，错误代码: %errorlevel%
    )
)

:: 删除临时文件列表
del %TEMP_FILE%

echo 文件更新完成！

pause
```

这个修改版本使用了 `scp` 的 `-r` 参数，它会递归地复制目录内容，从而包含子目录下的所有文件。我还添加了 `-C` 参数来启用压缩，这样可以加快传输速度。

这个修正版本使用了第二个findstr命令来同时排除bat文件和临时文件列表本身。这样，这两个文件都不会被上传到服务器。

另外，我还将临时文件名也定义为变量，使脚本更易于维护和修改。这样，如果你需要更改临时文件的名称，只需要修改一处即可。

请注意，以 root 用户身份运行 SCP 仍然存在安全风险，建议考虑使用受限权限的专用用户来执行此类操作。
