
#  Lifelong Journey「旅迹」

---

##  功能介绍
| 功能      | 描述                              |
| ------- | ------------------------------- |
| 用户注册/登录 | 支持账号密码验证，信息保存在数据库中              |
| 日志上传    | 支持多图上传、地图打点、内容记录                |
| 日志查询    | 支持关键词搜索、城市筛选、分页显示               |
| 数据统计    | 实时查询标记地点数、日志数、勋章数               |
| 日志导出    | 支持 CSV / PDF 格式导出，含图片插入、分页、美观排版 |
| 地图可视化   | 集成高德地图，展示用户标记路径与地点分布            |

##  技术栈

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

##  桌面端运行环境

| 技术 | 说明 |
|------|------|
| **Electron Builder** | 打包和发布 Electron 应用 |
| **Node.js** | Electron 应用运行环境（用于打包/开发） |
| **npm** | 包管理工具，安装依赖和运行脚本 |
| **Windows 10+** | 桌面客户端开发及运行环境（当前打包平台） |

##  安装与运行

修改项目根目录下.env中mysql配置

▶️ 启动前端：
pnpm -F @journey/frontend dev

▶️ 启动后端：
pnpm -F @journey/backend dev

▶️ 启动 Electron：
pnpm -F @journey/electron dev

▶️ 统一安装某依赖到前端：
pnpm -F @journey/frontend add lodash

▶️ 一键执行全部包的 lint：
pnpm -r lint