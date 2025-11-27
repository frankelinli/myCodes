# WordPress 会员验证插件

一个专为 haoyelaiga.com 网站设计的 Chrome 插件，实现 WordPress 会员身份验证和会员专享功能。

## 🌟 主要功能

### ✨ 会员认证
- **安全验证**：通过 WordPress 后台验证会员身份
- **自动登录**：支持记住登录状态，免重复验证
- **多种验证方式**：支持用户名/邮箱 + 密码登录

### 🎯 会员专享功能

#### 📱 页面注入功能
- **浮动面板**：显示会员信息和快捷工具
- **会员标识**：页面顶部显示认证状态
- **智能水印**：页面添加个性化会员水印
- **右键菜单**：输入框增强功能（AI补全、翻译等）

#### 🔧 功能按钮
- **会员截图**：专享截图功能，带会员标识
- **数据导出**：导出页面数据为 JSON 格式
- **页面分析**：分析页面元素统计信息

#### 📝 智能工具
- **AI 智能补全**：自动完成文本输入
- **会员翻译**：专业翻译服务
- **文本格式化**：一键美化文本格式
- **片段保存**：保存常用文本片段

## 📦 安装指南

### 方法一：开发模式安装（推荐）

1. **下载源码**
   ```bash
   git clone https://github.com/your-username/wp-member-extension.git
   # 或下载 ZIP 文件并解压
   ```

2. **打开 Chrome 扩展管理页面**
   - 在 Chrome 地址栏输入：`chrome://extensions/`
   - 或者：Chrome 菜单 → 更多工具 → 扩展程序

3. **启用开发者模式**
   - 点击右上角的"开发者模式"开关

4. **加载插件**
   - 点击"加载已解压的扩展程序"
   - 选择插件文件夹

5. **确认安装**
   - 插件图标将出现在工具栏中
   - 点击图标开始使用

### 方法二：Chrome 网上应用店安装

> 插件正在审核中，即将上架 Chrome 网上应用店

## 🚀 使用说明

### 首次设置

1. **打开插件弹窗**
   - 点击工具栏中的插件图标

2. **输入会员信息**
   - 用户名/邮箱：你在 haoyelaiga.com 的账户
   - 密码：对应的登录密码

3. **点击验证**
   - 插件将连接到 WordPress 网站验证身份
   - 验证成功后显示会员信息

### 功能使用

#### 🎛️ 控制面板
- **启用页面注入功能**：在任意网页添加会员专享元素
- **启用功能按钮**：显示侧边栏功能按钮组

#### 📋 页面功能
- **浮动面板**：可拖拽的会员工具面板
- **右键菜单**：在输入框右键查看会员专享选项
- **功能按钮**：页面左侧的快捷功能按钮

#### 💾 数据管理
- **文本片段**：保存和管理常用文本
- **使用统计**：查看功能使用情况
- **数据导出**：备份所有设置和数据

## ⚙️ 配置选项

### 基本设置
- ✅ **页面注入功能**：控制是否在页面添加会员元素
- ✅ **功能按钮**：控制是否显示侧边功能按钮
- 🔔 **通知提醒**：控制是否显示操作通知
- 🎨 **主题模式**：支持浅色/深色主题

### 高级设置
- 🔐 **自动登录**：记住登录状态
- 📊 **使用统计**：记录功能使用数据
- 🗂️ **数据同步**：云端同步设置（开发中）

## 🛠️ 开发说明

### 技术架构

```
chrome-extension/
├── manifest.json          # 插件清单文件
├── popup.html            # 弹窗界面
├── popup.css            # 弹窗样式
├── popup.js             # 弹窗逻辑
├── background.js        # 后台脚本
├── content.js          # 内容脚本
├── storage.js          # 存储管理
├── icons/              # 图标文件
└── README.md           # 说明文档
```

### 核心模块

#### 1. 认证模块 (`background.js`)
- WordPress API 调用
- 会员身份验证
- 状态管理

#### 2. 界面模块 (`popup.js`)
- 用户界面交互
- 设置管理
- 状态显示

