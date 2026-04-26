const state = {
  bootstrap: null,
  missions: 0,
  listening: false,
  recognition: null,
  tools: [],
  selectedTool: null
};

const els = {
  agentList: document.getElementById('agentList'),
  activityFeed: document.getElementById('activityFeed'),
  dispatchLog: document.getElementById('dispatchLog'),
  memoryList: document.getElementById('memoryList'),
  notesList: document.getElementById('notesList'),
  voiceToggleBtn: document.getElementById('voiceToggleBtn'),
  missionBtn: document.getElementById('missionBtn'),
  dispatchBtn: document.getElementById('dispatchBtn'),
  saveMemoryBtn: document.getElementById('saveMemoryBtn'),
  clearBtn: document.getElementById('clearBtn'),
  commandInput: document.getElementById('commandInput'),
  orbCore: document.getElementById('orbCore'),
  orbState: document.getElementById('orbState'),
  transcriptText: document.getElementById('transcriptText'),
  missionCount: document.getElementById('missionCount'),
  activeAgentCount: document.getElementById('activeAgentCount'),
  objectiveCount: document.getElementById('objectiveCount'),
  modeText: document.getElementById('modeText'),
  feedMode: document.getElementById('feedMode'),
  platformText: document.getElementById('platformText'),
  memoryCountText: document.getElementById('memoryCountText'),
  noteCountText: document.getElementById('noteCountText'),
  intelligenceMode: document.getElementById('intelligenceMode'),
  brainSummary: document.getElementById('brainSummary'),
  objectiveList: document.getElementById('objectiveList'),
  riskList: document.getElementById('riskList'),
  fridayResponse: document.getElementById('fridayResponse'),
  executionPlanList: document.getElementById('executionPlanList'),
  reviewChecklist: document.getElementById('reviewChecklist'),
  toolSelect: document.getElementById('toolSelect'),
  toolPayloadInput: document.getElementById('toolPayloadInput'),
  toolRunBtn: document.getElementById('toolRunBtn'),
  toolAutoBtn: document.getElementById('toolAutoBtn'),
  toolOutput: document.getElementById('toolOutput'),
  baseUrlInput: document.getElementById('baseUrlInput'),
  modelInput: document.getElementById('modelInput'),
  workspaceInput: document.getElementById('workspaceInput'),
  notificationsToggle: document.getElementById('notificationsToggle'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn'),
  settingsStatus: document.getElementById('settingsStatus')
};

function pretty(value) {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function addFeed(title, detail, meta = 'Friday command center') {
  const item = document.createElement('article');
  item.className = 'feed-item';
  item.innerHTML = `<strong>${title}</strong><p>${detail}</p><small>${meta}</small>`;
  els.activityFeed.prepend(item);
}

function addDispatch(agentName, task) {
  const item = document.createElement('article');
  item.className = 'log-item';
  item.innerHTML = `<strong>${agentName}</strong><p>${task}</p><small>assigned by Friday</small>`;
  els.dispatchLog.prepend(item);
}

function renderAgents(agents = []) {
  els.agentList.innerHTML = agents
    .map(
      (agent) => `
      <article class="agent-item">
        <div class="agent-avatar">${agent.name[0]}</div>
        <div>
          <h4>${agent.name}</h4>
          <div class="agent-role">${agent.role}</div>
          <div class="agent-focus">${agent.specialty}</div>
        </div>
      </article>`
    )
    .join('');
}

function renderMemory(memories = []) {
  els.memoryCountText.textContent = `${memories.length} saved notes`;
  if (!memories.length) {
    els.memoryList.innerHTML = '<article class="memory-item"><strong>ยังไม่มี memory</strong><p>กด “บันทึกลง memory” หลังใส่คำสั่ง เพื่อให้ฟรายเดย์จำ context สำคัญไว้ในเครื่อง</p><small>on-device storage</small></article>';
    return;
  }

  els.memoryList.innerHTML = memories
    .map(
      (entry) => `
        <article class="memory-item">
          <strong>${entry.type === 'mission' ? 'Mission memory' : 'Quick memory'}</strong>
          <p>${entry.text}</p>
          <small>${new Date(entry.createdAt).toLocaleString('th-TH')}</small>
        </article>`
    )
    .join('');
}

function renderNotes(notes = []) {
  els.noteCountText.textContent = `${notes.length} saved notes`;
  if (!notes.length) {
    els.notesList.innerHTML = '<article class="memory-item"><strong>ยังไม่มี note</strong><p>ใช้ tool notes.create เพื่อบันทึกโน้ตใหม่ แล้วมันจะโผล่ตรงนี้</p><small>Friday notes</small></article>';
    return;
  }

  els.notesList.innerHTML = notes
    .map(
      (note) => `
        <article class="memory-item">
          <strong>${note.title}</strong>
          <p>${note.text}</p>
          <small>${new Date(note.createdAt).toLocaleString('th-TH')}</small>
        </article>`
    )
    .join('');
}

function renderTools(tools = []) {
  state.tools = tools;
  if (!tools.length) {
    els.toolSelect.innerHTML = '<option value="">No tools available</option>';
    return;
  }

  els.toolSelect.innerHTML = tools
    .map((tool, index) => {
      const example = JSON.stringify(tool.payloadExample || {}, null, 2);
      return `<option value="${tool.name}" data-index="${index}" data-example='${example.replace(/'/g, '&apos;')}'>${tool.name}</option>`;
    })
    .join('');

  state.selectedTool = tools[0].name;
  els.toolSelect.value = state.selectedTool;
  syncToolPayloadExample();
}

function syncToolPayloadExample() {
  const tool = state.tools.find((item) => item.name === els.toolSelect.value) || state.tools[0];
  if (!tool) return;
  state.selectedTool = tool.name;
  els.toolPayloadInput.value = pretty(tool.payloadExample || {});
}

function updateIntelligence(analysis) {
  els.intelligenceMode.textContent = analysis.intent?.toUpperCase() || 'IDLE';
  els.brainSummary.textContent = analysis.refinedSummary || analysis.summary || 'ยังไม่มีการวิเคราะห์';
  els.fridayResponse.textContent = analysis.reply || analysis.response || 'ยังไม่มีคำตอบจาก Friday';
  els.objectiveList.innerHTML = (analysis.objectives || []).map((item) => `<li>${item}</li>`).join('');
  els.riskList.innerHTML = (analysis.risks || []).map((item) => `<li>${item}</li>`).join('');
  els.objectiveCount.textContent = (analysis.objectives || []).length;

  els.executionPlanList.innerHTML = (analysis.executionPlan || [])
    .map(
      (step) => `
        <li>
          <strong>${step.task}</strong>
          <span class="plan-owner">Owner: ${step.owner}</span>
          <div>${step.detail}</div>
          <div class="plan-owner">Output: ${step.output}</div>
        </li>`
    )
    .join('');

  els.reviewChecklist.innerHTML = (analysis.reviewerChecklist || [])
    .map((item) => `<li>${item}</li>`)
    .join('');
}

function renderSettings(settings = {}) {
  els.baseUrlInput.value = settings.baseUrl || '';
  els.modelInput.value = settings.model || '';
  els.workspaceInput.value = settings.workspaceRoot || '';
  els.notificationsToggle.checked = Boolean(settings.notificationsEnabled);
  els.settingsStatus.textContent = `workspace: ${settings.workspaceRoot || 'not set'} • notifications: ${settings.notificationsEnabled ? 'on' : 'off'}`;
}

async function saveMemory(text, type = 'manual') {
  const memories = await window.fridayDesktop.saveMemory({ text, type });
  renderMemory(memories);
}

async function saveSettings() {
  const payload = {
    baseUrl: els.baseUrlInput.value.trim(),
    model: els.modelInput.value.trim(),
    workspaceRoot: els.workspaceInput.value.trim(),
    notificationsEnabled: els.notificationsToggle.checked
  };
  const settings = await window.fridayDesktop.updateSettings(payload);
  renderSettings(settings);
  addFeed('Settings saved', 'บันทึกค่าตั้งต้นสำหรับ LLM, workspace และการแจ้งเตือนแล้ว', 'settings');
}

function parseToolPayload() {
  const raw = els.toolPayloadInput.value.trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Payload JSON ไม่ถูกต้อง: ${error.message}`);
  }
}

function renderToolResult(result) {
  els.toolOutput.textContent = pretty(result);
}

async function executeSelectedTool() {
  const toolName = els.toolSelect.value || state.selectedTool;
  if (!toolName) return;

  let payload;
  try {
    payload = parseToolPayload();
  } catch (error) {
    els.toolOutput.textContent = error.message;
    addFeed('Tool payload error', error.message, 'tool bench');
    return;
  }

  addFeed('Tool requested', `${toolName} ถูกส่งด้วย payload: ${pretty(payload)}`, 'tool bench');
  const result = await window.fridayDesktop.runTool(toolName, payload);
  renderToolResult(result);

  if (result.updatedMemory) {
    renderMemory(result.updatedMemory);
  }
  if (result.updatedNotes) {
    renderNotes(result.updatedNotes);
  }

  addFeed(
    result.ok ? 'Tool complete' : 'Tool failed',
    result.output || 'no output',
    toolName
  );
}

async function dispatchMission(prompt) {
  const trimmed = String(prompt || '').trim();
  if (!trimmed) {
    els.transcriptText.textContent = 'บอสยังไม่ได้ใส่คำสั่งค่ะ ลองพิมพ์โจทย์ก่อน แล้วฟรายเดย์จะเริ่มกระจายงานให้ทีม';
    addFeed('ไม่มีคำสั่งใหม่', 'ระบบรอรับคำสั่งจากบอสอยู่ค่ะ', 'input required');
    return;
  }

  els.transcriptText.textContent = trimmed;
  els.modeText.textContent = 'Mission Dispatch';
  els.feedMode.textContent = 'Processing mission';
  els.dispatchLog.innerHTML = '';
  addFeed('Mission received', `ฟรายเดย์กำลังประมวลผลคำสั่ง: “${trimmed}”`, 'processing');

  const result = await window.fridayDesktop.processMission(trimmed);
  if (result.error) {
    addFeed('Mission failed', 'ไม่สามารถประมวลผลคำสั่งนี้ได้', result.error);
    return;
  }

  state.missions += 1;
  els.missionCount.textContent = state.missions;
  els.activeAgentCount.textContent = result.analysis.selectedAgents.length;
  updateIntelligence(result.analysis);
  renderMemory(result.memories);
  renderNotes(result.notes);
  renderTools(result.tools || state.tools);

  const taskTemplates = {
    'ฟรายเดย์': 'สรุปโจทย์, แตกงาน, และรวมคำตอบสุดท้ายให้บอส',
    'เรย์': 'วาง roadmap และลำดับ execution สำหรับ mission นี้',
    'มีน': 'หา reference และ insight ที่ช่วยตัดสินใจเร็วขึ้น',
    'นาวา': 'แตก requirement เชิงธุรกิจและจัดกลุ่ม use case',
    'ลูนา': 'ออกแบบ user flow และภาพประสบการณ์ใช้งาน',
    'โซล': 'สร้าง interface/หน้าจอที่ผู้ใช้ต้องเห็นจริง',
    'ไค': 'คิดระบบหลังบ้านและ data flow ที่จำเป็น',
    'เอด้า': 'ออกแบบ AI/automation flow และ command orchestration',
    'พิกเซล': 'กำหนดจุด review และความเสี่ยงที่ต้องตรวจ',
    'โนว่า': 'สรุปคำอธิบาย, copy และ messaging ให้ชัด',
    'วีรา': 'คุมความพร้อมก่อนส่งมอบและ release plan'
  };

  result.analysis.selectedAgents.forEach((agent) => addDispatch(agent.name, taskTemplates[agent.name] || agent.specialty));

  if (result.autoToolRequests?.length) {
    result.autoToolRequests.forEach((tool) => {
      addFeed('Auto tool plan', `${tool.name} suggested for this mission`, 'planner');
    });
  }

  if (result.toolResults?.length) {
    result.toolResults.forEach((tool) => {
      addFeed('Tool used', `${tool.name} → ${tool.output}`, 'tool execution');
    });
  }

  if (result.llmEnabled) {
    addFeed(
      result.llmError ? 'LLM fallback mode' : 'LLM response ready',
      result.llmError
        ? `เรียกใช้โมเดลไม่สำเร็จ จึงใช้ local brain แทน (${result.llmError})`
        : 'Friday ได้ใช้ LLM จริงในการ refine คำตอบรอบนี้แล้ว',
      result.llmError ? 'llm error' : 'llm success'
    );
  } else {
    addFeed('LLM not configured', 'ตอนนี้ยังใช้ local brain อยู่ เพราะยังไม่ได้ตั้ง OPENAI_API_KEY', 'local-only');
  }

  addFeed(
    'Friday dispatched a new mission',
    `ฟรายเดย์เลือก ${result.analysis.selectedAgents.map((agent) => agent.name).join(', ')} เพื่อช่วยกันทำงานจากโจทย์: “${trimmed}”`,
    `mission #${state.missions}`
  );

  els.feedMode.textContent = 'Active dispatching';
}

function setupVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.lang = 'th-TH';
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onresult = (event) => {
    const text = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(' ')
      .trim();

    if (text) {
      els.commandInput.value = text;
      els.transcriptText.textContent = text;
    }
  };

  recognition.onerror = (event) => {
    addFeed('Voice error', `ระบบรับเสียงมีปัญหา: ${event.error}`, 'voice');
  };

  recognition.onend = () => {
    if (state.listening) {
      try { recognition.start(); } catch {}
    }
  };

  return recognition;
}

