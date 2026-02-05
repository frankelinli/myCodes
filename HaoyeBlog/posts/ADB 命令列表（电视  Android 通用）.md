---
id: 1092
title: ADB 命令列表（电视 / Android 通用）
slug: ADB 命令列表（电视 / Android 通用）
categories:
  - rba
tags: ['television','hisense']
---

![image-20260110010235687](https://haoyelaiga.com/wp-content/uploads/2026/01/image-20260110010235687.webp)

**ADB 命令 + 中文注释，对照清晰、可直接查用**。在电脑上来控制电视的所有功能。记不住命令没关系，我只做了个电视控制器ADB程序，图形控制。

## 一、连接与状态

- `adb version` —— 查看 adb 版本
- `adb devices` —— 查看已连接设备
- `adb connect 192.168.1.50:5555` —— 通过 Wi-Fi 连接电视
- `adb disconnect` —— 断开所有连接
- `adb kill-server` —— 关闭 adb 服务
- `adb start-server` —— 启动 adb 服务

------

## 二、Shell 与系统

- `adb shell` —— 进入电视系统命令行
- `exit` —— 退出 shell
- `adb shell getprop` —— 查看系统属性
- `adb shell getprop ro.product.model` —— 设备型号
- `adb shell getprop ro.build.version.release` —— Android 版本
- `adb shell uptime` —— 系统运行时间

------

## 三、遥控器 / 按键模拟（重点）

- `adb shell input keyevent KEYCODE_HOME` —— 主页
- `adb shell input keyevent KEYCODE_BACK` —— 返回
- `adb shell input keyevent KEYCODE_MENU` —— 菜单
- `adb shell input keyevent KEYCODE_DPAD_UP` —— 上
- `adb shell input keyevent KEYCODE_DPAD_DOWN` —— 下
- `adb shell input keyevent KEYCODE_DPAD_LEFT` —— 左
- `adb shell input keyevent KEYCODE_DPAD_RIGHT` —— 右
- `adb shell input keyevent KEYCODE_DPAD_CENTER` —— 确认
- `adb shell input keyevent KEYCODE_VOLUME_UP` —— 音量 +
- `adb shell input keyevent KEYCODE_VOLUME_DOWN` —— 音量 −
- `adb shell input keyevent KEYCODE_VOLUME_MUTE` —— 静音
- `adb shell input keyevent KEYCODE_POWER` —— 电源键
- `adb shell input keyevent 26` —— 电源键（通用）

------

## 四、应用管理

- `adb shell pm list packages` —— 列出所有应用包名
- `adb shell pm list packages -3` —— 仅第三方应用
- `adb shell pm path com.example.app` —— 查看 APK 路径
- `adb install app.apk` —— 安装应用
- `adb uninstall com.example.app` —— 卸载应用
- `adb shell monkey -p com.example.app 1` —— 启动应用
- `adb shell am force-stop com.example.app` —— 强制关闭应用

------

## 五、屏幕操作

- `adb shell screencap /sdcard/screen.png` —— 截图
- `adb pull /sdcard/screen.png` —— 下载截图
- `adb shell screenrecord /sdcard/video.mp4` —— 录屏；摁下CTRL+C结束录屏；录制的视频会存到电视里，然后下面命令下载到电脑上
- `adb pull /sdcard/video.mp4` —— 下载录像；

------

## 六、文件操作

- `adb shell ls /sdcard/` —— 查看存储文件
- `adb push file.txt /sdcard/` —— 传文件到电视
- `adb pull /sdcard/file.txt .` —— 从电视拷贝文件
- `adb shell rm /sdcard/file.txt` —— 删除文件

------

## 七、系统与硬件信息

- `adb shell dumpsys` —— 系统服务总览
- `adb shell dumpsys display` —— 分辨率 / 刷新率
- `adb shell dumpsys power` —— 电源 / 亮屏状态
- `adb shell dumpsys activity` —— 当前前台应用

------

## 八、网络相关

- `adb shell ip addr` —— 查看 IP 地址
- `adb shell ifconfig` —— 网络接口
- `adb shell ping 8.8.8.8` —— 网络连通测试

------

## 九、日志与调试

- `adb logcat` —— 实时日志
- `adb logcat -c` —— 清空日志
- `adb logcat | grep ERROR` —— 只看错误

------

## 十、常见组合用法

- `adb shell input keyevent KEYCODE_HOME && adb shell monkey -p com.app 1` —— 回主页并启动应用
- `adb shell input keyevent 25`（多次）—— 一键静音效果

------

## ⚠️ 高风险（不建议）

- `adb root` —— 提权（多数电视不可用）
- `adb remount` —— 重挂系统分区
- `adb shell rm -rf /` —— **会变砖**



:::tip 喜大普奔:heart_eyes:

**使用ADB命令来操作，虽然很方便，但是每次都要输入命令有点麻烦，于是我制作了个可视化程序，点击按钮就可以执行ADB，从而实现在电脑上控制电视。**

:::

![image-20260110010409061](https://haoyelaiga.com/wp-content/uploads/2026/01/image-20260110010409061.webp)
