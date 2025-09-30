---
id: 31
title: 油猴脚本自动调整所有textarea行高
slug: '%e6%b2%b9%e7%8c%b4%e8%84%9a%e6%9c%ac%e8%87%aa%e5%8a%a8%e8%b0%83%e6%95%b4%e6%89%80%e6%9c%89textarea%e8%a1%8c%e9%ab%98'
date: '2025-04-17T01:02:25'
categories:
  - notes
tags: []
url: https://haoyelaiga.com/%e6%b2%b9%e7%8c%b4%e8%84%9a%e6%9c%ac%e8%87%aa%e5%8a%a8%e8%b0%83%e6%95%b4%e6%89%80%e6%9c%89textarea%e8%a1%8c%e9%ab%98/
---

要实现你描述的功能，可以编写一个油猴脚本（Tampermonkey script）来动态调整所有 `<textarea>` 元素的行高，并且使其在检测到页面变化时重新运行调整代码，而不是依赖保存按钮。以下是更新后的脚本：

“\`javascript\
// ==UserScript==\
// @name Auto Resize Textarea\
// @namespace http\://tampermonkey.net/\
// @version 1.1\
// @description Auto resize textarea based on content\
// @author Your Name\
// @match https\://platform.amfori.org/ui/\*\
// @grant none\
// ==/UserScript==

(function() {\
‘use strict’;

```
// Function to auto-resize textareas
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
}

// Apply auto-resize to all textareas on the page
function applyAutoResize() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', () => autoResizeTextarea(textarea));
        autoResizeTextarea(textarea);
    });
}

// Observe the whole document for changes (in case new textareas are added dynamically)
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length || mutation.removedNodes.length) {
            applyAutoResize();
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial call to apply auto-resize on page load
applyAutoResize();
```

})();\
“\`

### 说明：

1. **自动调整行高**：

2. `autoResizeTextarea` 函数调整 `<textarea>` 的高度以适应其内容。

3. `applyAutoResize` 函数为页面上的所有 `<textarea>` 元素绑定 `input` 事件，以便在内容更改时调整高度。

4. **页面加载时应用**：

5. 脚本在页面加载时立即调用 `applyAutoResize` 以调整当前页面上的所有 `<textarea>`。

6. **观察 DOM 变化**：

7. 使用 `MutationObserver` 观察整个文档的变化（例如，动态添加或移除 `<textarea>` 元素）。

8. 当检测到 DOM 变化（子元素添加或移除）时，调用 `applyAutoResize` 重新调整所有 `<textarea>` 的高度。

这样，脚本会在页面任何变化时重新运行调整代码，确保所有 `<textarea>` 元素能根据内容自适应行高。
