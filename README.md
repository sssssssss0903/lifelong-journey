
# 🧭 Lifelong Journey「旅迹」

---
## 🌟 功能介绍
| 功能      | 描述                              |
| ------- | ------------------------------- |
| 用户注册/登录 | 支持账号密码验证，信息保存在数据库中              |
| 日志上传    | 支持多图上传、地图打点、内容记录                |
| 日志查询    | 支持关键词搜索、城市筛选、分页显示               |
| 数据统计    | 实时查询标记地点数、日志数、勋章数               |
| 日志导出    | 支持 CSV / PDF 格式导出，含图片插入、分页、美观排版 |
| 地图可视化   | 集成高德地图，展示用户标记路径与地点分布            |

## ⚙ 技术栈

| 类别         | 技术       |
|--------------|------------|
| 前端框架     | React + Vite |
| 地图服务     | AMap 高德地图 JS API v2.0 |
| 数据可视化   | ECharts |
| 后端         | Node.js + Express |
| 数据库       | MySQL |
| 文件上传     | multer |
| 导出支持     | json2csv + pdfkit |


---

## 🖥️ 桌面端运行环境

| 技术 | 说明 |
|------|------|
| **Electron Builder** | 打包和发布 Electron 应用 |
| **Node.js** | Electron 应用运行环境（用于打包/开发） |
| **npm** | 包管理工具，安装依赖和运行脚本 |
| **Windows 10+** | 桌面客户端开发及运行环境（当前打包平台） |

## 📦 安装与运行

1.修改项目根目录下.env中mysql配置如：
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
```
2. 安装依赖
```bash
npm install
```

3. 启动桌面应用

 本项目内含 Electron 主进程文件，可配合 electron-builder 打包为桌面客户端。

```bash
npm run pack
```
打包成功后运行dist\win-unpacked下的应用程序即可。

ps：网页端启动方法
启动本地服务器
```bash
node server.cjs
```
启动网页端
```bash
npm run dev
```