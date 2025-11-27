<?php
/**
 * 微信支付 - 简单实现
 * 单篇文章付费解锁
 */

// ==================================================
// 微信支付配置 - 请填写你的商户信息
// ==================================================

define('WECHAT_PAY_APPID', 'wx77147ed9a1859070'); // 微信APPID（必填！从商户平台"产品中心-开发配置"查看）
define('WECHAT_PAY_MCHID', '1729300754'); // 商户号（必填，10位数字）
define('WECHAT_PAY_KEY', 'Y3aP9sV7TqLb1RmXfE4NwZ6HcKdJ2GtB'); // API密钥（必填，32位）
define('WECHAT_PAY_PRICE', 0.1); // 价格（元）

// 引入邮件发送模块（异步任务中会调用）
if (file_exists(__DIR__ . '/wechat-pay-email.php')) {
    require_once __DIR__ . '/wechat-pay-email.php';
}


/**
 * 短代码：付费内容
 * 用法：[pay_content]这里是付费内容[/pay_content]
 */
function wechat_pay_content_shortcode($atts, $content = null) {
    $post_id = get_the_ID();
    
    // 检查用户是否已支付
    $user_ip = $_SERVER['REMOTE_ADDR'];
    $paid_key = 'paid_' . $post_id . '_' . md5($user_ip);
    
    // 检查cookie
    if (isset($_COOKIE[$paid_key])) {
        // 已支付，显示全文
        return '<div class="paid-content">' . do_shortcode($content) . '</div>';
    }
    
    // 未支付，先生成订单和二维码
    $order_id = 'WX' . date('YmdHis') . rand(1000, 9999);
    $order_result = create_wechat_native_order($order_id, $post_id);
    
    if (!$order_result['success']) {
        // 生成订单失败，显示错误信息
        ob_start();
        ?>
        <div class="wechat-pay-box" style="background: #fef2f2; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0; border: 2px solid #ef4444;">
            <h3 style="margin-top: 0; color: #ef4444;">❌ 支付功能暂时不可用</h3>
            <p style="color: #666;">错误信息：<?php echo esc_html($order_result['message']); ?></p>
            <p style="color: #999; font-size: 14px; margin-top: 15px;">请稍后再试或联系网站管理员</p>
        </div>
        <?php
        return ob_get_clean();
    }
    
    // 生成订单成功，显示支付界面
    ob_start();
    $code_url = $order_result['code_url'];
    
    // 检测是否为移动设备
    $is_mobile = wp_is_mobile();
    $current_url = esc_url(get_permalink());
    ?>
    <div class="wechat-pay-box" style="background: #f9f9f9; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0;">
        <h3 style="margin-top: 0;">🔒 付费内容</h3>
        <p style="color: #666;">支付 <strong style="color: #ff6b6b; font-size: 24px;"><?php echo WECHAT_PAY_PRICE; ?>元</strong> 即可查看完整内容</p>
        
        <?php if ($is_mobile): ?>
            <!-- 移动端：引导在电脑上支付 -->
            <div class="mobile-pay-notice" style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="color: #856404; font-size: 16px; margin: 0 0 15px 0; font-weight: bold;">
                    📱 手机暂不支持直接支付
                </p>
                <p style="color: #856404; font-size: 14px; margin: 10px 0;">
                    请在电脑浏览器中打开本页面，扫码支付
                </p>
                <p style="color: #856404; font-size: 14px; margin: 15px 0 5px 0; font-weight: bold;">
                    💻 复制链接到电脑：
                </p>
                <input type="text" readonly value="<?php echo $current_url; ?>" 
                       id="copy-url-<?php echo $post_id; ?>"
                       style="width: 100%; max-width: 400px; padding: 12px; border: 2px solid #ffc107; border-radius: 6px; font-size: 13px; text-align: center; background: #fff; color: #333; margin: 10px 0;"
                       onclick="this.select();">
                <button onclick="copyToClipboard<?php echo $post_id; ?>()" 
                        style="display: block; width: 100%; max-width: 400px; margin: 10px auto; padding: 12px 20px; background: #ffc107; color: #000; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer;">
                    📋 点击复制链接
                </button>
                <p style="color: #666; font-size: 12px; margin: 10px 0 0 0;">
                    复制后粘贴到电脑浏览器地址栏访问
                </p>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 20px;">
                订单号：<span style="user-select: all;"><?php echo $order_id; ?></span>
            </p>
            
            <script>
            function copyToClipboard<?php echo $post_id; ?>() {
                const input = document.getElementById('copy-url-<?php echo $post_id; ?>');
                input.select();
                input.setSelectionRange(0, 99999); // 移动端兼容
                
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        alert('✅ 链接已复制！\n\n请粘贴到电脑浏览器访问');
                    } else {
                        alert('请手动复制上方链接');
                    }
                } catch (err) {
                    // 使用新的 Clipboard API
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(input.value).then(() => {
                            alert('✅ 链接已复制！\n\n请粘贴到电脑浏览器访问');
                        }).catch(() => {
                            alert('请手动复制上方链接');
                        });
                    } else {
                        alert('请手动复制上方链接');
                    }
                }
            }
            </script>
        <?php else: ?>
            <!-- PC端：显示二维码扫码支付 -->
            <div id="wechat-qrcode-<?php echo $post_id; ?>" style="margin: 20px auto; width: 200px; height: 200px; padding: 10px; border: 1px solid #ddd; background: #fff; display: inline-block;">
                <div style="color: #999; padding: 80px 0;">正在加载二维码...</div>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 15px;">
                <span style="color: #09bb07;">📱</span> 请使用<strong style="color: #09bb07;">微信</strong>扫描二维码完成支付<br>
                支付成功后页面将自动刷新
            </p>
        <?php endif; ?>
        
        <div id="pay-status-<?php echo $post_id; ?>" style="margin-top: 15px;">
            <p style="color: #09bb07;">⏳ 等待支付中...</p>
        </div>
        
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
            订单号：<?php echo $order_id; ?>
        </p>
    </div>
    
    <script>
    (function() {
        const postId = <?php echo $post_id; ?>;
        const orderId = '<?php echo $order_id; ?>';
        const codeUrl = '<?php echo esc_js($code_url); ?>';
        const qrDiv = document.getElementById('wechat-qrcode-' + postId);
        const statusDiv = document.getElementById('pay-status-' + postId);
        const isMobile = <?php echo $is_mobile ? 'true' : 'false'; ?>;
        let payCheckInterval = null;
        
        // 页面加载后立即生成二维码
        if (typeof QRCode !== 'undefined') {
            qrDiv.innerHTML = '';
            
            if (isMobile) {
                // 移动端：生成Canvas二维码，然后转换为图片
                const tempDiv = document.createElement('div');
                const qrcode = new QRCode(tempDiv, {
                    text: codeUrl,
                    width: 280,
                    height: 280,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });
                
                // 等待二维码生成完成，然后转换为图片
                setTimeout(() => {
                    const canvas = tempDiv.querySelector('canvas');
                    if (canvas) {
                        // 将Canvas转换为图片
                        const img = document.createElement('img');
                        img.src = canvas.toDataURL('image/png');
                        img.style.maxWidth = '100%';
                        img.style.height = 'auto';
                        img.style.border = '10px solid #fff';
                        img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        img.style.borderRadius = '8px';
                        img.setAttribute('alt', '微信支付二维码');
                        img.setAttribute('title', '长按识别二维码');
                        
                        // 禁止拖拽
                        img.ondragstart = function() { return false; };
                        
                        // 添加到页面
                        qrDiv.appendChild(img);
                    } else {
                        qrDiv.innerHTML = '<p style="color: #ef4444;">二维码生成失败</p>';
                    }
                }, 200);
            } else {
                // PC端：生成普通二维码
                new QRCode(qrDiv, {
                    text: codeUrl,
                    width: 200,
                    height: 200
                });
            }
            
            // 开始轮询检查支付状态
            checkPaymentStatus();
        } else {
            // 如果QRCode库还没加载，等待加载完成
            window.addEventListener('load', function() {
                setTimeout(function() {
                    if (typeof QRCode !== 'undefined') {
                        qrDiv.innerHTML = '';
                        
                        if (isMobile) {
                            // 移动端：Canvas转图片
                            const tempDiv = document.createElement('div');
                            const qrcode = new QRCode(tempDiv, {
                                text: codeUrl,
                                width: 280,
                                height: 280,
                                colorDark: '#000000',
                                colorLight: '#ffffff',
                                correctLevel: QRCode.CorrectLevel.H
                            });
                            
                            setTimeout(() => {
                                const canvas = tempDiv.querySelector('canvas');
                                if (canvas) {
                                    const img = document.createElement('img');
                                    img.src = canvas.toDataURL('image/png');
                                    img.style.maxWidth = '100%';
                                    img.style.height = 'auto';
                                    img.style.border = '10px solid #fff';
                                    img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                    img.style.borderRadius = '8px';
                                    img.setAttribute('alt', '微信支付二维码');
                                    img.setAttribute('title', '长按识别二维码');
                                    img.ondragstart = function() { return false; };
                                    qrDiv.appendChild(img);
                                } else {
                                    qrDiv.innerHTML = '<p style="color: #ef4444;">二维码生成失败</p>';
                                }
                            }, 200);
                        } else {
                            // PC端：普通二维码
                            new QRCode(qrDiv, {
                                text: codeUrl,
                                width: 200,
                                height: 200
                            });
                        }
                        
                        checkPaymentStatus();
                    } else {
                        qrDiv.innerHTML = '<p style="color: #ef4444; padding: 80px 20px;">二维码加载失败<br>请刷新页面</p>';
                    }
                }, 500);
            });
        }
        
        function checkPaymentStatus() {
            payCheckInterval = setInterval(() => {
                fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: 'action=check_wechat_pay&order_id=' + orderId + '&post_id=' + postId
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.data.paid) {
                        clearInterval(payCheckInterval);
                        statusDiv.innerHTML = '<p style="color: #09bb07; font-size: 16px; font-weight: bold;">✅ 支付成功！页面即将刷新...</p>';
                        setTimeout(() => {
                            location.reload();
                        }, 1000);
                    }
                })
                .catch(error => {
                    console.error('检查支付状态失败:', error);
                });
            }, 2000); // 每2秒检查一次
            
            // 5分钟后停止检查
            setTimeout(() => {
                if (payCheckInterval) {
                    clearInterval(payCheckInterval);
                    statusDiv.innerHTML = '<p style="color: #f59e0b;">⏰ 二维码已过期，请刷新页面重新生成</p>';
                }
            }, 300000);
        }
    })();
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('pay_content', 'wechat_pay_content_shortcode');

