// Background service worker / script for AccountSwitch extension

// 条件性加载浏览器兼容性层
// Service Worker 环境使用 importScripts
// 普通脚本环境会通过 HTML 脚本标签加载
if (typeof importScripts === 'function') {
  try {
    importScripts('lib/browser-compat.js');
  } catch (e) {
    // 如果 importScripts 失败，继续 (可能是浏览器兼容问题)
  }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'refreshToken') {
    refreshTokenForAccount(request.account)
      .then(token => {
        sendResponse({ success: true, token });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // 保持消息通道开放以支持异步响应
  }
});

// 从API刷新账号的Token
async function refreshTokenForAccount(account) {
  try {
    // 获取API配置
    const result = await chrome.storage.sync.get([
      'apiUrl',
      'apiMethod',
      'apiPayload',
      'apiTokenPath',
      'accounts'
    ]);
    
    const apiUrl = result.apiUrl || '';
    const apiMethod = result.apiMethod || 'GET';
    const apiPayload = result.apiPayload || '';
    const apiTokenPath = result.apiTokenPath || '';
    
    if (!apiUrl && !apiPayload) {
      throw new Error('未配置API信息');
    }
    
    if (!apiTokenPath) {
      throw new Error('未配置Token的JSONPath');
    }
    
    // 替换占位符
    const replacePlaceholders = (str) => {
      return str
        .replace(/{email}/g, account.email || '')
        .replace(/{username}/g, account.name || '');
    };
    
    let url = replacePlaceholders(apiUrl);
    
    const options = {
      method: apiMethod,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (apiPayload && apiMethod === 'POST') {
      const body = replacePlaceholders(apiPayload);
      try {
        JSON.parse(body); // 验证JSON格式
        options.body = body;
      } catch (e) {
        throw new Error('Payload格式错误');
      }
    }
    
    // 发送请求
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 提取token
    const token = extractTokenByPath(data, apiTokenPath);
    
    if (!token) {
      throw new Error('无法从API响应中提取Token');
    }
    
    // 更新存储中的token
    const accounts = result.accounts || [];
    const index = accounts.findIndex(acc => acc.email === account.email);
    
    if (index >= 0) {
      accounts[index].token = token;
      await chrome.storage.sync.set({ accounts });
    }
    
    return token;
  } catch (error) {
    console.error('刷新Token失败:', error);
    throw error;
  }
}

// 使用JSONPath提取token
function extractTokenByPath(data, path) {
  try {
    path = path.replace(/^\$\.?/, '');
    
    const keys = path.split('.').flatMap(key => {
      return key.split(/\[['"]?/).map(k => k.replace(/['"]?\]$/, '')).filter(k => k);
    });
    
    let result = data;
    for (const key of keys) {
      if (result === null || result === undefined) {
        return null;
      }
      result = result[key];
    }
    
    return result;
  } catch (error) {
    console.error('JSONPath解析错误:', error);
    return null;
  }
}
