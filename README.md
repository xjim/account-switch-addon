# AccountSwitch Chrome Extension

一个用于在指定页面快速切换不同账号的Chrome扩展，通过替换Cookie中的OAuth Token实现账号切换。

## 功能特性

- ✨ **快速切换账号**: 点击扩展图标，选择账号即可快速切换
- 🔄 **自动刷新Token**: 通过配置的API自动获取和更新Token
- ⚙️ **灵活配置**: 支持自定义Cookie Key、API URL、请求方法和参数
- 📊 **账号管理**: 添加、编辑、删除账号信息
- 💾 **导入导出**: 支持配置的导入和导出，方便备份和分享
- 🎨 **美观界面**: 现代化的UI设计，操作简单直观

## 安装方法

### 开发模式安装

1. 克隆或下载此项目到本地
2. 打开Chrome浏览器，访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目所在文件夹
6. 安装完成！

### 生成图标（可选）

由于项目包含SVG图标，您可以使用在线工具或图像编辑软件将 `icons/icon128.svg` 转换为以下PNG文件：

- `icons/icon16.png` (16x16)
- `icons/icon32.png` (32x32)
- `icons/icon48.png` (48x48)
- `icons/icon128.png` (128x128)

或者使用在线SVG转PNG工具，如：https://svgtopng.com/

## 使用指南

### 首次配置

1. 点击扩展图标，选择"管理面板"
2. 在管理面板中配置：
   - **Cookie Key** (必填): 存储OAuth Token的Cookie键名，例如 `oauth_token`
   - **API配置** (可选): 如果需要自动获取Token，需要配置：
     - HTTP方法 (GET/POST)
     - API URL (支持 `{email}` 和 `{username}` 占位符)
     - 请求体 (POST方法时使用，JSON格式)
     - Token的JSONPath (用于从API响应中提取Token)

### 添加账号

1. 在管理面板点击"添加账号"
2. 填写账号信息：
   - 账号名 (必填)
   - 邮箱 (必填)
   - Token (可选，可手动输入或通过API获取)
3. 如果配置了API，可以点击刷新按钮自动获取Token
4. 点击"确认"保存

### 切换账号

1. 在需要切换账号的网页上，点击扩展图标
2. 在弹出的账号列表中选择要切换的账号
3. 扩展会自动替换Cookie中的Token并刷新页面

### 刷新Token

- 在弹出窗口的账号列表中，点击账号右侧的刷新图标
- 或在管理面板的账号卡片中点击刷新按钮
- 扩展会调用配置的API获取最新Token

### 导入导出配置

- **导出**: 在管理面板点击"导出配置"，下载JSON配置文件
- **导入**: 点击"导入配置"，选择之前导出的JSON文件

## 配置示例

### 示例1: GET请求获取Token

```json
{
  "cookieKey": "auth_token",
  "apiUrl": "https://api.example.com/token?email={email}",
  "apiMethod": "GET",
  "apiTokenPath": "$.data.access_token"
}
```

### 示例2: POST请求获取Token

```json
{
  "cookieKey": "oauth_token",
  "apiUrl": "https://api.example.com/auth/token",
  "apiMethod": "POST",
  "apiPayload": "{\"email\": \"{email}\", \"username\": \"{username}\"}",
  "apiTokenPath": "$.token"
}
```

## JSONPath说明

JSONPath用于从API响应中提取Token，支持以下语法：

- `$.token` - 获取根级别的token字段
- `$.data.token` - 获取嵌套的token字段
- `$.data.access_token` - 获取data对象中的access_token字段

示例API响应：
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600
  }
}
```

对应的JSONPath: `$.data.access_token`

## 占位符说明

在API URL和Payload中可以使用以下占位符：

- `{email}` - 会被替换为账号的邮箱
- `{username}` - 会被替换为账号的名称

## 项目结构

```
account-switch/
├── manifest.json          # 扩展配置文件
├── popup.html            # 弹出窗口HTML
├── popup.css             # 弹出窗口样式
├── popup.js              # 弹出窗口逻辑
├── options.html          # 管理面板HTML
├── options.css           # 管理面板样式
├── options.js            # 管理面板逻辑
├── background.js         # 后台服务脚本
├── icons/                # 图标文件夹
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon128.svg
└── README.md             # 说明文档
```

## 技术栈

- HTML5 / CSS3
- JavaScript (ES6+)
- Chrome Extension Manifest V3
- Chrome APIs:
  - chrome.storage (数据存储)
  - chrome.cookies (Cookie管理)
  - chrome.tabs (标签页操作)
  - chrome.runtime (消息传递)

## 注意事项

1. 确保目标网站允许通过JavaScript修改Cookie
2. Token的安全性由用户自行负责，建议定期更新
3. API配置为可选项，可以手动输入Token
4. 使用前请确保配置了正确的Cookie Key
5. 首次使用建议先导出配置文件作为备份

## 常见问题

**Q: 为什么切换账号后没有生效？**  
A: 请检查Cookie Key是否配置正确，以及目标网站是否使用该Cookie进行身份验证。

**Q: API获取Token失败怎么办？**  
A: 请检查API配置是否正确，包括URL、请求方法、Payload格式和JSONPath配置。

**Q: 可以在所有网站使用吗？**  
A: 理论上可以，但实际效果取决于目标网站的身份验证机制。

**Q: 数据存储在哪里？**  
A: 所有配置和账号信息都存储在Chrome的同步存储中，会自动同步到您登录的所有Chrome浏览器。

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 更新日志

### v1.0.0 (2025-11-07)
- 首次发布
- 支持账号快速切换
- 支持API自动获取Token
- 支持配置导入导出
- 美观的UI界面
