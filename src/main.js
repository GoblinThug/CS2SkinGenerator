const { app, BrowserWindow, ipcMain } = require('electron');

const path = require('path');

let win = null;

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
    
        frame: false,
        transparent: true,
    
        backgroundColor: '#00000000',
    
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile('src/renderer/index.html');
    autoUpdater.checkForUpdatesAndNotify();
}

ipcMain.handle('window:minimize', () => {
    win?.minimize();
});

ipcMain.handle('window:maximize', () => {
    if (!win) return;

    if (win.isMaximized()) {
        win.unmaximize();
    } else {
        win.maximize();
    }
});

ipcMain.handle('window:close', () => {
    win?.close();
});

ipcMain.handle('app:reload', () => {
    win?.webContents.reloadIgnoringCache();
});

ipcMain.handle('app:devtools', () => {
  win?.webContents.toggleDevTools();
});

app.whenReady().then(createWindow);