---
id: 1162
title: PHP 箭头函数（Arrow Functions）
slug: PHP 箭头函数（Arrow Functions）
categories:
  - notes
tags: []
---

PHP 7.4+ 引入，语法：`fn (参数) => 表达式`

箭头函数是针对很简单的一句话函数，最典型例子是返回一个年份：add_shortcode('year', fn () => date('Y'));

输入[year]短代码，就会自动显示为今年的年份。

基本语法

```php
// 传统写法
function ($x) {
    return $x * 2;
}

// 箭头函数
fn ($x) => $x * 2
```

**要点：**

- 关键字是 `fn`（不是 JavaScript 的 `=>`）
- **自动捕获外部变量**，不需要 `use`
- 只能写**一个表达式**，不能写多行语句
- 自动 return，不用写 `return`

---

## 对比：匿名函数 vs 箭头函数

```php
// 匿名函数 —— 需要 use 才能访问外部变量
$greeting = '你好';
$say = function ($name) use ($greeting) {
    return $greeting . '，' . $name;
};

// 箭头函数 —— 自动捕获 $greeting
$greeting = '你好';
$say = fn ($name) => $greeting . '，' . $name;

echo $say('张三'); // 输出：你好，张三
```

---

## 在 WordPress 中的典型用法

### 1. 简单过滤器 / 动作

```php
// 传统写法（定义函数 + 挂载）：这个写法可以实现功能，只是可以用箭头函数更简单
function csrwiki_login_logo_url() {
    return home_url();
}
add_filter('login_headerurl', 'csrwiki_login_logo_url');

// ✅ 箭头函数（一行搞定）
add_filter('login_headerurl', fn () => home_url());
```

### 2. 短代码

```php
// 传统写法
function dynamic_year_shortcode() {
    return date('Y');
}
add_shortcode('year', 'dynamic_year_shortcode');

// ✅ 箭头函数
add_shortcode('year', fn () => date('Y'));
```

### 3. 带参数的过滤器

```php
// 传统写法
add_filter('the_title', function ($title) {
    return '【推荐】' . $title;
});

// ✅ 箭头函数
add_filter('the_title', fn ($title) => '【推荐】' . $title);
```

### 4. 自动捕获外部变量

```php
$prefix = '📌';

//  匿名函数需要 use
add_filter('the_title', function ($title) use ($prefix) {
    return $prefix . ' ' . $title;
});

// ✅ 箭头函数自动捕获
add_filter('the_title', fn ($title) => $prefix . ' ' . $title);
```

---

## ⚠️ 不能用箭头函数的场景

箭头函数只能包含**一个表达式**，以下情况必须用传统函数或匿名函数：

```php
// ❌ 不行！多行逻辑不能用箭头函数
fn ($content) => {
    $pos = strpos($content, '<!--more-->');
    if ($pos !== false) {
        return substr($content, 0, $pos);
    }
    return $content;
}

// ✅ 必须用匿名函数或命名函数
function truncate_content_at_marker($content) {
    $pos = strpos($content, '<!--more-->');
    if ($pos !== false) {
        return substr($content, 0, $pos);
    }
    return $content;
}
```

---

## 速查表

| 特性 | 匿名函数 `function(){}` | 箭头函数 `fn()=>` |
|------|------------------------|-------------------|
| 多行代码 | ✅ 支持 | ❌ 仅单表达式 |
| 外部变量 | 需 `use` 声明 | 自动捕获 |
| `return` | 需手写 | 自动返回 |
| PHP 版本 | 5.3+ | **7.4+** |
| 适合场景 | 复杂逻辑 | 简单回调 |

---

## 判断原则

> **一句话能写完的回调 → 用箭头函数；否则用传统函数。**
