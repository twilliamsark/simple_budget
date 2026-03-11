// src-electron/main.ts
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { pathToFileURL } from 'url';

let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:4200');
    mainWindow.webContents.openDevTools();
  } else {
    // Angular app builder outputs to outputPath/browser/ (extra "browser" segment)
    const indexPath = path.join(__dirname, '..', 'simple_budget', 'browser', 'browser', 'index.html');
    mainWindow.loadURL(pathToFileURL(indexPath).href);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
