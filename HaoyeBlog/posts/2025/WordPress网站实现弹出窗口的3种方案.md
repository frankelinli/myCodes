---
id: 525
title:  WordPress网站中实现滚动触发弹窗
slug: WordPress网站中实现滚动触发弹窗的3个方案

categories:
  - notes
tags: []
---



在WordPress网站中实现滚动触发弹窗是一种吸引用户注意力的有效方式。本文将介绍两种实现这一功能的方法：一种是在页面结构中直接写入HTML元素，另一种是使用JavaScript动态生成元素；第三种是“专业”做法，用模板部件来实现。我们将对比这三种方法的优缺点，帮助您选择最适合自己需求的实现方式。

![image-20250919180429631](https://haoyeblog-1319658309.cos.ap-guangzhou.myqcloud.com/image-20250919180429631.png)



## 方法一：在页面结构中直接写入HTML元素

### 步骤1：添加HTML结构

在您的WordPress主题的footer.php文件中添加以下HTML代码：

```html
<div id="popup" class="popup">
  <div class="popup-content">
    <h2>感谢您的浏览!</h2>
    <p>您已经浏览到页面底部了，希望您喜欢我们的内容。</p>
    <button id="close-popup">关闭</button>
  </div>
</div>
```

### 步骤2：添加CSS样式

在您的主题的style.css文件中添加以下CSS样式：

```css
.popup {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
}

.popup-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 500px;
}

#close-popup {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
}

#close-popup:hover {
  background-color: #45a049;
}
```

### 步骤3：添加JavaScript代码

创建一个script.js文件，并添加以下代码：

```javascript
jQuery(document).ready(function($) {
    var $popup = $('#popup');
    var $closeButton = $('#close-popup');
    var hasShownPopup = false;

    $(window).on('scroll', function() {
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 100 && !hasShownPopup) {
            $popup.fadeIn();
            hasShownPopup = true;
        }
    });

    $closeButton.on('click', function() {
        $popup.fadeOut();
    });
});
```

## 方法二：使用JavaScript动态生成元素

### 步骤1：创建JavaScript文件

创建一个script.js文件，并添加以下代码：

```javascript
jQuery(document).ready(function($) {
    // 创建弹窗元素
    var $popup = $('<div>', {id: 'popup', class: 'popup'});
    var $popupContent = $('<div>', {class: 'popup-content'});
    var $title = $('<h2>').text('感谢您的浏览!');
    var $message = $('<p>').text('您已经浏览到页面底部了，希望您喜欢我们的内容。');
    var $closeButton = $('<button>', {id: 'close-popup', text: '关闭'});

    // 组装弹窗结构
    $popupContent.append($title, $message, $closeButton);
    $popup.append($popupContent);

    // 添加CSS样式
    var styles = `
        .popup {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        }
        .popup-content {
            background-color: #fefefe;
            margin: 15% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 500px;
        }
        #close-popup {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            cursor: pointer;
        }
        #close-popup:hover {
            background-color: #45a049;
        }
    `;

    // 创建style元素并添加到head
    $('<style>').text(styles).appendTo('head');

    // 将弹窗添加到body
    $('body').append($popup);

    var hasShownPopup = false;

    // 滚动事件处理
    $(window).on('scroll', function() {
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 100 && !hasShownPopup) {
            $popup.fadeIn();
            hasShownPopup = true;
        }
    });

    // 关闭按钮点击事件
    $closeButton.on('click', function() {
        $popup.fadeOut();
    });
});
```

### 步骤2：在WordPress中加载脚本

:::caution

对于两种方法，都需要在functions.php文件中添加以下代码来加载脚本：

```php
function enqueue_custom_scripts() {
    wp_enqueue_script('jquery');
    wp_enqueue_script('custom-script', get_template_directory_uri() . '/js/script.js', array('jquery'), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'enqueue_custom_scripts');
```

:::

---

## 两种方法的对比

| 特性         | 方法一：直接在页面结构写入HTML               | 方法二：用JS动态生成                         |
| ------------ | -------------------------------------------- | -------------------------------------------- |
| 页面结构     | HTML结构清晰，直接可见                       | HTML结构由JS生成，不直接可见                 |
| 可维护性     | 易于在主题文件中直接编辑                     | 集中在JS文件中管理，但可能较难直观理解       |
| 灵活性       | 修改内容需编辑主题文件，较不灵活             | 可通过JS轻松动态修改内容和样式               |
| 初始加载速度 | 较快，HTML直接加载                           | 略慢，需要JS执行才能创建元素                 |
| SEO影响      | 更好，内容是页面HTML的一部分，搜索引擎可索引 | 较差，动态生成的内容可能不被搜索引擎完全识别 |
| 条件加载     | 需要额外的PHP逻辑控制显示                    | 可在JS中轻松添加条件控制显示                 |
| 跨页面复用   | 需要在每个相关页面添加HTML                   | 只需在全局JS中实现一次即可                   |
| 与主题耦合度 | 较高，改变主题可能需要重新添加HTML           | 较低，不依赖于特定主题结构                   |
| 代码组织     | HTML、CSS、JS分离                            | HTML、CSS、JS集中在一起                      |
| 动态内容支持 | 较难实现动态内容                             | 易于实现动态内容，如根据用户行为改变显示     |

