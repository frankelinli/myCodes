---
id: 200
title: wordpress修改代码，在文章底部增加打赏按钮
slug: wordpress%e4%bf%ae%e6%94%b9%e4%bb%a3%e7%a0%81%ef%bc%8c%e5%9c%a8%e6%96%87%e7%ab%a0%e5%ba%95%e9%83%a8%e5%a2%9e%e5%8a%a0%e6%89%93%e8%b5%8f%e6%8c%89%e9%92%ae
date: '2025-04-28T23:10:52'
categories:
  - notes
tags: []
url: https://haoyelaiga.com/wordpress%e4%bf%ae%e6%94%b9%e4%bb%a3%e7%a0%81%ef%bc%8c%e5%9c%a8%e6%96%87%e7%ab%a0%e5%ba%95%e9%83%a8%e5%a2%9e%e5%8a%a0%e6%89%93%e8%b5%8f%e6%8c%89%e9%92%ae/
---

通过修改WordPress主题的`single.php`文件来实现文章底部添加“打赏”功能，并弹出微信和支付宝二维码的模态框，可以按照以下步骤操作：

### 1. 编辑astra主题的 `content-single.php` 文件

打开你的WordPress主题目录，找到并编辑 `content-single.php` 文件。你可以在文章内容的末尾添加打赏按钮和模态框的HTML代码。

### 2. 添加HTML和CSS代码

在 `content-single.php` 文件中，找到适合的位置（通常是在显示内容的 `the_content()` 函数之后），添加以下HTML和CSS代码：

### 3. 添加JavaScript代码

在 `single.php` 文件的底部（在 `</body>` 标签之前），添加以下JavaScript代码，以实现模态框的显示和隐藏功能：

完整代码如下：

```
<?php
/**
 * Template part for displaying single posts.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package Astra
 * @since 1.0.0
 */

?>

<?php astra_entry_before(); ?>

<article
<?php
        echo astra_attr(
            'article-single',
            array(
                'id'    => 'post-' . get_the_id(),
                'class' => join( ' ', get_post_class() ),
            )
        );
        ?>
>

    <?php astra_entry_top(); ?>

    <?php astra_entry_content_single(); ?>

     <!-- 打赏按钮 -->
        <div id="reward-button" style="text-align: center; margin-top: 20px;">
            <button id="rewardBtn" style="background-color: #ff5e5e; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                <i class="fa fa-dollar-sign"></i> 打赏
            </button>
        </div>

        <!-- 模态框 -->
        <div id="rewardModal" style="display: none; position: fixed; z-index: 1; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4);">
            <div style="background-color: #fefefe; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%; max-width: 600px; text-align: center; border-radius: 10px;">
                <span id="closeModal" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
                <h2>打赏</h2>
                <div style="display: flex; justify-content: center; margin-top: 20px;">
                    <div style="margin-right: 20px;">
                        <img src="https://shelleydigital.com/wp-content/uploads/2023/08/wechat-pay.jpg" alt="微信打赏" style="width: 150px; height: 150px;">
                        <p>微信</p>
                    </div>
                    <div>
                        <img src="https://shelleydigital.com/wp-content/uploads/2023/08/alipay.jpg" alt="支付宝打赏" style="width: 150px; height: 150px;">
                        <p>支付宝</p>
                    </div>
                </div>
            </div>
        </div>

    <?php astra_entry_bottom(); ?>

</article><!-- #post-## -->

<?php astra_entry_after(); ?>

<script>
// 打开模态框
document.getElementById('rewardBtn').onclick = function() {
    document.getElementById('rewardModal').style.display = 'block';
}

// 关闭模态框
document.getElementById('closeModal').onclick = function() {
    document.getElementById('rewardModal').style.display = 'none';
}

// 点击模态框外部关闭模态框
window.onclick = function(event) {
    if (event.target == document.getElementById('rewardModal')) {
        document.getElementById('rewardModal').style.display = 'none';
    }
}
</script>
```

### 4. 添加Font Awesome图标（可选）

如果你希望在按钮上添加一个图标，可以使用Font Awesome。在你的WordPress主题的 `header.php` 文件中，添加以下代码以引入Font Awesome：

```
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
```

### 5. 替换二维码图片

将 `path/to/wechat-qrcode.png` 和 `path/to/alipay-qrcode.png` 替换为你实际的微信和支付宝二维码图片路径。

### 6. 完成

保存 `single.php` 文件并刷新你的网站。在每篇文章的底部应该都会显示一个“打赏”按钮，点击按钮后会弹出包含微信和支付宝二维码的模态框。

### 注意事项

1. **备份：** 在修改 `single.php` 文件之前，确保你已经备份了文件，以防出现问题。
2. **图片路径：** 确保你的二维码图片路径正确并且图片已经上传到你的服务器。
3. **主题更新：** 如果你的主题更新，可能会覆盖 \`single.php

:::tip

编辑astra的single.php时，Astra更新后，自己的设置会失效；

即使astra child的single. php也有风险，无法即使获得astra的single.php的新功能。

最好是使用astra 的hook；

:::
