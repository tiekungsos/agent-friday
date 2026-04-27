# Friday // JARVIS for Mac

ต้นแบบโปรแกรม desktop สำหรับ MacBook ในสไตล์ JARVIS โดยใช้ Electron เป็นฐาน

## Phase 4: Tool use + planner/reviewer + native Mac features
เวอร์ชันนี้ต่อยอดจากสมองเริ่มต้นให้กลายเป็น assistant system ที่ใช้งานได้จริงขึ้นอีกขั้น:
- mission analysis
- planner / reviewer loop
- tool bench สำหรับรันเครื่องมือจริง
- notes + workspace tools
- native settings สำหรับ LLM / workspace / notifications
- tray + global shortcut
- package target สำหรับ Mac `.app`

## สิ่งที่มีในเวอร์ชันนี้
- หน้าจอ command center แบบเต็มจอ
- Friday เป็นแกนกลางคุมทีม agent 11 คน
- Mission composer สำหรับพิมพ์คำสั่งแล้วกระจายงานให้ทีม
- Voice mode พร้อมลองใช้ Web Speech API ถ้าเครื่องรองรับ
- Mission intelligence: สรุป intent, objectives, risks และ response ของ Friday
- Execution plan + reviewer checklist สำหรับงานแต่ละรอบ
- Local memory vault เก็บ context สำคัญไว้ในเครื่อง
- Notes vault สำหรับเก็บโน้ตแยกจาก memory
- Tool bench สำหรับทดสอบเครื่องมือจริง
- Native settings panel สำหรับ model, base URL, workspace root และ notifications
- Electron backend bridge ผ่าน IPC
- ใช้ LLM จริงได้ผ่าน OpenAI-compatible API
- tool use เริ่มต้น:
  - เวลา / สถานะระบบ
  - ค้น memory / notes
  - สร้าง note
  - list / read / write ไฟล์ใน workspace root
  - macOS notification
  - เปิดลิงก์ภายนอก
- tray icon + global shortcut (`CommandOrControl+Shift+Space`)

## วิธีเริ่มต้น
```bash
cd friday-jarvis-mac
npm install
npm start
```

## ตรวจโครงสร้างโปรเจกต์
```bash
npm run check
```

## ตั้งค่า LLM จริง
รองรับ OpenAI-compatible API ผ่าน environment variables หรือ settings panel

```bash
export OPENAI_API_KEY=***
export OPENAI_MODEL=gpt-4.1-mini
# ถ้ามี base URL อื่น เช่น OpenRouter หรือ gateway ของตัวเอง
export OPENAI_BASE_URL=https://api.openai.com/v1
npm start
```

ถ้า **ไม่ตั้ง `OPENAI_API_KEY`** โปรแกรมจะทำงานในโหมด **local brain only**

## โครงสร้างไฟล์
- `main.js` — Electron main process + IPC handlers + tray/global shortcut
- `preload.js` — bridge สำหรับ renderer
- `renderer/index.html` — UI หลัก
- `renderer/styles.css` — สไตล์หน้าจอ
- `renderer/app.js` — logic ฝั่งหน้าจอ
- `services/storage.js` — memory / notes / settings / workspace storage
- `services/toolbox.js` — tool registry และ tool execution
- `services/assistant.js` — mission analysis, planner, reviewer, LLM integration
- `scripts/check.js` — sanity check ของโปรเจกต์

## ความสามารถในตอนนี้
- วิเคราะห์คำสั่งแบบ local heuristic
- เลือก agent ที่เหมาะกับโจทย์
- สร้าง objective / risk / summary สำหรับแต่ละ mission
- สร้าง execution plan และ reviewer checklist
- บันทึก memory ลงไฟล์ใน userData ของ Electron
- บันทึก notes ลงไฟล์แยก
- เรียก LLM จริงเพื่อ refine summary/response ได้
- ใช้ tool เบื้องต้นก่อนส่ง context เข้า LLM
- เปิด/ปิดเสียงฟังแบบ Web Speech API เมื่อ browser รองรับ

## ข้อจำกัดตอนนี้
- ยังไม่มี speech-to-text แบบ native macOS เต็มรูป
- tool use ยังเป็นชุดเริ่มต้น ไม่ได้สั่งงานเครื่องลึก ๆ
- agent orchestration ยังเป็น single-pass logic ไม่ได้มี subagent จริง
- ยังไม่แพ็กเป็น `.app` สำหรับส่งต่อผู้ใช้ทั่วไป

## ขั้นต่อไปที่ควรทำ
- เพิ่ม native speech + wake word
- เพิ่ม calendar / reminders / browser automation tools
- เพิ่ม planner/reviewer loop แบบ multi-agent จริง
- เพิ่ม settings sync และ import/export workspace
- สร้างเวอร์ชัน packaged สำหรับ Mac `.app`

## เอกสารเพิ่มใน repo
- `docs/ROADMAP.md` — roadmap รวมของ Friday Jarvis
- `docs/release-checklist.md` — checklist สำหรับ build/release บน Mac
- `docs/plans/phase-5-native-operator-foundations.md` — แผน implementation ของ Phase 5
