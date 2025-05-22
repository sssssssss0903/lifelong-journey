
# 🧭 Lifelong Journey

---

## 🧱 架构

| 技术 | 说明 |
|------|------|
| **React** | 构建用户界面，采用组件化开发 |
| **Vite** | 新一代前端构建工具，极速热更新，快速打包 |
| **JavaScript (ES6+)** | 项目主要编程语言 |
| **Electron** | 构建跨平台桌面应用 |
| **HTML5 + CSS3** | 页面结构与样式 |
| **模块化资源管理** | 前端采用 `import` 语法（ESModule），后端 Node.js 采用 `require`（CommonJS） |


---

## 🖥️ 桌面端运行环境

| 技术 | 说明 |
|------|------|
| **Electron Builder** | 打包和发布 Electron 应用 |
| **Node.js** | Electron 应用运行环境（用于打包/开发） |
| **npm** | 包管理工具，安装依赖和运行脚本 |
| **Windows 10+** | 桌面客户端开发及运行环境（当前打包平台） |

## 📦 安装与运行

修改项目根目录下.env中mysql配置如：
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
```
启动本地服务器
```bash
cd src
node server.cjs
```

 安装依赖
```bash
npm install
```
启动网页端
```bash
npm run dev
```
构建生产环境前端页面
```bash
npm run build
```
🖥 启动桌面应用

 本项目内含 Electron 主进程文件，可配合 electron-builder 打包为桌面客户端。


```bash
npm run electron:dev
```
