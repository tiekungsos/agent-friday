const { createToolbox } = require('./toolbox');

const AGENTS = [
  { name: 'ฟรายเดย์', role: 'Head / Orchestrator', specialty: 'คุมภาพรวม ตีโจทย์ และรวมคำตอบสุดท้าย' },
  { name: 'เรย์', role: 'Strategic Planner', specialty: 'วาง roadmap และลำดับงาน' },
  { name: 'มีน', role: 'Research Lead', specialty: 'หา reference และสรุป insight' },
  { name: 'นาวา', role: 'Business Analyst', specialty: 'แตก requirement เชิงธุรกิจ' },
  { name: 'ลูนา', role: 'UX/UI Designer', specialty: 'ออกแบบ flow และประสบการณ์ใช้งาน' },
  { name: 'โซล', role: 'Frontend Engineer', specialty: 'สร้าง interface และ interaction' },
  { name: 'ไค', role: 'Backend Engineer', specialty: 'ดู API, data, integration และ logic' },
  { name: 'เอด้า', role: 'AI / Automation Specialist', specialty: 'วาง agent flow และระบบอัตโนมัติ' },
  { name: 'พิกเซล', role: 'QA / Reviewer', specialty: 'ตรวจคุณภาพ หา issue และ edge case' },
  { name: 'โนว่า', role: 'Content Lead', specialty: 'สรุปข้อความ เอกสาร และ copy' },
  { name: 'วีรา', role: 'Operations / Delivery', specialty: 'คุมการส่งมอบและความพร้อมก่อนปล่อยงาน' }
];

function detectIntent(prompt) {
  const lower = prompt.toLowerCase();
  if (/(สรุป|summary)/.test(prompt)) return 'summary';
  if (/(ออกแบบ|design|prototype|ui|ux)/.test(lower) || /(ออกแบบ)/.test(prompt)) return 'design';
  if (/(แผน|roadmap|timeline|plan|milestone)/.test(lower) || /(แผน)/.test(prompt)) return 'planning';
  if (/(รีวิว|review|ตรวจ|qa|bug)/.test(lower) || /(รีวิว|ตรวจ)/.test(prompt)) return 'review';
  if (/(เปิดตัว|launch|release|go to market)/.test(lower) || /(เปิดตัว|ปล่อยงาน)/.test(prompt)) return 'launch';
  if (/(โค้ด|build|app|โปรแกรม|system|tool|automation)/.test(lower) || /(โปรแกรม|ระบบ)/.test(prompt)) return 'build';
  return 'general';
}

function selectAgents(prompt) {
  const picks = new Set(['ฟรายเดย์']);
  const lower = prompt.toLowerCase();

  if (/(แผน|roadmap|project|กลยุทธ์|timeline|milestone)/.test(lower)) picks.add('เรย์');
  if (/(research|ข้อมูล|คู่แข่ง|อ้างอิง|หา|insight|เอกสาร)/.test(lower) || /(ข้อมูล|คู่แข่ง|อ้างอิง)/.test(prompt)) picks.add('มีน');
  if (/(ธุรกิจ|requirement|pain|ลูกค้า|ขาย|business)/.test(lower) || /(ธุรกิจ|ลูกค้า|ขาย)/.test(prompt)) picks.add('นาวา');
  if (/(ux|ui|flow|หน้าจอ|design|ออกแบบ|prototype)/.test(lower) || /(หน้าจอ|ออกแบบ)/.test(prompt)) picks.add('ลูนา');
  if (/(frontend|หน้าเว็บ|interface|interaction|visual|dashboard)/.test(lower) || /(หน้าเว็บ|อินเตอร์เฟส)/.test(prompt)) picks.add('โซล');
  if (/(backend|api|database|integration|data|system|โค้ด|app|program|workspace|file|note)/.test(lower) || /(ระบบ|โปรแกรม)/.test(prompt)) picks.add('ไค');
  if (/(ai|agent|automation|workflow|jarvis|voice|memory|tool)/.test(lower) || /(อัตโนมัติ|เสียง|เมมโมรี่)/.test(prompt)) picks.add('เอด้า');
  if (/(test|qa|bug|review|ตรวจ)/.test(lower) || /(ทดสอบ|รีวิว|ตรวจ)/.test(prompt)) picks.add('พิกเซล');
  if (/(content|copy|proposal|doc|เอกสาร|สรุป|message|notes)/.test(lower) || /(ข้อความ|เอกสาร|สรุป)/.test(prompt)) picks.add('โนว่า');
  if (/(deploy|release|ops|ส่งมอบ|launch|handoff)/.test(lower) || /(ปล่อยงาน|ส่งมอบ|เปิดตัว)/.test(prompt)) picks.add('วีรา');

  return AGENTS.filter((agent) => picks.has(agent.name));
}