/**
 * AJAX: 生成微信支付订单
 */
function ajax_generate_wechat_pay() {
    $post_id = intval($_POST['post_id']);
    
    if (!$post_id) {
        wp_send_json_error('文章ID无效');
    }
    
    // 生成订单号
    $order_id = 'WX' . date('YmdHis') . rand(1000, 9999);
    
    // 调用微信支付API
    $result = create_wechat_native_order($order_id, $post_id);
    
    if ($result['success']) {
        wp_send_json_success($result);
    } else {
        wp_send_json_error($result['message']);
    }
}
add_action('wp_ajax_generate_wechat_pay', 'ajax_generate_wechat_pay');
add_action('wp_ajax_nopriv_generate_wechat_pay', 'ajax_generate_wechat_pay');

/**
 * AJAX: 检查支付状态
 */
function ajax_check_wechat_pay() {
    $order_id = sanitize_text_field($_POST['order_id']);
    $post_id = intval($_POST['post_id']);
    
    if (!$order_id || !$post_id) {
        wp_send_json_error('参数无效');
    }
    
    // 检查订单状态
    $paid = check_order_paid($order_id);
    
    if ($paid) {
        // 设置cookie，有效期7天
        $user_ip = $_SERVER['REMOTE_ADDR'];
        $paid_key = 'paid_' . $post_id . '_' . md5($user_ip);
        setcookie($paid_key, '1', time() + 7 * 24 * 3600, '/');
        
        wp_send_json_success(['paid' => true]);
    } else {
        wp_send_json_success(['paid' => false]);
    }
}
add_action('wp_ajax_check_wechat_pay', 'ajax_check_wechat_pay');
add_action('wp_ajax_nopriv_check_wechat_pay', 'ajax_check_wechat_pay');

