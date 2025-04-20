<?php
// check_messages.php - 检查是否有新消息

header('Content-Type: application/json');

// 创建日志目录
$log_dir = dirname(__FILE__) . '/wx-logs';
$messages_file = $log_dir . '/recent_messages.json';

// 默认响应
$response = [
    'success' => false,
    'hasNewMessages' => false,
    'messages' => []
];

// 检查文件是否存在
if (file_exists($messages_file)) {
    $json_content = file_get_contents($messages_file);
    
    if (!empty($json_content)) {
        $messages = json_decode($json_content, true);
        
        if (is_array($messages)) {
            // 查找未读消息
            $unread_messages = array_filter($messages, function($msg) {
                return isset($msg['read']) && $msg['read'] === false;
            });
            
            // 如果有未读消息
            if (count($unread_messages) > 0) {
                $response['hasNewMessages'] = true;
                $response['messages'] = array_values($unread_messages);
                
                // 标记所有消息为已读
                foreach ($messages as &$msg) {
                    $msg['read'] = true;
                }
                
                // 保存更新后的消息
                file_put_contents($messages_file, json_encode($messages, JSON_UNESCAPED_UNICODE));
            }
            
            $response['success'] = true;
        }
    } else {
        $response['success'] = true; // 文件存在但为空
    }
}

// 返回JSON响应
echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>