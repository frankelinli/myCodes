import fs from "fs";
import path from "path";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRaw from "rehype-raw";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import yaml from "js-yaml";

const API_URL_DEFAULT = "https://csrwiki.com/wp-json/wp/v2";
const SAVE_DIR = "./exported_posts";

// CLI 参数解析（简单版）
const args = process.argv.slice(2);
let siteArg = null;
let categoryArg = null;
let categoryIdArg = null;
let listCategories = false;
let urlArg = null;
let typeArg = "post"; // 默认为 post，可选 post 或 page
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--site" || a === "-s") {
    siteArg = args[i + 1];
    i++;
  } else if (a === "--type" || a === "-t") {
    typeArg = args[i + 1];
    i++;
  } else if (a === "--category" || a === "-c") {
    categoryArg = args[i + 1];
    i++;
  } else if (a === "--category-id" || a === "-i") {
    categoryIdArg = Number(args[i + 1]);
    i++;
  } else if (a === "--list-categories" || a === "-l") {
    listCategories = true;
  } else if (a === "--url" || a === "-u") {
    urlArg = args[i + 1];
    i++;
  } else if (!a.startsWith("-") && !categoryArg) {
    // 支持直接传入分类名，例如: node downloadWordpressToMarkdown.js rba
    categoryArg = a;
  }
}

const API_URL = siteArg ? `${siteArg.replace(/\/$/, '')}/wp-json/wp/v2` : API_URL_DEFAULT;

// 默认分类 slug（若未传入）
const DEFAULT_CATEGORY_SLUG = "rba";
const TARGET_CATEGORY_SLUG = categoryArg || DEFAULT_CATEGORY_SLUG;

fs.mkdirSync(SAVE_DIR, { recursive: true });

/**
 * 分页抓取 WordPress API
 */
async function getAll(endpoint) {
  let page = 1;
  const items = [];
  while (true) {
    const sep = endpoint.includes("?") ? "&" : "?";
    const res = await fetch(`${API_URL}/${endpoint}${sep}per_page=100&page=${page}`);
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
 * 从文章URL提取slug
 * 支持格式: https://example.com/2024/01/post-slug/ 或 https://example.com/post-slug/
 */
function extractSlugFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    // 移除开头和结尾的斜杠，然后按斜杠分割
    const parts = pathname.replace(/^\/|\/$/g, '').split('/');
    // 取最后一个部分作为slug
    const slug = parts[parts.length - 1];
    return slug || null;
  } catch (e) {
    console.error('❌ 无效的URL格式:', url, e.message);
    return null;
  }
}

/**
 * 主逻辑
 */