## 选择建议

- 选择方法一（直接在页面结构写入HTML）如果：
  1. 您的弹窗内容相对固定
  2. SEO对弹窗内容很重要
  3. 您希望保持传统的代码分离模式
  4. 网站对初始加载速度要求极高

- 选择方法二（用JS动态生成）如果：
  1. 您需要高度的灵活性和动态内容
  2. 希望能够轻松地在不同页面复用弹窗功能
  3. 计划根据用户行为或其他条件动态改变弹窗内容
  4. 希望降低与特定主题的耦合度

## 方法三：组件化（模板部件）

:question: WordPress有无“组件”的说法，比如把这个弹窗做成一个组件，在需要显示的页面，用类似`<?php get_footer ?>`的方法来调用？

:accept: 您提出了一个非常好的问题。WordPress确实有类似"组件"的概念，虽然它们通常不被称为"组件"，但有几种方式可以实现类似的功能：

1. 模板部件（Template Parts）
2. 小工具（Widgets）
3. 短代码（Shortcodes）
4. 自定义函数

对于弹窗这样的功能，我们可以使用"模板部件"的方法来实现，这与您提到的 `get_footer()` 非常相似。以下是如何将弹窗制作成一个可重用的"组件"：

1. 创建模板部件文件：
   在您的主题文件夹中创建一个名为 `template-parts` 的文件夹（如果还没有的话），然后在其中创建一个名为 `popup.php` 的文件。

2. 在 `popup.php` 中添加弹窗的 HTML 结构：

```php
<div id="popup" class="popup">
  <div class="popup-content">
    <h2>感谢您的浏览!</h2>
    <p>您已经浏览到页面底部了，希望您喜欢我们的内容。</p>
    <button id="close-popup">关闭</button>
  </div>
</div>
```

3. 在需要显示弹窗的页面模板中，使用 `get_template_part()` 函数来引入弹窗：

   ```php
   <?php get_template_part( 'template-parts/popup' ); ?>
   ```

   :::tip

   可以在`index.php`底部放这个代码，那么它只在`index.php`页面显示；也可以在`footer.php`里面放进去，那么它将在每个带有footer的页面里显示。

   :::

4. 将 CSS 样式添加到您的主题的 `style.css` 文件中。

5. 创建一个 `js/popup.js` 文件来处理弹窗的行为：

```javascript
jQuery(document).ready(function($) {
    var $popup = $('#popup');
    var $closeButton = $('#close-popup');
    var hasShownPopup = false;

    $(window).on('scroll', function() {
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 100 && !hasShownPopup) {
            $popup.fadeIn();
            hasShownPopup = true;
        }
    });

    $closeButton.on('click', function() {
        $popup.fadeOut();
    });
});
```

6. 在 `functions.php` 中确保 JS 文件被正确加载：

```php
function enqueue_popup_script() {
    wp_enqueue_script('popup-script', get_template_directory_uri() . '/js/popup.js', array('jquery'), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'enqueue_popup_script');
```

:::info

当然可以把多个JS代码片段放到一个`custom.js`里，在`functions.php`引入一个`custom.js`即可。如图：

![image-20240718235412210](https://docu-1319658309.cos.ap-guangzhou.myqcloud.com/image-20240718235412210.png)

:::

模板组件的优点包括：

1. 可重用性：可以在任何需要的页面模板中使用 `get_template_part( 'template-parts/popup' );` 来引入弹窗。
2. 维护性：弹窗的 HTML 结构集中在一个文件中，便于维护和更新。
3. 灵活性：可以轻松地在特定页面添加或移除弹窗。
4. 主题兼容性：如果更换主题，只需将 `template-parts/popup.php` 文件复制到新主题中即可。

如果您想更进一步，还可以创建一个函数来控制弹窗的显示：

```php
function display_popup() {
    if (is_single() || is_page()) {  // 只在文章和页面显示
        get_template_part( 'template-parts/popup' );
    }
}
```

然后在页面模板中调用这个函数：

```php
<?php display_popup(); ?>
```

这样，您就可以在函数中添加更多的逻辑来控制弹窗的显示条件。

这种方法结合了模板部件的概念和函数的灵活性，使得弹窗功能更接近于一个可重用的"组件"。它保持了代码的组织性，同时提供了足够的灵活性来控制弹窗的显示逻辑。

