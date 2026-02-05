---
id: 1149
title:  WordPress 中的 jQuery 使用指南-带不带$
slug: WordPress 中的 jQuery 使用指南-带不带$
categories:
  - notes
tags: []
---

![image-20260205213624698](https://haoyelaiga.com/wp-content/uploads/2026/02/image-20260205213624698.webp)### noConflict 模式

WordPress 默认为 jQuery 启用了 `noConflict()` 模式，这是为了**避免与其他 JavaScript 库的冲突**。

```javascript
// jQuery 的 noConflict 模式
jQuery.noConflict();  // 释放 $ 符号..
```

**结果：**

- ✅ `jQuery` 全局可用
- ❌ `$` 全局不可用（被其他库使用或保留）

---

## $ vs jQuery 对比

### 在 jQuery 初始化函数内

```javascript
// ✅ 推荐方式 - 在 jQuery(function($) {...}) 内可用 $
jQuery(function($) {
    $('body').css('color', 'red');        // 正确
    $('#my-id').on('click', function() {  // 正确
        $(this).hide();                    // 正确
    });
});
```

**原因：** `$` 作为参数传入，是局部变量，不受 noConflict 影响

---

### 在外部函数中

```javascript
// ❌ 错误 - 外部不能用 $
function myFunction() {
    $('body').css('color', 'red');  // TypeError: $ is not a function
}

// ✅ 正确 - 外部必须用 jQuery
function myFunction() {
    jQuery('body').css('color', 'red');  // 正确
}
```

---

## 实际案例

### 场景 1：初始化时绑定事件（用 $）

```javascript
jQuery(function($) {
    // 在这里可以安心使用 $
    $(document).on('click', 'h1', function() {
        console.log('H1 被点击');
    });
    
    $(window).on('scroll', function() {
        console.log('页面滚动中');
    });
});
```

### 场景 2：独立工具函数（用 jQuery）

```javascript
// 这些函数在外部定义，无法访问 $ 参数

function initProgressBar() {
    // ✅ 必须用 jQuery
    jQuery('<div id="progress"></div>').css({
        position: 'fixed',
        width: 0
    }).prependTo('body');
}

function updateProgress(percent) {
    // ✅ 必须用 jQuery
    jQuery('#progress').css('width', percent + '%');
}

// 在初始化函数中调用
jQuery(function($) {
    initProgressBar();
    $(window).on('scroll', updateProgress);
});
```

### 场景 3：混合使用

```javascript
jQuery(function($) {
    // 初始化区 - 用 $
    $('#button').on('click', handleButtonClick);
});

// 处理函数 - 用 jQuery
function handleButtonClick() {
    jQuery(this).addClass('active');
    jQuery('.notification').fadeIn();
}
```

---

## 最佳实践

| 位置                             | 使用     | 原因                   |
| -------------------------------- | -------- | ---------------------- |
| `jQuery(function($) {...})` 内部 | `$`      | 是参数，安全可用       |
| 外部函数                         | `jQuery` | 避免 noConflict 冲突   |
| 第三方库调用                     | `jQuery` | 保证兼容性             |
| AJAX 回调                        | `jQuery` | 回调在 jQuery 作用域外 |

---

## 快速记忆

```
┌─────────────────────────────────────┐
│  jQuery(function($) {               │
│      // 这里面用 $                   │
│      $('body')...                   │
│  });                                │
│                                     │
│  function myFunc() {                │
│      // 外面用 jQuery               │
│      jQuery('body')...              │
│  }                                  │
└─────────────────────────────────────┘
```

---

## 总结

**WordPress 的 jQuery 规则很简单：**

1. **在 `jQuery(function($) {})` 内** → 用 `$`（推荐在初始化代码中使用）
2. **在外部函数中** → 用 `jQuery`（工具函数、回调函数等）
3. **跨越作用域** → 始终用 `jQuery` 更安全

这样写代码既符合 WordPress 标准，也避免了难以调试的 `$ is not a function` 错误。

---

## Custom.js 架构示意图

一下是最终使用的方案：

![image-20260205225454451](https://haoyelaiga.com/wp-content/uploads/2026/02/image-20260205225454451.webp)

**总结：一个大的 `jQuery(function($) { ... });` 包含所有功能，每个功能独立一个区块，清晰易维护！**
