---

id: 804
title: wordpres图片自动裁剪和缩略图的使用指南
slug: wordpres如何设置媒体图片的尺寸？
categories:
  - notes
tags: []
---

![image-20250928115827175](https://images.haoyelaiga.com/image-20250928115827175.webp)

## 🖼️ WordPress图片尺寸设置详解

截图是 WordPress 后台的「媒体设置」界面，它决定了你上传图片时，WordPress 会自动生成哪些尺寸的缩略图，以及如何组织这些文件。WordPress 每上传一张图片，除了原图会保存之外，还会根据设置自动生成多个尺寸的副本，方便在不同页面调用，比如小图在文章列表里显示，中等尺寸的图在正文显示。WordPress会自动分配合适的图给浏览器。

当你上传一张图片，WordPress 会自动生成多个尺寸（前提是主题启用了 `add_theme_support('post-thumbnails')`）：

| 尺寸名称       | 默认尺寸（可在后台设置中修改） | 特点说明               |
| -------------- | ------------------------------ | ---------------------- |
| `thumbnail`    | 150×150（硬裁剪）              | 用于小图标或列表缩略图 |
| `medium`       | 最大宽高 300px（保持比例）     | 适合文章内嵌图         |
| `medium_large` | 宽度 768px，高度不限           | 响应式设计中常用       |
| `large`        | 最大宽高 1024px（保持比例）    | 适合展示型内容         |
| `full`         | 原始尺寸                       | 不压缩不裁剪           |

比如150 x 150：Thumbnail 缩略图尺寸，这是 WordPress 为每张上传图片生成的缩略图尺寸，宽度和高度都为 150 像素。**截图中勾选了“裁剪为精确尺寸”**：意味着 WordPress 会强制裁剪图片为正方形 150x150，而不是按比例缩放。

Medium Large在WordPress管理后台看不到，不让你修改。她默认生成768宽的图。

还有2个超大尺寸在管理后台也看不到：

```
1536x1536: 默认不裁剪、比例缩放(crop: false)
2048x2048: 默认不裁剪、比例缩放(crop: false)
```

上传图片时，在WordPress后台的“媒体库”里只能看到1张原图，自动生成的其他不同尺寸的图，在“媒体库”里不显示。在wp-content/uploads/2025/09文件夹下能看到。同理，当在“媒体库”删除主图时，uploads文件夹里对应的附图，也会全部自动删除。

## 如何查看目前的WordPress下注册了哪些媒体尺寸？

### 用WP-CLI命令行：

```cmd
wp media image-size
```

命令行里会输出一个表格，里会显示你的WordPress系统里，已经注册的所有媒体尺寸，名称、宽高、裁剪方式：

![image-20250929202644509](https://images.haoyelaiga.com/image-20250929202644509.webp)

### PHP代码查询并显示在页面上

可以写个查询代码，把WordPress已经注册的图片尺寸，显示到管理后台页面（当然可以显示到任意页面，只是在管理后台查看方便点，又不影响前台页面）：

```php
add_action('admin_notices', function () {
    $screen = get_current_screen();
    if ($screen && $screen->id === 'options-media') {
        global $_wp_additional_image_sizes;

        echo '<div style="background:#111;color:#0f0;padding:10px;margin-bottom:20px;"><pre style="margin:0;">';
        echo "=== WordPress本身已注册的图片尺寸 ===\n";

        // 核心默认尺寸
        echo "thumbnail: " . get_option('thumbnail_size_w') . "x" . get_option('thumbnail_size_h') . " (crop: " . (get_option('thumbnail_crop') ? 'true' : 'false') . ")\n";
        echo "medium: " . get_option('medium_size_w') . "x" . get_option('medium_size_h') . "\n";
        echo "medium_large: " . get_option('medium_large_size_w') . "x" . get_option('medium_large_size_h') . "\n";
        echo "large: " . get_option('large_size_w') . "x" . get_option('large_size_h') . "\n";

        // 额外注册的尺寸
        if (!empty($_wp_additional_image_sizes)) {
            foreach ($_wp_additional_image_sizes as $name => $size) {
                echo $name . ': ' . $size['width'] . 'x' . $size['height'] . ' (crop: ' . ($size['crop'] ? 'true' : 'false') . ")\n";
            }
        } else {
            echo "没有额外注册的尺寸\n";
        }

        echo '</pre></div>';
    }
});
```

![image-20250929204909116](https://images.haoyelaiga.com/image-20250929204909116.webp)





## 如何禁止WordPress自动生成过多的缩略图？

关闭 WordPress 默认注册的图片副本尺寸，比如 `large`, `1536x1536`, 和 `2048x2048` 图片尺寸，避免生成过多尺寸的图片。大多数时候，这些不同尺寸的图片用不上。可以通过以下几种方式实现：

### ✅ 方法一：最简单，在管理后台把Large图像尺寸设置0*0。这是简单粗暴的做法。

![image-20250929211027599](https://images.haoyelaiga.com/image-20250929211027599.webp)

### ✅ 方法二：在 `functions.php` 中移除尺寸注册

上面设为0*0的做法，简单粗暴，不过 `1536x1536` 和 `2048x2048` 是 WordPress 5.3+ 引入的高分辨率尺寸，**不会出现在后台设置中**。medium large 768这个尺寸在后台也看不到设置选项。所以只能用 `remove_image_size()` 函数来移除

```php
add_action( 'init', function() {
    remove_image_size( 'large' );
    remove_image_size( '1536x1536' );
    remove_image_size( '2048x2048' );
}, 20 );
```

这段代码会在 WordPress 初始化时移除这些尺寸的注册，**新上传的图片将不会生成这些尺寸**。

还可以与以下代码组合，彻底禁止WordPress生成特定尺寸的图片（无论是否有注册）

```php
add_filter( 'intermediate_image_sizes_advanced', function( $sizes ) {
    unset( $sizes['large'] );
    unset( $sizes['1536x1536'] );
    unset( $sizes['2048x2048'] );
    return $sizes;
} );
```

这是通过 WordPress 的过滤器 `intermediate_image_sizes_advanced`，**在图片上传处理阶段动态取消某些尺寸的生成**。它不像 `remove_image_size()` 那样只是取消注册，而是直接影响 WordPress 是否生成这些尺寸的文件。

所以如果你想彻底干净地移除wordpress的某些尺寸，推荐双保险，使用以下2个组合。如此一来，就可以明确知道哪些尺寸是你主动保留的，哪些是禁止的。甚至可以全部尺寸都remove，只保留原图。

```php
add_action( 'init', function() {
    remove_image_size( 'large' );
    remove_image_size( '1536x1536' );
    remove_image_size( '2048x2048' );
}, 20 );

add_filter( 'intermediate_image_sizes_advanced', function( $sizes ) {
    unset( $sizes['large'] );
    unset( $sizes['1536x1536'] );
    unset( $sizes['2048x2048'] );
    return $sizes;
} );
```

#### 🧩 `remove_image_size()`：取消注册

- ✅ 会从 WordPress 的尺寸列表中移除
- ✅ `get_intermediate_image_sizes()` 不再显示这些尺寸
- ⚠️ 某些插件或主题仍可能尝试生成这些尺寸（如果它们硬编码了尺寸名）

#### 🧩 `intermediate_image_sizes_advanced`：拦截生成流程

- ✅ 上传图片时，WordPress不会生成这些尺寸的文件
- ❌ 这些尺寸仍然存在于注册列表中（只是不会生成文件）

### 举例演示-禁止WordPress自动生成≥1024的图片

我使用上述方法，禁止WordPress自动生成large大图(1024)。只要thumbnail 150 x 150、medium 300 x 300、以及wordpress隐藏的自动medium large 768。当我上传一张1500 x 1129的图片（>1024）后，预期是得到4张图片：

- 1张原图
- thumbnail 150 x 150  (裁剪保持方形)
- medium 300 x 300 (宽度300，高度根据比例缩放)
- 以及wordpress隐藏的自动medium large 768 （宽度768，高度是比例缩放）

查看uploads图片，的确是4张图片，没有生成1024的large大图。说明设置成功，精准控制了WordPress的自动缩略图逻辑。

![feature images demo](https://images.haoyelaiga.com/image-20250929230446885.webp)

![image-20250929234810969](https://images.haoyelaiga.com/image-20250929234810969.webp)

不同容器宽度比较：同一 srcset 在不同容器宽度下会被选择不同分辨率的文件。

![image-20250929235606755](https://images.haoyelaiga.com/image-20250929235606755.webp)

## WordPress超大图的自动缩放scale

1. 自动压缩没改名：不知为何WordPress偷偷把“原图”也自动压缩了，我的feature-image-demo原图是1500 x 1129，传到媒体库之后，feature-image-demo自动变成了834 x 628。WordPress的“原图”已经不是你上传的“原图”。有可能是 WordPress 的 `big_image_size_threshold`自动裁剪原图在作祟，WordPress自动裁剪的阈值是多少？有的说是1536以上，简单测试后发现也不对。我不是摄影展览站点，对此不再进一步研究了。如果是摄影的图片，就要注意WordPress的这个自动压缩了。

2. 自动压缩后改名了，加上了-scale。为什么会WordPress有时会自动把原图名字也修改，出现 `-scaled.jpg`这种情况？从 WordPress 5.3 开始，WordPress引入了一个自动缩放机制： 如果你上传的图片尺寸超过 `2560px`（默认阈值），WordPress 会自动生成一个“scaled”版本用于前台展示，以避免加载超大图。

这个行为是由 `wp_big_image_size_threshold` 控制的。

![image-20250929220716847](https://images.haoyelaiga.com/image-20250929220716847.webp)

如果你需要，可以禁用 `-scaled.jpg` 自动缩放行为，在 `functions.php` 中添加以下代码：

```
add_filter( 'big_image_size_threshold', '__return_false' );
```

这样 WordPress 就不会再自动生成 `-scaled.jpg` 文件，即使尺寸超过 `2560px`的原图，也会存到媒体图。

除非你是专业的摄影图片展示网站，否则还是启用WordPress的超大尺寸自动裁剪缩放。WordPress考虑的很周到。



## 自定义图片尺寸（进阶）

`add_image_size()` 是 WordPress 提供的一个函数，用于添加新的图片尺寸，供系统在上传图片时自动生成对应尺寸的副本。

```php
add_image_size( $name, $width = 0, $height = 0, $crop = false );
```

比如，可以模仿微信公众号的封面图片尺寸，来注册个900 x 383的大封面，以及383 x 383的小封面

![image-20251001000852805](https://images.haoyelaiga.com/image-20251001000852805.webp)

下面是推荐的 `add_image_size()` 注册方式来模仿微信公众号的封面图片，附带裁剪逻辑：

```php
// 注册微信公众号风格的大封面图（居中裁剪）
add_image_size( 'wechat-large-cover', 900, 383, true );

// 注册微信公众号风格的小封面图（居中裁剪）
add_image_size( 'wechat-square-cover', 383, 383, true );

```

## “再生缩略图”（Regenerate Thumbnails）

- 新上传的图片将不会生成宽度为 1024 的中间尺寸，large 会使用 768。
- 已存在的图片不会自动改变；若要对历史图片生效，请运行“再生缩略图”（Regenerate Thumbnails）或使用 WP-CLI：
  - 在 WordPress 根目录运行：wp media regenerate --yes
- 如果你更愿意把代码放到主题的 functions.php，也可以，但 mu-plugin 更保险、对主题切换无影响。

## 通过函数调用不同尺寸的图片

`get_the_post_thumbnail()`是WordPress内置的函数，可以方便的获取不同尺寸的特色图片（thumbnail, medium, medium large)。

这是 WordPress 的一个函数，用来获取某篇文章的「特色图片」（Featured Image），并以 `<img>` 标签形式输出。

它不会直接显示图片，而是返回 HTML，你可以用 `echo` 输出它。

基本语法

```php
echo get_the_post_thumbnail( $post_id, $size, $attr );
```

- `$post_id`：文章的 ID。如果不填，默认是当前文章。
- `$size`：图片尺寸，可以是字符串（如 `'thumbnail'`, `'medium'`, `'large'`, `'full'`），也可以是数组（如 `[100, 100]`）。
- `$attr`：HTML 属性数组，比如 `class`, `alt`, `title` 等。

例如自定义一个文章列表，显示最近10篇文章，左侧是文章特色图片的缩略图，指定调取150 x 150那个小图。

```php+HTML
<div class="recent-posts-list" style="max-width:600px;margin:0 auto;">
    <?php
    $recent_posts = get_posts([
        'numberposts' => 5,
        'post_status' => 'publish',
    ]);
    foreach ($recent_posts as $post) :
        setup_postdata($post);
        // 使用 get_the_post_thumbnail 输出更语义化的 img 标记和 srcset 支持
        $has_thumb = has_post_thumbnail($post->ID);
    ?>
    <div class="recent-post-item">
        <a class="recent-post-link" href="<?php the_permalink(); ?>">
            <div class="thumb-wrap">
                <?php if ($has_thumb): ?>
                    <?php echo get_the_post_thumbnail($post->ID, 'thumbnail', ['class' => 'recent-thumb', 'alt' => get_the_title($post->ID)]); ?>
                <?php else: ?>
                    <div class="no-thumb">无</div>
                <?php endif; ?>
            </div>
            <div class="post-title">
                <?php the_title(); ?>
            </div>
        </a>
    </div>
    <?php
    endforeach;
    wp_reset_postdata();
    ?>
</div>	
```

这段 PHP 代码是一个 WordPress 模板片段，用于显示最近的 5 篇已发布文章的列表，每篇文章会显示缩略图（如果有）、标题，并链接到对应的文章页面。

1. 检查当前文章是否有缩略图。

```php
<?php
$has_thumb = has_post_thumbnail($post->ID);
```

2. 如果有缩略图，使用 `get_the_post_thumbnail` 输出"thumbnail"小图（150*150的那张图）。带有 `class` 和 `alt` 属性的 `<img>` 标签。如果没有缩略图，显示“无”。

```php+HTML
<?php if ($has_thumb): ?>
    <?php echo get_the_post_thumbnail($post->ID, 'thumbnail', ['class' => 'recent-thumb', 'alt' => get_the_title($post->ID)]); ?>
<?php else: ?>
    <div class="no-thumb">无</div>
<?php endif; ?>
```



