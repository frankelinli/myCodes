---
id: 25
title: 在WordPress页面添加音乐播放器区块
slug: '%e5%9c%a8wordpress%e9%a1%b5%e9%9d%a2%e6%b7%bb%e5%8a%a0%e9%9f%b3%e4%b9%90%e6%92%ad%e6%94%be%e5%99%a8%e5%8c%ba%e5%9d%97'
date: '2025-04-17T01:02:21'
categories:
  - notes
tags: []
url: https://haoyelaiga.com/%e5%9c%a8wordpress%e9%a1%b5%e9%9d%a2%e6%b7%bb%e5%8a%a0%e9%9f%b3%e4%b9%90%e6%92%ad%e6%94%be%e5%99%a8%e5%8c%ba%e5%9d%97/
---

我有WordPress子主题，请帮我用aplayer JS来实现在网页左下角添加播放区块：

好的，下面是如何在WordPress子主题中添加APlayer播放区块的步骤。

### 1. 下载和引入APlayer资源

首先，你需要下载APlayer的JavaScript和CSS文件，并将其放入你的子主题目录中。你可以从[APlayer的GitHub页面](https://github.com/MoePlayer/APlayer)下载这些文件，或者使用CDN。

### 2. 引入APlayer的CSS和JS

在你的子主题的`functions.php`文件中添加以下代码，以便在WordPress中加载APlayer的CSS和JS文件：[首页 – APlayer](https://aplayer.js.org/#/zh-Hans/?id=cdn)

```php\
function enqueue\_aplayer\_scripts() {\
// APlayer CSS\
wp\_enqueue\_style(‘aplayer-css’, ‘https\://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.css’);

// APlayer JS
wp_enqueue_script('aplayer-js', 'https://cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.js', array(), null, true);
}\
add\_action(‘wp\_enqueue\_scripts’, ‘enqueue\_aplayer\_scripts’);\
```

### 3. 创建播放区块容器

在你的子主题的模板文件（例如`footer.php`）中添加一个用于APlayer的HTML容器：

```html
```

```
```

### 4. 初始化APlayer

接下来，在你的子主题的JavaScript文件中（例如`custom.js`，你需要确保该文件已经在`functions.php`中被正确加载），初始化APlayer：

`javascript
document.addEventListener('DOMContentLoaded', function () {
const ap = new APlayer({
container: document.getElementById('aplayer'),
fixed: true, // 固定在页面底部
audio: [{
name: 'Song Title',
artist: 'Artist Name',
url: 'path/to/your/audio/file.mp3',
cover: 'path/to/your/cover/image.jpg'
}]
});
});`

### 5. 确保自定义JavaScript文件加载

在你的`functions.php`文件中，确保加载了自定义的JavaScript文件：

`php
function enqueue_custom_scripts() {
// 你的自定义JS文件
wp_enqueue_script('custom-js', get_stylesheet_directory_uri() . '/custom.js', array('jquery', 'aplayer-js'), null, true);
}
add_action('wp_enqueue_scripts', 'enqueue_custom_scripts');`

### 6. 完成

以上步骤完成后，你应该能够在你的网站左下角看到APlayer播放区块。你可以根据需要调整CSS样式和JavaScript配置来满足你的需求。

如果你有任何问题或需要进一步的帮助，请告诉我！

***

以上代码，网页刷新后，音乐就停止了，而且要从头开始播放。

一个简单的刷新网页，继续播放的方案,，使用localStorage

“\`js\
[Your browser does not support the audio element.](https://spacexcode.oss-cn-hangzhou.aliyuncs.com/mp3/那女孩对我说.mp3)

“\`
