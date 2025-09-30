---
id: 81
title: WordPress浮动任务清单实现方案
slug: wordpress%e6%b5%ae%e5%8a%a8%e4%bb%bb%e5%8a%a1%e6%b8%85%e5%8d%95%e5%ae%9e%e7%8e%b0%e6%96%b9%e6%a1%88
date: '2025-04-17T17:49:07'
categories:
  - notes
tags: []
url: https://haoyelaiga.com/wordpress%e6%b5%ae%e5%8a%a8%e4%bb%bb%e5%8a%a1%e6%b8%85%e5%8d%95%e5%ae%9e%e7%8e%b0%e6%96%b9%e6%a1%88/
---

![](https://haoyelaiga.com/wp-content/uploads/2025/04/image.png)

一个仅管理员可见的浮动任务清单。以下是一个极简方案，用localstorag储存任务。

## 步骤1：添加PHP代码到functions.php

将这段代码添加到你的Astra子主题的`functions.php`文件中：

```
// 添加管理员专属任务清单
function csrwiki_admin_todo_list() {
    // 仅对管理员显示
    if (!current_user_can('administrator')) return;

    // 添加HTML结构
    echo '<div id="admin-todo-list" class="admin-todo-panel">
        <div class="todo-header">任务清单<span class="todo-toggle">−</span></div>
        <div class="todo-content">
            <ul id="todo-items"></ul>
            <div class="todo-input-group">
                <input type="text" id="new-todo" placeholder="添加新任务...">
                <button id="add-todo">添加</button>
            </div>
        </div>
    </div>';

    // 加载相关JS和CSS
    add_action('wp_footer', 'csrwiki_todo_list_scripts');
}
add_action('wp_body_open', 'csrwiki_admin_todo_list');

// 加载任务清单所需的JS
function csrwiki_todo_list_scripts() {
    if (!current_user_can('administrator')) return;
    ?>
    <script>
    jQuery(document).ready(function($) {
        // 从localStorage加载任务
        function loadTodos() {
            return JSON.parse(localStorage.getItem('csrwiki_todos') || '[]');
        }

        // 保存任务到localStorage
        function saveTodos(todos) {
            localStorage.setItem('csrwiki_todos', JSON.stringify(todos));
        }

        // 渲染任务列表
        function renderTodos() {
            const todos = loadTodos();
            const $list = $('#todo-items');
            $list.empty();

            todos.forEach((todo, index) => {
                const $item = $(`<li class="${todo.completed ? 'completed' : ''}">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                    <span>${todo.text}</span>
                    <button class="delete-todo">×</button>
                </li>`);

                $item.find('input').on('change', function() {
                    const todos = loadTodos();
                    todos[index].completed = this.checked;
                    saveTodos(todos);
                    renderTodos();
                });

                $item.find('.delete-todo').on('click', function() {
                    const todos = loadTodos();
                    todos.splice(index, 1);
                    saveTodos(todos);
                    renderTodos();
                });

                $list.append($item);
            });
        }

        // 添加新任务
        $('#add-todo').on('click', function() {
            const $input = $('#new-todo');
            const text = $input.val().trim();

            if (text) {
                const todos = loadTodos();
                todos.push({ text, completed: false });
                saveTodos(todos);
                renderTodos();
                $input.val('');
            }
        });

        // 回车键添加任务
        $('#new-todo').on('keypress', function(e) {
            if (e.which === 13) {
                $('#add-todo').click();
            }
        });

        // 切换面板显示/隐藏
        $('.todo-toggle').on('click', function() {
            const $panel = $('#admin-todo-list');
            const $content = $('.todo-content');
            const $toggle = $(this);

            if ($content.is(':visible')) {
                $content.slideUp();
                $toggle.text('+');
                localStorage.setItem('todo_panel_state', 'closed');
            } else {
                $content.slideDown();
                $toggle.text('−');
                localStorage.setItem('todo_panel_state', 'open');
            }
        });

        // 初始化面板状态
        const panelState = localStorage.getItem('todo_panel_state') || 'open';
        if (panelState === 'closed') {
            $('.todo-content').hide();
            $('.todo-toggle').text('+');
        }

        // 初始化任务列表
        renderTodos();
    });
    </script>
    <?php
}
```

## 步骤2：添加CSS样式到style.css

在子主题的`style.css`文件中添加以下样式：

```
/* 管理员任务清单样式 */
.admin-todo-panel {
    position: fixed;
    right: 20px;
    top: 100px;
    width: 300px;
    background: #fff;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.todo-header {
    background: #2271b1;
    color: #fff;
    padding: 10px 15px;
    border-radius: 5px 5px 0 0;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
}

.todo-toggle {
    cursor: pointer;
    font-weight: bold;
}

.todo-content {
    padding: 15px;
    max-height: 70vh;
    overflow-y: auto;
}

#todo-items {
    list-style: none;
    margin: 0 0 15px 0;
    padding: 0;
}

#todo-items li {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
}

#todo-items li.completed span {
    text-decoration: line-through;
    color: #888;
}

#todo-items li input[type="checkbox"] {
    margin-right: 10px;
}

#todo-items li span {
    flex-grow: 1;
    word-break: break-word;
}

.delete-todo {
    background: none;
    border: none;
    color: #cc0000;
    cursor: pointer;
    padding: 0 5px;
    font-size: 18px;
}

.todo-input-group {
    display: flex;
}

#new-todo {
    flex-grow: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 3px 0 0 3px;
}

#add-todo {
    background: #2271b1;
    color: #fff;
    border: none;
    padding: 8px 15px;
    border-radius: 0 3px 3px 0;
    cursor: pointer;
}

#add-todo:hover {
    background: #135e96;
}
```

## 功能说明

1. 该任务清单只对管理员可见
2. 浮动在页面右侧
3. 可以折叠/展开
4. 任务数据保存在浏览器的localStorage中
5. 支持添加、完成和删除任务
6. 折叠状态会被记忆
7. 简洁的UI设计

## 优点

- 不需要创建数据库表或修改WordPress核心
- 不依赖额外插件
- 使用localStorage存储，不增加服务器负担
- 只对管理员可见，不影响普通访客
- 跨设备局限性成为优点：任务列表是设备特定的，适合个人使用

## 浏览器端存储方案

### 1. localStorage

**优点**: 简单实现、无服务器负担、永久存储直到手动清除\
**缺点**: 设备局限性、无法跨设备同步、容量限制(5-10MB)、只能存储字符串

### 2. sessionStorage

**优点**: 使用简单、隔离每个会话窗口、安全性较高\
**缺点**: 会话结束即清除、无跨设备/跨窗口同步、容量限制同localStorage

### 5. cookies

**优点**: 兼容性极佳、可设置过期时间\
**缺点**: 容量极小(4KB)、每次请求都会发送、安全性较低

## 服务器端存储方案

### 1. WordPress选项API

**优点**: 跨设备同步、原生WordPress功能、简单实现\
**缺点**: 需要AJAX请求、共享单一任务列表给所有管理员

### 2. 用户元数据

**优点**: 每位管理员独立任务列表、利用WordPress权限系统\
**缺点**: 需要AJAX请求、数据库查询开销

### 3. 自定义数据表

**优点**: 高度定制化、优化查询性能、适合复杂任务管理\
**缺点**: 需创建维护表、迁移困难、实现复杂

### 4. 自定义文章类型

**优点**: 利用WordPress核心功能、支持修订历史、分类和标签\
**缺点**: 可能过于笨重、性能消耗较大、操作复杂

### 5. 分类/标签系统

**优点**: 无需额外表、可嵌套分类整理任务\
**缺点**: 功能受限、难以表达复杂任务状态

### 6. WordPress Transients API

**优点**: 自动缓存、可设置过期时间、减少数据库负担\
**缺点**: 主要用于临时数据、可能被缓存清理移除

### 7. 文件系统存储

**优点**: 不占用数据库资源、易于备份\
**缺点**: 文件IO操作可能较慢、权限问题、并发写入风险

## 第三方服务

### 1. Firebase/Firestore

**优点**: 实时同步、强大的查询能力、无需自建后端\
**缺点**: 第三方依赖、可能产生费用、隐私顾虑

### 2. REST API与第三方服务集成

**优点**: 功能丰富、专业任务管理工具、跨平台同步\
**缺点**: 外部依赖、需API密钥、可能有费用、集成复杂

### 3. 浏览器扩展存储

**优点**: 独立于网站、功能强大、深度集成浏览器\
**缺点**: 需单独安装扩展、开发复杂、受限于扩展商店政策

## 混合方案

### 1. 本地优先+服务器同步

**优点**: 离线可用、良好用户体验、数据安全有保障\
**缺点**: 同步逻辑复杂、冲突解决挑战

### 2. PWA与缓存API

**优点**: 跨设备安装体验、离线功能、推送通知\
**缺点**: 实现复杂、需HTTPS、老浏览器支持有限

对于一个极简方案，localStorage是最佳选择，但如果需要跨设备同步，用户元数据或WordPress选项API会是更好的选择。
