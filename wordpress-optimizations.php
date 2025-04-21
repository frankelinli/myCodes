<?php 
// WordPress优化程序集中在此处
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

//防止网页被iframe调用
header('X-Frame-Options:Deny');

//彻底屏蔽 XML-RPC，防止 xmlrpc.php 被扫描，也不需要用客户端发文章
// add_filter('xmlrpc_enabled','__return_false');
// add_filter('xmlrpc_methods', '__return_empty_array');

//禁用RSS
function itsme_disable_feed() {
wp_die( __( 'No feed available, please visit the <a href="'. esc_url( home_url( '/' ) ) .'">homepage</a>!' ) );
}
add_action('do_feed', 'itsme_disable_feed', 1);
add_action('do_feed_rdf', 'itsme_disable_feed', 1);
add_action('do_feed_rss', 'itsme_disable_feed', 1);
add_action('do_feed_rss2', 'itsme_disable_feed', 1);
add_action('do_feed_atom', 'itsme_disable_feed', 1);
add_action('do_feed_rss2_comments', 'itsme_disable_feed', 1);
add_action('do_feed_atom_comments', 'itsme_disable_feed', 1);

//禁止<head>输出RSS链接
remove_action( 'wp_head', 'feed_links_extra', 3 );
remove_action( 'wp_head', 'feed_links', 2 );

// 移除头部 wp-json 标签和 HTTP header 中的 link
// remove_action('wp_head','rest_output_link_wp_head',10);
// remove_action('template_redirect','rest_output_link_header',11);

//限制文章修改历史次数
function limit_post_revisions($num, $post) {
    return 3; // 设置为你想要的修订版本数量
}
add_filter('wp_revisions_to_keep', 'limit_post_revisions', 10, 2);


//禁用CORS跨域资源
function disable_cors() {
    header_remove('Access-Control-Allow-Origin');
}
add_action('init', 'disable_cors');

//禁止后台加载Google字体

//我们只是个简简单单的网站，不需要那么多冗余
remove_action('template_redirect','wp_shortlink_header',11,0);//移除短链接头部

remove_action('wp_head','wp_generator');//移除WordPress版本号

remove_action('wp_head','rsd_link'); //移除Really Simple Discovery链接
remove_action('wp_head','wp_resource_hints',2);
remove_action('wp_head','wp_shortlink_wp_head',10,0);
remove_action('rest_api_init','wp_oembed_register_route');
remove_filter('rest_pre_serve_request','_oembed_rest_pre_serve_request',10,4);
remove_filter('oembed_dataparse','wp_filter_oembed_result',10);
remove_filter('oembed_response_data','get_oembed_response_data_rich',10,4);

//禁止Embed，防止被他人嵌入文章
remove_action('wp_head','wp_oembed_add_discovery_links');
remove_action('wp_head','wp_oembed_add_host_js');