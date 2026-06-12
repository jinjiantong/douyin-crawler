# Douyin Crawler Frontend - 抖音信息采集网站

## 项目简介

这是一个现代化的抖音信息采集网站，提供直观的图形界面来管理抖音数据采集。

## 功能特性

### 🎯 核心功能
- ✅ Cookie 账号管理（添加、查看、删除、标记过期）
- ✅ 关键词搜索视频
- ✅ 视频详情查看
- ✅ 评论采集（一级评论、二级回复）
- ✅ 用户信息查询
- ✅ 数据导出（JSON、Excel）

### 🎨 界面特性
- 深色主题设计
- 响应式布局
- 实时数据预览
- 分页加载
- 数据导出

## 技术栈

- **前端框架**: React 18
- **UI 库**: Tailwind CSS
- **HTTP 客户端**: Axios
- **图标**: Lucide React
- **状态管理**: React Hooks

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 配置后端地址
在 `src/config.js` 中修改 API 地址：
```javascript
const API_BASE = 'http://localhost:8080';
```

## 目录结构

```
douyin-crawler-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── CookieManager.jsx
│   │   ├── VideoSearch.jsx
│   │   ├── VideoDetail.jsx
│   │   ├── CommentSection.jsx
│   │   └── UserInfo.jsx
│   ├── App.jsx
│   ├── index.js
│   └── config.js
├── package.json
└── vite.config.js
```

## 界面预览

### 首页 - Cookie 管理
- 显示已添加的账号列表
- 支持添加新账号
- 显示账号状态（有效/过期）

### 搜索页面
- 输入关键词搜索
- 瀑布流展示搜索结果
- 点击查看视频详情

### 详情页面
- 视频完整信息
- 评论列表
- 用户信息
- 数据导出选项

## API 集成

项目与 Crawler 后端服务集成，所有 API 调用通过 Axios 代理。

### 可用接口

| 功能 | 接口 | 方法 |
|------|------|------|
| 添加账号 | /douyin/add_account | POST |
| 账号列表 | /douyin/account_list | GET |
| 过期账号 | /douyin/expire_account | POST |
| 搜索视频 | /douyin/search | GET |
| 视频详情 | /douyin/detail | GET |
| 获取评论 | /douyin/comments | GET |
| 评论回复 | /douyin/replys | GET |
| 用户信息 | /douyin/user | GET |

## 使用说明

### 1. 添加 Cookie
首次使用需要添加抖音账号 Cookie：
1. 点击"添加账号"按钮
2. 输入账号名称
3. 粘贴 Cookie 内容
4. 点击确认

### 2. 搜索视频
1. 在搜索框输入关键词
2. 点击搜索按钮
3. 浏览搜索结果
4. 点击视频卡片查看详情

### 3. 采集评论
1. 打开视频详情页
2. 点击"查看评论"
3. 输入要采集的评论数量
4. 点击"开始采集"

### 4. 导出数据
支持导出为 JSON 或 Excel 格式

## 注意事项

- Cookie 有效期有限，请定期更新
- 采集频率建议控制在合理范围
- 请遵守抖音平台规则
- 仅供学习和研究使用

## License

MIT License
