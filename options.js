// 全局变量
let accounts = [];
let editingIndex = -1;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

// 加载设置
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get([
      'cookieKey',
      'apiUrl',
      'apiMethod',
      'apiPayload',
      'apiTokenPath',
      'accounts',
      'compactLayout'
    ]);
    
    document.getElementById('cookieKey').value = result.cookieKey || '';
    document.getElementById('apiUrl').value = result.apiUrl || '';
    document.getElementById('apiMethod').value = result.apiMethod || 'GET';
    document.getElementById('apiPayload').value = result.apiPayload || '';
    document.getElementById('apiTokenPath').value = result.apiTokenPath || '';
    document.getElementById('compactLayout').checked = result.compactLayout || false;
    
    accounts = result.accounts || [];
    renderAccounts();
    applyLayoutPreference(result.compactLayout || false);
  } catch (error) {
    console.error('加载设置失败:', error);
    showStatus('加载设置失败', 'error');
  }
}

// 设置事件监听
function setupEventListeners() {
  // 保存按钮
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  
  // 紧凑布局切换
  document.getElementById('compactLayout').addEventListener('change', (e) => {
    applyLayoutPreference(e.target.checked);
  });
  
  // 添加账号按钮
  document.getElementById('addAccountBtn').addEventListener('click', () => {
    openAccountModal();
  });
  
  // 模态框关闭
  document.getElementById('closeModal').addEventListener('click', closeAccountModal);
  document.getElementById('cancelBtn').addEventListener('click', closeAccountModal);
  
  // 模态框确认
  document.getElementById('confirmBtn').addEventListener('click', saveAccount);
  
  // 模态框内的刷新Token按钮
  document.getElementById('refreshTokenBtn').addEventListener('click', refreshTokenInModal);
  
  // 导出按钮
  document.getElementById('exportBtn').addEventListener('click', exportSettings);
  
  // 导入按钮
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFileInput').click();
  });
  
  // 文件选择
  document.getElementById('importFileInput').addEventListener('change', importSettings);
  
  // 点击模态框外部关闭
  document.getElementById('accountModal').addEventListener('click', (e) => {
    if (e.target.id === 'accountModal') {
      closeAccountModal();
    }
  });
}

// 保存设置
async function saveSettings() {
  try {
    const settings = {
      cookieKey: document.getElementById('cookieKey').value.trim(),
      apiUrl: document.getElementById('apiUrl').value.trim(),
      apiMethod: document.getElementById('apiMethod').value,
      apiPayload: document.getElementById('apiPayload').value.trim(),
      apiTokenPath: document.getElementById('apiTokenPath').value.trim(),
      compactLayout: document.getElementById('compactLayout').checked,
      accounts: accounts
    };
    
    // 验证必填项
    if (!settings.cookieKey) {
      showStatus('请填写Cookie Key', 'error');
      return;
    }
    
    await chrome.storage.sync.set(settings);
    applyLayoutPreference(settings.compactLayout);
    showStatus('保存成功！', 'success');
  } catch (error) {
    console.error('保存设置失败:', error);
    showStatus('保存失败: ' + error.message, 'error');
  }
}

// 渲染账号列表
function renderAccounts() {
  const accountsList = document.getElementById('accountsList');
  
  if (accounts.length === 0) {
    accountsList.innerHTML = '<div class="empty-accounts">暂无账号，点击上方按钮添加账号</div>';
    return;
  }
  
  accountsList.innerHTML = '';
  
  accounts.forEach((account, index) => {
    const card = createAccountCard(account, index);
    accountsList.appendChild(card);
  });
}

// 创建账号卡片
function createAccountCard(account, index) {
  const card = document.createElement('div');
  card.className = 'account-card';
  
  card.innerHTML = `
    <div class="account-card-header">
      <div class="account-card-info">
        <h3>${escapeHtml(account.name || 'Unnamed')}</h3>
        <p>${escapeHtml(account.email || 'No email')}</p>
      </div>
      <div class="account-card-actions">
        <button class="icon-btn refresh-account-btn" data-index="${index}" title="刷新Token">
          <svg viewBox="0 0 24 24">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
        </button>
        <button class="icon-btn edit-btn" data-index="${index}" title="编辑">
          <svg viewBox="0 0 24 24">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="icon-btn delete delete-btn" data-index="${index}" title="删除">
          <svg viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
    <div class="account-token">
      Token: ${account.token ? maskToken(account.token) : '未设置'}
    </div>
  `;
  
  // 绑定事件
  card.querySelector('.refresh-account-btn').addEventListener('click', () => refreshAccountToken(index));
  card.querySelector('.edit-btn').addEventListener('click', () => editAccount(index));
  card.querySelector('.delete-btn').addEventListener('click', () => deleteAccount(index));
  
  return card;
}

// 打开账号模态框
function openAccountModal(index = -1) {
  editingIndex = index;
  const modal = document.getElementById('accountModal');
  const modalTitle = document.getElementById('modalTitle');
  
  if (index >= 0) {
    // 编辑模式
    modalTitle.textContent = '编辑账号';
    const account = accounts[index];
    document.getElementById('accountName').value = account.name || '';
    document.getElementById('accountEmail').value = account.email || '';
    document.getElementById('accountToken').value = account.token || '';
  } else {
    // 添加模式
    modalTitle.textContent = '添加账号';
    document.getElementById('accountName').value = '';
    document.getElementById('accountEmail').value = '';
    document.getElementById('accountToken').value = '';
  }
  
  modal.classList.add('show');
}

