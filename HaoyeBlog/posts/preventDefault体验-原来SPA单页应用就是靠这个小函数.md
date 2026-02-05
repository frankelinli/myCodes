---
id: 1145
title: preventDefault体验-原来SPA单页应用就是靠这个小函数
slug: preventDefault体验SPA单页应用
categories:
  - notes
tags: []
---



![image-20260201142607479](https://haoyelaiga.com/wp-content/uploads/2026/02/image-20260201142607479.webp)

## 什么是 preventDefault()

`preventDefault()` 是事件对象的一个方法，用于**阻止事件的默认行为**。当用户与网页交互时（如点击链接、提交表单等），浏览器会自动执行某些默认动作，调用此方法可以完全取消这些默认动作。

### 基本语法

```javascript
event.preventDefault();
```

------

:::tip

在现代网页应用中，`preventDefault()` 是必不可少的：

这就是现代单页应用 (SPA) 的核心实现原理！ 🚀

:::

### 1️⃣ **从被动到主动**

- **没有它**：只能接受浏览器的默认行为
- **有了它**：可以主动控制用户交互

### 2️⃣ **构建现代应用的基础**

- 单页应用 (SPA) 的路由切换
- 异步表单提交（不刷新页面）
- 自定义快捷键
- 实现拖拽功能
- 自定义菜单系统

### 3️⃣ **改善用户体验**

- 页面不刷新，保留用户输入和应用状态
- 更快的交互速度
- 更平滑的动画和过渡

------

## 常见应用场景

### 📋 场景汇总表

| 事件类型         | 原生默认行为   | 阻止后的做法     | 常见应用                 |
| :--------------- | :------------- | :--------------- | :----------------------- |
| `submit`         | 提交表单并刷新 | 异步提交数据     | 登录、注册、表单验证     |
| `click` (链接)   | 跳转页面       | 前端路由导航     | Vue Router、React Router |
| `click` (复选框) | 改变勾选状态   | 条件判断后再改变 | 权限验证、条款同意       |
| `contextmenu`    | 显示浏览器菜单 | 显示自定义菜单   | Figma、在线设计工具      |
| `keydown`        | 浏览器快捷键   | 自定义快捷键     | Ctrl+S 保存、Ctrl+B 加粗 |
| `dragover`       | 不允许 drop    | 允许 drop 事件   | 文件拖拽上传             |
| `drop`           | 打开/下载文件  | 上传到服务器     | 网盘、云存储应用         |
| `wheel`          | 页面滚动       | 自定义滚动行为   | 图片缩放、幻灯片翻页     |

------

## JavaScript 原生实现

### 示例 1: 表单提交

```javascript
// HTML
<form id="myForm">
  <input type="email" placeholder="邮箱">
  <button type="submit">提交</button>
</form>

// JavaScript
document.getElementById('myForm').addEventListener('submit', function(e) {
  e.preventDefault(); // 🎯 阻止默认提交行为
  
  // 验证表单
  const email = this.querySelector('input').value;
  if (!email.includes('@')) {
    alert('邮箱格式不正确');
    return;
  }
  
  // 异步提交
  fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
  .then(res => res.json())
  .then(data => {
    console.log('✅ 提交成功');
    // 页面不刷新，用户体验更好
  });
});
```

### 示例 2: 链接拦截

```javascript
// HTML
<a href="https://example.com" id="myLink">点击我</a>

// JavaScript - 前端路由方案
document.getElementById('myLink').addEventListener('click', function(e) {
  e.preventDefault(); // 🎯 阻止链接跳转
  
  // 使用前端路由（如 Vue Router）
  router.push('/target-page');
  
  // 或者手动更新 URL
  window.history.pushState({}, '', '/target-page');
});
```

### 示例 3: 键盘快捷键

```javascript
document.addEventListener('keydown', function(e) {
  // Ctrl+S 或 Cmd+S 保存
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault(); // 🎯 阻止浏览器保存页面
    
    console.log('💾 执行自定义保存...');
    saveDocument(); // 调用保存函数
  }
  
  // Ctrl+K 打开命令面板（VS Code 风格）
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openCommandPalette();
  }
});
```

### 示例 4: 文件拖拽上传

```javascript
const dropZone = document.getElementById('dropZone');

// 阻止默认行为
dropZone.addEventListener('dragover', function(e) {
  e.preventDefault(); // 🎯 必须阻止才能触发 drop
  this.style.background = '#e7f5ff';
});

dropZone.addEventListener('dragleave', function(e) {
  this.style.background = 'white';
});

// 处理文件上传
dropZone.addEventListener('drop', function(e) {
  e.preventDefault(); // 🎯 阻止浏览器打开文件
  
  const files = e.dataTransfer.files;
  
  // 上传到服务器
  Array.from(files).forEach(file => {
    const formData = new FormData();
    formData.append('file', file);
    
    fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
  });
});
```

### 示例 5: 右键菜单

```javascript
document.addEventListener('contextmenu', function(e) {
  e.preventDefault(); // 🎯 阻止浏览器菜单
  
  // 显示自定义菜单
  const menu = document.getElementById('customMenu');
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';
  menu.style.display = 'block';
});

// 点击其他地方隐藏菜单
document.addEventListener('click', function(e) {
  if (e.target.id !== 'customMenu') {
    document.getElementById('customMenu').style.display = 'none';
  }
});
```

---

:::info :information_desk_person:

等于截胡。或者钩子，插入自己想做的坏事

说得太对了！

**“截胡”** 这个词简直精准。 

:::

浏览器本来有一套“官定”的流程（比如：点链接  跳网页），你用 `e.preventDefault()` 往那一横，就像是在公路上设了个**私卡**，把原本的流程直接拦截掉，然后换成你自己想干的事。 

除了登录，这里还有两个非常典型的“截胡”场景： 

1. 截胡“文件拖放” (Drag & Drop) 

如果你想做一个拖拽上传的功能，你必须截胡。因为浏览器默认看到文件拖进来，会直接尝试在窗口**打开这个文件**（比如 PDF 或图片），如果不“截胡”，你的上传逻辑根本没机会跑。 

javascript

```
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault(); // 截胡：别直接打开文件，让我来处理拖拽效果
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault(); // 截胡：别让浏览器乱跳，我要拿文件数据
  const files = e.dataTransfer.files;
  console.log("拿到了截胡的文件：", files[0].name);
});
```



2. 截胡“复制/粘贴” (限制白嫖) 

有些文档网站为了让你付费，会截胡你的复制操作。当你按下 `Ctrl+C` 时，它不让浏览器复制，而是弹窗提醒你“请先登录”或者在你的剪贴板后面强行加一段“作者版权所有...”。 

javascript

```js
document.addEventListener('copy', (e) => {
  e.preventDefault(); // 截胡：不准复制！
  alert("想白嫖？请扫码支付 1 元解锁全文 💰");
  
  // 或者更阴险一点：虽然让你复制，但改掉你的内容
  e.clipboardData.setData('text/plain', '想复制？没门！';
});
```

它确实就是一个**前置钩子**： 

1. **浏览器动作触发**
2. **你的钩子函数执行**
3. **e.preventDefault() 发令：** 官定后续动作**作废**。
4. **你的私货代码继续执行**
