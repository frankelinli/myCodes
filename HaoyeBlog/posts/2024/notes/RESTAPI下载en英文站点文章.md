---
id: 390
title: polylang的REST API下载en英文站点文章
slug: polylang的REST API下载en英文站点文章
categories:
  - notes
tag: []
---

的点点滴滴

##  lang=en 参数来筛选英文内容

脚本通过在所有 REST 请求里添加 lang=en 参数来筛选英文内容，逻辑如下：

1. 常量定义  
````js
const LANG = "en";
````

2. getAll 函数接受第二个参数 query，并把其中的键值对（包括 lang）写入 URL 查询串：  
````js
async function getAll(endpoint, query = {}) {
  // ...existing code...
  const searchParams = new URLSearchParams({ per_page: "100", page: String(page) });
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null) searchParams.append(k, String(v));
  }
  const res = await fetch(`${API_URL}/${endpoint}?${searchParams.toString()}`);
  // ...existing code...
}
````

3. 调用时显式传入 { lang: LANG }：  
````js
// filepath
const categoriesArr = await getAll("categories", { lang: LANG });
const tagsArr       = await getAll("tags",       { lang: LANG });
const posts         = await getAll("posts",      { lang: LANG });
const mediaArr      = await getAll("media",      { lang: LANG });
````

4. 生成的请求示例（第 1 页）：  
- https://csrwiki.com/wp-json/wp/v2/posts?per_page=100&page=1&lang=en  
Polylang 在服务器端按语言过滤，所以返回结果已是英文版本，不需要再在本地过滤。

5. <u>front matter 中的 language 字段只是标记；真正筛选动作发生在上述带 lang=en 的 API 请求上。</u>

验证方式（任选）：
- 浏览器访问 https://csrwiki.com/wp-json/wp/v2/posts?lang=en 查看返回语言是否为英文。
- 去掉 lang 比较数量差异。
- PowerShell:  
```
curl "https://csrwiki.com/wp-json/wp/v2/posts?per_page=1&lang=en"
```



## `&lang=en` 是 Polylang 提供的，不是 WordPress 核心功能。

说明如下：

- WordPress 核心本身不支持多语言内容隔离，也没有 [lang] 这个 REST 查询参数。加上它也不会生效。
- 安装 Polylang 后，它在：
  - 前台查询（WP_Query）
  - REST API (`/wp-json/wp/v2/...`) 中注册一个 [lang]查询变量，并拦截请求，根据语言代码过滤内容（posts、categories、tags、media 等）。
- 因此你现在代码里对 `/wp-json/wp/v2/posts?lang=en` 的请求，过滤行为来自 Polylang。
- 若停用 Polylang：
  - 该参数将被忽略（返回所有语言的原始文章集合，实际上文章仍然只是“单语”版本记录，失去语言区分）。
  - 你的脚本仍会收到数据，但不再有语言过滤效果。
- 语言代码值使用 Polylang 后台设置的“语言 slug”（例如 en、zh、fr）。若你在后台改成 `en-us`，就要改脚本常量。

快速验证：

1. 浏览器打开：`/wp-json/wp/v2/posts?per_page=2&lang=en`
2. 再打开：`/wp-json/wp/v2/posts?per_page=2`（不带 lang）
3. 比较返回的 post id 集合是否不同（或看某篇的中文/英文是否只在其中一组出现）。

扩展（可选）：

- 同时导出多语言：循环语言数组 `[ 'en','zh' ]`，分别调用 [getAll('posts', { lang })]放到不同目录。
- 如果改用 WPML，参数名称仍是，但语言代码可能不同（如 `en`, `zh-hans`）。