/**
 * 创建微信Native支付订单
 */
function create_wechat_native_order($order_id, $post_id) {
    // 检查配置
    if (empty(WECHAT_PAY_MCHID) || empty(WECHAT_PAY_KEY)) {
        return ['success' => false, 'message' => '微信支付未配置'];
    }
    
    $post_title = get_the_title($post_id);
    $price = WECHAT_PAY_PRICE * 100; // 转换为分
    
    // 检查APPID（微信支付API要求必填）
    if (empty(WECHAT_PAY_APPID)) {
        return [
            'success' => false, 
            'message' => '请配置APPID。登录微信支付商户平台，在"产品中心-开发配置"查看关联的APPID，填入 wechat-pay-simple.php 第8行'
        ];
    }
    
    // 请求参数
    $params = [
        'appid' => WECHAT_PAY_APPID,
        'mch_id' => WECHAT_PAY_MCHID,
        'nonce_str' => md5(uniqid()),
        'body' => '文章解锁-' . $post_title,
        'out_trade_no' => $order_id,
        'total_fee' => $price,
        'spbill_create_ip' => $_SERVER['REMOTE_ADDR'],
        'notify_url' => home_url('/wechat-pay-notify'),
        'trade_type' => 'NATIVE',
    ];
    
    // 生成签名
    $params['sign'] = generate_wechat_sign($params);
    
    // 转换为XML
    $xml = array_to_xml($params);
    
    // 发送请求
    $response = wp_remote_post('https://api.mch.weixin.qq.com/pay/unifiedorder', [
        'body' => $xml,
        'timeout' => 10,
        'headers' => ['Content-Type' => 'text/xml']
    ]);
    
    if (is_wp_error($response)) {
        return ['success' => false, 'message' => '请求失败: ' . $response->get_error_message()];
    }
    
    $body = wp_remote_retrieve_body($response);
    $result = xml_to_array($body);
    
    // 记录详细错误信息到日志
    error_log('微信支付响应: ' . print_r($result, true));
    
    if ($result['return_code'] == 'SUCCESS' && $result['result_code'] == 'SUCCESS') {
        // 保存订单信息
        save_order($order_id, $post_id, $result['code_url']);
        
        return [
            'success' => true,
            'order_id' => $order_id,
            'code_url' => $result['code_url']
        ];
    } else {
        // 详细的错误信息
        $error_msg = '创建订单失败';
        
        if (isset($result['return_msg'])) {
            $error_msg .= ' - ' . $result['return_msg'];
        }
        
        if (isset($result['err_code'])) {
            $error_msg .= ' [' . $result['err_code'] . ']';
        }
        
        if (isset($result['err_code_des'])) {
            $error_msg .= ': ' . $result['err_code_des'];
        }
        
        // 记录到日志
        error_log('微信支付创建订单失败: ' . $error_msg);
        
        return ['success' => false, 'message' => $error_msg];
    }
}

