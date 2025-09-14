#!/usr/bin/env node
/**
 * Typora Markdown -> WordPress 一键发布/更新
 * 特性：
 * - 解析 Front Matter（title/slug/status/date/categories/tags/featured_image）
 * - Markdown -> HTML（remark + rehype）
 * - 自动上传本地图片到 /media，并替换正文中的相对路径
 * - 分类/标签按名称匹配，不存在则自动创建
 * - 以 slug 为幂等键：存在则更新，不存在则创建
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
// 移除 remark-admonitions，改为自定义实现以避免 ESM/CJS 兼容问题
import rehypeStringify from 'rehype-stringify';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import { parse as parseHTML } from 'node-html-parser';
import mime from 'mime';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== 配置区 (.env) ======
// 自定义轻量 .env 解析（避免额外依赖 dotenv）
// 1) 在根目录创建 .env 文件，例如：
//    WP_SITE=https://csrwiki.com
//    WP_USER=youruser
//    WP_APP_PASS=application-password-here
// 2) 运行 node publish.js posts/xxx.md
// 解析规则：忽略 # 开头行；支持 KEY=VALUE（不处理引号/转义/多行）。
const envFile = path.join(process.cwd(), '.env');
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || /^\s*#/.test(line)) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    // 去掉首尾引号（简单处理）
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

const SITE = process.env.WP_SITE;
const USER = process.env.WP_USER;
const APP_PASS = process.env.WP_APP_PASS;
if (!SITE || !USER || !APP_PASS) {
  console.error('[配置错误] 缺少 WP_SITE / WP_USER / WP_APP_PASS 环境变量，请在 .env 中设置');
  process.exit(1);
}
const API_BASE = `${SITE.replace(/\/+$/, '')}/wp-json/wp/v2`;
const AUTH = 'Basic ' + Buffer.from(`${USER}:${APP_PASS}`).toString('base64');

// 将分类/标签名转 ID，如果不存在可选择自动创建
const AUTO_CREATE_TERMS = true;

// 从命令行读取文件路径
const mdPath = process.argv[2];
if (!mdPath) {
  console.error('用法：node publish.js path/to/post.md');
  process.exit(1);
}

function ensureAbsolute(p, baseDir) {
  if (!p) return null;
  return path.isAbsolute(p) ? p : path.resolve(baseDir, p);
}

async function wpFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': AUTH,
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}\n${txt}`);
  }
  return res;
}

async function findOrCreateTermByName(taxonomy, name) {
  // taxonomy: 'categories' | 'tags'
  const qs = new URLSearchParams({ search: name, per_page: '100' });
  const res = await wpFetch(`${API_BASE}/${taxonomy}?${qs.toString()}`, { method: 'GET' });
  const arr = await res.json();
  const exact = arr.find(t => t.name.toLowerCase() === name.toLowerCase());
  if (exact) return exact.id;
  if (!AUTO_CREATE_TERMS) throw new Error(`Term not found: ${taxonomy} "${name}"`);
  // create
  const createRes = await wpFetch(`${API_BASE}/${taxonomy}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  const created = await createRes.json();
  return created.id;
}

async function namesToTermIds(taxonomy, names) {
  if (!names || names.length === 0) return [];
  const ids = [];
  for (const name of names) {
    ids.push(await findOrCreateTermByName(taxonomy, String(name)));
  }
  return ids;
}

async function uploadMediaFromFile(absFilePath, filenameHint) {
  const stat = fs.statSync(absFilePath);
  if (!stat.isFile()) throw new Error(`Not a file: ${absFilePath}`);
  const data = fs.readFileSync(absFilePath);
  const mimeType = mime.getType(absFilePath) || 'application/octet-stream';
  const filename = path.basename(filenameHint || absFilePath);

  const res = await fetch(`${API_BASE}/media`, {
    method: 'POST',
    headers: {
      'Authorization': AUTH,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Type': mimeType,
      'Content-Length': String(data.length)
    },
    body: data
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Upload failed: ${filename}\n${t}`);
  }
  const json = await res.json();
  return json; // includes id, source_url
}

function isLocalRelativeImage(src) {
  if (!src) return false;
  if (/^https?:\/\//i.test(src)) return false;
  if (src.startsWith('data:')) return false;
  return true;
}

async function processImagesAndReturnHTML(html, baseDir) {
  const root = parseHTML(html);
  const imgNodes = root.querySelectorAll('img');

  for (const img of imgNodes) {
    const rawSrc = img.getAttribute('src');
    if (!isLocalRelativeImage(rawSrc)) continue;
    // 处理 URL 编码与 Windows 反斜杠
    let decoded = rawSrc;
    try { decoded = decodeURIComponent(rawSrc); } catch (_) {}
    // 将类似 C:%5CUsers%5C... 或含反斜杠统一成正常路径
    decoded = decoded.replace(/%5C/gi, '\\');
    // 若是 file:/// 开头，去掉协议
    decoded = decoded.replace(/^file:\/+/, '');
    const absPath = ensureAbsolute(decoded, baseDir);
    if (!absPath || !fs.existsSync(absPath)) {
      console.warn(`图片文件不存在，跳过：${rawSrc}`);
      continue;
    }
    try {
      const uploaded = await uploadMediaFromFile(absPath, path.basename(absPath));
      img.setAttribute('src', uploaded.source_url);
      // 可选：把 alt 设置为文件名（若原本为空）
      if (!img.getAttribute('alt')) {
        img.setAttribute('alt', path.parse(absPath).name);
      }
    } catch (e) {
      console.error(`上传图片失败：${src}\n${e.message}`);
    }
  }

  return root.toString();
}

// 自定义 Admonition 解析插件，支持 :::tip / :::warning[标题] 语法
function remarkAdmonitionBlocks() {
  const TYPES = new Set(['tip','note','info','warning','caution','danger','important','success']);
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== 'containerDirective') return;
      const type = (node.name || '').toLowerCase();
      if (!TYPES.has(type)) return;

      let titleText = node.label || '';
      if (!titleText && node.children && node.children.length) {
        const first = node.children[0];
        if (first.type === 'paragraph' && first.children) {
          const textNode = first.children.find(c => c.type === 'text' && c.value && c.value.trim());
          if (textNode) {
            titleText = textNode.value.trim();
            // 移除第一段作为正文避免重复标题
            node.children.shift();
          }
        }
      }
      if (!titleText) {
        titleText = type.charAt(0).toUpperCase() + type.slice(1);
      }
      const data = node.data || (node.data = {});
      data.hName = 'div';
      data.hProperties = { class: `admonition admonition-${type}` };
      node.children.unshift({
        type: 'paragraph',
        data: { hName: 'p', hProperties: { class: 'admonition-title' } },
        children: [{ type: 'text', value: titleText }]
      });
    });
  };
}

async function markdownToHTML(md) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkAdmonitionBlocks)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md);
  return String(file);
}

async function getPostBySlug(slug) {
  const qs = new URLSearchParams({ slug, per_page: '1' });
  const res = await wpFetch(`${API_BASE}/posts?${qs.toString()}`, { method: 'GET' });
  const arr = await res.json();
  return arr[0] || null;
}

function parseFrontMatter(mdPath) {
  const raw = fs.readFileSync(mdPath, 'utf8');
  const parsed = matter(raw);
  return { data: parsed.data || {}, content: parsed.content || '', raw };
}

function normalizeDate(str) {
  if (!str) return null;
  // Accept 'YYYY-MM-DD HH:mm:ss' or ISO
  const iso = new Date(str);
  if (isNaN(iso.getTime())) return null;
  // WordPress expects ISO8601; we let JSON stringify handle it
  return iso.toISOString();
}

(async function main() {
  try {
    const absMd = path.resolve(mdPath);
    const baseDir = path.dirname(absMd);

    const { data, content } = parseFrontMatter(absMd);

    const title = data.title || path.parse(absMd).name;
    const slug = data.slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    const status = data.status || 'draft';
    const dateStr = data.date ? normalizeDate(data.date) : null;

    // 1) Markdown -> HTML
    let html = await markdownToHTML(content);

    // 2) 上传正文中的本地图片并替换 URL
    html = await processImagesAndReturnHTML(html, baseDir);

    // 3) 分类与标签名 -> ID
    const categoryIds = await namesToTermIds('categories', data.categories || []);
    const tagIds = await namesToTermIds('tags', data.tags || []);

    // 4) 检查是否已有同 slug 文章
    const existing = await getPostBySlug(slug);

    // 5) 准备请求体
    const body = {
      title,
      slug,
      status,
      content: html,
      categories: categoryIds,
      tags: tagIds
    };
    // if (dateStr) {
    //   // 若未来时间且 status !== 'publish'，可使用 status: 'future'
    //   body.date_gmt = new Date(dateStr).toISOString();
    //   if (status === 'future') {
    //     body.status = 'future';
    //   }
    // };

    if (dateStr) {
      // 若未来时间且 status !== 'publish'，可使用 status: 'future'
      body.date_gmt = new Date(dateStr).toISOString();
      if (status === 'future') {
        body.status = 'future';
      }
    } else if (existing && existing.date_gmt) {
      // 没有指定 date，且是更新，保留原发布时间，防止变成最新
      body.date_gmt = existing.date_gmt;
    }

    // 6) 上传封面图（若有）
    if (data.featured_image) {
      const coverAbs = ensureAbsolute(data.featured_image, baseDir);
      if (coverAbs && fs.existsSync(coverAbs)) {
        const uploaded = await uploadMediaFromFile(coverAbs, path.basename(coverAbs));
        body.featured_media = uploaded.id;
      } else if (typeof data.featured_image === 'number') {
        body.featured_media = data.featured_image;
      }
    }

    // 7) 创建或更新
    let result;
    if (existing) {
      const url = `${API_BASE}/posts/${existing.id}`;
      const res = await wpFetch(url, {
        method: 'POST', // PUT/PATCH 也可；POST 兼容性更好
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      result = await res.json();
      console.log(`已更新：#${result.id} ${result.link}`);
    } else {
      const url = `${API_BASE}/posts`;
      const res = await wpFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      result = await res.json();
      console.log(`已创建：#${result.id} ${result.link}`);
    }

  } catch (err) {
    console.error('发布失败：', err.message);
    process.exit(1);
  }
})();