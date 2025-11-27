

polylang： 只在非默认语言才运行过滤



英文站点的菜单menu；侧边栏



SEO：去掉page/24等



CSR Wiki 是优质的企业社会责任验厂资源知识百科库，提供BSCI、Sedex、RBA、ESCP、WRAP等验厂标准的审核流程、审核清单、审核方法以及各种资源。

### 3. **（未来扩展）为 /en/ 设置独立语言菜单**

如果 `/en/` 的所有内容都是英文版，可在 WordPress 的菜单中：

- 创建独立的英文菜单；
- 设置为 Polylang 的 English 语言；
- 让英文访客完全看不到任何中文元素。



## 🚀 如果想进一步完善：

1. **在 /en/ 首页加 canonical**

   ```
   <link rel="canonical" href="https://csrwiki.com/en/">
   ```

2. **在 sitemap 里分语言**

   - 一个 `sitemap.xml`（中文）

   - 一个 `sitemap_en.xml`（英文）

   - 然后在 robots.txt 中声明两者：

     ```
     Sitemap: https://csrwiki.com/sitemap.xml
     Sitemap: https://csrwiki.com/en/sitemap_en.xml
     ```

3. **设置独立导航和页脚**
    让英文页的 footer、菜单、侧边栏、版权信息都用英文。

4. **添加语言重定向（可选）**
    检测浏览器语言：

   - 英文用户自动跳转 `/en/`
   - 中文用户留在 `/`

------

🧠 **一句话总结：**

> 你已经用 Polylang + `/en/` URL 结构，
>  在单站 WordPress 上实现了一个“伪多站点系统”。
>  功能 ≈ 多站点，维护 ≈ 单站点，性能比多站点还快。

[Polylang插件工作原理](https://chatgpt.com/c/68e909c4-26dc-832f-9ceb-24ac858133db)