function toggleListening() {
  state.listening = !state.listening;
  els.orbCore.classList.toggle('listening', state.listening);
  els.orbState.textContent = state.listening ? 'LISTENING' : 'STANDBY';
  els.voiceToggleBtn.textContent = state.listening ? 'หยุดโหมดฟังเสียง' : 'เริ่มโหมดฟังเสียง';
  els.modeText.textContent = state.listening ? 'Voice Listening' : 'Command Center';
  els.feedMode.textContent = state.listening ? 'Voice mode active' : 'Passive monitoring';

  if (!state.recognition) state.recognition = setupVoiceRecognition();

  if (state.recognition) {
    try {
      if (state.listening) state.recognition.start();
      else state.recognition.stop();
    } catch {}
  }

  const detail = state.listening
    ? state.recognition
      ? 'ฟรายเดย์เข้าสู่โหมดฟังเสียงแล้ว พร้อมรับคำสั่งแบบ JARVIS-style บน MacBook'
      : 'เข้าสู่โหมดฟังเสียงจำลองแล้ว — เครื่องนี้ยังไม่มี speech recognition ให้ใช้งาน'
    : 'ฟรายเดย์ออกจากโหมดฟังเสียง กลับสู่โหมดศูนย์บัญชาการปกติ';

  els.transcriptText.textContent = state.listening
    ? 'Listening... ลองสั่งงานเช่น “เรียกทีมวิเคราะห์”, “วางแผนโปรเจกต์ใหม่”, หรือ “สรุปสิ่งที่ต้องทำวันนี้”'
    : 'พร้อมรับคำสั่งจากบอส เช่น “สรุปงานวันนี้”, “เรียกทีมวิเคราะห์”, หรือ “วางแผนโปรเจกต์ใหม่”';

  addFeed(state.listening ? 'Voice mode started' : 'Voice mode stopped', detail, 'voice control');
}

