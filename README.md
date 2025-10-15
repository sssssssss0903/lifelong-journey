
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
cd packages/backend
pnpm install
pnpm run dev
```

### 前端

```bash
cd packages/frontend
pnpm install
pnpm run dev
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


## 项目亮点

<ul>
 <li> <b>接入高德地图 API</b>：实现地图地理位置标记、坐标拾取与热力图显示功能， 支持用户在全国范围内选择任意位置进行日志打卡，并动态可视化地理分布。 </li> 
 <li> <b>构建数据可视化面板</b>：基于 <b>ECharts</b> 实现多维度统计展示， 包括日志上传趋势、地区分布热力图、城市打卡数量排行等图表， 帮助用户直观了解个人活动轨迹与成长过程。 </li> 
 <li> <b>文件上传模块优化</b>：支持多图上传与预览， 使用 <b>文件分块上传</b> + <b>文件 Hash 校验</b> 实现断点续传与秒传功能， 大幅提升上传性能与用户体验。 </li> 
 
 <li> <b>Axios 请求封装</b>：统一封装 <code>Axios</code> 实例， 通过请求拦截器自动注入 <code>Authorization</code> Token， 响应拦截器集中处理异常与鉴权失效（401 自动跳转登录）， 提高接口调用安全性与可维护性。 </li> 

 <li> <b>JWT 鉴权机制</b>：后端基于 <code>jsonwebtoken</code> 实现身份认证， 登录成功后颁发 Token 并存储于前端， 通过中间件 <code>authMiddleware</code> 对受保护路由进行权限校验， 保证数据访问安全。 </li>
 
  <li> <b>多格式导出功能</b>：支持将日志数据与图表结果导出为 PDF 或 CSV， 自动生成图文报告用于归档与分享，提升数据可移植性。 </li> 
  
  <li> <b>渲染与交互性能优化</b>： 使用 React Hooks（<code>useMemo</code>、<code>useCallback</code>）优化渲染， 引入懒加载与条件渲染减少不必要的重绘， 保证地图与图表在大量数据下依然保持流畅。 </li> 
  
  <li> <b>后端 RESTful 服务架构</b>： 基于 <code>Node.js + Express + MySQL</code> 构建， 模块化划分控制器、路由与中间件， 提供日志分页查询、模糊搜索、标记统计等接口， 数据结构清晰、扩展性强。 </li> 
  <li> <b>多用户数据隔离</b>： 为每位用户动态创建独立日志表（<code>{username}_log</code>）， 实现用户数据分库管理与高并发安全存储。 </li>

   <li> <b>跨域与安全配置</b>： 使用 <code>cors</code> 精确设置跨域白名单， 支持携带 Cookie 与 Token， 配合 <code>dotenv</code> 管理环境变量与数据库密钥，确保部署安全。 </li> </ul>

- 项目通过 Gzip 与 Brotli 双压缩、图片资源自动优化（mozjpeg + WebP）、SVGR 内联矢量图、路径别名与按环境构建策略，实现前端加载速度与运行性能的显著提升

