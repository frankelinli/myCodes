import fs from "fs";
import path from "path";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRaw from "rehype-raw";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import yaml from "js-yaml";

const API_URL = "https://csrwiki.com/wp-json/wp/v2";
// Polylang 语言代码（仅抓取指定语言内容）
const LANG = "en"; // 如需切换，请改为 "zh" 等
const SAVE_DIR = "./exported_posts";

fs.mkdirSync(SAVE_DIR, { recursive: true });

/**
 * 分页抓取 WordPress API
 */
async function getAll(endpoint, query = {}) {
  let page = 1;
  const items = [];
  while (true) {
    const searchParams = new URLSearchParams({ per_page: "100", page: String(page) });
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) searchParams.append(k, String(v));
    }
    const res = await fetch(`${API_URL}/${endpoint}?${searchParams.toString()}`);
    if (!res.ok) {
      if (res.status === 400) {
        // 400 说明已到最后一页，正常结束循环
        break;
      }
      console.warn(`⚠️ 请求失败: ${endpoint}, 状态码 ${res.status}`);
      break;
    }
    const data = await res.json();
    if (!data.length) break;
    items.push(...data);
    page++;
  }
  return items;
}

/**
 * HTML → Markdown
 */
async function htmlToMarkdown(html) {
  const file = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeRaw) // 支持混合 HTML
    .use(rehypeRemark) // HTML → Markdown AST
    .use(remarkGfm) // 支持 GFM (表格/任务列表等)
    .use(remarkStringify, {
      fences: true,
      bullet: "-",
      entities: "escape",
    })
    .process(html);
  return String(file);
}

/**
 * 清理文件名
 */
function sanitizeFilename(filename) {
  return filename.replace(/[\\/*?:"<>|]/g, "_");
}

/**
 * 主逻辑
 */
async function main() {
  console.log("🔍 获取分类和标签...");
  const categoriesArr = await getAll("categories", { lang: LANG });
  const categories = {};
  categoriesArr.forEach((c) => (categories[c.id] = c.slug));

  const tagsArr = await getAll("tags", { lang: LANG });
  const tags = {};
  tagsArr.forEach((t) => (tags[t.id] = t.slug));

  // 去掉作者处理，不再请求 users

  console.log("🔍 获取文章...");
  const posts = await getAll("posts", { lang: LANG });

  console.log("🔍 获取媒体...");
  const mediaArr = await getAll("media", { lang: LANG });
  const media = {};
  mediaArr.forEach((m) => (media[m.id] = m.source_url));

  for (const post of posts) {
    const postId = post.id;
  const title = post.title.rendered || "untitled";
  const slug = post.slug || `post-${postId}`;
    const date = post.date;
    const contentHtml = post.content.rendered;

    const contentMd = await htmlToMarkdown(contentHtml);

    const postCategories = post.categories.map(
      (cid) => categories[cid] || "uncategorized"
    );
    const postTags = post.tags.map((tid) => tags[tid] || `tag-${tid}`);
  // 已移除作者逻辑

    let featuredImage = null;
    if (post.featured_media) {
      featuredImage = media[post.featured_media] || null;
    }

    // 文章URL
    const postUrl = post.link || '';

    const frontMatter = {
      id: postId,
      title: title,
      slug: slug,
      date: date,
      language: LANG,
      categories: postCategories,
      tags: postTags,
      url: postUrl,
    };
    if (featuredImage) {
      frontMatter.featured_image = featuredImage;
    }

    const mdContent =
      `---\n${yaml.dump(frontMatter, { skipInvalid: true, lineWidth: -1 })}---\n\n` +
      contentMd;

    // 以第一个分类为主目录，若无分类则放 uncategorized
    const mainCategory = postCategories[0] || "uncategorized";
    const categoryDir = path.join(SAVE_DIR, sanitizeFilename(mainCategory));
    fs.mkdirSync(categoryDir, { recursive: true });

    const safeTitle = sanitizeFilename(title);
    const filename = path.join(categoryDir, `${safeTitle}.md`);
    fs.writeFileSync(filename, mdContent, "utf-8");

    console.log(`✅ 已保存: ${filename}`);
  }
}

main();