// WordPress会员验证插件 - Background Script
// 处理会员验证和API调用

class WordPressMembershipAPI {
  constructor() {
    this.baseUrl = 'https://haoyelaiga.com';
    this.apiEndpoint = '/wp-json/custom/v1/member-auth';
    this.memberData = null;
  }

  /**
   * 验证WordPress会员身份
   * @param {string} username - 用户名或邮箱
   * @param {string} password - 密码
   * @returns {Promise<Object>} 验证结果
   */
  async authenticateMember(username, password) {
    try {
      // 构造登录请求
      const loginData = {
        username: username,
        password: password,
        action: 'member_auth'
      };

      // 发送认证请求到WordPress网站
      console.debug('发送 member-auth 请求，url=', `${this.baseUrl}${this.apiEndpoint}`, 'body=', loginData);
      const response = await fetch(`${this.baseUrl}${this.apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(loginData),
        credentials: 'include'
      });

      if (!response.ok) {
        // 记录响应体以便调试（很多原因可能导致服务器返回非200，例如CORS、服务器错误或自定义错误）
        let respText = null;
        try {
          respText = await response.text();
        } catch (e) {
          respText = '<unable to read response body>';
        }
        console.error('member-auth 非2xx 响应:', response.status, respText);
        throw new Error(`HTTP error! status: ${response.status} - ${respText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        this.memberData = result.data;
        // 保存会员信息到Chrome存储
        await this.saveMemberData(result.data);
        return {
          success: true,
          data: result.data,
          message: '会员验证成功'
        };
      } else {
        return {
          success: false,
          message: result.message || '验证失败，请检查用户名和密码'
        };
      }
    } catch (error) {
      console.error('WordPress会员验证错误:', error);
      
      // 如果API不存在，使用备用验证方法
      return await this.fallbackAuthentication(username, password);
    }
  }

  /**
   * 备用验证方法 - 尝试通过WordPress标准登录接口
   * @param {string} username 
   * @param {string} password 
   */
  async fallbackAuthentication(username, password) {
    try {
      // 尝试WordPress标准登录
      const formData = new FormData();
      formData.append('log', username);
      formData.append('pwd', password);
      formData.append('wp-submit', '登录');
      formData.append('redirect_to', `${this.baseUrl}/wp-admin/`);

      const response = await fetch(`${this.baseUrl}/wp-login.php`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        redirect: 'manual'
      });

      // 检查是否重定向到后台（表示登录成功）
      if (response.status === 302 && response.headers.get('location')?.includes('wp-admin')) {
        // 获取用户信息
        const userInfo = await this.getCurrentUserInfo();
        if (userInfo) {
          await this.saveMemberData(userInfo);
          return {
            success: true,
            data: userInfo,
            message: '会员验证成功'
          };
        }
      }

      return {
        success: false,
        message: '用户名或密码错误'
      };
    } catch (error) {
      console.error('备用验证失败:', error);
      return {
        success: false,
        message: '网络连接错误，请检查网络设置'
      };
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUserInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/users/me`, {
        credentials: 'include'
      });

      if (response.ok) {
        const userData = await response.json();
        return {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          roles: userData.roles || [],
          memberLevel: this.determineMemberLevel(userData.roles),
          loginTime: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
    return null;
  }

  /**
   * 根据用户角色确定会员等级
   * @param {Array} roles - 用户角色数组
   */
  determineMemberLevel(roles) {
    if (roles.includes('administrator')) return 'VIP会员';
    if (roles.includes('editor')) return '高级会员';
    if (roles.includes('author')) return '普通会员';
    if (roles.includes('subscriber')) return '注册会员';
    return '访客';
  }

  /**
   * 保存会员数据到Chrome存储
   * @param {Object} memberData 
   */
  async saveMemberData(memberData) {
    await chrome.storage.local.set({
      memberData: memberData,
      isLoggedIn: true,
      lastLogin: new Date().toISOString()
    });
  }

  /**
   * 清除会员数据
   */
  async clearMemberData() {
    await chrome.storage.local.remove(['memberData', 'isLoggedIn', 'lastLogin']);
    this.memberData = null;
  }

  /**
   * 检查会员状态
   */
  async checkMemberStatus() {
    const result = await chrome.storage.local.get(['memberData', 'isLoggedIn']);
    return {
      isLoggedIn: result.isLoggedIn || false,
      memberData: result.memberData || null
    };
  }
}

// 创建API实例
const wpAPI = new WordPressMembershipAPI();

// 监听来自popup和content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const handleAsync = async () => {
    try {
      switch (request.action) {
        case 'authenticate':
          const authResult = await wpAPI.authenticateMember(request.username, request.password);
          sendResponse(authResult);
          break;

        case 'checkStatus':
          const status = await wpAPI.checkMemberStatus();
          sendResponse(status);
          break;

        case 'logout':
          await wpAPI.clearMemberData();
          sendResponse({ success: true });
          break;

        case 'getMemberData':
          const memberStatus = await wpAPI.checkMemberStatus();
          sendResponse(memberStatus);
          break;

        default:
          sendResponse({ success: false, message: '未知操作' });
      }
    } catch (error) {
      console.error('Background script错误:', error);
      sendResponse({ success: false, message: error.message });
    }
  };

  handleAsync();
  return true; // 保持消息通道开放用于异步响应
});

// 监听存储变化，同步会员状态到所有标签页
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && (changes.memberData || changes.isLoggedIn)) {
    // 通知所有content script更新状态
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'memberStatusChanged',
          isLoggedIn: changes.isLoggedIn?.newValue || false,
          memberData: changes.memberData?.newValue || null
        }).catch(() => {
          // 忽略无法发送消息的标签页（可能没有加载content script）
        });
      });
    });
  }
});

// 插件安装/启动时的初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('WordPress会员验证插件已安装');
});

console.log('WordPress会员验证插件 Background Script 已加载');