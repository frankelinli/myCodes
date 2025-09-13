<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WordPress REST API Demo</title>
  <style>
    body { font-family: sans-serif; margin: 1em; }
    h1 { font-size: 1.5em; }
    .hidden { display: none; }
    input, textarea, button { margin: 0.5em 0; padding: 0.5em; width: 100%; max-width: 400px; }
    button { background: #0073aa; border: none; color: white; cursor: pointer; }
    button:hover { background: #005f8d; }
    .post { border-bottom: 1px solid #ddd; padding: 0.5em 0; }
  </style>
</head>
<body>
  <h1>WordPress REST API Demo</h1>

  <section>
    <h2>📖 最新文章</h2>
    <div id="posts">加载中...</div>
  </section>

  <section>
    <h2>🔑 用户登录</h2>
    <div id="loginForm">
      <input type="text" id="username" placeholder="用户名">
      <input type="password" id="password" placeholder="密码">
      <button onclick="login()">登录</button>
    </div>
    <div id="userInfo" class="hidden"></div>
  </section>

  <section id="postForm" class="hidden">
    <h2>✍️ 发布新文章</h2>
    <input type="text" id="title" placeholder="文章标题">
    <textarea id="content" placeholder="文章内容"></textarea>
    <button onclick="publishPost()">发布文章</button>
  </section>

  <div id="result"></div>

  <script>
    const WP_API = "https://你的域名/wp-json"; // ⚠️ 换成你的 WordPress 域名
    let token = null;

    // 获取最新文章
    async function loadPosts() {
      const res = await fetch(`${WP_API}/wp/v2/posts?per_page=5&_embed`);
      const posts = await res.json();
      const container = document.getElementById("posts");
      container.innerHTML = "";
      posts.forEach(post => {
        const div = document.createElement("div");
        div.className = "post";
        div.innerHTML = `
          <h3><a href="${post.link}" target="_blank">${post.title.rendered}</a></h3>
          <p>${new Date(post.date).toLocaleDateString()}</p>
        `;
        container.appendChild(div);
      });
    }

    // 登录获取 token
    async function login() {
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      const res = await fetch(`${WP_API}/jwt-auth/v1/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (data.token) {
        token = data.token;
        document.getElementById("loginForm").classList.add("hidden");
        document.getElementById("userInfo").classList.remove("hidden");
        document.getElementById("userInfo").textContent = `欢迎 ${data.user_display_name}`;
        document.getElementById("postForm").classList.remove("hidden");
      } else {
        document.getElementById("result").textContent = "登录失败：" + (data.message || "未知错误");
      }
    }

    // 发布文章
    async function publishPost() {
      const title = document.getElementById("title").value;
      const content = document.getElementById("content").value;

      const res = await fetch(`${WP_API}/wp/v2/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, status: "publish" })
      });

      const data = await res.json();
      if (data.id) {
        document.getElementById("result").innerHTML = 
          `✅ 文章已发布：<a href="${data.link}" target="_blank">${data.link}</a>`;
        loadPosts(); // 刷新文章列表
      } else {
        document.getElementById("result").textContent = "发布失败：" + (data.message || "未知错误");
      }
    }

    // 初始化加载最新文章
    loadPosts();
  </script>
</body>
</html>