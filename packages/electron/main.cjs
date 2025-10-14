const { app, BrowserWindow } = require('electron');
const { fork } = require('child_process');
const path = require('path');
const url = require('url');

// 启动本地 Express 后端服务
function startServer() {
  const serverPath = path.join(__dirname, '../server.cjs');
  try {
    const server = fork(serverPath, {
     stdio: 'inherit',
      detached: true
    });
    server.unref(); // 确保主进程退出不阻塞
    console.log('[main] Server started:', serverPath);
  } catch (err) {
    console.error('[main] Failed to start server:', err);
  }
}

//  创建前端窗口
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
     icon: path.join(__dirname, '../src/assets/icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (app.isPackaged) {
    // 加载构建后的页面
    const indexPath = url.format({
      pathname: path.join(__dirname, '../dist/index.html'),
      protocol: 'file:',
      slashes: true
    });
    win.loadURL(indexPath);
  } else {
    // 加载开发服务器
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools(); // 开发时打开控制台
  }
}

//  启动主进程入口
app.whenReady().then(() => {
  startServer();       // 启动本地 Express 服务
  createWindow();      // 创建界面窗口

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