function bindEvents() {
  els.voiceToggleBtn.addEventListener('click', toggleListening);
  els.missionBtn.addEventListener('click', () => {
    const prompt = 'ช่วยออกแบบผู้ช่วย AI แบบ JARVIS สำหรับธุรกิจ แล้วแตกงานให้ทีมว่าใครทำอะไรบ้าง';
    els.commandInput.value = prompt;
    dispatchMission(prompt);
  });
  els.dispatchBtn.addEventListener('click', () => dispatchMission(els.commandInput.value));
  els.saveMemoryBtn.addEventListener('click', async () => {
    const text = els.commandInput.value || els.transcriptText.textContent;
    await saveMemory(text, 'manual');
    addFeed('Memory saved', 'ฟรายเดย์บันทึก context นี้ลง local memory แล้ว', 'memory');
  });
  els.clearBtn.addEventListener('click', () => {
    els.commandInput.value = '';
    els.transcriptText.textContent = 'พร้อมรับคำสั่งจากบอส เช่น “สรุปงานวันนี้”, “เรียกทีมวิเคราะห์”, หรือ “วางแผนโปรเจกต์ใหม่”';
  });
  els.commandInput.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') dispatchMission(els.commandInput.value);
  });
  document.querySelectorAll('.quick-chip').forEach((button) => {
    button.addEventListener('click', () => {
      const prompt = button.dataset.prompt || '';
      els.commandInput.value = prompt;
      dispatchMission(prompt);
    });
  });

  els.toolSelect.addEventListener('change', syncToolPayloadExample);
  els.toolRunBtn.addEventListener('click', executeSelectedTool);
  els.toolAutoBtn.addEventListener('click', () => {
    const tool = state.tools.find((item) => item.name === els.toolSelect.value) || state.tools[0];
    if (!tool) return;
    els.toolPayloadInput.value = pretty(tool.payloadExample || {});
    addFeed('Tool payload autofilled', `ใช้ payload ตัวอย่างของ ${tool.name}`, 'tool bench');
  });
  els.saveSettingsBtn.addEventListener('click', saveSettings);
}

