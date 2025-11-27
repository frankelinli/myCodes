// WordPress会员验证插件 - Popup Script
// 处理用户界面交互和状态管理

document.addEventListener('DOMContentLoaded', function() {
  // DOM元素引用
  const elements = {
    loginForm: document.getElementById('login-form'),
    memberInfo: document.getElementById('member-info'),
    usernameInput: document.getElementById('username'),
    passwordInput: document.getElementById('password'),
    loginBtn: document.getElementById('login-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    loginStatus: document.getElementById('login-status'),
    memberName: document.getElementById('member-name'),
    memberLevel: document.getElementById('member-level'),
    enableInjection: document.getElementById('enable-injection'),
    enableButtons: document.getElementById('enable-buttons'),
    helpLink: document.getElementById('help-link')
  };

  // 初始化popup
  init();

  async function init() {
    try {
      // 检查当前登录状态
      const status = await sendMessage({ action: 'checkStatus' });
      
      if (status.isLoggedIn && status.memberData) {
        showMemberInfo(status.memberData);
        await loadSettings();
      } else {
        showLoginForm();
      }
    } catch (error) {
      console.error('初始化失败:', error);
      showLoginForm();
    }
  }

  // 显示登录表单
  function showLoginForm() {
    elements.loginForm.style.display = 'block';
    elements.memberInfo.style.display = 'none';
    elements.loginStatus.textContent = '';
  }

  // 显示会员信息
  function showMemberInfo(memberData) {
    elements.loginForm.style.display = 'none';
    elements.memberInfo.style.display = 'block';
    elements.memberInfo.classList.add('fade-in');
    
    // 更新会员信息显示
    elements.memberName.textContent = `欢迎，${memberData.name || memberData.email}`;
    elements.memberLevel.textContent = `会员等级: ${memberData.memberLevel || '普通会员'}`;
  }

  // 登录按钮事件
  elements.loginBtn.addEventListener('click', async function() {
    const username = elements.usernameInput.value.trim();
    const password = elements.passwordInput.value.trim();

    if (!username || !password) {
      showStatus('请输入用户名和密码', 'error');
      return;
    }

    // 显示登录中状态
    elements.loginBtn.disabled = true;
    elements.loginBtn.textContent = '验证中...';
    showStatus('正在验证会员身份...', 'loading');

    try {
      const result = await sendMessage({
        action: 'authenticate',
        username: username,
        password: password
      });

      if (result.success) {
        showStatus('验证成功！', 'success');
        setTimeout(() => {
          showMemberInfo(result.data);
          // 清空输入框
          elements.usernameInput.value = '';
          elements.passwordInput.value = '';
        }, 1000);
      } else {
        showStatus(result.message || '验证失败', 'error');
      }
    } catch (error) {
      console.error('登录错误:', error);
      showStatus('网络连接错误，请稍后重试', 'error');
    } finally {
      elements.loginBtn.disabled = false;
      elements.loginBtn.textContent = '登录验证';
    }
  });

  // 退出登录按钮事件
  elements.logoutBtn.addEventListener('click', async function() {
    try {
      await sendMessage({ action: 'logout' });
      showLoginForm();
      showStatus('已退出登录', 'success');
    } catch (error) {
      console.error('退出登录错误:', error);
      showStatus('退出登录失败', 'error');
    }
  });

  // 功能开关事件
  elements.enableInjection.addEventListener('change', function() {
    saveSettings();
    notifyContentScript('injectionEnabled', this.checked);
  });

  elements.enableButtons.addEventListener('change', function() {
    saveSettings();
    notifyContentScript('buttonsEnabled', this.checked);
  });

  // 帮助链接事件
  elements.helpLink.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({
      url: 'https://haoyelaiga.com/help'
    });
  });

  // 键盘事件支持
  elements.usernameInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      elements.passwordInput.focus();
    }
  });

  elements.passwordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      elements.loginBtn.click();
    }
  });

  // 显示状态消息
  function showStatus(message, type) {
    elements.loginStatus.textContent = message;
    elements.loginStatus.className = `status-message ${type}`;
    
    if (type === 'success') {
      setTimeout(() => {
        elements.loginStatus.textContent = '';
        elements.loginStatus.className = 'status-message';
      }, 3000);
    }
  }

  // 发送消息到background script
  function sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  // 通知content script状态变化
  async function notifyContentScript(setting, value) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'settingChanged',
          setting: setting,
          value: value
        });
      }
    } catch (error) {
      console.error('通知content script失败:', error);
    }
  }

  // 保存设置
  async function saveSettings() {
    const settings = {
      injectionEnabled: elements.enableInjection.checked,
      buttonsEnabled: elements.enableButtons.checked
    };
    
    try {
      await chrome.storage.local.set({ pluginSettings: settings });
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  }

  // 加载设置
  async function loadSettings() {
    try {
      const result = await chrome.storage.local.get(['pluginSettings']);
      const settings = result.pluginSettings || {
        injectionEnabled: false,
        buttonsEnabled: false
      };
      
      elements.enableInjection.checked = settings.injectionEnabled;
      elements.enableButtons.checked = settings.buttonsEnabled;
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  }

  // 监听来自background的状态变化
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'memberStatusChanged') {
      if (request.isLoggedIn && request.memberData) {
        showMemberInfo(request.memberData);
      } else {
        showLoginForm();
      }
    }
  });

  console.log('WordPress会员验证插件 Popup 已初始化');
});