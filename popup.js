// 加载账号列表
async function loadAccounts() {
  const result = await chrome.storage.sync.get(['accounts', 'cookieKey', 'compactLayout']);
  const accounts = result.accounts || [];
  const cookieKey = result.cookieKey || '';
  const compactLayout = result.compactLayout || false;
  
  // 应用布局偏好设置
  applyLayoutPreference(compactLayout);
  
  const accountList = document.getElementById('accountList');
  accountList.innerHTML = '';
  
  if (accounts.length === 0) {
    accountList.innerHTML = `
      <div class="empty-state">
        <p>暂无账号</p>
        <p>请点击下方"管理面板"添加账号</p>
      </div>
    `;
    return;
  }
  
  if (!cookieKey) {
    accountList.innerHTML = `
      <div class="empty-state">
        <p>未配置Cookie Key</p>
        <p>请在管理面板中设置</p>
      </div>
    `;
    return;
  }
  
  accounts.forEach(account => {
    const accountItem = createAccountItem(account);
    accountList.appendChild(accountItem);
  });
}

// 创建账号列表项
function createAccountItem(account) {
  const div = document.createElement('div');
  div.className = 'account-item';
  
  const infoDiv = document.createElement('div');
  infoDiv.className = 'account-info';
  
  const nameDiv = document.createElement('div');
  nameDiv.className = 'account-name';
  nameDiv.textContent = account.name || 'Unnamed';
  
  const emailDiv = document.createElement('div');
  emailDiv.className = 'account-email';
  emailDiv.textContent = account.email || 'No email';
  
  infoDiv.appendChild(nameDiv);
  infoDiv.appendChild(emailDiv);
  
  // 刷新按钮
  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'refresh-btn';
  refreshBtn.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
    </svg>
  `;
  refreshBtn.title = '刷新Token';
  
  // 点击刷新按钮
  refreshBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await refreshAccountToken(account.email, refreshBtn);
  });
  
  // 点击账号项
  div.addEventListener('click', async () => {
    await switchAccount(account);
  });
  
  div.appendChild(infoDiv);
  div.appendChild(refreshBtn);
  
  return div;
}

// 切换账号
async function switchAccount(account) {
  try {
    if (!account.token) {
      alert('该账号没有Token，请先刷新Token');
      return;
    }
    
    const result = await chrome.storage.sync.get(['cookieKey']);
    const cookieKey = result.cookieKey;
    
    if (!cookieKey) {
      alert('未配置Cookie Key，请先在管理面板中配置');
      return;
    }
    
    // 获取当前标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url) {
      alert('无法获取当前页面信息');
      return;
    }
    
    // 设置Cookie
    await chrome.cookies.set({
      url: tab.url,
      name: cookieKey,
      value: account.token,
      path: '/'
    });
    
    // 刷新页面
    await chrome.tabs.reload(tab.id);
    
    // 关闭popup
    window.close();
  } catch (error) {
    console.error('切换账号失败:', error);
    alert('切换账号失败: ' + error.message);
  }
}

// 刷新账号Token
async function refreshAccountToken(email, buttonElement) {
  try {
    buttonElement.classList.add('loading');
    
    const result = await chrome.storage.sync.get([
      'accounts', 
      'apiUrl', 
      'apiMethod', 
      'apiPayload', 
      'apiTokenPath'
    ]);
    
    if (!result.apiUrl && !result.apiPayload) {
      alert('未配置API信息，无法刷新Token');
      buttonElement.classList.remove('loading');
      return;
    }
    
    const account = result.accounts.find(acc => acc.email === email);
    if (!account) {
      throw new Error('账号不存在');
    }
    
    // 发送消息到background script获取token
    const response = await chrome.runtime.sendMessage({
      action: 'refreshToken',
      account: account
    });
    
    if (response.success) {
      alert('Token刷新成功');
      loadAccounts(); // 重新加载列表
    } else {
      throw new Error(response.error || 'Token刷新失败');
    }
  } catch (error) {
    console.error('刷新Token失败:', error);
    alert('刷新Token失败: ' + error.message);
  } finally {
    buttonElement.classList.remove('loading');
  }
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

// 打开管理面板
document.getElementById('openOptions').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// 初始化
loadAccounts();