function buildObjectives(prompt, intent) {
  const objectives = [
    'ทำความเข้าใจเป้าหมายหลักของบอสให้ชัด',
    'แยกงานเป็นส่วนที่ลงมือทำได้จริง',
    'กำหนด owner และผลลัพธ์ที่ต้องได้'
  ];

  if (intent === 'design') objectives.push('สร้างภาพหน้าจอหรือ flow ที่เห็นภาพได้เร็ว');
  if (intent === 'planning') objectives.push('กำหนด timeline และ dependency ของงาน');
  if (intent === 'review') objectives.push('หาความเสี่ยงและจุดที่ต้องแก้ก่อนปล่อยงาน');
  if (intent === 'launch') objectives.push('เตรียม execution plan และ launch checklist');
  if (intent === 'build') objectives.push('กำหนด architecture และงาน implement ที่ต้องเริ่มก่อน');
  if (/(voice|เสียง)/i.test(prompt)) objectives.push('กำหนด voice interaction และ fallback เมื่อรับเสียงไม่ได้');
  if (/(ai|agent|jarvis|tool)/i.test(prompt)) objectives.push('กำหนดขอบเขตความสามารถของ AI และ workflow ของ agent');
  if (/(file|note|workspace)/i.test(prompt)) objectives.push('กำหนด workspace และรูปแบบข้อมูลที่ tool จะใช้งาน');

  return [...new Set(objectives)].slice(0, 6);
}

function buildRisks(prompt, intent, toolResults = []) {
  const risks = [];
  const lower = prompt.toLowerCase();
  if (/(ai|agent|jarvis|tool)/.test(lower)) risks.push('ต้องกำหนดขอบเขต AI และตรวจ hallucination ให้ชัด');
  if (/(integration|api|database|system|workspace|file)/.test(lower)) risks.push('ต้องเช็ก dependency และการเชื่อมต่อระบบเดิม');
  if (/(voice|เสียง)/.test(lower)) risks.push('ต้องมี fallback หาก speech recognition ใช้งานไม่ได้');
  if (intent === 'launch') risks.push('ต้องยืนยัน owner, timeline และเกณฑ์พร้อมปล่อยงาน');
  if (/(ธุรกิจ|ลูกค้า|ขาย)/.test(prompt)) risks.push('ต้องผูกผลลัพธ์กับเป้าหมายธุรกิจที่ชัดเจน');
  if (toolResults.some((item) => item.name === 'memory.search' && String(item.output).includes('No memory'))) {
    risks.push('ยังไม่มี memory เกี่ยวข้องมากพอ อาจต้องเก็บ context เพิ่ม');
  }
  if (toolResults.some((item) => item.name === 'files.list' && String(item.output).includes('No files'))) {
    risks.push('workspace ยังว่าง ควรตั้งค่าพื้นที่ทำงานก่อนใช้งาน file tools');
  }
  if (!risks.length) risks.push('ควรยืนยัน scope และ success metric ก่อนลงรายละเอียด');
  return [...new Set(risks)].slice(0, 5);
}

