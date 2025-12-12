const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    // 1. 隐藏标准标题栏
    titleBarStyle: 'hidden',
    // 2. 关键修改：让右上角按钮背景“透明”，且图标变成“白色”
    titleBarOverlay: {
      color: '#00000000', // 设为完全透明 (8位hex代码，后两位00代表透明度)
      symbolColor: '#5d6565', // 图标设为白色，配合你的深色/彩色背景
      height: 35
    },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // 3. 关键修改：把这一行注释掉，就不会自动弹出控制台了
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});