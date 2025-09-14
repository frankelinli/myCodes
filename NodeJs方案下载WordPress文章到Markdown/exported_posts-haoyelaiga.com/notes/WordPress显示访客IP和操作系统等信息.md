---
id: 202
title: WordPress显示访客IP和操作系统等信息
date: '2025-04-28T23:10:53'
author: haoye
categories:
  - notes
tags: []
url: https://haoyelaiga.com/wordpress%e6%98%be%e7%a4%ba%e8%ae%bf%e5%ae%a2ip%e5%92%8c%e6%93%8d%e4%bd%9c%e7%b3%bb%e7%bb%9f%e7%ad%89%e4%bf%a1%e6%81%af/
---

访客访问您的网站时，将会在右下角弹出一个欢迎窗口，显示他们的IP地址、地理位置、浏览器、操作系统和当前时间。这个窗口将在5秒后自动关闭。

我们可以在 `functions.php` 文件中添加条件判断，仅在页面ID为 `4366` 的页面上执行欢迎窗口的显示逻辑。

请在您的子主题的 `functions.php` 文件中添加以下代码：

```
function csrwiki_welcome_popup() {
    // 仅在Post ID为4366时生效
    if (is_single(4366)) {
        // 获取访客IP
        $visitor_ip = $_SERVER['REMOTE_ADDR'];

        // 使用ipinfo.io API获取地理位置信息
        $location_info = file_get_contents("http://ipinfo.io/{$visitor_ip}/json");
        $location_info = json_decode($location_info);

        // 获取浏览器和操作系统信息
        $user_agent = $_SERVER['HTTP_USER_AGENT'];

        // 生成JavaScript代码
        ?>
        <script type="text/javascript">
            document.addEventListener('DOMContentLoaded', function() {
                var visitorIP = "<?php echo $visitor_ip; ?>";
                var locationInfo = <?php echo json_encode($location_info); ?>;
                var userAgent = "<?php echo $user_agent; ?>";
                var visitorTime = new Date().toLocaleString();

                // 创建弹出窗口的内容
                var popupContent = `
                    <div id="welcome-popup" style="position: fixed; right: 20px; bottom: 20px; padding: 15px; background: #fff; border: 1px solid #ccc; box-shadow: 0 0 10px rgba(0,0,0,0.1); z-index: 1000;">
                        <h4>欢迎您！</h4>
                        <p>您的IP地址是：${visitorIP}</p>
                        <p>您来自：${locationInfo.city}, ${locationInfo.region}, ${locationInfo.country}</p>
                        <p>您使用的浏览器是：${navigator.userAgent}</p>
                        <p>您的操作系统是：${navigator.platform}</p>
                        <p>当前时间是：${visitorTime}</p>
                    </div>
                `;

                // 将弹出窗口添加到页面
                document.body.insertAdjacentHTML('beforeend', popupContent);

                // 设置定时器，5秒后自动关闭弹出窗口
                setTimeout(function() {
                    var popup = document.getElementById('welcome-popup');
                    if (popup) {
                        popup.remove();
                    }
                }, 5000);
            });
        </script>
        <?php
    }
}

// 将函数挂载到wp_footer钩子
add_action('wp_footer', 'csrwiki_welcome_popup');
```

这样，当访客访问页面ID为 `4366` 的页面时，右下角将弹出欢迎窗口，显示他们的IP地址、地理位置、浏览器、操作系统和当前时间。此窗口将在5秒后自动关闭。