function buildExecutionPlan(prompt, selectedAgents, objectives, intent) {
  const planner = selectedAgents.find((agent) => agent.name === 'เรย์') || AGENTS[1];
  const reviewer = selectedAgents.find((agent) => agent.name === 'พิกเซล') || AGENTS[8];
  const builder = selectedAgents.find((agent) => ['โซล', 'ไค', 'เอด้า'].includes(agent.name)) || selectedAgents[1] || AGENTS[6];

  const firstObjective = objectives[0] || 'ล็อกโจทย์หลัก';
  const secondObjective = objectives[1] || 'แตกงานที่ทำได้จริง';
  const thirdObjective = objectives[2] || 'ตรวจความเสี่ยง';

  return [
    {
      phase: '1',
      owner: 'ฟรายเดย์',
      task: 'ล็อก scope และสรุปโจทย์',
      detail: `${firstObjective} จากคำสั่ง: ${prompt}`,
      output: 'Mission brief ที่ทีมใช้ตรงกัน'
    },
    {
      phase: '2',
      owner: planner.name,
      task: 'แตก roadmap / dependency',
      detail: `${secondObjective} พร้อมลำดับทำงานและ owner`,
      output: 'Execution map'
    },
    {
      phase: '3',
      owner: builder.name,
      task: 'ลงมือสร้างสิ่งที่จับต้องได้',
      detail: `${intent === 'design' ? 'ทำ wireframe / visual flow' : 'สร้าง implementation หรือ automation flow'}`,
      output: 'Working draft'
    },
    {
      phase: '4',
      owner: reviewer.name,
      task: 'ตรวจคุณภาพ / edge cases',
      detail: `${thirdObjective} และเช็กว่าสิ่งที่ทำตรงกับเป้าหมาย`,
      output: 'Review notes'
    },
    {
      phase: '5',
      owner: 'วีรา + ฟรายเดย์',
      task: 'สรุปและส่งมอบ',
      detail: 'รวมผลลัพธ์เป็นคำตอบเดียว และบอก next step ชัด ๆ',
      output: 'Boss-ready response'
    }
  ];
}

function buildReviewerChecklist(prompt, intent, risks) {
  const checklist = [
    'โจทย์ชัดเจนและมีผลลัพธ์ที่วัดได้',
    'เจ้าของงานแต่ละส่วนถูกระบุแล้ว',
    'มี fallback หาก tool หรือ LLM ใช้งานไม่ได้'
  ];

  if (intent === 'build') checklist.push('มี architecture และ data flow ที่เหมาะกับระบบ');
  if (intent === 'design') checklist.push('flow และหน้าจออ่านง่ายบน MacBook');
  if (intent === 'planning') checklist.push('timeline และ dependency สมเหตุสมผล');
  if (intent === 'launch') checklist.push('พร้อม checklist ปล่อยงานและ post-launch review');
  if (/(voice|เสียง)/.test(prompt)) checklist.push('voice mode มี fallback เมื่อ speech recognition ไม่พร้อม');
  if (/(file|note|workspace)/i.test(prompt)) checklist.push('workspace path และข้อมูลสำคัญถูกจำกัดให้อยู่ในพื้นที่ที่ปลอดภัย');
  if (risks.length) checklist.push(`ความเสี่ยงหลักถูกตอบด้วยแผนรับมือ ${risks.length} ข้อ`);
  return [...new Set(checklist)].slice(0, 6);
}

function summarizeTools(toolResults) {
  if (!toolResults.length) return 'ยังไม่ได้ใช้เครื่องมือเสริมในรอบนี้';
  return toolResults.map((item) => `${item.name}: ${item.output}`).join('\n');
}

async function runAutoTools(prompt, toolbox) {
  const requests = toolbox.autoToolPlan(prompt);
  const results = [];
  for (const request of requests) {
    try {
      const result = await toolbox.executeTool(request.name, request.payload || {});
      results.push(result);
    } catch (error) {
      results.push({ name: request.name, ok: false, output: error.message });
    }
  }
  return results;
}

