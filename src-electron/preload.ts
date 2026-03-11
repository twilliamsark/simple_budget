// src-electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// Expose safe APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Example: send/receive messages
  send: (channel: string, data: any) => ipcRenderer.send(channel, data),
  on: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
});
