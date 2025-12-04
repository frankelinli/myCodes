const WP_API_URL = 'https://haoyelaiga.com/wp-json/wp/v2/posts?per_page=10';
const DEEPSEEK_API_KEY = 'sk-de606d09bd7f463281b9524e13ec2ed5';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
import WPAPI from 'wpapi';
const wp = new WPAPI({ endpoint: 'https://haoyelaiga.com/wp-json' });

// Helper: Fetch recent posts from WordPress
// Helper: Fetch recent posts from WordPress (using wpapi)
async function fetchRecentPosts() {
    try {
        const posts = await wp.posts().perPage(10).get();
        return posts;
    } catch (err) {
        throw new Error('Failed to fetch posts: ' + err.message);
    }
}

// Helper: Get excerpt using DeepSeek API
async function getExcerpt(content) {
    const payload = {
        model: "deepseek-chat",
        messages: [
            { role: "system", content: "你是一个专业的wordpress文章内容摘要助手，要求简洁流畅，阅读友好，包含文章的主要内容和关键词，对SEO友好。" },
            { role: "user", content: `请为以下内容生成简洁的中文摘要，文字在150字左右：${content}` }
        ],
        max_tokens: 100
    };
    const res = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to get excerpt');
    const data = await res.json();
    return data.choices[0].message.content;
}

// Main: Fetch posts, get excerpts, and render to HTML
async function main() {
    const posts = await fetchRecentPosts();

    const excerpts = await Promise.all(posts.map(async post => {
        const excerpt = await getExcerpt(post.content && post.content.rendered ? post.content.rendered : post.excerpt && post.excerpt.rendered ? post.excerpt.rendered : '');
        return {
            title: post.title && post.title.rendered ? post.title.rendered : (post.title || ''),
            excerpt: excerpt
        };
    }));

    // If running in browser, render into DOM. If running in Node, print to console and save to a file.
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const container = document.getElementById('posts-excerpts');
        if (container) {
            container.innerHTML = '加载中...';
            const html = excerpts.map(e => `\n            <div class="post-excerpt">\n                <h2>${e.title}</h2>\n                <p>${e.excerpt}</p>\n            </div>\n        `).join('');
            container.innerHTML = html;
        } else {
            console.warn('DOM 元素 #posts-excerpts 未找到，已将结果输出到控制台。');
            console.log(excerpts);
        }
    } else {
        // Node.js: 输出到控制台，并写入一个 HTML 文件以便查看
        try {
            const fs = await import('fs');
            const path = await import('path');
            const outHtml = `<!doctype html><meta charset="utf-8"><title>Post Excerpts</title><style>.post-excerpt{margin-bottom:20px}</style><body>${excerpts.map(e => `<div class="post-excerpt"><h2>${e.title}</h2><p>${e.excerpt}</p></div>`).join('')}</body>`;
            const outPath = path.resolve(process.cwd(), 'posts-excerpts.html');
            fs.writeFileSync(outPath, outHtml, 'utf8');
            console.log('输出已写入:', outPath);
        } catch (err) {
            console.log('无法写入文件，输出到控制台。');
            console.log(excerpts);
        }
    }
}

// Run on page load (browser) or execute immediately in Node
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('DOMContentLoaded', main);
} else {
    // Node.js environment: run immediately
    main().catch(err => {
        console.error('运行脚本时出错:', err);
        process.exitCode = 1;
    });
}