async function callLLM({ prompt, analysis, selectedAgents, memories, toolResults, config }) {
  if (!config.apiKey) {
    return null;
  }

  const systemPrompt = [
    'คุณคือ Friday ผู้ช่วยสไตล์ JARVIS สำหรับ MacBook ของบอส',
    'ตอบเป็นภาษาไทย กระชับ แต่มีประโยชน์ ใช้งานได้จริง',
    'ให้ผลลัพธ์อยู่ในรูปแบบ JSON เท่านั้น ด้วย key: reply, refinedSummary, suggestedNextActions',
    'suggestedNextActions ต้องเป็น array ของ string 3-5 ข้อ',
    'ห้ามใส่ markdown code block'
  ].join('\n');

  const memoryContext = memories.slice(0, 6).map((entry) => `- ${entry.text}`).join('\n') || 'ไม่มี memory สำคัญ';
  const agentContext = selectedAgents.map((agent) => `- ${agent.name}: ${agent.role}`).join('\n');
  const planContext = analysis.executionPlan.map((step) => `- ${step.owner}: ${step.task} — ${step.detail}`).join('\n');
  const checklistContext = analysis.reviewerChecklist.map((item) => `- ${item}`).join('\n');
  const userPrompt = [
    `คำสั่งจากบอส: ${prompt}`,
    `intent: ${analysis.intent}`,
    `objectives: ${analysis.objectives.join(' | ')}`,
    `risks: ${analysis.risks.join(' | ')}`,
    `execution plan:\n${planContext}`,
    `review checklist:\n${checklistContext}`,
    `agents selected:\n${agentContext}`,
    `tool results: ${summarizeTools(toolResults)}`,
    `memory context:\n${memoryContext}`
  ].join('\n\n');

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '{}';
  return JSON.parse(content);
}

function buildToolboxBridge(storage, runtimeInfo) {
  return createToolbox({
    storage,
    runtimeInfo,
    notify: () => {},
    openExternal: async () => false
  });
}

async function processMission({ prompt, storage, runtimeInfo, llmConfig, toolbox: providedToolbox, notify, openExternal }) {
  const trimmed = String(prompt || '').trim();
  if (!trimmed) {
    return {
      error: 'EMPTY_PROMPT'
    };
  }

  const toolbox = providedToolbox || createToolbox({
    storage,
    runtimeInfo,
    notify: notify || (() => {}),
    openExternal: openExternal || (async () => false)
  });

  const selectedAgents = selectAgents(trimmed);
  const intent = detectIntent(trimmed);
  const memories = storage.listMemory();
  const toolResults = await runAutoTools(trimmed, toolbox);
  const objectives = buildObjectives(trimmed, intent);
  const risks = buildRisks(trimmed, intent, toolResults);
  const executionPlan = buildExecutionPlan(trimmed, selectedAgents, objectives, intent);
  const reviewerChecklist = buildReviewerChecklist(trimmed, intent, risks);

  const analysis = {
    intent,
    selectedAgents,
    objectives,
    risks,
    executionPlan,
    reviewerChecklist
  };

  analysis.summary = `ภารกิจนี้เน้น ${intent} โดยฟรายเดย์เลือก ${selectedAgents.length} agent เพื่อช่วยกันทำงานจากคำสั่ง: ${trimmed}`;
  analysis.response = `ฟรายเดย์จะเริ่มจากการตีโจทย์ให้ชัด แล้วกระจายงานให้ ${selectedAgents[1]?.name || 'ทีมหลัก'} เป็นตัวเดินเรื่องก่อน จากนั้นค่อยวนกลับมาตรวจความเสี่ยงและรวมผลลัพธ์ให้บอส`;

  let llmOutput = null;
  let llmError = null;
  try {
    llmOutput = await callLLM({
      prompt: trimmed,
      analysis,
      selectedAgents,
      memories,
      toolResults,
      config: llmConfig
    });
  } catch (error) {
    llmError = error.message;
  }

  storage.addMemory(trimmed, 'mission');

  return {
    prompt: trimmed,
    analysis: {
      ...analysis,
      refinedSummary: llmOutput?.refinedSummary || analysis.summary,
      reply: llmOutput?.reply || analysis.response,
      suggestedNextActions: Array.isArray(llmOutput?.suggestedNextActions)
        ? llmOutput.suggestedNextActions
        : [
            'ยืนยัน scope ของคำสั่งนี้กับบอสให้ชัด',
            'เลือก owner หลักของงานก่อนเริ่มลงมือ',
            'แยกงานส่วนแรกที่ทำได้ทันที'
          ]
    },
    toolResults,
    llmEnabled: Boolean(llmConfig.apiKey),
    llmError,
    memories: storage.listMemory().slice(0, 12),
    notes: storage.listNotes().slice(0, 12),
    tools: toolbox.listTools(),
    autoToolRequests: toolbox.autoToolPlan(trimmed)
  };
}

module.exports = {
  AGENTS,
  processMission,
  buildToolbox: buildToolboxBridge
};
