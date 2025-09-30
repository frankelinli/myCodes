#!/usr/bin/env node
/**
 * 批量发布 / 更新 Markdown 到 WordPress
 * 基于 publish.js 暴露的 publishFile()
 * 
 * 功能：
 *  - 递归遍历指定根目录 (默认 posts)
 *  - 仅处理 .md / .markdown 文件
 *  - 使用内容 SHA1 (front matter + 内容) 判断是否变化
 *  - 维护 .publish-cache.json 保存 { file, hash, id, slug, updatedAt }
 *  - 默认只发布有变化的文件；--all 强制全部重新发布
 *  - --dry-run 仅显示将要发布的列表
 *  - --delay-ms=300 控制两次请求之间的延迟
 */


import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { publishFile } from './publish.js';

// 统一相对路径分隔符，便于跨平台缓存（使用 /）
function relKey(absPath, rootDir) {
  return path.relative(rootDir, absPath).split(path.sep).join('/');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { root: 'posts', all: false, dryRun: false, delayMs: 0 };
  for (const a of args) {
    if (a === '--all') opts.all = true;
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a.startsWith('--root=')) opts.root = a.split('=')[1];
    else if (a.startsWith('--delay-ms=')) opts.delayMs = Number(a.split('=')[1]) || 0;
    else if (a === '--help' || a === '-h') opts.help = true;
    else {
      console.warn('未知参数:', a);
    }
  }
  return opts;
}

function showHelp() {
  console.log(`批量发布用法:
  node batch_publish.js [--root=posts] [--all] [--dry-run] [--delay-ms=300]

说明:
  --root=DIR     指定扫描根目录 (默认 posts)
  --all          忽略缓存，强制全部文件发布
  --dry-run      仅显示将会发布的文件，不真正调用 API
  --delay-ms=NUM 两次请求之间的延迟毫秒 (默认 0)
  --help         显示本帮助
`);
}

function walkMarkdownFiles(rootDir) {
  const out = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith('.')) continue; // 跳过隐藏
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.(md|markdown)$/i.test(e.name)) out.push(full);
    }
  }
  walk(rootDir);
  return out;
}

function sha1(content) {
  return crypto.createHash('sha1').update(content).digest('hex');
}


const CACHE_FILE = path.join(process.cwd(), '.publish-cache.json');
function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) return { files: {}, meta: { keyMode: 'relative' } };
  try {
    const parsed = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    if (!parsed.files) parsed.files = {};
    if (!parsed.meta) parsed.meta = {};
    return parsed;
  } catch {
    return { files: {}, meta: { keyMode: 'relative' } };
  }
}
function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

// 自动迁移旧缓存中的绝对路径键为相对路径
function migrateCacheToRelative(cache, rootDir) {
  const oldKeys = Object.keys(cache.files || {});
  if (oldKeys.length === 0) return false;
  // 如果已经是相对路径，直接跳过
  const alreadyRelative = oldKeys.every(k => !/^[A-Za-z]:[\\/]/.test(k) && !k.startsWith('\\'));
  if (alreadyRelative) return false;
  const newFiles = {};
  for (const k of oldKeys) {
    const rel = relKey(k, rootDir);
    if (!newFiles[rel]) newFiles[rel] = cache.files[k];
  }
  cache.files = newFiles;
  cache.meta = { ...(cache.meta || {}), keyMode: 'relative', migratedAt: new Date().toISOString() };
  return true;
}

function readRaw(mdPath) {
  try { return fs.readFileSync(mdPath, 'utf8'); } catch { return ''; }
}

async function main() {
  const opts = parseArgs();
  if (opts.help) { showHelp(); return; }
  const rootDir = path.resolve(opts.root);
  if (!fs.existsSync(rootDir)) {
    console.error('根目录不存在:', rootDir);
    process.exit(1);
  }
  const files = walkMarkdownFiles(rootDir);
  if (files.length === 0) {
    console.log('无 Markdown 文件');
    return;
  }

  const cache = loadCache();
  const migrated = migrateCacheToRelative(cache, rootDir);
  if (migrated) {
    console.log('[提示] 已自动迁移旧缓存为相对路径键');
    saveCache(cache);
  }
  const toPublish = [];

  for (const f of files) {
    const raw = readRaw(f);
    if (!raw.trim().startsWith('---')) {
      console.warn('[跳过] 缺少 front matter:', f);
      continue;
    }
    const hash = sha1(raw);
    const key = relKey(f, rootDir); // 相对路径作为缓存键
    const rec = cache.files[key];
    if (opts.all || !rec || rec.hash !== hash) {
      toPublish.push({ file: f, key, hash });
    }
  }

  if (toPublish.length === 0) {
    console.log('没有需要发布的变更文件');
    return;
  }

  console.log(`待发布文件数: ${toPublish.length}`);
  toPublish.forEach((p, idx) => console.log(`[${idx+1}/${toPublish.length}] ${p.key}`));

  if (opts.dryRun) {
    console.log('\n--dry-run 模式，未执行实际发布');
    return;
  }

  for (let i = 0; i < toPublish.length; i++) {
    const { file, key, hash } = toPublish[i];
    console.log(`\n(${i+1}/${toPublish.length}) 发布: ${key}`);
    try {
      const { result } = await publishFile(file); // 保持 slug 不变策略
      const id = result.id;
      const slug = result.slug;
      cache.files[key] = { hash, id, slug, updatedAt: new Date().toISOString() };
      saveCache(cache);
      if (opts.delayMs > 0 && i < toPublish.length - 1) {
        await new Promise(r => setTimeout(r, opts.delayMs));
      }
    } catch (e) {
      console.error('发布失败:', e.message);
      // 不中断，继续后续
    }
  }
  console.log('\n批量处理完成');
}

main().catch(e => { console.error(e); process.exit(1); });