/**
 * 生成微信签名
 */
function generate_wechat_sign($params) {
    ksort($params);
    $string = '';
    foreach ($params as $key => $value) {
        if ($value !== '' && $key != 'sign') {
            $string .= $key . '=' . $value . '&';
        }
    }
    $string .= 'key=' . WECHAT_PAY_KEY;
    return strtoupper(md5($string));
}

/**
 * 数组转XML
 */
function array_to_xml($array) {
    $xml = '<xml>';
    foreach ($array as $key => $value) {
        $xml .= '<' . $key . '><![CDATA[' . $value . ']]></' . $key . '>';
    }
    $xml .= '</xml>';
    return $xml;
}

/**
 * XML转数组
 */
function xml_to_array($xml) {
    libxml_disable_entity_loader(true);
    $result = simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOCDATA);
    return json_decode(json_encode($result), true);
}

/**
 * 保存订单
 */
function save_order($order_id, $post_id, $code_url) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'wechat_pay_orders';
    
    // 创建表（如果不存在）
    $charset_collate = $wpdb->get_charset_collate();
    $sql = "CREATE TABLE IF NOT EXISTS $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        order_id varchar(50) NOT NULL,
        post_id bigint(20) NOT NULL,
        code_url text,
        status varchar(20) DEFAULT 'pending',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        paid_at datetime DEFAULT NULL,
        PRIMARY KEY (id),
        KEY order_id (order_id)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
    
    // 插入订单
    $wpdb->insert($table_name, [
        'order_id' => $order_id,
        'post_id' => $post_id,
        'code_url' => $code_url,
        'status' => 'pending'
    ]);
}

