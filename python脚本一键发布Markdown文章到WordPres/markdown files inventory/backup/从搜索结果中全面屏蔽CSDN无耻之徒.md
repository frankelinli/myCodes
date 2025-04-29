**使用油猴脚本，可以把搜索结果的CSDN页面全面屏蔽。**

为了确保脚本在加载下一页时也能运行，我们可以使用`MutationObserver`来监控页面上的DOM变化。这样，当搜索结果页面动态加载新内容（例如通过点击“下一页”按钮或滚动加载更多结果）时，脚本能够检测到这些变化并重新执行隐藏操作。



以下是更新后的脚本，添加了`MutationObserver`来监控DOM变化：

```javascript
// ==UserScript==
// @name         Block CSDN Results
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Hide CSDN results from search engines
// @match        *://www.google.com/*
// @match        *://www.baidu.com/*
// @match        *://www.bing.com/*
// @match        *://www.sogou.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to hide CSDN results
    function hideCSDNResults() {
        const selectors = [
            'a[href*="csdn.net"]',
            'a[href*="csdn.com"]'
        ];
        
        selectors.forEach(selector => {
            const links = document.querySelectorAll(selector);
            links.forEach(link => {
                const result = link.closest('div'); // Adjust this if the structure is different
                if (result) {
                    result.style.display = 'none';
                }
            });
        });
    }

    // Run the function on page load
    hideCSDNResults();

    // Create a MutationObserver to monitor changes in the DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                hideCSDNResults();
            }
        });
    });

    // Configure the observer to watch for changes in the body element
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
```

### 说明：
1. **`hideCSDNResults` 函数**：用于查找并隐藏包含CSDN链接的搜索结果。
2. **页面加载时运行一次**：在页面初次加载时运行`hideCSDNResults`。
3. **`MutationObserver`**：创建一个`MutationObserver`实例来监控DOM变化。
    - **回调函数**：每当DOM中有新节点添加时，回调函数都会运行，并调用`hideCSDNResults`函数。
    - **观察目标**：设置观察目标为`document.body`，并监视子节点和子树的变化。

通过这种方式，脚本能在初始页面加载和后续动态加载（如点击“下一页”按钮或滚动加载更多结果）时都能隐藏来自CSDN的结果。这种方法不仅高效，而且避免了不必要的频繁运行。
