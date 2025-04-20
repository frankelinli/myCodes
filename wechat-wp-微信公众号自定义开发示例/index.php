<?php
// index.php - 微信公众号自动回复

// 设置响应头
http_response_code(200);
header('Content-Type: text/xml; charset=utf-8');

// 微信Token
$token = 'haoyecsr'; // 确保与微信公众平台配置一致

// 创建日志目录
$log_dir = dirname(__FILE__) . '/wx-logs';
if (!file_exists($log_dir)) {
    mkdir($log_dir, 0755, true);
}

// 记录请求
$raw_post = file_get_contents('php://input');
if (!empty($raw_post)) {
    $log = date('Y-m-d H:i:s') . " - 收到请求:\n" . $raw_post . "\n";
    file_put_contents($log_dir . '/messages.log', $log, FILE_APPEND);
}

// 保存新消息到JSON文件
function save_message($from_user, $content, $msg_type) {
    global $log_dir;
    
    $messages_file = $log_dir . '/recent_messages.json';
    
    // 读取现有消息
    $messages = [];
    if (file_exists($messages_file)) {
        $json_content = file_get_contents($messages_file);
        if (!empty($json_content)) {
            $messages = json_decode($json_content, true) ?: [];
        }
    }
    
    // 添加新消息
    $messages[] = [
        'from_user' => $from_user,
        'content' => $content,
        'type' => $msg_type,
        'time' => date('Y-m-d H:i:s'),
        'read' => false
    ];
    
    // 只保留最近50条消息
    if (count($messages) > 50) {
        $messages = array_slice($messages, -50);
    }
    
    // 保存到文件
    file_put_contents($messages_file, json_encode($messages, JSON_UNESCAPED_UNICODE));
}

// 处理GET请求（微信验证）
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $signature = isset($_GET['signature']) ? $_GET['signature'] : '';
    $timestamp = isset($_GET['timestamp']) ? $_GET['timestamp'] : '';
    $nonce = isset($_GET['nonce']) ? $_GET['nonce'] : '';
    $echostr = isset($_GET['echostr']) ? $_GET['echostr'] : '';
    
    // 签名计算
    $tmpArr = array($token, $timestamp, $nonce);
    sort($tmpArr, SORT_STRING);
    $tmpStr = implode($tmpArr);
    $tmpStr = sha1($tmpStr);
    
    // 验证并返回
    if ($tmpStr == $signature) {
        echo $echostr;
    } else {
        echo "签名验证失败";
    }
    exit;
}

// 处理POST请求（接收消息）
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // 解析XML消息
    $xml = simplexml_load_string($raw_post, 'SimpleXMLElement', LIBXML_NOCDATA);
    
    // 提取消息基本信息
    $from_user = isset($xml->FromUserName) ? (string)$xml->FromUserName : '';
    $to_user = isset($xml->ToUserName) ? (string)$xml->ToUserName : '';
    $msg_type = isset($xml->MsgType) ? (string)$xml->MsgType : '';
    $create_time = time();
    
    // 事件消息处理
    if ($msg_type == 'event') {
        $event = isset($xml->Event) ? (string)$xml->Event : '';
        
        // 处理关注事件 - 回复文字
        if ($event == 'subscribe') {
            $reply_content = "感谢关注！本号持续关注可持续发展、CSR企业社会责任验厂、ESG行业。点击菜单「加群」可扫描二维码，邀请您加入验厂技术交流群。";
            
            // 保存新用户关注事件
            save_message($from_user, "新用户关注", 'event_subscribe');
            
            $reply = "<xml>
                      <ToUserName><![CDATA[{$from_user}]]></ToUserName>
                      <FromUserName><![CDATA[{$to_user}]]></FromUserName>
                      <CreateTime>{$create_time}</CreateTime>
                      <MsgType><![CDATA[text]]></MsgType>
                      <Content><![CDATA[{$reply_content}]]></Content>
                      </xml>";
            
            // 记录日志
            $log = date('Y-m-d H:i:s') . " - 新用户关注，发送欢迎消息\n";
            file_put_contents($log_dir . '/subscribe.log', $log, FILE_APPEND);
            
            echo $reply;
            exit;
        } else if ($event == 'CLICK') {
            $event_key = isset($xml->EventKey) ? (string)$xml->EventKey : '';
            
            // 保存菜单点击事件
            save_message($from_user, "用户点击菜单: " . $event_key, 'event_click');
        }
    }
    
    // 处理文本消息
    if ($msg_type == 'text') {
        $content = isset($xml->Content) ? (string)$xml->Content : '';
        
        // 保存文本消息
        save_message($from_user, $content, 'text');
        
        // 简单自动回复
        $reply_content = "感谢您的留言！我们已收到您的消息。";
        
        // 构建文本回复
        $reply = "<xml>
                  <ToUserName><![CDATA[{$from_user}]]></ToUserName>
                  <FromUserName><![CDATA[{$to_user}]]></FromUserName>
                  <CreateTime>{$create_time}</CreateTime>
                  <MsgType><![CDATA[text]]></MsgType>
                  <Content><![CDATA[{$reply_content}]]></Content>
                  </xml>";
        
        echo $reply;
        exit;
    }
    
    // 其他消息类型
    if ($msg_type == 'image') {
        save_message($from_user, "发送了一张图片", 'image');
    } else if ($msg_type == 'voice') {
        save_message($from_user, "发送了一段语音", 'voice');
    } else if ($msg_type == 'video') {
        save_message($from_user, "发送了一段视频", 'video');
    } else if ($msg_type == 'location') {
        save_message($from_user, "分享了位置信息", 'location');
    } else {
        save_message($from_user, "发送了其他类型消息", $msg_type);
    }
    
    // 其他消息类型的默认回复
    $reply_content = "感谢您的留言，已收到。";
    $reply = "<xml>
              <ToUserName><![CDATA[{$from_user}]]></ToUserName>
              <FromUserName><![CDATA[{$to_user}]]></FromUserName>
              <CreateTime>{$create_time}</CreateTime>
              <MsgType><![CDATA[text]]></MsgType>
              <Content><![CDATA[{$reply_content}]]></Content>
              </xml>";
    
    echo $reply;
    exit;
}
?>