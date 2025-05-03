<?php
/**
 * WordPress系统信息页面
 * 
 * 显示WordPress、PHP、MySQL和服务器的全部配置信息
 */

// 加载WordPress环境
require_once('wp-load.php');

// 只允许管理员访问此页面
if (!current_user_can('manage_options')) {
    wp_die('抱歉，您没有权限访问此页面。');
}

// 获取WordPress版本信息
global $wp_version;

// 获取数据库信息
global $wpdb;

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WordPress系统信息</title>
    <?php wp_head(); ?>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .info-container {
            margin-bottom: 30px;
        }
        h1 {
            color: #0073aa;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        h2 {
            color: #23282d;
            margin-top: 30px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 20px;
        }
        th, td {
            text-align: left;
            padding: 8px;
            border: 1px solid #ddd;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .success {
            color: green;
        }
        .warning {
            color: orange;
        }
        .error {
            color: red;
        }
        .back-to-site {
            margin-top: 20px;
            display: inline-block;
            padding: 10px 15px;
            background-color: #0073aa;
            color: white;
            text-decoration: none;
            border-radius: 3px;
        }
        .back-to-site:hover {
            background-color: #005177;
        }
        .section-nav {
            background: #f5f5f5;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 3px;
        }
        .section-nav a {
            margin-right: 15px;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="info-container">
        <h1>WordPress系统信息</h1>
        
        <div class="section-nav">
            <a href="#wordpress">WordPress信息</a>
            <a href="#php">PHP信息</a>
            <a href="#mysql">MySQL信息</a>
            <a href="#server">服务器信息</a>
            <a href="#plugins">已激活插件</a>
            <a href="#theme">当前主题</a>
        </div>
        
        <h2 id="wordpress">WordPress信息</h2>
        <table>
            <tr>
                <th>参数</th>
                <th>值</th>
            </tr>
            <tr>
                <td>WordPress版本</td>
                <td><?php echo esc_html($wp_version); ?></td>
            </tr>
            <tr>
                <td>站点URL</td>
                <td><?php echo esc_url(get_site_url()); ?></td>
            </tr>
            <tr>
                <td>Home URL</td>
                <td><?php echo esc_url(get_home_url()); ?></td>
            </tr>
            <tr>
                <td>多站点启用</td>
                <td><?php echo is_multisite() ? '是' : '否'; ?></td>
            </tr>
            <tr>
                <td>调试模式</td>
                <td><?php echo defined('WP_DEBUG') && WP_DEBUG ? '开启' : '关闭'; ?></td>
            </tr>
            <tr>
                <td>内存限制</td>
                <td><?php echo defined('WP_MEMORY_LIMIT') ? WP_MEMORY_LIMIT : '未设置'; ?></td>
            </tr>
            <tr>
                <td>安装目录</td>
                <td><?php echo esc_html(ABSPATH); ?></td>
            </tr>
            <tr>
                <td>内容目录</td>
                <td><?php echo esc_html(WP_CONTENT_DIR); ?></td>
            </tr>
            <tr>
                <td>上传目录</td>
                <td><?php 
                    $upload_dir = wp_upload_dir();
                    echo esc_html($upload_dir['basedir']); 
                ?></td>
            </tr>
            <tr>
                <td>文章修订版本</td>
                <td><?php echo defined('WP_POST_REVISIONS') ? (WP_POST_REVISIONS === true ? '无限' : WP_POST_REVISIONS) : '默认'; ?></td>
            </tr>
        </table>
        
        <h2 id="php">PHP信息</h2>
        <table>
            <tr>
                <th>参数</th>
                <th>值</th>
            </tr>
            <tr>
                <td>PHP版本</td>
                <td><?php echo esc_html(phpversion()); ?></td>
            </tr>
            <tr>
                <td>PHP SAPI</td>
                <td><?php echo esc_html(php_sapi_name()); ?></td>
            </tr>
            <tr>
                <td>显示错误</td>
                <td><?php echo ini_get('display_errors') ? '开启' : '关闭'; ?></td>
            </tr>
            <tr>
                <td>内存限制</td>
                <td><?php echo esc_html(ini_get('memory_limit')); ?></td>
            </tr>
            <tr>
                <td>最大执行时间</td>
                <td><?php echo esc_html(ini_get('max_execution_time')); ?> 秒</td>
            </tr>
            <tr>
                <td>上传文件最大大小</td>
                <td><?php echo esc_html(ini_get('upload_max_filesize')); ?></td>
            </tr>
            <tr>
                <td>POST数据最大大小</td>
                <td><?php echo esc_html(ini_get('post_max_size')); ?></td>
            </tr>
            <tr>
                <td>PHP配置文件位置</td>
                <td><?php echo esc_html(php_ini_loaded_file()); ?></td>
            </tr>
            <tr>
                <td>mysqli扩展</td>
                <td><?php echo extension_loaded('mysqli') ? '<span class="success">已启用</span>' : '<span class="error">未启用</span>'; ?></td>
            </tr>
            <tr>
                <td>curl扩展</td>
                <td><?php echo extension_loaded('curl') ? '<span class="success">已启用</span>' : '<span class="warning">未启用</span>'; ?></td>
            </tr>
            <tr>
                <td>gd扩展</td>
                <td><?php echo extension_loaded('gd') ? '<span class="success">已启用</span>' : '<span class="warning">未启用</span>'; ?></td>
            </tr>
            <tr>
                <td>已加载扩展</td>
                <td><?php echo implode(', ', get_loaded_extensions()); ?></td>
            </tr>
        </table>
        
        <h2 id="mysql">MySQL/数据库信息</h2>
        <table>
            <tr>
                <th>参数</th>
                <th>值</th>
            </tr>
            <tr>
                <td>MySQL客户端版本</td>
                <td><?php echo function_exists('mysqli_get_client_info') ? esc_html(mysqli_get_client_info()) : '未知'; ?></td>
            </tr>
            <tr>
                <td>MySQL服务器版本</td>
                <td><?php echo esc_html($wpdb->get_var('SELECT VERSION()')); ?></td>
            </tr>
            <tr>
                <td>数据库名称</td>
                <td><?php echo esc_html(DB_NAME); ?></td>
            </tr>
            <tr>
                <td>数据库字符集</td>
                <td><?php echo esc_html($wpdb->charset); ?></td>
            </tr>
            <tr>
                <td>表前缀</td>
                <td><?php echo esc_html($wpdb->prefix); ?></td>
            </tr>
            <tr>
                <td>数据库主机</td>
                <td><?php echo esc_html(DB_HOST); ?></td>
            </tr>
            <tr>
                <td>数据库表数量</td>
                <td><?php 
                    $tables_count = $wpdb->get_var("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '" . DB_NAME . "'");
                    echo esc_html($tables_count); 
                ?></td>
            </tr>
            <tr>
                <td>数据库大小</td>
                <td><?php
                    $db_size = $wpdb->get_var("SELECT SUM(data_length + index_length) 
                                               FROM information_schema.TABLES 
                                               WHERE table_schema = '" . DB_NAME . "'");
                    echo esc_html(size_format($db_size));
                ?></td>
            </tr>
        </table>
        
        <h2 id="server">服务器信息</h2>
        <table>
            <tr>
                <th>参数</th>
                <th>值</th>
            </tr>
            <tr>
                <td>服务器软件</td>
                <td><?php echo esc_html($_SERVER['SERVER_SOFTWARE']); ?></td>
            </tr>
            <tr>
                <td>操作系统</td>
                <td><?php echo esc_html(PHP_OS); ?></td>
            </tr>
            <tr>
                <td>服务器IP</td>
                <td><?php echo esc_html($_SERVER['SERVER_ADDR'] ?? '未知'); ?></td>
            </tr>
            <tr>
                <td>服务器主机名</td>
                <td><?php echo esc_html(gethostname()); ?></td>
            </tr>
            <tr>
                <td>服务器协议</td>
                <td><?php echo esc_html($_SERVER['SERVER_PROTOCOL']); ?></td>
            </tr>
            <tr>
                <td>服务器端口</td>
                <td><?php echo esc_html($_SERVER['SERVER_PORT']); ?></td>
            </tr>
            <tr>
                <td>当前时间</td>
                <td><?php echo esc_html(current_time('Y-m-d H:i:s')); ?></td>
            </tr>
            <tr>
                <td>服务器时区</td>
                <td><?php echo esc_html(date_default_timezone_get()); ?></td>
            </tr>
            <tr>
                <td>WordPress时区</td>
                <td><?php echo esc_html(get_option('timezone_string') ?: 'UTC' . get_option('gmt_offset')); ?></td>
            </tr>
        </table>
        
        <h2 id="plugins">已激活插件</h2>
        <table>
            <tr>
                <th>插件名称</th>
                <th>版本</th>
                <th>作者</th>
            </tr>
            <?php
            $active_plugins = get_option('active_plugins');
            if (!empty($active_plugins)) {
                foreach ($active_plugins as $plugin) {
                    $plugin_data = get_plugin_data(WP_PLUGIN_DIR . '/' . $plugin);
                    if (!empty($plugin_data['Name'])) {
                        echo '<tr>';
                        echo '<td>' . esc_html($plugin_data['Name']) . '</td>';
                        echo '<td>' . esc_html($plugin_data['Version']) . '</td>';
                        echo '<td>' . wp_kses_post($plugin_data['AuthorName']) . '</td>';
                        echo '</tr>';
                    }
                }
            } else {
                echo '<tr><td colspan="3">没有已激活的插件</td></tr>';
            }
            ?>
        </table>
        
        <h2 id="theme">当前主题</h2>
        <?php
        $theme = wp_get_theme();
        ?>
        <table>
            <tr>
                <th>参数</th>
                <th>值</th>
            </tr>
            <tr>
                <td>主题名称</td>
                <td><?php echo esc_html($theme->get('Name')); ?></td>
            </tr>
            <tr>
                <td>主题版本</td>
                <td><?php echo esc_html($theme->get('Version')); ?></td>
            </tr>
            <tr>
                <td>主题作者</td>
                <td><?php echo wp_kses_post($theme->get('Author')); ?></td>
            </tr>
            <tr>
                <td>主题目录</td>
                <td><?php echo esc_html(get_template_directory()); ?></td>
            </tr>
            <tr>
                <td>是否为子主题</td>
                <td><?php echo is_child_theme() ? '是' : '否'; ?></td>
            </tr>
            <?php if (is_child_theme()): ?>
            <tr>
                <td>父主题名称</td>
                <td><?php 
                    $parent_theme = wp_get_theme(get_template());
                    echo esc_html($parent_theme->get('Name')); 
                ?></td>
            </tr>
            <?php endif; ?>
        </table>
        
        <p>
            <a href="<?php echo esc_url(home_url()); ?>" class="back-to-site">返回网站首页</a>
        </p>
    </div>
    <?php wp_footer(); ?>
</body>
</html>