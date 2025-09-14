---
id: 270
title: elementor自定义查询
date: '2025-05-11T18:14:09'
author: haoye
categories:
  - notes
tags: []
url: https://haoyelaiga.com/elementor%e8%87%aa%e5%ae%9a%e4%b9%89%e6%9f%a5%e8%af%a2/
---

![image-20240718113440784](https://docu-1319658309.cos.ap-guangzhou.myqcloud.com/image-20240718113440784.png)要在Elementor中查询最近一个月的帖子，可以使用你已经设置的Query ID，并在相应的代码中定义查询逻辑。以下是如何实现这一目标的详细步骤：

:::info

原来如此简单！elementor的自定义查询，等于把“elementor可视化”与WordPress代码结合起来了。

:::

### 1. 添加自定义查询逻辑

将以下代码添加到你的WordPress主题的`functions.php`文件，或者通过插件添加：

```
add_action( 'elementor/query/sedexthismonth', function( $query ) {
    // 获取当前日期
    $current_date = date( 'Y-m-d' );
    // 获取一个月前的日期
    $date_one_month_ago = date( 'Y-m-d', strtotime( '-1 month' ) );

    // 设置查询参数
    $query->set( 'post_type', 'post' );
    $query->set( 'posts_per_page', 10 ); // 每页显示10篇文章，可以根据需要调整
    $query->set( 'date_query', array(
        array(
            'after'     => $date_one_month_ago,
            'before'    => $current_date,
            'inclusive' => true,
        ),
    ));
});
```

### 2. 在Elementor编辑器中使用Query ID

1. **打开Elementor编辑器**，编辑你想要显示查询结果的页面或模板。

2. **添加小工具**：拖放你需要的小工具到页面上，比如“文章列表”（Posts）小工具。

3. **设置查询**：

   - 点击小工具来打开其设置面板。
   - 找到“查询”选项。
   - 在“高级”部分，找到“Query ID”输入框，并输入`sedexthismonth`。

通过以上步骤，你将能够显示最近一个月内发布的帖子。如果你需要更多自定义的查询逻辑或有其他问题，请随时问我。

***

## 查询当前文章所在分类下的全部文章

我来为您编写一个新功能，用于查询当前文章所在分类下的全部文章列表，以便在Elementor的Query ID中使用。这里是相应的代码：

```
add_action('elementor/query/current_category_posts', function($query) {
    // 确保我们在单个文章页面
    if (is_single()) {
        // 获取当前文章的ID
        $current_post_id = get_the_ID();

        // 获取当前文章的分类
        $categories = get_the_category($current_post_id);

        if (!empty($categories)) {
            // 获取第一个分类的ID（如果文章属于多个分类）
            $category_id = $categories[0]->term_id;

            // 设置查询参数
            $query->set('post_type', 'post');
            $query->set('cat', $category_id);
            $query->set('posts_per_page', -1); // 获取所有文章，您可以根据需要调整这个数值

            // 排除当前文章
            //$query->set('post__not_in', array($current_post_id));

            // 按发布日期降序排序
            $query->set('orderby', 'date');
            $query->set('order', 'DESC');
        }
    }
});
```

这段代码的功能如下：

1. 我们创建了一个名为 `current_category_posts` 的查询ID，您可以在Elementor中使用这个ID。

2. 该函数首先检查是否在单个文章页面上，因为我们需要获取当前文章的分类。

3. 然后，它获取当前文章的ID和分类。

4. 如果文章有分类，它会使用第一个分类的ID来设置查询参数。

5. 查询设置为获取所有属于该分类的文章（通过 `posts_per_page` 设为 -1）。您可以根据需要调整这个数值。

6. 我们排除了当前文章，以避免在列表中显示当前正在查看的文章。

7. 最后，我们设置了按发布日期降序排序，以便最新的文章显示在前面。

要使用这个功能，您需要将这段代码添加到您的主题的 functions.php 文件中，或者使用一个自定义插件。然后，在Elementor中创建一个帖子小部件时，您可以在查询设置中选择自定义查询，并输入 `current_category_posts` 作为查询ID。

这将显示与当前正在查看的文章属于同一分类的所有其他文章列表。

需要我解释代码的任何部分吗？
