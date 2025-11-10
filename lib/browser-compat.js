/**
 * 浏览器 API 兼容性层
 * 
 * 在 Chrome 和 Firefox 之间提供一致的 API 接口
 * 必须在所有其他脚本之前加载
 */

(function() {
  'use strict';

  // 检测当前环境
  const isFirefox = typeof browser !== 'undefined';
  const isChrome = typeof chrome !== 'undefined' && !isFirefox;

  // 确保 chrome 命名空间存在
  if (!window.chrome) {
    window.chrome = {};
  }

  // Firefox: 将 browser API 映射到 chrome 命名空间
  if (isFirefox && window.browser) {
    // 复制主要的 API
    if (browser.runtime && !chrome.runtime) {
      chrome.runtime = browser.runtime;
    }
    if (browser.storage && !chrome.storage) {
      chrome.storage = browser.storage;
    }
    if (browser.tabs && !chrome.tabs) {
      chrome.tabs = browser.tabs;
    }
    if (browser.cookies && !chrome.cookies) {
      chrome.cookies = browser.cookies;
    }
    if (browser.extension && !chrome.extension) {
      chrome.extension = browser.extension;
    }
  }

  // 暴露检测函数
  window.__browserEnv = {
    isFirefox: isFirefox,
    isChrome: isChrome,
    getBrowserName: function() {
      return isFirefox ? 'firefox' : isChrome ? 'chrome' : 'unknown';
    }
  };

  // 输出调试信息（可选，开发时有用）
  if (typeof console !== 'undefined' && console.log) {
    const envName = window.__browserEnv.getBrowserName();
    // 只在开发环境输出
    // console.log(`[AccountSwitch] Running on: ${envName}`);
  }
})();
