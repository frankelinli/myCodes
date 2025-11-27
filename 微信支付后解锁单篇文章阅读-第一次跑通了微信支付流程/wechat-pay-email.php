<?php
/**
 * wechat-pay-email.php
 * 将发送邮件的功能抽离到单独文件，供异步任务调用
 */

if (!defined('ABSPATH')) {
    exit;
}

function send_payment_notification_email($order_id, $order_info, $wechat_data) {
    // 管理员邮箱（需要时可改为常量或站点设置）
    $admin_email = 'wingxyq@qq.com';

    // 获取文章信息
    $post = get_post($order_info->post_id);
    $post_title = $post ? $post->post_title : '未知文章';
    $post_url = $post ? get_permalink($post->ID) : '';

    // 获取支付金额（从微信返回数据中获取，单位是分）
    $total_fee = isset($wechat_data['total_fee']) ? ($wechat_data['total_fee'] / 100) : WECHAT_PAY_PRICE;

    // 获取支付用户信息（如果有）
    $openid = isset($wechat_data['openid']) ? $wechat_data['openid'] : '未知用户';

    // 支付时间（微信返回 time_end 格式为 YYYYMMDDhhmmss）
    $pay_time = isset($wechat_data['time_end']) ? $wechat_data['time_end'] : date('YmdHis');
    $pay_time_formatted = date('Y-m-d H:i:s', strtotime($pay_time));

    // 邮件主题
    $subject = '💰 收到新的微信支付 - ' . $total_fee . '元';

    // 邮件内容（HTML格式）
    $message = '
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: "Microsoft YaHei", Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            .header { background: #07c160; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-row { padding: 12px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #666; display: inline-block; width: 120px; }
            .value { color: #333; }
            .highlight { color: #ff6b6b; font-size: 24px; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
            .success { background: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2 style="margin: 0;">✅ 微信支付成功通知</h2>
            </div>
            <div class="content">
                <div class="success">
                    <strong>🎉 支付成功！</strong> 用户已支付 <span class="highlight">' . $total_fee . '元</span>
                </div>
                
                <h3>📋 订单详情</h3>
                <div class="info-row">
                    <span class="label">订单号：</span>
                    <span class="value">' . htmlspecialchars($order_id) . '</span>
                </div>
                <div class="info-row">
                    <span class="label">支付金额：</span>
                    <span class="value" style="color: #ff6b6b; font-weight: bold;">' . $total_fee . ' 元</span>
                </div>
                <div class="info-row">
                    <span class="label">支付时间：</span>
                    <span class="value">' . $pay_time_formatted . '</span>
                </div>
                <div class="info-row">
                    <span class="label">微信 OpenID：</span>
                    <span class="value" style="font-size: 12px;">' . htmlspecialchars($openid) . '</span>
                </div>
                
                <h3>📄 文章信息</h3>
                <div class="info-row">
                    <span class="label">文章标题：</span>
                    <span class="value">' . htmlspecialchars($post_title) . '</span>
                </div>
                <div class="info-row">
                    <span class="label">文章链接：</span>
                    <span class="value"><a href="' . esc_url($post_url) . '" target="_blank">' . esc_url($post_url) . '</a></span>
                </div>
                
                <div class="success" style="margin-top: 30px;">
                    <strong>✅ 已开通该用户的阅读权限</strong><br>
                    <span style="font-size: 14px; color: #666;">用户现在可以查看付费内容（30天有效期）</span>
                </div>
            </div>
            <div class="footer">
                此邮件由 WordPress 微信支付系统自动发送<br>
                ' . get_bloginfo('name') . ' | ' . date('Y-m-d H:i:s') . '
            </div>
        </div>
    </body>
    </html>
    ';

    // 设置邮件头为HTML格式
    $headers = array('Content-Type: text/html; charset=UTF-8');

    // 发送邮件
    $sent = wp_mail($admin_email, $subject, $message, $headers);

    // 记录日志
    $log_file = __DIR__ . '/wechat-pay-debug.log';
    if ($sent) {
        file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] 邮件发送成功到: $admin_email, 订单: $order_id\n", FILE_APPEND);
    } else {
        file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] 邮件发送失败! 订单: $order_id\n", FILE_APPEND);
    }

    return $sent;
}