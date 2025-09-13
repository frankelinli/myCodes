---
id: 64
title: python客户端脚本连接服务器PHP来验证授权
date: '2025-04-17T07:26:16'
author: haoye
categories:
  - notes
tags: []
---

如果你有一个PHP站点，我们可以创建一个自定义的PHP脚本来提供API端点，然后编写一个Python脚本来调用这个端点。

### 步骤1：在PHP站点中创建API端点

1. **创建API端点**

在你的PHP站点的根目录或适当位置创建一个新的PHP文件，例如 `auth.php`。

**auth.php** 文件内容如下：

```
<?php
// 防止直接访问
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(array('authorized' => false, 'message' => 'Method Not Allowed'));
    exit;
}

// 获取Authorization头部
$headers = getallheaders();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

// 假设API密钥为 'your_api_key_here'
$valid_api_key = 'your_api_key_here';

if ($auth_header === 'Bearer ' . $valid_api_key) {
    echo json_encode(array('authorized' => true));
} else {
    http_response_code(401); // Unauthorized
    echo json_encode(array('authorized' => false));
}
?>
```

2. **上传PHP文件**

将这个 `auth.php` 文件上传到你的PHP站点的服务器上。例如，你可以将其放在根目录下，这样它可以通过 `https://yourphpsite.com/auth.php` 访问。

### 步骤2：编写Python脚本来调用这个API端点

假设你的API密钥是 `your_api_key_here`，站点URL是 `https://yourphpsite.com`。

**auth\_script.py** 文件内容如下：

```
import requests

# 你的PHP站点的API端点
AUTH_URL = 'https://yourphpsite.com/auth.php'

# 你需要的API密钥
API_KEY = 'your_api_key_here'

def get_authorization(api_key):
    """
    从PHP站点获取授权信息。
    """
    headers = {'Authorization': f'Bearer {api_key}'}
    response = requests.get(AUTH_URL, headers=headers)

    if response.status_code == 200:
        return response.json()
    elif response.status_code == 401:
        return {'authorized': False}
    else:
        response.raise_for_status()

def main():
    try:
        auth_response = get_authorization(API_KEY)

        if auth_response.get('authorized'):
            print("授权成功，执行脚本...")
            # 在这里放置你想要执行的脚本逻辑
            run_your_script()
        else:
            print("授权失败，取消脚本执行。")
    except requests.HTTPError as http_err:
        print(f"HTTP错误: {http_err}")
    except Exception as err:
        print(f"其他错误: {err}")

def run_your_script():
    """
    你的脚本逻辑。
    """
    print("脚本正在运行...")

if __name__ == "__main__":
    main()
```

### 运行Python脚本

1. 安装`requests`库：

   `sh
   pip install requests`

2. 运行Python脚本：

   `sh
   python auth_script.py`

### 解释

1. **PHP脚本**：

   - 接受GET请求并检查`Authorization`头部是否包含正确的API密钥。
   - 如果API密钥匹配，则返回授权成功的响应；否则返回授权失败的响应。

2. **Python脚本**：

   - 发送GET请求到PHP站点的API端点。
   - 通过`Authorization`头部传递API密钥。
   - 根据响应决定是否执行后续的脚本逻辑。

这个方案提供了一个从PHP站点获取授权信息并在Python脚本中使用的完整示例。根据你的实际需求，可能需要进一步调整和扩展。

***

很高兴你明白了客户端软件注册和授权的原理。这种机制通常用于确保只有授权用户才能使用特定的软件功能或访问特定的服务。我们可以总结一下这个过程，并添加一个基于成功授权后显示祝贺弹窗的完整示例。

### 总结

1. **服务器端（PHP站点）**\
   – 创建一个API端点来接收和验证授权请求。\
   – 验证请求中的授权信息（例如API密钥）。\
   – 返回授权状态（成功或失败）。

2. **客户端（Python脚本）**\
   – 向服务器端发送授权请求，并附带必要的授权信息（例如API密钥）。\
   – 根据服务器端的响应决定是否执行后续操作。\
   – 如果授权成功，显示一个祝贺弹窗。

通过这个完整的示例，你可以看到客户端软件如何通过API进行注册和授权，并根据授权结果执行相应的操作。希望这个示例对你有帮助！
