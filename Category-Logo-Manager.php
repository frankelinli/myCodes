<?php
/**
 * Category_Logo_Manager
 * 
 * 这是一个用于 WordPress 分类（Category）Logo 管理的插件类。
 * 
 * 功能说明：
 * 1. 在后台分类编辑页面添加 Logo 上传/选择功能，支持使用媒体库选择图片。
 * 2. 支持保存每个分类的 Logo 图片（图片 ID 存储在 term meta）。
 * 3. 提供前台调用方法：
 *    - get_category_logo_url($term_id)：获取分类 Logo 图片的 URL。
 *    - display_category_logo($term_id, $style)：直接输出带样式的 img 标签。
 * 4. 通过 new Category_Logo_Manager() 自动初始化，无需手动调用。
 * 
 * 用法示例（在主题模板中显示分类 Logo）：
 * <?php
 * if (class_exists('Category_Logo_Manager')) {
 *     Category_Logo_Manager::display_category_logo();
 * }
 * ?>
 */

class Category_Logo_Manager {
    public function __construct() {
        add_action('category_edit_form_fields', [$this, 'render_logo_field'], 10, 2);
        add_action('edited_category', [$this, 'save_logo_field'], 10, 2);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_media_script']);
    }

    public function enqueue_media_script() {
        if (is_admin()) {
            wp_enqueue_media();
        }
    }

    public function render_logo_field($term) {
        $image_id = get_term_meta($term->term_id, 'category_logo_id', true);
        $image_url = $image_id ? wp_get_attachment_url($image_id) : '';

        ?>
        <tr class="form-field">
            <th scope="row"><label for="category_logo_id">分类 Logo</label></th>
            <td>
                <input type="hidden" name="category_logo_id" id="category_logo_id" value="<?php echo esc_attr($image_id); ?>">
                <div id="category-logo-preview">
                    <?php if ($image_url): ?>
                        <img src="<?php echo esc_url($image_url); ?>" style="max-height: 80px;">
                    <?php endif; ?>
                </div>
                <button class="upload-logo-button button">上传/选择图片</button>
                <script>
                jQuery(document).ready(function($){
                    var frame;
                    $('.upload-logo-button').on('click', function(e){
                        e.preventDefault();
                        if (frame) {
                            frame.open();
                            return;
                        }
                        frame = wp.media({
                            title: '选择分类 Logo',
                            button: { text: '使用这张图片' },
                            multiple: false
                        });
                        frame.on('select', function() {
                            var attachment = frame.state().get('selection').first().toJSON();
                            $('#category_logo_id').val(attachment.id);
                            $('#category-logo-preview').html('<img src="'+attachment.url+'" style="max-height:80px;">');
                        });
                        frame.open();
                    });
                });
                </script>
            </td>
        </tr>
        <?php
    }

    public function save_logo_field($term_id) {
        if (isset($_POST['category_logo_id'])) {
            update_term_meta($term_id, 'category_logo_id', intval($_POST['category_logo_id']));
        }
    }

    // 前台调用方法：获取 logo URL
    public static function get_category_logo_url($term_id = null) {
        if (!$term_id) {
            $term_id = get_queried_object_id();
        }
        $logo_id = get_term_meta($term_id, 'category_logo_id', true);
        return $logo_id ? wp_get_attachment_url($logo_id) : false;
    }

    // 前台调用方法：直接输出 img 标签
    public static function display_category_logo($term_id = null, $style = 'max-height:80px;') {
        $logo_url = self::get_category_logo_url($term_id);
        if ($logo_url) {
            echo '<img src="' . esc_url($logo_url) . '" alt="分类 Logo" style="' . esc_attr($style) . '">';
        }
    }
}

// 初始化类
new Category_Logo_Manager();