// 关闭账号模态框
function closeAccountModal() {
  const modal = document.getElementById('accountModal');
  modal.classList.remove('show');
  editingIndex = -1;
}

// 保存账号
function saveAccount() {
  const name = document.getElementById('accountName').value.trim();
  const email = document.getElementById('accountEmail').value.trim();
  const token = document.getElementById('accountToken').value.trim();
  
  if (!name) {
    alert('请输入账号名');
    return;
  }
  
  if (!email) {
    alert('请输入邮箱');
    return;
  }
  
  const account = { name, email, token };
  
  if (editingIndex >= 0) {
    // 编辑
    accounts[editingIndex] = account;
  } else {
    // 添加
    accounts.push(account);
  }
  
  renderAccounts();
  closeAccountModal();
}

// 编辑账号
function editAccount(index) {
  openAccountModal(index);
}

// 删除账号
function deleteAccount(index) {
  if (confirm('确定要删除这个账号吗？')) {
    accounts.splice(index, 1);
    renderAccounts();
  }
}

// 在模态框中刷新Token
async function refreshTokenInModal() {
  const name = document.getElementById('accountName').value.trim();
  const email = document.getElementById('accountEmail').value.trim();
  
  if (!email || !name) {
    alert('请先填写账号名和邮箱');
    return;
  }
  
  const button = document.getElementById('refreshTokenBtn');
  button.classList.add('loading');
  
  try {
    const token = await fetchTokenFromAPI({ name, email });
    document.getElementById('accountToken').value = token;
    alert('Token获取成功！');
  } catch (error) {
    alert('获取Token失败: ' + error.message);
  } finally {
    button.classList.remove('loading');
  }
}

// 刷新账号Token
async function refreshAccountToken(index) {
  const account = accounts[index];
  
  try {
    const token = await fetchTokenFromAPI(account);
    accounts[index].token = token;
    renderAccounts();
    showStatus('Token刷新成功！', 'success');
  } catch (error) {
    showStatus('Token刷新失败: ' + error.message, 'error');
  }
}

// 从API获取Token
async function fetchTokenFromAPI(account) {
  const apiUrl = document.getElementById('apiUrl').value.trim();
  const apiMethod = document.getElementById('apiMethod').value;
  const apiPayload = document.getElementById('apiPayload').value.trim();
  const apiTokenPath = document.getElementById('apiTokenPath').value.trim();
  
  if (!apiUrl && !apiPayload) {
    throw new Error('未配置API URL或Payload');
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
  let body = null;
  
  const options = {
    method: apiMethod,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (apiPayload && apiMethod === 'POST') {
    body = replacePlaceholders(apiPayload);
    try {
      JSON.parse(body); // 验证JSON格式
      options.body = body;
    } catch (e) {
      throw new Error('Payload格式错误，请检查JSON格式');
    }
  }
  
  // 发送请求
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // 使用JSONPath提取token
  const token = extractTokenByPath(data, apiTokenPath);
  
  if (!token) {
    throw new Error('无法从API响应中提取Token，请检查JSONPath配置');
  }
  
  return token;
}

// 使用JSONPath提取token
function extractTokenByPath(data, path) {
  try {
    // 简化的JSONPath实现，支持基本的点号和方括号语法
    // 例如: $.data.token, $.access_token, $['data']['token']
    
    path = path.replace(/^\$\.?/, ''); // 移除开头的 $ 或 $.
    
    const keys = path.split('.').flatMap(key => {
      // 处理方括号语法 ['key']
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

// 导出设置
async function exportSettings() {
  try {
    const result = await chrome.storage.sync.get(null);
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `account-switch-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showStatus('导出成功！', 'success');
  } catch (error) {
    console.error('导出失败:', error);
    showStatus('导出失败: ' + error.message, 'error');
  }
}

// 导入设置
async function importSettings(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const config = JSON.parse(text);
    
    // 验证配置格式
    if (typeof config !== 'object') {
      throw new Error('配置文件格式错误');
    }
    
    await chrome.storage.sync.set(config);
    await loadSettings();
    
    showStatus('导入成功！', 'success');
  } catch (error) {
    console.error('导入失败:', error);
    showStatus('导入失败: ' + error.message, 'error');
  }
  
  // 重置文件选择
  event.target.value = '';
}

// 显示状态消息
function showStatus(message, type = 'success') {
  const statusElement = document.getElementById('saveStatus');
  statusElement.textContent = message;
  statusElement.className = `save-status ${type}`;
  
  setTimeout(() => {
    statusElement.textContent = '';
    statusElement.className = 'save-status';
  }, 3000);
}

// 转义HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 掩码Token显示
function maskToken(token) {
  if (!token) return '未设置';
  if (token.length <= 8) return '***';
  return token.substring(0, 4) + '...' + token.substring(token.length - 4);
}

// 应用布局偏好设置
function applyLayoutPreference(isCompact) {
  const body = document.body;
  if (isCompact) {
    body.classList.add('compact-layout');
  } else {
    body.classList.remove('compact-layout');
  }
}
