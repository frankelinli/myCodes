<?php
/**
 * 只为管理员加载任务清单样式
 * haowiki_admin_todo_list.php
 * 任务清单功能
 * 仅管理员可见
 * 使用localStorage存储任务数据
 * 使用jQuery处理DOM操作和事件绑定
 */

// 只给管理员界面注入html
function haowiki_admin_todo_list() {
    // 仅对管理员显示
    if (!current_user_can('administrator')) return;
    ?>
    <!-- 添加HTML结构 -->
    <div id="admin-todo-list" class="admin-todo-panel">
        <div class="todo-header">任务清单<span class="todo-toggle">−</span></div>
        <div class="todo-content">
            <ul id="todo-items"></ul>
            <div class="todo-input-group">
                <input type="text" id="new-todo" placeholder="添加新任务...">
                <button id="add-todo">添加</button>
            </div>
        </div>
    </div>
    
    <?php
    // 加载相关JS和CSS
    add_action('wp_footer', 'haowiki_todo_list_scripts');
}
add_action('wp_body_open', 'haowiki_admin_todo_list');


// 加载任务清单所需的JS
function haowiki_todo_list_scripts() {
    if (!current_user_can('administrator')) return;
    ?>
    <script>
    jQuery(document).ready(function($) {
        // 从localStorage加载任务
        function loadTodos() {
            return JSON.parse(localStorage.getItem('haowiki_todos') || '[]');
        }
        
        // 保存任务到localStorage
        function saveTodos(todos) {
            localStorage.setItem('haowiki_todos', JSON.stringify(todos));
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



// 添加管理员任务清单css,只在管理员登录时加载
function haowiki_admin_todo_styles()
{
    // 检查用户是否登录且是管理员
    if (is_user_logged_in() && current_user_can('administrator')) {
?>
        <style>
            /* 管理员任务清单样式 */
            .admin-todo-panel {
                position: fixed;
                right: 20px;
                top: 100px;
                width: 300px;
                background: #fff;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
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
        </style>
<?php
    }
}
add_action('wp_head', 'haowiki_admin_todo_styles');