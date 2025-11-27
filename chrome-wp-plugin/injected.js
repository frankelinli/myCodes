// WordPress会员验证插件 - 注入脚本
// 在页面上下文中执行的脚本

(function() {
  'use strict';

  // 防止重复注入
  if (window.wpMemberInjected) {
    return;
  }
  window.wpMemberInjected = true;

  /**
   * 页面增强功能
   */
  class PageEnhancer {
    constructor() {
      this.memberData = null;
      this.init();
    }

    init() {
      // 监听来自 content script 的消息
      window.addEventListener('message', (event) => {
        if (event.source !== window) return;
        
        if (event.data.type === 'WP_MEMBER_DATA') {
          this.memberData = event.data.memberData;
          this.enhancePage();
        }
      });

      console.log('WordPress会员页面增强脚本已加载');
    }

    enhancePage() {
      if (!this.memberData) return;

      // 为会员用户添加特殊样式
      this.addMemberStyles();
      
      // 增强表单功能
      this.enhanceForms();
      
      // 添加快捷键支持
      this.addKeyboardShortcuts();
    }

    addMemberStyles() {
      const style = document.createElement('style');
      style.id = 'wp-member-enhancement-styles';
      style.textContent = `
        /* 会员专享样式 */
        .wp-member-enhanced {
          border: 2px solid #4facfe !important;
          box-shadow: 0 0 10px rgba(79, 172, 254, 0.3) !important;
        }
        
        .wp-member-badge {
          position: relative;
        }
        
        .wp-member-badge::after {
          content: '👑';
          position: absolute;
          top: -10px;
          right: -10px;
          font-size: 16px;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `;
      
      document.head.appendChild(style);
    }

    enhanceForms() {
      // 增强输入框
      const inputs = document.querySelectorAll('input[type="text"], textarea');
      inputs.forEach(input => {
        if (!input.dataset.wpEnhanced) {
          input.addEventListener('focus', this.onInputFocus.bind(this));
          input.dataset.wpEnhanced = 'true';
        }
      });
    }

    onInputFocus(event) {
      const input = event.target;
      
      // 添加会员专享视觉效果
      input.classList.add('wp-member-enhanced');
      
      // 移除效果
      input.addEventListener('blur', () => {
        input.classList.remove('wp-member-enhanced');
      }, { once: true });
    }

    addKeyboardShortcuts() {
      document.addEventListener('keydown', (event) => {
        // Ctrl + Shift + M: 快速显示会员面板
        if (event.ctrlKey && event.shiftKey && event.key === 'M') {
          event.preventDefault();
          this.toggleMemberPanel();
        }
        
        // Ctrl + Shift + S: 快速保存页面内容
        if (event.ctrlKey && event.shiftKey && event.key === 'S') {
          event.preventDefault();
          this.quickSave();
        }
      });
    }

    toggleMemberPanel() {
      // 向 content script 发送消息
      window.postMessage({
        type: 'WP_TOGGLE_PANEL',
        source: 'injected-script'
      }, '*');
    }

    quickSave() {
      const content = {
        title: document.title,
        url: window.location.href,
        content: document.body.innerText.substring(0, 500),
        timestamp: new Date().toISOString()
      };

      window.postMessage({
        type: 'WP_QUICK_SAVE',
        data: content,
        source: 'injected-script'
      }, '*');
    }
  }

  // 初始化页面增强器
  const pageEnhancer = new PageEnhancer();
  
  // 导出到全局作用域（调试用）
  window.wpPageEnhancer = pageEnhancer;

})();