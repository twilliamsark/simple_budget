// src-electron/main.ts
import { app, BrowserWindow } from 'electron/main';
import * as path from 'path';
import * as url from 'url';

let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // optional but recommended
      nodeIntegration: false, // security: keep false
      contextIsolation: true, // security: keep true
      sandbox: true,
    },
  });

  // In dev → use Angular dev server
  // In production → load the built Angular files
  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:4200'); // ng serve port
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/simple_budget/browser/index.html'));
    // or if you use --base-href . → adjust path accordingly
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
