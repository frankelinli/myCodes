#!/usr/bin/env node
/**
 * Typora / Obsidian Markdown -> WordPress 发布 / 更新脚本（精简版）
 * 更新说明（2025-09）：
 * - categories / tags 现在都视为 slug 列表（精确匹配 slug）
 * - slug 必须在 front matter 中提供；原样使用（支持中文，不做规范化）
 * - 不再处理 front matter 中的 date（忽略，不发送，更新文章时保持 WP 默认行为）
 * - 文章更新 / 创建逻辑：通过 id (优先) 或 slug 查找；存在则更新，不存在则创建
 * - 所有文章统一直接发布（固定 status=publish，不解析 front matter status）
 * - 支持环境变量 DEBUG_PUBLISH=1 输出调试日志
 * - 其它逻辑保持不变：title / slug / featured_image
 *
 * 不再自动上传正文或封面图片：featured_image 仅支持已存在的媒体 ID（数字）
 *
 * 使用：node publish.js posts/xxx.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== 环境变量加载 (.env 轻量解析) ======
const envFile = path.join(process.cwd(), '.env');
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || /^\s*#/.test(line)) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
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

// 配置：是否自动创建不存在的分类/标签
const AUTO_CREATE_TERMS = true;

// ====== 工具函数 ======
function ensureAbsolute(p, baseDir) {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p; // 已是 URL
  if (path.isAbsolute(p)) return p;
  return path.join(baseDir, p);
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
    const text = await res.text();
    throw new Error(`WP API ${res.status} ${res.statusText}: ${text.slice(0, 400)}`);
  }
  return res;
}

// ========== 术语：分类 / 标签统一按 slug（原样） ==========
// 不再进行任何字符规范化，完全使用 front matter 中列出的原始 slug（仅 trim）。

async function findOrCreateTermBySlug(taxonomy, slugRaw) {
  const slug = String(slugRaw || '').trim();
  if (!slug) throw new Error(`空 ${taxonomy} slug`);
  // 1) 查询（精确 slug）
  let r = await wpFetch(`${API_BASE}/${taxonomy}?slug=${encodeURIComponent(slug)}`, { method: 'GET' });
  let arr = await r.json();
  if (process.env.DEBUG_PUBLISH) {
    console.log(`[DEBUG] 查询 ${taxonomy} slug="${slug}" -> ${Array.isArray(arr) ? arr.length : 'N/A'} 条`);
  }
  if (Array.isArray(arr) && arr.length > 0) return arr[0].id; // 任意命中即使用第一条

  if (!AUTO_CREATE_TERMS) throw new Error(`Term slug not found: ${taxonomy}:${slug}`);

  // 2) 创建
  try {
    const createRes = await wpFetch(`${API_BASE}/${taxonomy}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, name: slug.replace(/-/g, ' ') })
    });
    const created = await createRes.json();
    if (created.slug && created.slug !== slug) {
      console.warn(`[WARN] 期望 slug=${slug} 实际创建 slug=${created.slug} (可能已存在重复，WP 自动重写)`);
    }
    return created.id;
  } catch (e) {
    const msg = e.message || '';
    if (msg.includes('term_exists')) {
      const idMatch = msg.match(/"term_id":\s*(\d+)/);
      if (idMatch) {
        const existingId = Number(idMatch[1]);
        console.warn(`[INFO] slug=${slug} 已存在，使用已有 term_id=${existingId}`);
        return existingId;
      }
    }
    throw e;
  }
}

async function slugsToTermIds(taxonomy, list) {
  if (!list) return [];
  const arr = Array.isArray(list) ? list : [list];
  const ids = [];
  for (const raw of arr) {
    if (!raw) continue;
    ids.push(await findOrCreateTermBySlug(taxonomy, raw));
  }
  return ids;
}

// 自定义 Admonition 解析插件，支持 :::tip / :::warning[标题]
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

// 将 Markdown 文本转换为 HTML，支持自定义 Admonition 块（如 :::tip）
async function markdownToHTML(md) {
  const file = await unified()
    .use(remarkParse) // 解析 Markdown 语法
    .use(remarkDirective) // 支持自定义指令（如 :::）
    .use(remarkAdmonitionBlocks) // 处理自定义 Admonition 块
    .use(remarkRehype, { allowDangerousHtml: true }) // 转换为 HTML AST，允许危险 HTML
    .use(rehypeStringify, { allowDangerousHtml: true }) // 序列化为 HTML 字符串
    .process(md);
  return String(file);
}


async function getPostBySlug(slug) {
  const qs = new URLSearchParams({ slug, per_page: '20' });
  const res = await wpFetch(`${API_BASE}/posts?${qs.toString()}`, { method: 'GET' });
  const arr = await res.json();
  if (process.env.DEBUG_PUBLISH) {
    console.log(`[DEBUG] 查询文章 slug="${slug}" 返回 ${Array.isArray(arr) ? arr.length : 'N/A'} 条`);
  }
  if (!Array.isArray(arr) || arr.length === 0) return null;
  if (arr.length > 1 && process.env.DEBUG_PUBLISH) {
    console.warn(`[WARN] slug="${slug}" 返回多条 (${arr.length})，将选用最早创建的一条`);
  }
  return arr.sort((a,b)=> new Date(a.date_gmt||a.date).getTime() - new Date(b.date_gmt||b.date).getTime())[0];
}

// 通过已知 ID 获取文章。若不存在或无权限返回错误；404 时返回 null
async function getPostById(id) {
  try {
    const res = await wpFetch(`${API_BASE}/posts/${id}`, { method: 'GET' });
    const json = await res.json();
    return json; // id 存在
  } catch (e) {
    if (/WP API 404/.test(e.message)) return null; // 不存在
    throw e; // 其他错误抛出
  }
}

// 将创建后返回的 ID 写回 front matter（如果之前没有）
function writeBackId(absMd, savedId) {
  try {
    const text = fs.readFileSync(absMd, 'utf8');
    // 匹配首个 front matter 块
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return; // 没有 front matter 不处理
    const block = match[1];
    
    // 检查是否有 id 行
    const idLineMatch = block.match(/^id\s*:\s*(.*)$/m);
    if (idLineMatch) {
      const existingId = idLineMatch[1].trim();
      if (existingId) {
        // 已有非空 id，不覆盖
        if (process.env.DEBUG_PUBLISH) console.log('[DEBUG] front matter 已有非空 id，跳过写回');
        return;
      } else {
        // 有 id 行但为空，替换该行
        const updatedBlock = block.replace(/^id\s*:\s*.*$/m, `id: ${savedId}`);
        const updated = text.replace(block, updatedBlock);
        fs.writeFileSync(absMd, updated, 'utf8');
        if (process.env.DEBUG_PUBLISH) console.log(`[DEBUG] 已写回 id=${savedId} (填充空 id)`);
        return;
      }
    } else {
      // 没有 id 行，在开头添加
      const newBlock = `id: ${savedId}\n` + block;
      const updated = text.replace(block, newBlock);
      fs.writeFileSync(absMd, updated, 'utf8');
      if (process.env.DEBUG_PUBLISH) console.log(`[DEBUG] 已写回 id=${savedId} (新增 id 行)`);
    }
  } catch (e) {
    console.warn('[WARN] 写回 ID 失败:', e.message);
  }
}

 
function parseFrontMatter(mdPath) {
  const raw = fs.readFileSync(mdPath, 'utf8');
  const parsed = matter(raw);
  return { data: parsed.data || {}, content: parsed.content || '', raw };
}

// 删除日期处理：忽略 front matter 中 date

export async function publishFile(mdPath, options = {}) {
  const opts = { preserveSlugOnUpdate: true, ...options };
  const absMd = path.resolve(mdPath);
  if (!fs.existsSync(absMd)) {
    throw new Error('文件不存在: ' + absMd);
  }
  const { data, content } = parseFrontMatter(absMd);
  const title = data.title || path.parse(absMd).name;
  if (!data.slug || String(data.slug).trim() === '') {
    throw new Error('[错误] front matter 必须提供 slug 字段');
  }
  const slug = String(data.slug).trim();
  const status = 'publish';

  // Markdown -> HTML
  const html = await markdownToHTML(content);
  const categoryIds = await slugsToTermIds('categories', data.categories || []);
  const tagIds = await slugsToTermIds('tags', data.tags || []);

  // 查询现有文章
  let existing = null;
  if (data.id) {
    const numericId = Number(data.id);
    if (!Number.isNaN(numericId) && numericId > 0) {
      if (process.env.DEBUG_PUBLISH) console.log(`[DEBUG] 尝试通过 id=${numericId} 获取文章`);
      try { existing = await getPostById(numericId); } catch (e) { console.warn('[WARN] 通过 ID 获取文章失败，回退 slug 查询:', e.message); }
    }
  }
  if (!existing) existing = await getPostBySlug(slug);
  if (process.env.DEBUG_PUBLISH) {
    console.log(existing ? `[DEBUG] 准备更新文章 id=${existing.id}` : '[DEBUG] 准备创建新文章');
  }

  // 构造请求体
  const body = {
    title,
    status,
    content: html,
    categories: categoryIds,
    tags: tagIds
  };
  if (!existing || !opts.preserveSlugOnUpdate) {
    body.slug = slug; // 仅创建或明确允许更新 slug 时设置
  }
  if (typeof data.featured_image === 'number') {
    body.featured_media = data.featured_image;
  }

  let result;
  if (existing) {
    const url = `${API_BASE}/posts/${existing.id}`;
    if (process.env.DEBUG_PUBLISH) console.log('[DEBUG] 更新文章 =>', url, opts.preserveSlugOnUpdate ? '(不更新 slug)' : '(包含 slug)');
    const res = await wpFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    result = await res.json();
    console.log(`已更新：#${result.id} ${result.link}${opts.preserveSlugOnUpdate ? ' (slug 保持不变)' : ''}`);
  } else {
    const url = `${API_BASE}/posts`;
    if (process.env.DEBUG_PUBLISH) console.log('[DEBUG] 创建文章 =>', url);
    const res = await wpFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    result = await res.json();
    console.log(`已创建：#${result.id} ${result.link}`);
    if (!data.id && result.id) writeBackId(absMd, result.id);
  }
  return { result, existing, absMd };
}

// CLI 入口
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const mdPath = process.argv[2];
      if (!mdPath) {
        console.error('用法: node publish.js <markdown-file>');
        process.exit(1);
      }
      await publishFile(mdPath);
    } catch (err) {
      console.error('发布失败：', err.message);
      process.exit(1);
    }
  })();
}