#### 3. 注入模块 (`content.js`)
- 页面元素注入
- 功能按钮管理
- 交互处理

#### 4. 存储模块 (`storage.js`)
- 数据持久化
- 缓存管理
- 导入导出

### API 接口

#### WordPress 端点
```javascript
// 主要验证接口
POST /wp-json/custom/v1/member-auth
{
  "username": "user@example.com",
  "password": "password",
  "action": "member_auth"
}

// 备用验证接口
POST /wp-login.php
// 标准 WordPress 登录表单

// 用户信息获取
GET /wp-json/wp/v2/users/me
```

### 自定义 WordPress 端点

在你的 WordPress 主题的 `functions.php` 中添加：

```php
// 添加自定义 REST API 端点
add_action('rest_api_init', function() {
    register_rest_route('custom/v1', '/member-auth', array(
        'methods' => 'POST',
        'callback' => 'handle_member_auth',
        'permission_callback' => '__return_true'
    ));
});

function handle_member_auth($request) {
    $username = $request->get_param('username');
    $password = $request->get_param('password');
    
    $user = wp_authenticate($username, $password);
    
    if (is_wp_error($user)) {
        return new WP_Error('auth_failed', '用户名或密码错误', array('status' => 401));
    }
    
    // 检查会员权限
    if (!user_can($user, 'read')) {
        return new WP_Error('not_member', '非会员用户', array('status' => 403));
    }
    
    return array(
        'success' => true,
        'data' => array(
            'id' => $user->ID,
            'name' => $user->display_name,
            'email' => $user->user_email,
            'roles' => $user->roles,
            'memberLevel' => determine_member_level($user->roles)
        )
    );
}

function determine_member_level($roles) {
    if (in_array('administrator', $roles)) return 'VIP会员';
    if (in_array('editor', $roles)) return '高级会员';
    if (in_array('author', $roles)) return '普通会员';
    return '注册会员';
}
```

## 🔧 故障排除

### 常见问题

#### ❓ 验证失败
- 检查网络连接
- 确认 haoyelaiga.com 网站是否可访问
- 验证用户名和密码是否正确
- 确保账户具有会员权限

#### ❓ 功能不显示
- 确认已登录并验证成功
- 检查插件设置是否已启用相应功能
- 尝试刷新页面或重启浏览器

#### ❓ 页面注入异常
- 某些网站可能有 CSP 策略阻止注入
- 尝试在不同网站测试功能
- 检查浏览器控制台是否有错误信息

### 调试模式

1. **开启开发者工具**
   ```bash
   # 在 Chrome 中按 F12 或右键选择"检查"
   ```

2. **查看控制台输出**
   ```javascript
   // 插件会输出调试信息到控制台
   console.log('WordPress会员验证插件已加载');
   ```

3. **检查存储数据**
   ```javascript
   // 在控制台执行
   chrome.storage.local.get(null, console.log);
   ```

## 📄 更新日志

### v1.0.0 (2024-10-24)
- ✨ 初始版本发布
- 🔐 实现 WordPress 会员验证
- 💉 添加页面注入功能
- 🔧 创建功能按钮组
- 📱 设计响应式界面
- 💾 完善数据存储管理

### 计划功能
- 🌐 多语言支持
- ☁️ 云端数据同步
- 🎨 自定义主题
- 📊 详细使用统计
- 🔌 更多第三方集成

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. **Fork 项目**
2. **创建功能分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **创建 Pull Request**

## 📞 支持与反馈

- 💬 **问题反馈**：[GitHub Issues](https://github.com/your-username/wp-member-extension/issues)
- 📧 **邮件联系**：support@example.com
- 🌐 **官网支持**：https://haoyelaiga.com/support

## 📜 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## ⚠️ 免责声明

- 本插件仅供学习和测试使用
- 请确保在使用前获得网站所有者的许可
- 开发者不对使用本插件造成的任何问题承担责任
- 请遵守相关网站的使用条款和隐私政策

---

<p align="center">
  Made with ❤️ for WordPress Community
</p>