async function boot() {
  const bootstrap = await window.fridayDesktop.bootstrap();
  state.bootstrap = bootstrap;

  els.platformText.textContent = bootstrap.platform === 'darwin'
    ? 'macOS'
    : `${bootstrap.platform} (target: MacBook)`;

  renderAgents(bootstrap.agents || []);
  renderMemory(bootstrap.memories || []);
  renderNotes(bootstrap.notes || []);
  renderTools(bootstrap.tools || []);
  renderSettings(bootstrap.settings || {});

  addFeed('Friday system ready', 'โปรแกรม JARVIS-style พร้อมเริ่มใช้งานบน MacBook แล้ว', 'boot sequence');
  addFeed(
    bootstrap.llmEnabled ? 'LLM connected' : 'Local brain mode',
    bootstrap.llmEnabled
      ? 'พบการตั้งค่า OPENAI_API_KEY แล้ว พร้อมเรียกใช้โมเดลจริง'
      : 'ยังไม่พบ OPENAI_API_KEY — ตอนนี้ใช้ local brain อยู่',
    bootstrap.llmEnabled ? 'llm ready' : 'llm optional'
  );
  addFeed('Team online', 'สมาชิกทั้ง 11 คนพร้อมทำงานและเรียนรู้ต่อเนื่อง', 'agent network');
  addFeed('Native toolkit online', 'tool bench, workspace, notes และ notifications พร้อมให้ทดสอบ', 'phase 4');

  updateIntelligence({
    intent: 'idle',
    objectives: ['พร้อมรับคำสั่ง'],
    risks: ['ยังไม่มี mission ใหม่'],
    executionPlan: [],
    reviewerChecklist: []
  });

  bindEvents();
}

boot();
