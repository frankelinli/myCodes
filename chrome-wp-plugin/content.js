// WordPress会员验证插件 - Content Script
// 负责页面注入和功能按钮显示

class WordPressPluginInjector {
  constructor() {
    this.isLoggedIn = false;
    this.memberData = null;
    this.settings = {
      injectionEnabled: false,
      buttonsEnabled: false
    };
    this.injectedElements = new Set();
    this.floatingPanel = null;
    
    this.init();
  }

  async init() {
    // 获取当前会员状态和设置
    await this.loadMemberStatus();
    await this.loadSettings();
    
    // 如果是会员，根据设置执行相应功能
    if (this.isLoggedIn) {
      this.updatePageFeatures();
    }

    // 监听消息
    this.setupMessageListeners();
    
    console.log('WordPress会员插件内容脚本已加载');
  }

  async loadMemberStatus() {
    try {
      const response = await this.sendMessage({ action: 'getMemberData' });
      this.isLoggedIn = response.isLoggedIn || false;
      this.memberData = response.memberData || null;
    } catch (error) {
      console.error('加载会员状态失败:', error);
    }
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['pluginSettings']);
      this.settings = result.pluginSettings || this.settings;
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'memberStatusChanged':
          this.isLoggedIn = request.isLoggedIn;
          this.memberData = request.memberData;
          this.updatePageFeatures();
          break;

