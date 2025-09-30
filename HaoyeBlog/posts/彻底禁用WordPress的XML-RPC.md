---
id: 712
title: 彻底禁用WordPress的XML-RPC
slug: 彻底禁用WordPress的XML-RPC
categories:
  - notes
tags: ["doc"]
---

![image-20250921130242881](https://images.haoyelaiga.com/image-20250921130242881.png)

`xmlrpc.php` 本身的功能是设计用来远程发文的，比如你不登录WordPress编辑后台，通过xmlrpc接口，就可以从客户端、从手机上等其他页面，向WordPress发送文章。个人博客根本用不到这个功能。

xmlrpc类似于人类的阑尾，放那里没用，却会引发疾病，会给WordPress带来负担和攻击。它是黑客和扫描器的常见攻击目标。而且XMLRPC已经是过时的技术，现在WordPress使用REST API来进行远程发文。

要**彻底屏蔽 XML-RPC** 有几种方法，推荐组合起来用。

给它精神隔离，加 肉体消灭。彻底消灭。

------

## 1. **通过 WordPress 逻辑禁用 XML-RPC**

在你主题的 `functions.php` 或者自定义插件里加：

```
// 禁用 XML-RPC
add_filter( 'xmlrpc_enabled', '__return_false' );

// 移除 xmlrpc 链接
remove_action( 'wp_head', 'rsd_link' );
```

这样 WordPress 内部会禁止 XML-RPC 请求，但 `xmlrpc.php` 仍然存在（会返回 `XML-RPC server accepts POST requests only`）.

------

## 2. **物理层面拦截 xmlrpc.php 访问**

如果你想**从根源上拒绝访问**（安全又干净），可以在 Web 服务器层面屏蔽：

### 👉 Apache (加在 `.htaccess`)

```
<Files xmlrpc.php>
    Order Deny,Allow
    Deny from all
</Files>
```

### 👉 Nginx

```
location = /xmlrpc.php {
    deny all;
    return 403;
}
```

这样请求直接被服务器拒绝，连 WordPress 都不会处理。



1. **functions.php 禁用**（逻辑层防护）
2. **Nginx/Apache 拒绝访问**（物理层防护）

这样就算扫描器疯狂打 `xmlrpc.php`，也会直接 403，不会拖慢站点。



## 在 **Nginx** 里屏蔽 `xmlrpc.php`的操作步骤

在 **Nginx** 里屏蔽 `xmlrpc.php`，需要改的是你网站对应的 **Nginx 配置文件**。大概步骤如下：

------

## 1. 找到你网站的配置文件

通常在这些目录里：

- `/etc/nginx/nginx.conf`（主配置文件）
- `/etc/nginx/conf.d/your_site.conf`
- `/etc/nginx/sites-available/your_site`

如果你用宝塔面板/腾讯云/阿里云面板，那就直接在“网站设置 → 配置文件”里能看到。

------

## 2. 修改配置

在你站点的 `server { ... }` 块里，加上这一段：

```
location = /xmlrpc.php {
    deny all;
    return 403;
}
```

完整示例：

```
server {
    listen 80;
    server_name haowiki.com;
    root /var/www/haowiki.com;

    index index.php index.html;

    # 屏蔽 xmlrpc.php
    location = /xmlrpc.php {
        deny all;
        return 403;
    }

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass   unix:/run/php/php8.1-fpm.sock;
        fastcgi_param  SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

![image-20250925154732940](https://images.csrwiki.com/image-20250925154732940.webp)

这样 `xmlrpc.php` 会直接 **403 Forbidden**，WordPress 根本收不到请求。

## 检测XMLRPC是否关闭与开通

1. 直接用浏览器测试：your-site-url.com/xmlrpc.php
   ![image-20250921184258805](https://images.haoyelaiga.com/image-20250921184258805.png)

2. 通过这个网站来测试: xmlrpc    [xmlrpc.blog](https://xmlrpc.blog/)

   ![image-20250921183146337](https://images.haoyelaiga.com/image-20250921183146337.png)