---
author: haoye
categories:
- 随记
date: '2025-04-19T12:17:19'
id: 138
tags: []
title: WordPress获取用户邮箱给他发邮件
---

在这个博客里，我们将探讨一个自定义的WordPress功能，它通过追踪访客行为和显示访客信息来提升用户体验。

### 访客第4次访问时提示输入邮箱

我们希望在访客第4次访问页面时，提示他们输入邮箱地址，以便发送通知邮件。具体步骤如下：

  * **记录访客访问次数：** 使用浏览器的Cookie来记录访客的访问次数。
  * **弹出邮箱输入框：** 当访问次数达到4次时，弹出一个提示框要求用户输入邮箱。
  * **发送邮件：** 通过AJAX请求将邮箱地址发送到服务器，并由服务器发送一封确认邮件给访客。

#### 实现代码， 实测可用；

    
    
    function csrwiki_fourth_visit_popup() {
        ?>
        <script type="text/javascript">
            document.addEventListener("DOMContentLoaded", function() {
                var visitCount = getCookie('csrwiki_visit_count');
                visitCount = visitCount ? parseInt(visitCount) : 0;
                visitCount++;
                setCookie('csrwiki_visit_count', visitCount, 365);
    
                if (visitCount === 4) {
                    var email = prompt("您已经浏览了四次。请输入您的邮箱地址以接收通知：");
                    if (email) {
                        var currentUrl = window.location.href;
    
                        // 发送AJAX请求到服务器
                        var xhr = new XMLHttpRequest();
                        xhr.open("POST", "<?php echo admin_url('admin-ajax.php'); ?>", true);
                        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState === 4 && xhr.status === 200) {
                                alert("邮件已发送到您的邮箱！");
                            }
                        };
                        xhr.send("action=send_email&email=" + encodeURIComponent(email) + "&url=" + encodeURIComponent(currentUrl));
                    }
                }
            });
    
            function setCookie(name, value, days) {
                var expires = "";
                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime() + (days*24*60*60*1000));
                    expires = "; expires=" + date.toUTCString();
                }
                document.cookie = name + "=" + (value || "")  + expires + "; path=/";
            }
    
            function getCookie(name) {
                var nameEQ = name + "=";
                var ca = document.cookie.split(';');
                for(var i=0;i < ca.length;i++) {
                    var c = ca[i];
                    while (c.charAt(0)==' ') c = c.substring(1,c.length);
                    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
                }
                return null;
            }
        </script>
        <?php
    }
    add_action('wp_footer', 'csrwiki_fourth_visit_popup');
    
    function csrwiki_send_email() {
        if (isset($_POST['email']) && is_email($_POST['email']) && isset($_POST['url'])) {
            $to = sanitize_email($_POST['email']);
            $url = esc_url_raw($_POST['url']);
            $subject = "感谢您的访问";
            $message = "感谢您多次访问我们的网站！您正在浏览的页面是：<a href=\"$url\">$url</a>";
            $headers = ['Content-Type: text/html; charset=UTF-8'];
    
            wp_mail($to, $subject, $message, $headers);
    
            wp_send_json_success('邮件已发送');
        } else {
            wp_send_json_error('无效的邮箱地址或网址');
        }
    }
    add_action('wp_ajax_send_email', 'csrwiki_send_email');
    add_action('wp_ajax_nopriv_send_email', 'csrwiki_send_email');
    

