---
id: 389
title: 关于更新文章不改动Slug的GPT
slug: 关于更新文章不改动Slug的GPT

categories:
  - notes
tags: []
---



从SEO角度来说，你的想法是对的！文章发布后改动slug会影响URL，造成链接失效和SEO权重损失。

我来修改脚本，让更新文章时不发送slug字段：

````javascript
    // 4) 构造请求体
    const body = {
      title,
      status,
      content: html,
      categories: categoryIds,
      tags: tagIds
    };

    // SEO考虑：更新文章时不发送slug，保持原有URL不变
    if (!existing) {
      // 仅在创建新文章时设置slug
      body.slug = slug;
    }

    // 不发送 date 字段：创建时 WP 使用当前时间；更新时不改变原发布时间

    // 5) featured_image 仅支持媒体库已存在的数字 ID
    if (typeof data.featured_image === 'number') {
      body.featured_media = data.featured_image;
    }

    // 6) 创建或更新
    let result;

    if (existing) {
      const url = `${API_BASE}/posts/${existing.id}`;
      if (process.env.DEBUG_PUBLISH) console.log('[DEBUG] 更新文章 => (不更新slug)', url);
      const res = await wpFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      result = await res.json();
      console.log(`已更新：#${result.id} ${result.link} (slug保持不变)`);
    } else {
      const url = `${API_BASE}/posts`;
      if (process.env.DEBUG_PUBLISH) console.log('[DEBUG] 创建文章 =>', url);
      const res = await wpFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      result = await res.json();
      console.log(`已创建：#${result.id} ${result.link}`);
      // 如果原 front matter 没有写 id，这里写回（下次直接用 id 更新，不再依赖 slug）
      if (!data.id && result.id) {
        writeBackId(absMd, result.id);
      }
    }
````

## 修改说明

**主要变化：**
1. **创建新文章时**：正常使用 front matter 中的 `slug`
2. **更新已有文章时**：不发送 `slug` 字段给 WordPress API，保持原有 URL 不变

**好处：**
- ✅ 保护SEO：已发布文章的URL永不改变
- ✅ 灵活性：你仍可在 front matter 中修改 `slug`，但只影响本地，不会破坏线上链接
- ✅ 向后兼容：不影响现有工作流程

**调试输出优化：**
- 更新文章时会显示 `"(不更新slug)"` 提示
- 更新成功后显示 `"(slug保持不变)"` 确认

这样你就可以放心地在 front matter 中保留 `slug` 字段（用于本地管理和新文章创建），同时确保已发布文章的SEO安全性！