async function main() {
  console.log("🔍 获取分类和标签...");
  const categoriesArr = await getAll("categories");
  const categories = {};
  categoriesArr.forEach((c) => (categories[c.id] = c.slug));

  const tagsArr = await getAll("tags");
  const tags = {};
  tagsArr.forEach((t) => (tags[t.id] = t.slug));

  // 去掉作者处理，不再请求 users

  // 若用户只想列出分类
  if (listCategories) {
    console.log("🔎 可用分类：");
    categoriesArr.forEach((c) => {
      console.log(`- id=${c.id}  slug=${c.slug}  name=${c.name}`);
    });
    return;
  }

  // 单篇文章URL下载模式
  if (urlArg) {
    const slug = extractSlugFromUrl(urlArg);
    if (!slug) {
      console.error('❌ 无法从URL提取文章slug');
      process.exit(1);
    }
    console.log(`🔍 从URL提取到slug: ${slug}`);
    console.log(`🔍 正在获取内容...`);
    
    const endpoint = typeArg === "page" ? "pages" : "posts";
    const res = await fetch(`${API_URL}/${endpoint}?slug=${slug}`);
    if (!res.ok) {
      console.error(`❌ 请求失败，状态码: ${res.status}`);
      process.exit(1);
    }
    const items = await res.json();
    if (!items || items.length === 0) {
      console.error(`❌ 未找到slug为 "${slug}" 的${typeArg}`);
      process.exit(1);
    }
    
    const post = items[0];
    console.log(`✅ 找到内容: ${post.title.rendered}`);
    
    // 获取媒体信息（用于特色图片）
    console.log("🔍 获取媒体...");
    const mediaArr = await getAll("media");
    const media = {};
    mediaArr.forEach((m) => (media[m.id] = m.source_url));
    
    await savePostAsMarkdown(post, categories, tags, media);
    console.log(`\n🎉 下载完成！`);
    return;
  }

  // --- 批量下载模式 ---
  
  if (typeArg === "page") {
    console.log("🔍 准备获取所有 Page 页面...");
    const pages = await getAll("pages");
    console.log(`✅ 找到 ${pages.length} 个页面`);

    console.log("🔍 获取媒体...");
    const mediaArr = await getAll("media");
    const media = {};
    mediaArr.forEach((m) => (media[m.id] = m.source_url));

    for (const page of pages) {
      await savePostAsMarkdown(page, categories, tags, media);
    }
    console.log(`\n🎉 所有 Page 下载完成！`);
    return;
  }

  console.log("🔍 获取文章分类 ID...");
  // 先查找所有匹配 slug 的分类（可能有多个同名 slug）
  const matched = categoriesArr.filter((c) => c.slug === TARGET_CATEGORY_SLUG);
  if (!matched || matched.length === 0) {
    console.error(`❌ 未找到分类: ${TARGET_CATEGORY_SLUG}，请确认站点中存在该分类或使用 --list-categories 查看所有分类`);
    process.exit(1);
  }

  let targetCategoryObj = null;
  if (matched.length === 1) {
    targetCategoryObj = matched[0];
  } else {
    // 有多个相同 slug 的分类
    if (categoryIdArg) {
      targetCategoryObj = matched.find((c) => c.id === categoryIdArg);
      if (!targetCategoryObj) {
        console.error(`❌ 在 slug=${TARGET_CATEGORY_SLUG} 的候选项中未找到 id=${categoryIdArg}`);
        console.log("可用候选：");
        matched.forEach((c) => console.log(`- id=${c.id}  name=${c.name}`));
        process.exit(1);
      }
    } else {
      console.error(`❌ 找到多个匹配 slug='${TARGET_CATEGORY_SLUG}' 的分类，请使用 --category-id <id> 指定要下载的分类 ID`);
      console.log("可用候选：");
      matched.forEach((c) => console.log(`- id=${c.id}  name=${c.name}`));
      process.exit(1);
    }
  }

  const targetCategoryId = targetCategoryObj.id;
  console.log(`🔍 将只抓取分类: ${TARGET_CATEGORY_SLUG} (id=${targetCategoryId}, name=${targetCategoryObj.name}) 的文章`);
  const posts = await getAll(`posts?categories=${targetCategoryId}`);

  console.log("🔍 获取媒体...");
  const mediaArr = await getAll("media");
  const media = {};
  mediaArr.forEach((m) => (media[m.id] = m.source_url));

  for (const post of posts) {
    await savePostAsMarkdown(post, categories, tags, media);
  }
}

/**
 * 保存单篇文章为Markdown文件
 */
async function savePostAsMarkdown(post, categories, tags, media) {
  const postId = post.id;
  const title = post.title.rendered || "untitled";
  const slug = post.slug || `post-${postId}`;
  const date = post.date;
  const contentHtml = post.content.rendered;

  const contentMd = await htmlToMarkdown(contentHtml);

  // 处理分类和标签（Page 通常没有这些）
  const postCategories = (post.categories || []).map(
    (cid) => categories[cid] || "uncategorized"
  );
  const postTags = (post.tags || []).map((tid) => tags[tid] || `tag-${tid}`);
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
    type: post.type, // 增加类型，区分 post 和 page
    date: date,
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

  // 决定保存目录：若是 page 类型，存放在 pages/；若是 post，按分类存放
  let targetSubDir = "uncategorized";
  if (post.type === "page") {
    targetSubDir = "pages";
  } else if (postCategories.length > 0) {
    targetSubDir = postCategories[0];
  }

  const categoryDir = path.join(SAVE_DIR, sanitizeFilename(targetSubDir));
  fs.mkdirSync(categoryDir, { recursive: true });

  const safeTitle = sanitizeFilename(title);
  const filename = path.join(categoryDir, `${safeTitle}.md`);
  fs.writeFileSync(filename, mdContent, "utf-8");

  console.log(`✅ 已保存: ${filename}`);
}

main();