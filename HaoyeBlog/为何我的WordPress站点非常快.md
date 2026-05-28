---
title: 为何我的WordPress站点非常快
slug: 为何我的wordpress站点非常快
categories:
  - notes
tags: []
---

为何我的WordPress站点非常快！！我自己都诧异了。

好嘞，我把你项目里所有的优化措施都翻了一遍，原因非常清晰！下面给你做个**全面分析**：

---

## 🔥 你的 WordPress 为什么快到像静态网站

### 1️⃣ 极致地清理了 wp_head 垃圾（最关键）

wordpress-optimizations.php 里几乎把 WordPress 默认输出的所有无用标签全部干掉了：

| 移除项                                    | 效果                                  |
| ----------------------------------------- | ------------------------------------- |
| `wp_generator`（版本号）                  | 少一个标签                            |
| `rsd_link`（RSD 链接）                    | 少一个 HTTP 请求                      |
| `wlwmanifest_link`（Windows Live Writer） | 少一个 XML 文件请求                   |
| `wp_shortlink_wp_head`（短链接）          | 少一个 link 标签                      |
| oEmbed 发现链接 + JS                      | 少加载一整套 oEmbed 脚本              |
| `wp_resource_hints`（DNS 预取）           | 去掉 s.w.org、gravatar.com 等外部域名 |

> 👉 **HTML 体积减小，HTTP 请求数大幅下降。**

### 2️⃣ 彻底禁用了 Gravatar（外部请求杀手）

disable-Gravatar.php 做得非常绝：
- `get_avatar` / `get_avatar_url` → 直接返回 `false`
- 拦截所有向 `gravatar.com` 发起的 HTTP 请求 → 返回 `WP_Error`

> 👉 这意味着**你的页面不会去连国外 Gravatar 服务器**，避免了最典型的卡顿瓶颈。

### 3️⃣ 禁用了 Emoji、RSS、oEmbed 等多余功能

- **Emoji**：移除 emoji 检测脚本、样式、TinyMCE 插件
- **RSS/Feed**：全部禁用（7 个 feed hook 全部干掉）
- **oEmbed**：移除发现链接、JS、REST API 路由

> 👉 每一个功能都对应一个外部请求或内联脚本，全部去掉后页面极度清爽。

### 4️⃣ 前端资源精益求精

| 优化项                         | 说明                        |
| ------------------------------ | --------------------------- |
| 非登录用户移除 Dashicons       | 普通访客不加载管理图标样式  |
| 移除 Classic Theme Styles      | WP 6.1+ 的冗余样式          |
| 资源 URL 去掉版本号 `?ver=x.x` | 改善 CDN / 浏览器缓存命中率 |
| 仅前台加载 Highlight.js        | 代码高亮不会拖慢后台        |

### 5️⃣ 禁用心跳 API（Heartbeat）

```php
// 前台完全禁用心跳
wp_deregister_script('heartbeat');
// 后台频率降到 60 秒
$settings['interval'] = 60;
```

> 👉 前台**不再有每 15 秒一次的 AJAX 轮询**，这是很多 WordPress 站点慢的隐形杀手。

### 6️⃣ 限制文章修订版本

```php
add_filter('wp_revisions_to_keep', function() { return 3; });
```

> 👉 数据库不会无限膨胀，查询更快。

### 7️⃣ 禁用 XML-RPC + 安全加固

- XML-RPC 彻底关闭（减少被扫描攻击的负担）
- X-Frame-Options、X-Content-Type-Options 等安全头

---

## 📊 总结：为什么这么快

```
传统 WordPress 慢的原因           →  你的网站
───────────────────────────────────────────────────
❌ 加载 Gravatar 头像（连国外）    ✅ 完全禁用
❌ wp_head 输出大量无用标签        ✅ 全部清理干净
❌ Emoji 脚本（每个页面都加载）     ✅ 禁用
❌ oEmbed JS（嵌入检测）           ✅ 禁用
❌ 心跳 API（15秒轮询）            ✅ 彻底禁用
❌ 多个外部 DNS 预连接             ✅ 精简到最少
❌ Dashicons（非登录用户也加载）    ✅ 只给登录用户
❌ 修订版本几百个拖慢数据库         ✅ 限制到 3 个
```

> **你的 WordPress 现在几乎不加载任何外部资源，HTML 输出极度精简，没有多余的 JS/CSS 请求**，所以体感上跟纯静态 HTML 网站几乎没有区别 🎉

如果想进一步加速，还可以考虑加个**页面缓存插件**（如 WP Super Cache、WP Rocket 或 Nginx FastCGI Cache），那时候就真的跟静态网站一模一样快了。
