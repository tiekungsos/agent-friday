const fs = require('fs');
const path = require('path');
const os = require('os');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function createStorage(baseDir) {
  const storageDir = path.join(baseDir, 'friday-jarvis');
  const memoryFile = path.join(storageDir, 'memory.json');
  const settingsFile = path.join(storageDir, 'settings.json');
  const notesFile = path.join(storageDir, 'notes.json');
  ensureDir(storageDir);

  const defaultWorkspaceRoot = path.join(os.homedir(), 'Documents', 'FridayWorkspace');

  function getDefaultSettings() {
    return {
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4.1-mini',
      notificationsEnabled: true,
      workspaceRoot: defaultWorkspaceRoot,
      memoryRetention: 50
    };
  }

  function listMemory() {
    const entries = readJson(memoryFile, []);
    return (Array.isArray(entries) ? entries : [])
      .filter((entry) => entry && typeof entry.text === 'string')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function addMemory(text, type = 'manual') {
    const trimmed = String(text || '').trim();
    if (!trimmed) return listMemory();

    const entries = listMemory();
    entries.unshift({
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      text: trimmed,
      type,
      createdAt: new Date().toISOString()
    });

    writeJson(memoryFile, entries.slice(0, getSettings().memoryRetention || 50));
    return listMemory();
  }

  function searchMemory(query) {
    const lower = String(query || '').toLowerCase();
    if (!lower) return [];
    return listMemory().filter((entry) => entry.text.toLowerCase().includes(lower)).slice(0, 8);
  }

  function getSettings() {
    return {
      ...getDefaultSettings(),
      ...readJson(settingsFile, {})
    };
  }

  function updateSettings(partial = {}) {
    const next = {
      ...getSettings(),
      ...partial
    };
    if (typeof next.memoryRetention !== 'number' || Number.isNaN(next.memoryRetention)) {
      next.memoryRetention = getDefaultSettings().memoryRetention;
    }
    next.memoryRetention = Math.max(10, Math.min(200, Math.floor(next.memoryRetention)));
    ensureWorkspaceRoot(next.workspaceRoot);
    writeJson(settingsFile, next);
    return next;
  }

  function ensureWorkspaceRoot(workspaceRoot) {
    const resolved = path.resolve(String(workspaceRoot || defaultWorkspaceRoot));
    ensureDir(resolved);
    return resolved;
  }

  function getWorkspaceRoot() {
    return ensureWorkspaceRoot(getSettings().workspaceRoot);
  }

  function resolveWorkspacePath(requestedPath = '.') {
    const root = getWorkspaceRoot();
    const target = path.resolve(root, String(requestedPath || '.'));
    if (path.relative(root, target).startsWith('..')) {
      throw new Error('Path escapes workspace root');
    }
    return target;
  }

  function listWorkspaceFiles(relativeDir = '.') {
    const targetDir = resolveWorkspacePath(relativeDir);
    ensureDir(targetDir);
    return fs.readdirSync(targetDir, { withFileTypes: true }).map((entry) => {
      const abs = path.join(targetDir, entry.name);
      const stat = fs.statSync(abs);
      return {
        name: entry.name,
        path: path.relative(getWorkspaceRoot(), abs),
        type: entry.isDirectory() ? 'directory' : 'file',
        size: stat.size,
        modifiedAt: stat.mtime.toISOString()
      };
    });
  }

  function readWorkspaceFile(relativePath) {
    const abs = resolveWorkspacePath(relativePath);
    const content = fs.readFileSync(abs, 'utf8');
    return {
      path: path.relative(getWorkspaceRoot(), abs),
      content
    };
  }

  function writeWorkspaceFile(relativePath, content) {
    const abs = resolveWorkspacePath(relativePath);
    ensureDir(path.dirname(abs));
    fs.writeFileSync(abs, String(content ?? ''), 'utf8');
    return readWorkspaceFile(relativePath);
  }

  function listNotes() {
    const notes = readJson(notesFile, []);
    return (Array.isArray(notes) ? notes : [])
      .filter((note) => note && typeof note.text === 'string')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function addNote(payload = {}) {
    const title = String(payload.title || '').trim() || 'Quick note';
    const text = String(payload.text || payload.body || '').trim();
    if (!text) return listNotes();

    const notes = listNotes();
    notes.unshift({
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      title,
      text,
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      createdAt: new Date().toISOString()
    });
    writeJson(notesFile, notes.slice(0, 100));
    return listNotes();
  }

  function searchNotes(query) {
    const lower = String(query || '').toLowerCase();
    if (!lower) return [];
    return listNotes().filter((note) => {
      return note.title.toLowerCase().includes(lower) || note.text.toLowerCase().includes(lower);
    }).slice(0, 8);
  }

  return {
    storageDir,
    memoryFile,
    settingsFile,
    notesFile,
    getSettings,
    updateSettings,
    listMemory,
    addMemory,
    searchMemory,
    listNotes,
    addNote,
    searchNotes,
    getWorkspaceRoot,
    resolveWorkspacePath,
    listWorkspaceFiles,
    readWorkspaceFile,
    writeWorkspaceFile
  };
}

module.exports = { createStorage };
