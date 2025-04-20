<?php
// wx-menu.php - 创建微信公众号菜单

// 微信公众号配置
$appid = 'wxe251d4f5425fff4d'; // 替换为您的公众号appid
$appsecret = '833746a8db4e321ffceeba2d7f05d73e'; // 替换为您的公众号appsecret

// 获取 access_token
function get_access_token($appid, $appsecret) {
    $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={$appid}&secret={$appsecret}";
    $response = file_get_contents($url);
    $result = json_decode($response, true);
    
    if (isset($result['access_token'])) {
        return $result['access_token'];
    }
    
    return false;
}

// 创建菜单
function create_menu($access_token) {
    $url = "https://api.weixin.qq.com/cgi-bin/menu/create?access_token={$access_token}";
    
    // 菜单数据
    // 简化的菜单结构
$menu = array(
    'button' => array(
        array(
            'name' => '加群',
            'type' => 'click',  // 最基本的click类型
            'key' => 'JOIN_GROUP'
        )
    )
);
    
    $json_menu = json_encode($menu, JSON_UNESCAPED_UNICODE);
    
    // 发送请求
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $json_menu);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8'));
    $response = curl_exec($ch);
    curl_close($ch);
    
    return $response;
}

// 执行创建菜单
$access_token = get_access_token($appid, $appsecret);
if ($access_token) {
    $result = create_menu($access_token);
    echo "菜单创建结果：" . $result;
} else {
    echo "获取access_token失败";
}
?>