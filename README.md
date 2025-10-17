
# Lifelong Journey

基于React + Express的地图打卡日志管理系统。
用户可以在地图上选择地点进行打卡，上传日志与图片，查看个人统计与数据可视化结果。

---

## 项目结构

```

lifelong-journey/
├─ packages/
│  ├─ backend/                 # Node.js + Express 后端服务
│  │  ├─ config/               # 数据库与环境变量配置
│  │  ├─ controllers/          # 控制器层（auth、logs、users、upload 等）
│  │  ├─ middlewares/          # 中间件（auth、errorHandler 等）
│  │  ├─ routes/               # 路由模块化管理
│  │  ├─ utils/                # 工具函数（JWT、文件处理等）
│  │  ├─ public/               # 静态资源目录
│  │  └─ app.js                # 后端应用入口
│  │
│  └─ frontend/                # React + Vite 前端应用
│     ├─ src/
│     │  ├─ api/               # Axios 请求封装与接口定义
│     │  ├─ components/        # 通用组件（Sidebar、LogDetail、AddPanel 等）
│     │  ├─ pages/             # 页面模块（Home、Login、Register）
│     │  ├─ hooks/             # 自定义 Hook（useUserData、useUploadProgress 等）
│     │  ├─ store/             # 全局状态管理（Zustand）
│     │  ├─ utils/             # 工具函数（文件上传、节流防抖等）
│     │  └─ assets/            # 图片、样式与图标资源
│     └─ vite.config.js        # 前端构建配置
│
├─ pnpm-workspace.yaml         # Monorepo 管理配置
└─ README.md

```

## 技术栈

### 前端

| 类别        | 技术                | 说明                                   |
| --------- | ----------------- | ------------------------------------ |
| **框架**    | React 18 + Vite 5 | 采用函数式组件与 Hooks 架构，构建高性能 SPA          |
| **状态管理**  | Zustand           | 轻量级全局状态管理方案，替代 Redux，实现用户登录态、界面状态等共享 |
| **路由管理**  | React Router 6    | 动态路由与嵌套路由配置                          |
| **网络请求**  | Axios             | 统一封装请求与响应拦截，支持 JWT 鉴权                |
| **地图可视化** | 高德地图 JS API 2.0   | 实现地理位置标记、轨迹打卡与热力图展示                  |
| **文件上传**  | 自定义 uploader 模块   | 支持多图上传、断点续传、文件哈希校验与秒传优化              |

### 后端

| 类别       | 技术                       | 说明                              |
| -------- | ------------------------ | ------------------------------- |
| **运行环境** | Node.js 20+              | 使用 ES Module 与 async/await 异步编程 |
| **框架**   | Express 4                | 路由与中间件分层设计                      |
| **数据库**  | MySQL 8 + mysql2/promise | 异步数据库连接与事务处理                    |
| **认证授权** | JWT（jsonwebtoken）        | 访问令牌 + 刷新令牌机制                   |
| **文件处理** | multer + sharp           | 实现多文件上传与图片压缩存储                  |
| **配置管理** | dotenv                   | 环境变量加载与安全隔离                     |
| **跨域支持** | cors                     | 前后端分离开发的跨域配置                    |


## 启动方式

### 后端

```bash
 pnpm dev:backend
```

### 前端

```bash
pnpm build 
pnpm preview
# pnpm  dev
```


## 环境变量配置

`packages/backend/.env`

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
SECRET_KEY =your_secret_key
```

## 核心功能

* 用户注册 / 登录（JWT 鉴权）
* 地图选点打卡标记
* 多图上传
* 日志分页查询、搜索与删除
* 用户统计与标记地点统计
* 打卡热力图与数据图表展示
* 日志导出

