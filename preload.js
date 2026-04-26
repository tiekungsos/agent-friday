const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fridayDesktop', {
  platform: process.platform,
  appName: 'Friday // JARVIS for Mac',
  bootstrap: () => ipcRenderer.invoke('app:bootstrap'),
  processMission: (prompt) => ipcRenderer.invoke('assistant:process-mission', prompt),
  runTool: (name, payload) => ipcRenderer.invoke('tool:run', name, payload),
  listTools: () => ipcRenderer.invoke('tools:list'),
  saveMemory: (payload) => ipcRenderer.invoke('memory:add', payload),
  listMemory: () => ipcRenderer.invoke('memory:list'),
  searchMemory: (query) => ipcRenderer.invoke('memory:search', query),
  listNotes: () => ipcRenderer.invoke('notes:list'),
  addNote: (payload) => ipcRenderer.invoke('notes:add', payload),
  searchNotes: (query) => ipcRenderer.invoke('notes:search', query),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (payload) => ipcRenderer.invoke('settings:update', payload),
  listWorkspaceFiles: (dir) => ipcRenderer.invoke('workspace:list', dir),
  readWorkspaceFile: (filePath) => ipcRenderer.invoke('workspace:read', filePath),
  writeWorkspaceFile: (payload) => ipcRenderer.invoke('workspace:write', payload)
});
