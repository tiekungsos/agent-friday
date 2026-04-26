const { app, BrowserWindow, nativeTheme, ipcMain, Tray, Menu, nativeImage, globalShortcut, Notification, shell } = require('electron');
const path = require('path');
const os = require('os');
const { createStorage } = require('./services/storage');
const { processMission, AGENTS, buildToolbox } = require('./services/assistant');
const { createToolbox } = require('./services/toolbox');

let mainWindow;
let tray;
let storage;

function getRuntimeInfo() {
  return {
    platform: process.platform,
    arch: process.arch,
    hostname: os.hostname(),
    appVersion: app.getVersion(),
    appPath: app.getAppPath(),
    userDataPath: app.getPath('userData')
  };
}

function getLLMConfig() {
  const settings = storage ? storage.getSettings() : {};
  return {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.OPENAI_BASE_URL || settings.baseUrl || 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || settings.model || 'gpt-4.1-mini'
  };
}

function canNotify() {
  return Notification.isSupported() && Boolean(storage?.getSettings().notificationsEnabled);
}

function showNotification(title, body) {
  if (!canNotify()) return false;
  const notification = new Notification({
    title,
    body,
    silent: false
  });
  notification.show();
  return true;
}

function createToolboxBridge() {
  return createToolbox({
    storage,
    runtimeInfo: getRuntimeInfo(),
    notify: showNotification,
    openExternal: shell.openExternal
  });
}

function registerIpc() {
  ipcMain.handle('app:bootstrap', async () => {
    const toolbox = createToolboxBridge();
    return {
      appName: 'Friday // JARVIS for Mac',
      platform: process.platform,
      agents: AGENTS,
      memories: storage.listMemory().slice(0, 12),
      notes: storage.listNotes().slice(0, 12),
      settings: storage.getSettings(),
      tools: toolbox.listTools(),
      llmEnabled: Boolean(getLLMConfig().apiKey),
      runtimeInfo: getRuntimeInfo()
    };
  });

  ipcMain.handle('assistant:process-mission', async (_event, prompt) => {
    const toolbox = createToolboxBridge();
    return processMission({
      prompt,
      storage,
      runtimeInfo: getRuntimeInfo(),
      llmConfig: getLLMConfig(),
      toolbox,
      notify: showNotification,
      openExternal: shell.openExternal
    });
  });

  ipcMain.handle('tool:run', async (_event, toolName, payload) => {
    const toolbox = createToolboxBridge();
    return toolbox.executeTool(toolName, payload || {});
  });

  ipcMain.handle('tools:list', async () => createToolboxBridge().listTools());
  ipcMain.handle('memory:add', async (_event, payload) => storage.addMemory(payload?.text || '', payload?.type || 'manual').slice(0, 12));
  ipcMain.handle('memory:list', async () => storage.listMemory().slice(0, 12));
  ipcMain.handle('memory:search', async (_event, query) => storage.searchMemory(query));
  ipcMain.handle('notes:list', async () => storage.listNotes().slice(0, 12));
  ipcMain.handle('notes:add', async (_event, payload) => storage.addNote(payload || {}).slice(0, 12));
  ipcMain.handle('notes:search', async (_event, query) => storage.searchNotes(query));
  ipcMain.handle('settings:get', async () => storage.getSettings());
  ipcMain.handle('settings:update', async (_event, partial) => storage.updateSettings(partial || {}));
  ipcMain.handle('workspace:list', async (_event, dir) => storage.listWorkspaceFiles(dir || '.'));
  ipcMain.handle('workspace:read', async (_event, filePath) => storage.readWorkspaceFile(filePath));
  ipcMain.handle('workspace:write', async (_event, payload) => storage.writeWorkspaceFile(payload?.path || '', payload?.content || ''));
}

function createAppIcon() {
  const svg = `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#68a2ff"/><stop offset="1" stop-color="#7c63ff"/></linearGradient></defs><rect width="256" height="256" rx="72" fill="#050816"/><circle cx="128" cy="128" r="78" fill="url(#g)" opacity="0.24"/><circle cx="128" cy="128" r="52" fill="url(#g)"/><path d="M92 128h72" stroke="white" stroke-width="14" stroke-linecap="round"/><path d="M128 92v72" stroke="white" stroke-width="14" stroke-linecap="round"/></svg>`;
  return nativeImage.createFromDataURL(`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`);
}

function createTray() {
  if (tray) return tray;
  tray = new Tray(createAppIcon());
  tray.setToolTip('Friday // JARVIS for Mac');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open Friday', click: showMainWindow },
    { label: 'New Mission', click: () => mainWindow?.webContents.send('ui:tray-action', 'mission') },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } }
  ]));
  tray.on('click', showMainWindow);
  return tray;
}

function showMainWindow() {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function toggleMainWindow() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    showMainWindow();
  }
}

function registerShortcuts() {
  globalShortcut.unregisterAll();
  globalShortcut.register('CommandOrControl+Shift+Space', toggleMainWindow);
}

function createWindow() {
  nativeTheme.themeSource = 'dark';

  mainWindow = new BrowserWindow({
    width: 1560,
    height: 980,
    minWidth: 1200,
    minHeight: 760,
    title: 'Friday // JARVIS for Mac',
    backgroundColor: '#050816',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 16 },
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

app.whenReady().then(() => {
  storage = createStorage(app.getPath('userData'));
  registerIpc();
  createWindow();
  createTray();
  registerShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      showMainWindow();
    }
  });
});

app.on('before-quit', () => {
  app.isQuitting = true;
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