/**
 * 检查订单是否已支付
 */
function check_order_paid($order_id) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'wechat_pay_orders';
    
    $order = $wpdb->get_row($wpdb->prepare(
        "SELECT status FROM $table_name WHERE order_id = %s",
        $order_id
    ));
    
    return $order && $order->status == 'paid';
}

/**
 * 微信支付回调
 */
function wechat_pay_notify_handler() {
    // 调试日志文件路径
    $log_file = __DIR__ . '/wechat-pay-debug.log';
    
    $xml = file_get_contents('php://input');
    
    // 记录接收到的原始数据
    file_put_contents($log_file, "\n\n=== " . date('Y-m-d H:i:s') . " ===\n", FILE_APPEND);
    file_put_contents($log_file, "接收到的原始XML:\n" . $xml . "\n", FILE_APPEND);
    
    // 如果没有POST数据（比如GET访问或测试访问），返回提示信息
    if (empty($xml)) {
        file_put_contents($log_file, "错误：没有POST数据\n", FILE_APPEND);
        header('Content-Type: text/plain; charset=utf-8');
        echo "微信支付回调接口\n";
        echo "此接口仅接受微信服务器的POST通知\n";
        echo "当前时间：" . date('Y-m-d H:i:s');
        exit;
    }
    
    $data = xml_to_array($xml);
    file_put_contents($log_file, "解析后的数据:\n" . print_r($data, true) . "\n", FILE_APPEND);
    
    // 验证数据是否有效
    if (!is_array($data) || empty($data)) {
        file_put_contents($log_file, "错误：数据格式错误\n", FILE_APPEND);
        header('Content-Type: text/xml');
        echo '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[数据格式错误]]></return_msg></xml>';
        exit;
    }
    
    // 验证签名
    if (!isset($data['sign'])) {
        file_put_contents($log_file, "错误：缺少签名\n", FILE_APPEND);
        header('Content-Type: text/xml');
        echo '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[缺少签名]]></return_msg></xml>';
        exit;
    }
    
    $sign = $data['sign'];
    unset($data['sign']);
    $check_sign = generate_wechat_sign($data);
    
    file_put_contents($log_file, "微信签名: " . $sign . "\n", FILE_APPEND);
    file_put_contents($log_file, "本地计算签名: " . $check_sign . "\n", FILE_APPEND);
    
    if ($sign !== $check_sign) {
        file_put_contents($log_file, "错误：签名验证失败\n", FILE_APPEND);
        header('Content-Type: text/xml');
        echo '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[签名错误]]></return_msg></xml>';
        exit;
    }
    
    file_put_contents($log_file, "签名验证成功\n", FILE_APPEND);
    
    if (isset($data['return_code']) && $data['return_code'] == 'SUCCESS' && isset($data['result_code']) && $data['result_code'] == 'SUCCESS') {
        $order_id = $data['out_trade_no'];
        file_put_contents($log_file, "订单号: " . $order_id . "\n", FILE_APPEND);
        
        // 更新订单状态
        global $wpdb;
        $table_name = $wpdb->prefix . 'wechat_pay_orders';
        $result = $wpdb->update(
            $table_name,
            ['status' => 'paid', 'paid_at' => current_time('mysql')],
            ['order_id' => $order_id]
        );
        
        file_put_contents($log_file, "数据库更新结果: " . ($result !== false ? "成功 (影响行数: $result)" : "失败") . "\n", FILE_APPEND);
        if ($result === false) {
            file_put_contents($log_file, "数据库错误: " . $wpdb->last_error . "\n", FILE_APPEND);
        }
        
        // 获取订单详细信息用于发送邮件
        $order_info = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE order_id = %s",
            $order_id
        ));
        
        // 将回调数据缓存供异步任务使用，并调度异步任务来发送邮件等耗时操作
        if ($order_info && $result !== false) {
            // 缓存回调数据（最多缓存1小时）
            set_transient('wechat_notify_' . $order_id, $data, HOUR_IN_SECONDS);

            // 调度一次性异步任务（1秒后执行）
            if (!wp_next_scheduled('wechat_pay_async_process', array($order_id))) {
                wp_schedule_single_event(time() + 1, 'wechat_pay_async_process', array($order_id));
                file_put_contents($log_file, "已调度异步任务: wechat_pay_async_process for {$order_id}\n", FILE_APPEND);
            } else {
                file_put_contents($log_file, "异步任务已存在，无需重复调度: {$order_id}\n", FILE_APPEND);
            }
        }
        
        // 返回成功给微信
        header('Content-Type: text/xml');
        echo '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>';
        file_put_contents($log_file, "已返回SUCCESS给微信\n", FILE_APPEND);
    } else {
        file_put_contents($log_file, "错误：return_code或result_code不是SUCCESS\n", FILE_APPEND);
        header('Content-Type: text/xml');
        echo '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[FAIL]]></return_msg></xml>';
        exit;
    }
    exit;
}
add_action('wp_ajax_wechat_pay_notify', 'wechat_pay_notify_handler');
add_action('wp_ajax_nopriv_wechat_pay_notify', 'wechat_pay_notify_handler');

