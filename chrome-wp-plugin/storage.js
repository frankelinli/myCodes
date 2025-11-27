// WordPress会员验证插件 - 存储管理模块
// 处理数据存储、缓存和状态管理

class StorageManager {
  constructor() {
    this.storageKeys = {
      MEMBER_DATA: 'memberData',
      LOGIN_STATUS: 'isLoggedIn', 
      LAST_LOGIN: 'lastLogin',
      PLUGIN_SETTINGS: 'pluginSettings',
      MEMBER_SNIPPETS: 'memberSnippets',
      USAGE_STATS: 'usageStats',
      CACHED_TOKENS: 'cachedTokens'
    };

    this.defaultSettings = {
      injectionEnabled: false,
      buttonsEnabled: false,
      autoLogin: false,
      notificationsEnabled: true,
      theme: 'light'
    };
  }

  /**
   * 保存会员数据
   * @param {Object} memberData - 会员信息
   */
  async saveMemberData(memberData) {
    const dataToSave = {
      [this.storageKeys.MEMBER_DATA]: {
        ...memberData,
        savedAt: new Date().toISOString()
      },
      [this.storageKeys.LOGIN_STATUS]: true,
      [this.storageKeys.LAST_LOGIN]: new Date().toISOString()
    };

    await chrome.storage.local.set(dataToSave);
    
    // 更新使用统计
    await this.updateUsageStats('login');
    
    console.log('会员数据已保存');
  }

  /**
   * 获取会员数据
   * @returns {Promise<Object>} 会员信息
   */
  async getMemberData() {
    const result = await chrome.storage.local.get([
      this.storageKeys.MEMBER_DATA,
      this.storageKeys.LOGIN_STATUS,
      this.storageKeys.LAST_LOGIN
    ]);

    return {
      memberData: result[this.storageKeys.MEMBER_DATA] || null,
      isLoggedIn: result[this.storageKeys.LOGIN_STATUS] || false,
      lastLogin: result[this.storageKeys.LAST_LOGIN] || null
    };
  }

  /**
   * 清除会员数据
   */
  async clearMemberData() {
    await chrome.storage.local.remove([
      this.storageKeys.MEMBER_DATA,
      this.storageKeys.LOGIN_STATUS,
      this.storageKeys.LAST_LOGIN,
      this.storageKeys.CACHED_TOKENS
    ]);

    await this.updateUsageStats('logout');
    console.log('会员数据已清除');
  }

  /**
   * 保存插件设置
   * @param {Object} settings - 设置对象
   */
  async saveSettings(settings) {
    const currentSettings = await this.getSettings();
    const newSettings = { ...currentSettings, ...settings };
    
    await chrome.storage.local.set({
      [this.storageKeys.PLUGIN_SETTINGS]: newSettings
    });
    
    console.log('插件设置已保存:', newSettings);
  }

  /**
   * 获取插件设置
   * @returns {Promise<Object>} 设置对象
   */
  async getSettings() {
    const result = await chrome.storage.local.get([this.storageKeys.PLUGIN_SETTINGS]);
    return result[this.storageKeys.PLUGIN_SETTINGS] || this.defaultSettings;
  }

  /**
   * 重置设置为默认值
   */
  async resetSettings() {
    await chrome.storage.local.set({
      [this.storageKeys.PLUGIN_SETTINGS]: this.defaultSettings
    });
    
    console.log('设置已重置为默认值');
  }

  /**
   * 保存文本片段
   * @param {Object} snippet - 文本片段
   */
  async saveSnippet(snippet) {
    const snippets = await this.getSnippets();
    
    const newSnippet = {
      id: Date.now().toString(),
      text: snippet.text,
      title: snippet.title || '未命名片段',
      url: snippet.url || '',
      timestamp: new Date().toISOString(),
      tags: snippet.tags || []
    };

    snippets.push(newSnippet);
    
    // 限制片段数量（最多100个）
    if (snippets.length > 100) {
      snippets.splice(0, snippets.length - 100);
    }

    await chrome.storage.local.set({
      [this.storageKeys.MEMBER_SNIPPETS]: snippets
    });

    await this.updateUsageStats('snippet_saved');
    return newSnippet.id;
  }

  /**
   * 获取所有文本片段
   * @returns {Promise<Array>} 片段数组
   */
  async getSnippets() {
    const result = await chrome.storage.local.get([this.storageKeys.MEMBER_SNIPPETS]);
    return result[this.storageKeys.MEMBER_SNIPPETS] || [];
  }

  /**
   * 删除文本片段
   * @param {string} snippetId - 片段ID
   */
  async deleteSnippet(snippetId) {
    const snippets = await this.getSnippets();
    const filteredSnippets = snippets.filter(s => s.id !== snippetId);
    
    await chrome.storage.local.set({
      [this.storageKeys.MEMBER_SNIPPETS]: filteredSnippets
    });
  }