        case 'settingChanged':
          this.settings[request.setting] = request.value;
          this.updatePageFeatures();
          break;
      }
    });
  }

  updatePageFeatures() {
    if (!this.isLoggedIn) {
      this.removeAllInjections();
      return;
    }

    if (this.settings.injectionEnabled) {
      this.injectMemberElements();
    } else {
      this.removeInjectedElements();
    }

    if (this.settings.buttonsEnabled) {
      this.showFunctionalButtons();
    } else {
      this.removeFunctionalButtons();
    }
  }

  injectMemberElements() {
    // 会员专属浮动面板
    this.createFloatingPanel();
    
    // 页面顶部会员标识
    this.createMemberBadge();
    
    // 在输入框添加会员专属功能
    this.enhanceInputFields();
    
    // 添加页面水印（可选）
    this.addWatermark();
  }

  createFloatingPanel() {
    if (this.floatingPanel) return;

    this.floatingPanel = document.createElement('div');
    this.floatingPanel.id = 'wp-member-panel';
    this.floatingPanel.innerHTML = `
      <div class="wp-member-panel-header">
        <span class="wp-member-badge">VIP会员</span>
        <button class="wp-panel-toggle">−</button>
      </div>
      <div class="wp-member-panel-content">
        <div class="wp-member-info">
          <p><strong>${this.memberData.name || '会员'}</strong></p>
          <p>${this.memberData.memberLevel || '普通会员'}</p>
        </div>
        <div class="wp-member-tools">
          <button class="wp-tool-btn" data-tool="highlight">智能高亮</button>
          <button class="wp-tool-btn" data-tool="notes">快速笔记</button>
          <button class="wp-tool-btn" data-tool="share">会员分享</button>
        </div>
      </div>
    `;

    // 添加样式
    this.addPanelStyles();
    
    // 添加事件监听
    this.setupPanelEvents();
    
    document.body.appendChild(this.floatingPanel);
    this.injectedElements.add(this.floatingPanel);

    // 添加拖拽功能
    this.makeDraggable(this.floatingPanel);
  }

  createMemberBadge() {
    // 检查是否已存在
    if (document.getElementById('wp-member-top-badge')) return;

    const badge = document.createElement('div');
    badge.id = 'wp-member-top-badge';
    badge.innerHTML = `
      <div class="wp-badge-content">
        <span class="wp-badge-icon">👑</span>
        <span class="wp-badge-text">WordPress会员已激活</span>
      </div>
    `;

    // 添加样式
    const badgeStyle = document.createElement('style');
    badgeStyle.textContent = `
      #wp-member-top-badge {
        position: fixed;
        top: 10px;
        right: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 8px 16px;
        border-radius: 25px;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.5s ease-out;
      }
      
      .wp-badge-content {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .wp-badge-icon {
        font-size: 14px;
      }
      
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;

    document.head.appendChild(badgeStyle);
    document.body.appendChild(badge);
    this.injectedElements.add(badge);
    this.injectedElements.add(badgeStyle);

    // 3秒后自动隐藏
    setTimeout(() => {
      if (badge.parentNode) {
        badge.style.animation = 'slideOutRight 0.5s ease-in forwards';
        setTimeout(() => {
          if (badge.parentNode) badge.remove();
        }, 500);
      }
    }, 3000);
  }

  enhanceInputFields() {
    const inputs = document.querySelectorAll('input[type="text"], textarea');
    inputs.forEach(input => {
      if (input.dataset.wpEnhanced) return;
      
      // 添加会员专属右键菜单
      input.addEventListener('contextmenu', (e) => {
        this.showMemberContextMenu(e, input);
      });
      
      input.dataset.wpEnhanced = 'true';
    });
  }

  showMemberContextMenu(event, input) {
    event.preventDefault();
    
    // 移除已存在的菜单
    const existingMenu = document.getElementById('wp-member-context-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.id = 'wp-member-context-menu';
    menu.innerHTML = `
      <div class="wp-context-item" data-action="ai-complete">AI智能补全</div>
      <div class="wp-context-item" data-action="translate">会员翻译</div>
      <div class="wp-context-item" data-action="format">格式化文本</div>
      <div class="wp-context-item" data-action="save-snippet">保存为片段</div>
    `;

    // 添加菜单样式
    const menuStyle = document.createElement('style');
    menuStyle.textContent = `
      #wp-member-context-menu {
        position: fixed;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 10001;
        min-width: 150px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      
      .wp-context-item {
        padding: 10px 15px;
        cursor: pointer;
        font-size: 13px;
        border-bottom: 1px solid #f0f0f0;
        transition: background-color 0.2s;
      }
      
      .wp-context-item:hover {
        background: #f8f9fa;
      }
      
      .wp-context-item:last-child {
        border-bottom: none;
      }
    `;

    document.head.appendChild(menuStyle);

    // 设置菜单位置
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';

    document.body.appendChild(menu);

    // 添加点击事件
    menu.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action) {
        this.handleMemberAction(action, input);
      }
      menu.remove();
      menuStyle.remove();
    });

    // 点击其他地方时关闭菜单
    document.addEventListener('click', () => {
      if (menu.parentNode) {
        menu.remove();
        menuStyle.remove();
      }
    }, { once: true });
  }

  handleMemberAction(action, input) {
    switch (action) {
      case 'ai-complete':
        this.aiCompleteText(input);
        break;
      case 'translate':
        this.translateText(input);
        break;
      case 'format':
        this.formatText(input);
        break;
      case 'save-snippet':
        this.saveTextSnippet(input);
        break;
    }
  }

  aiCompleteText(input) {
    const originalValue = input.value;
    input.value = originalValue + ' [AI智能补全功能 - 会员专享]';
    
    // 模拟AI处理
    setTimeout(() => {
      input.value = originalValue + ' 这是AI智能补全的示例文本。';
    }, 1000);
  }

  translateText(input) {
    const text = input.value || input.placeholder || '请输入要翻译的文本';
    input.value = `[翻译] ${text} -> Translation example (会员专享翻译功能)`;
  }

  formatText(input) {
    if (input.value) {
      input.value = input.value.trim().replace(/\s+/g, ' ');
      this.showNotification('文本已格式化 (会员功能)');
    }
  }

  saveTextSnippet(input) {
    if (input.value) {
      const snippet = {
        text: input.value,
        timestamp: new Date().toLocaleString(),
        url: window.location.href
      };
      
      // 保存到本地存储
      chrome.storage.local.get(['memberSnippets'], (result) => {
        const snippets = result.memberSnippets || [];
        snippets.push(snippet);
        chrome.storage.local.set({ memberSnippets: snippets });
      });
      
      this.showNotification('文本片段已保存 (会员功能)');
    }
  }

  addWatermark() {
    if (document.getElementById('wp-member-watermark')) return;

    const watermark = document.createElement('div');
    watermark.id = 'wp-member-watermark';
    watermark.textContent = `WordPress会员 - ${this.memberData.name}`;
    watermark.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      font-size: 10px;
      color: rgba(0,0,0,0.3);
      font-family: Arial, sans-serif;
      z-index: 9999;
      pointer-events: none;
      transform: rotate(-15deg);
    `;

    document.body.appendChild(watermark);
    this.injectedElements.add(watermark);
  }

  showFunctionalButtons() {
    // 创建功能按钮组
    if (document.getElementById('wp-member-buttons')) return;

    const buttonGroup = document.createElement('div');
    buttonGroup.id = 'wp-member-buttons';
    buttonGroup.innerHTML = `
      <button class="wp-func-btn" data-func="screenshot">📷 会员截图</button>
      <button class="wp-func-btn" data-func="export">📤 导出数据</button>
      <button class="wp-func-btn" data-func="analyze">📊 页面分析</button>
    `;

    // 添加样式
    const buttonStyle = document.createElement('style');
    buttonStyle.textContent = `
      #wp-member-buttons {
        position: fixed;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 10000;
      }
      
      .wp-func-btn {
        background: #4facfe;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 2px 10px rgba(79, 172, 254, 0.3);
        transition: all 0.3s ease;
        white-space: nowrap;
      }
      
      .wp-func-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 20px rgba(79, 172, 254, 0.4);
      }
    `;

    document.head.appendChild(buttonStyle);
    document.body.appendChild(buttonGroup);
    this.injectedElements.add(buttonGroup);
    this.injectedElements.add(buttonStyle);

    // 添加按钮事件
    buttonGroup.addEventListener('click', (e) => {
      const func = e.target.dataset.func;
      if (func) {
        this.handleButtonFunction(func);
      }
    });
  }

  handleButtonFunction(func) {
    switch (func) {
      case 'screenshot':
        this.takeScreenshot();
        break;
      case 'export':
        this.exportPageData();
        break;
      case 'analyze':
        this.analyzePage();
        break;
    }
  }

  takeScreenshot() {
    // 模拟会员专享截图功能
    this.showNotification('正在生成会员专享截图...');
    
    setTimeout(() => {
      this.showNotification('截图已保存到会员相册 📷');
    }, 2000);
  }

  exportPageData() {
    const pageData = {
      title: document.title,
      url: window.location.href,
      content: document.body.innerText.substring(0, 1000),
      timestamp: new Date().toISOString(),
      member: this.memberData.name
    };

    const dataStr = JSON.stringify(pageData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `page-data-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    this.showNotification('页面数据已导出 📤');
  }

  analyzePage() {
    const analysis = {
      elements: document.querySelectorAll('*').length,
      images: document.querySelectorAll('img').length,
      links: document.querySelectorAll('a').length,
      forms: document.querySelectorAll('form').length,
      scripts: document.querySelectorAll('script').length
    };

    const message = `页面分析结果：
元素总数：${analysis.elements}
图片数量：${analysis.images}
链接数量：${analysis.links}
表单数量：${analysis.forms}
脚本数量：${analysis.scripts}`;

    this.showNotification(message, 5000);
  }

  showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'wp-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 13px;
      z-index: 10002;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      animation: slideDown 0.3s ease-out;
      max-width: 300px;
      text-align: center;
      line-height: 1.4;
      white-space: pre-line;
    `;

    // 添加动画样式
    if (!document.getElementById('wp-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'wp-notification-styles';
      style.textContent = `
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(0); opacity: 1; }
          to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease-in forwards';
      setTimeout(() => {
        if (notification.parentNode) notification.remove();
      }, 300);
    }, duration);
  }

  addPanelStyles() {
    const style = document.createElement('style');
    style.id = 'wp-member-panel-styles';
    style.textContent = `
      #wp-member-panel {
        position: fixed;
        top: 100px;
        right: 20px;
        width: 280px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        border: 1px solid #e1e5e9;
        overflow: hidden;
      }
      
      .wp-member-panel-header {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
      }
      
      .wp-member-badge {
        font-weight: 600;
        font-size: 13px;
      }
      
      .wp-panel-toggle {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        padding: 0;
        width: 20px;
        height: 20px;
      }
      
      .wp-member-panel-content {
        padding: 16px;
      }
      
      .wp-member-info {
        margin-bottom: 15px;
        text-align: center;
      }
      
      .wp-member-info p {
        margin: 4px 0;
        font-size: 13px;
        color: #666;
      }
      
      .wp-member-info strong {
        color: #333;
        font-size: 14px;
      }
      
      .wp-member-tools {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .wp-tool-btn {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
        text-align: center;
      }
      
      .wp-tool-btn:hover {
        background: #e9ecef;
        border-color: #4facfe;
      }
    `;
    
    document.head.appendChild(style);
    this.injectedElements.add(style);
  }

  setupPanelEvents() {
    const toggleBtn = this.floatingPanel.querySelector('.wp-panel-toggle');
    const content = this.floatingPanel.querySelector('.wp-member-panel-content');
    
    toggleBtn.addEventListener('click', () => {
      const isHidden = content.style.display === 'none';
      content.style.display = isHidden ? 'block' : 'none';
      toggleBtn.textContent = isHidden ? '−' : '+';
    });

    // 工具按钮事件
    const toolBtns = this.floatingPanel.querySelectorAll('.wp-tool-btn');
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        this.handleToolAction(tool);
      });
    });
  }

  handleToolAction(tool) {
    switch (tool) {
      case 'highlight':
        this.toggleHighlightMode();
        break;
      case 'notes':
        this.openNotesDialog();
        break;
      case 'share':
        this.sharePageAsMember();
        break;
    }
  }

  toggleHighlightMode() {
    // 实现智能高亮模式
    this.showNotification('智能高亮模式已激活 ✨');
  }

  openNotesDialog() {
    // 实现快速笔记功能
    this.showNotification('快速笔记功能开发中... 📝');
  }

  sharePageAsMember() {
    // 实现会员分享功能
    const shareData = {
      title: document.title,
      url: window.location.href,
      member: this.memberData.name
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareData.url);
      this.showNotification('链接已复制到剪贴板 📋');
    }
  }

  makeDraggable(element) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    const header = element.querySelector('.wp-member-panel-header');

    header.addEventListener('mousedown', (e) => {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (e.target === header || header.contains(e.target)) {
        isDragging = true;
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
    });

    document.addEventListener('mouseup', () => {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
    });
  }

  removeAllInjections() {
    this.removeInjectedElements();
    this.removeFunctionalButtons();
  }

  removeInjectedElements() {
    this.injectedElements.forEach(element => {
      if (element.parentNode) {
        element.remove();
      }
    });
    this.injectedElements.clear();
    this.floatingPanel = null;
  }

  removeFunctionalButtons() {
    const buttons = document.getElementById('wp-member-buttons');
    if (buttons) buttons.remove();
  }

  sendMessage(message) {
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
}

// 初始化插件
const wpInjector = new WordPressPluginInjector();