/**
 * 加载QRCode.js库
 */
function enqueue_qrcode_script() {
    if (is_single()) {
        wp_enqueue_script('qrcode', 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js', [], '1.0.0', true);
    }
}
add_action('wp_enqueue_scripts', 'enqueue_qrcode_script');

// 异步任务处理：调用独立的邮件函数（和其它耗时操作）
add_action('wechat_pay_async_process', 'wechat_pay_async_process_handler', 10, 1);
function wechat_pay_async_process_handler($order_id) {
    global $wpdb;
    $log_file = __DIR__ . '/wechat-pay-debug.log';
    $table_name = $wpdb->prefix . 'wechat_pay_orders';

    // 恢复回调数据
    $data = get_transient('wechat_notify_' . $order_id);
    if (!$data) {
        file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] 异步任务：未找到 transient 数据 for $order_id\n", FILE_APPEND);
        return;
    }

    // 获取最新订单信息（以数据库为准）
    $order_info = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM $table_name WHERE order_id = %s",
        $order_id
    ));

    if (!$order_info) {
        file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] 异步任务：未找到订单 $order_id\n", FILE_APPEND);
        delete_transient('wechat_notify_' . $order_id);
        return;
    }

    // 调用独立文件中的邮件发送函数（耗时）——已异步执行
    try {
        $sent = send_payment_notification_email($order_id, $order_info, $data);
        file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] 异步任务：邮件发送结果: " . ($sent ? '成功' : '失败') . "\n", FILE_APPEND);
    } catch (Exception $e) {
        file_put_contents($log_file, "[" . date('Y-m-d H:i:s') . "] 异步任务邮件异常: " . $e->getMessage() . "\n", FILE_APPEND);
    }

    // 这里可继续添加其他耗时处理（LearnDash 同步等）

    // 清理缓存
    delete_transient('wechat_notify_' . $order_id);
}

// 为无法填写 query string 的商户平台提供一个不带 ? 的回调入口：/wechat-pay-notify
// 该入口会内部转发到 admin-ajax.php?action=wechat_pay_notify
add_action('init', 'wechat_pay_add_rewrite_rule');
function wechat_pay_add_rewrite_rule() {
    // 添加查询变量和重写规则
    add_rewrite_tag('%wechat_pay_notify%', '([0-9]+)');
    add_rewrite_rule('^wechat-pay-notify/?$', 'index.php?wechat_pay_notify=1', 'top');

    // 仅在后台首次注册时刷新重写规则，避免每次请求都 flush
    if (is_admin() && get_option('wechat_pay_rewrite_flushed') !== '1') {
        flush_rewrite_rules();
        update_option('wechat_pay_rewrite_flushed', '1');
    }
}

add_action('template_redirect', 'wechat_pay_template_redirect');
function wechat_pay_template_redirect() {
    if (get_query_var('wechat_pay_notify') == '1') {
        // 直接调用处理函数并退出（保持与 admin-ajax 行为一致）
        wechat_pay_notify_handler();
        exit;
    }
}
