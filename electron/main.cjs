const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 可选
      webSecurity: false,                          //  关键：关闭 CORS 安全策略
      contextIsolation: false,                     // 若使用 Node.js 模块可禁用隔离
      nodeIntegration: true,                       // 前端需使用 Node 模块
    },
  });

  if (app.isPackaged) {
    // 构造 file 协议地址
    const indexPath = url.format({
      pathname: path.join(__dirname, '../dist/index.html'),
      protocol: 'file:',
      slashes: true,
    });

    win.loadURL(indexPath); //  加载本地文件
  } else {
    win.loadURL('http://localhost:5173'); // 开发环境加载 Vite 服务器
  }
}

app.whenReady().then(createWindow);