  /**
   * 搜索文本片段
   * @param {string} query - 搜索关键词
   * @returns {Promise<Array>} 匹配的片段
   */
  async searchSnippets(query) {
    const snippets = await this.getSnippets();
    const lowercaseQuery = query.toLowerCase();
    
    return snippets.filter(snippet => 
      snippet.title.toLowerCase().includes(lowercaseQuery) ||
      snippet.text.toLowerCase().includes(lowercaseQuery) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * 更新使用统计
   * @param {string} action - 操作类型
   */
  async updateUsageStats(action) {
    const result = await chrome.storage.local.get([this.storageKeys.USAGE_STATS]);
    const stats = result[this.storageKeys.USAGE_STATS] || {
      totalLogins: 0,
      totalLogouts: 0,
      snippetsSaved: 0,
      featuresUsed: {},
      lastUpdated: new Date().toISOString(),
      installDate: new Date().toISOString()
    };

    switch (action) {
      case 'login':
        stats.totalLogins++;
        break;
      case 'logout':
        stats.totalLogouts++;
        break;
      case 'snippet_saved':
        stats.snippetsSaved++;
        break;
      default:
        if (!stats.featuresUsed[action]) {
          stats.featuresUsed[action] = 0;
        }
        stats.featuresUsed[action]++;
    }

    stats.lastUpdated = new Date().toISOString();

    await chrome.storage.local.set({
      [this.storageKeys.USAGE_STATS]: stats
    });
  }

  /**
   * 获取使用统计
   * @returns {Promise<Object>} 统计数据
   */
  async getUsageStats() {
    const result = await chrome.storage.local.get([this.storageKeys.USAGE_STATS]);
    return result[this.storageKeys.USAGE_STATS] || null;
  }

  /**
   * 缓存API令牌
   * @param {string} token - 令牌
   * @param {number} expiresIn - 过期时间（秒）
   */
  async cacheToken(token, expiresIn = 3600) {
    const tokenData = {
      token: token,
      expiresAt: Date.now() + (expiresIn * 1000)
    };

    await chrome.storage.local.set({
      [this.storageKeys.CACHED_TOKENS]: tokenData
    });
  }

  /**
   * 获取缓存的令牌
   * @returns {Promise<string|null>} 令牌或null
   */
  async getCachedToken() {
    const result = await chrome.storage.local.get([this.storageKeys.CACHED_TOKENS]);
    const tokenData = result[this.storageKeys.CACHED_TOKENS];

    if (!tokenData) return null;

    // 检查是否过期
    if (Date.now() > tokenData.expiresAt) {
      await chrome.storage.local.remove([this.storageKeys.CACHED_TOKENS]);
      return null;
    }

    return tokenData.token;
  }

  /**
   * 导出所有数据
   * @returns {Promise<Object>} 导出的数据
   */
  async exportAllData() {
    const allKeys = Object.values(this.storageKeys);
    const result = await chrome.storage.local.get(allKeys);
    
    return {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      data: result
    };
  }

  /**
   * 导入数据
   * @param {Object} importData - 要导入的数据
   */
  async importData(importData) {
    if (!importData.data) {
      throw new Error('无效的导入数据格式');
    }

    // 验证数据完整性
    const validKeys = Object.values(this.storageKeys);
    const dataToImport = {};

    for (const [key, value] of Object.entries(importData.data)) {
      if (validKeys.includes(key)) {
        dataToImport[key] = value;
      }
    }

    await chrome.storage.local.set(dataToImport);
    console.log('数据导入成功');
  }

  /**
   * 清理过期数据
   */
  async cleanupExpiredData() {
    // 清理过期的令牌
    await this.getCachedToken(); // 这会自动清理过期令牌
    
    // 清理旧的统计数据（保留最近30天）
    const stats = await this.getUsageStats();
    if (stats) {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const lastUpdated = new Date(stats.lastUpdated).getTime();
      
      if (lastUpdated < thirtyDaysAgo) {
        // 重置统计数据但保留安装日期
        const newStats = {
          totalLogins: 0,
          totalLogouts: 0,
          snippetsSaved: 0,
          featuresUsed: {},
          lastUpdated: new Date().toISOString(),
          installDate: stats.installDate
        };
        
        await chrome.storage.local.set({
          [this.storageKeys.USAGE_STATS]: newStats
        });
      }
    }

    console.log('过期数据清理完成');
  }

  /**
   * 获取存储使用情况
   * @returns {Promise<Object>} 存储信息
   */
  async getStorageInfo() {
    const bytesInUse = await chrome.storage.local.getBytesInUse();
    const quota = chrome.storage.local.QUOTA_BYTES;
    
    return {
      used: bytesInUse,
      quota: quota,
      available: quota - bytesInUse,
      percentageUsed: (bytesInUse / quota * 100).toFixed(2)
    };
  }

  /**
   * 监听存储变化
   * @param {Function} callback - 回调函数
   */
  onStorageChanged(callback) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        callback(changes);
      }
    });
  }
}

// 创建存储管理器实例
const storageManager = new StorageManager();

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
} else if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
  window.storageManager = storageManager;
}