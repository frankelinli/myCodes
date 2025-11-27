import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrism from 'rehype-prism-plus';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';

// Simple TOC collector as a rehype plugin
function rehypeCollectToc() {
  return (tree, file) => {
    const toc = [];
    visit(tree, 'element', (node) => {
      if (/^h[1-6]$/.test(node.tagName)) {
        const depth = Number(node.tagName.slice(1));
        const text = collectText(node);
        const id = node.properties && node.properties.id;
        toc.push({ depth, text, id });
      }
    });
    file.data.toc = toc;
  };
}

function collectText(node) {
  let text = '';
  if (node.type === 'text') return node.value;
  if (node.children) {
    for (const c of node.children) text += collectText(c);
  }
  return text;
}

function renderTocHtml(toc) {
  if (!toc || toc.length === 0) return '';
  const items = toc
    .map((i) => `<li class="toc-l${i.depth}"><a href="#${i.id}">${escapeHtml(i.text)}</a></li>`) // eslint-disable-line
    .join('\n');
  return `<nav class="toc"><h2>目录</h2><ul>${items}</ul></nav>`;
}

function escapeHtml(str = '') {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Minimal SEO head generator
function renderHead({ title = 'Markdown 渲染示例', description = '测试 Markdown 渲染（TOC、SEO、代码高亮、表格等）', url = 'http://localhost:8080', image = '/og.png' } = {}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
  };
  const jsonLdStr = escapeHtml(JSON.stringify(jsonLd));
  return `
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <script type="application/ld+json">${jsonLdStr}</script>
    <link rel="stylesheet" href="/styles.css" />
    <link rel="stylesheet" href="/prism.css" />
  `;
}

function wrapHtml({ head, tocHtml, contentHtml }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
${head}
</head>
<body>
  <div class="page">
    <aside class="sidebar">${tocHtml}</aside>
    <main class="content markdown-body">${contentHtml}</main>
  </div>
</body>
</html>`;
}

async function buildOne(mdPath, outPath) {
  const md = await readFile(mdPath, 'utf8');
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'append',
      content: {
        type: 'text',
        value: ' #',
      },
    })
  .use(rehypePrism)
    .use(rehypeCollectToc)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md);

  const toc = file.data.toc || [];
  const contentHtml = String(file);
  const title = extractFirstHeading(contentHtml) || 'Markdown 渲染示例';
  const head = renderHead({ title });
  const tocHtml = renderTocHtml(toc);
  const html = wrapHtml({ head, tocHtml, contentHtml });

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, html, 'utf8');
}

function extractFirstHeading(html) {
  const m = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (!m) return null;
  return m[1].replace(/<[^>]+>/g, '').trim();
}

async function copyPublic() {
  const src = resolve(process.cwd(), 'public');
  const files = ['styles.css', 'prism.css', 'og.png'];
  for (const f of files) {
    try {
      await mkdir(resolve('dist'), { recursive: true });
      await copyFile(resolve(src, f), resolve('dist', f));
    } catch (e) {
      // ignore missing optional files
    }
  }
}

async function main() {
  const mdPath = resolve(process.cwd(), 'content', 'sample.md');
  const outPath = resolve(process.cwd(), 'dist', 'index.html');
  await buildOne(mdPath, outPath);
  await copyPublic();
  console.log('Built', basename(outPath));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
