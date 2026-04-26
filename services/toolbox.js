const path = require('path');

function formatList(items, emptyMessage) {
  if (!items.length) return emptyMessage;
  return items.map((item) => `- ${item}`).join('\n');
}

function formatFileList(entries) {
  if (!entries.length) return 'No files found';
  return entries.map((entry) => `${entry.type === 'directory' ? '📁' : '📄'} ${entry.path} (${entry.size} bytes)`).join('\n');
}

function createToolbox({ storage, runtimeInfo, notify = () => {}, openExternal = async () => false }) {
  const tools = [
    {
      name: 'system.info',
      description: 'รายงานสถานะระบบ เครื่อง และแอป',
      category: 'system',
      payloadExample: { verbose: true }
    },
    {
      name: 'memory.search',
      description: 'ค้น context ที่เคยบันทึกไว้',
      category: 'memory',
      payloadExample: { query: 'Friday' }
    },
    {
      name: 'memory.add',
      description: 'บันทึก context ใหม่ลง memory',
      category: 'memory',
      payloadExample: { text: 'บอสชอบ UI โทนมืด', type: 'manual' }
    },
    {
      name: 'notes.list',
      description: 'ดูโน้ตที่บันทึกไว้',
      category: 'notes',
      payloadExample: {}
    },
    {
      name: 'notes.search',
      description: 'ค้นโน้ตจากคำสำคัญ',
      category: 'notes',
      payloadExample: { query: 'launch' }
    },
    {
      name: 'notes.create',
      description: 'สร้างโน้ตใหม่',
      category: 'notes',
      payloadExample: { title: 'Meeting', text: 'สรุปสิ่งที่ต้องทำ' }
    },
    {
      name: 'files.list',
      description: 'ดูไฟล์ใน workspace root',
      category: 'files',
      payloadExample: { dir: '.' }
    },
    {
      name: 'files.read',
      description: 'อ่านไฟล์ใน workspace root',
      category: 'files',
      payloadExample: { path: 'notes/today.md' }
    },
    {
      name: 'files.write',
      description: 'เขียนไฟล์ใน workspace root',
      category: 'files',
      payloadExample: { path: 'notes/today.md', content: '...' }
    },
    {
      name: 'mac.notify',
      description: 'ส่งแจ้งเตือนผ่าน macOS notification center',
      category: 'mac',
      payloadExample: { title: 'Friday', body: 'Mission complete' }
    },
    {
      name: 'url.open',
      description: 'เปิดลิงก์ภายนอกผ่าน default browser',
      category: 'mac',
      payloadExample: { url: 'https://example.com' }
    }
  ];

  function listTools() {
    return tools;
  }

  function autoToolPlan(prompt) {
    const lower = String(prompt || '').toLowerCase();
    const requests = [];

    if (/(เวลา|time|today|วันนี้|ตอนนี้)/.test(lower)) {
      requests.push({ name: 'system.info', payload: { verbose: true } });
    }

    if (/(จำ|memory|ก่อนหน้า|ย้อนหลัง|บริบท)/.test(lower)) {
      requests.push({ name: 'memory.search', payload: { query: prompt } });
    }

    if (/(โน้ต|note|บันทึก|จำไว้)/.test(lower)) {
      requests.push({
        name: 'notes.create',
        payload: {
          title: prompt.slice(0, 28) || 'Friday note',
          text: prompt,
          tags: ['mission']
        }
      });
    }

    if (/(ไฟล์|file|workspace|เอกสาร)/.test(lower)) {
      requests.push({ name: 'files.list', payload: { dir: '.' } });
    }

    if (/https?:\/\//.test(lower)) {
      const match = String(prompt).match(/https?:\/\/\S+/);
      if (match) {
        requests.push({ name: 'url.open', payload: { url: match[0] } });
      }
    }

    return requests;
  }

  async function executeTool(name, payload = {}) {
    const settings = storage.getSettings();

    switch (name) {
      case 'system.info': {
        const info = {
          platform: runtimeInfo.platform,
          arch: runtimeInfo.arch,
          hostname: runtimeInfo.hostname,
          appVersion: runtimeInfo.appVersion,
          workspaceRoot: storage.getWorkspaceRoot(),
          notificationsEnabled: Boolean(settings.notificationsEnabled),
          memoryCount: storage.listMemory().length,
          noteCount: storage.listNotes().length,
          llmModel: settings.model,
          llmBaseUrl: settings.baseUrl
        };
        return {
          name,
          ok: true,
          output: JSON.stringify(info, null, 2),
          data: info
        };
      }
      case 'memory.search': {
        const query = String(payload.query || '').trim();
        const matches = storage.searchMemory(query);
        return {
          name,
          ok: true,
          output: matches.length ? formatList(matches.map((entry) => entry.text), 'No memory matches') : 'No memory matches',
          data: matches
        };
      }
      case 'memory.add': {
        const text = String(payload.text || '').trim();
        const entries = storage.addMemory(text, payload.type || 'manual');
        return {
          name,
          ok: true,
          output: text ? `Saved memory: ${text}` : 'No text provided',
          data: entries,
          updatedMemory: entries
        };
      }
      case 'notes.list': {
        const notes = storage.listNotes();
        return {
          name,
          ok: true,
          output: notes.length ? notes.map((note) => `${note.title}: ${note.text}`).join('\n') : 'No notes saved yet',
          data: notes
        };
      }
      case 'notes.search': {
        const query = String(payload.query || '').trim();
        const notes = storage.searchNotes(query);
        return {
          name,
          ok: true,
          output: notes.length ? notes.map((note) => `${note.title}: ${note.text}`).join('\n') : 'No note matches',
          data: notes
        };
      }
      case 'notes.create': {
        const notes = storage.addNote(payload);
        const note = notes[0];
        return {
          name,
          ok: true,
          output: note ? `Saved note: ${note.title}` : 'No note text provided',
          data: notes,
          updatedNotes: notes
        };
      }
      case 'files.list': {
        const dir = String(payload.dir || '.').trim() || '.';
        const files = storage.listWorkspaceFiles(dir);
        return {
          name,
          ok: true,
          output: formatFileList(files),
          data: files
        };
      }
      case 'files.read': {
        const filePath = String(payload.path || '').trim();
        const file = storage.readWorkspaceFile(filePath);
        return {
          name,
          ok: true,
          output: file.content,
          data: file
        };
      }
      case 'files.write': {
        const filePath = String(payload.path || '').trim();
        const file = storage.writeWorkspaceFile(filePath, payload.content || '');
        return {
          name,
          ok: true,
          output: `Wrote ${file.path}`,
          data: file
        };
      }
      case 'mac.notify': {
        const title = String(payload.title || 'Friday').trim();
        const body = String(payload.body || 'Mission update').trim();
        notify(title, body);
        return {
          name,
          ok: true,
          output: `Notification sent: ${title} — ${body}`,
          data: { title, body }
        };
      }
      case 'url.open': {
        const url = String(payload.url || '').trim();
        if (!url) {
          return { name, ok: false, output: 'No URL provided' };
        }
        const opened = await openExternal(url);
        return {
          name,
          ok: Boolean(opened),
          output: opened ? `Opened URL: ${url}` : `Could not open URL: ${url}`,
          data: { url, opened }
        };
      }
      default:
        return {
          name,
          ok: false,
          output: `Unknown tool: ${name}`
        };
    }
  }

  return {
    listTools,
    autoToolPlan,
    executeTool
  };
}

module.exports = { createToolbox };
