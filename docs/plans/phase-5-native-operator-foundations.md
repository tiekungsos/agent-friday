# Phase 5 Native Operator Foundations Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** เพิ่มความสามารถ native macOS และ operator tools ให้ Friday ทำงานจริงบน MacBook ได้มากขึ้น

**Architecture:** ขยาย Electron main process ให้รองรับ native integrations เพิ่มเติม และเพิ่ม service layer สำหรับ calendar / reminders / browser tools โดยยังคงใช้ IPC bridge เดิมระหว่าง main, preload และ renderer

**Tech Stack:** Electron, JavaScript, OpenAI-compatible API, on-device JSON storage, macOS integrations

---

### Task 1: Add release and packaging checklist document

**Objective:** สร้างเอกสารสำหรับ build `.app` และตรวจความพร้อมก่อนปล่อยบน Mac

**Files:**
- Create: `docs/release-checklist.md`
- Modify: `README.md`

**Step 1: Write document**
- อธิบาย prerequisites บน Mac
- คำสั่ง `npm install`, `npm run check`, `npm run build:mac`
- checklist ก่อน release เช่น icon, signing, env setup, smoke test

**Step 2: Link from README**
- เพิ่ม section เอกสารอ้างอิง

**Step 3: Verify**
Run: `npm run check`
Expected: PASS

### Task 2: Design calendar and reminders tool interfaces

**Objective:** กำหนด shape ของ tools สำหรับงานตารางและ reminder ก่อนลง implementation

**Files:**
- Modify: `services/toolbox.js`
- Create: `docs/plans/calendar-reminders-tool-spec.md`

**Step 1: Document tool contract**
- `calendar.listToday`
- `calendar.createEvent`
- `reminders.list`
- `reminders.create`

**Step 2: Add placeholder registry entries**
- ยังไม่ต้องเชื่อม native จริง แต่ให้ UI มองเห็น tools ได้

**Step 3: Verify**
Run: `node --check services/toolbox.js && npm run check`
Expected: PASS

### Task 3: Add browser automation MVP plan

**Objective:** เตรียมแผนสำหรับเปิดเว็บ / เปิดลิงก์ / เก็บ session intent แบบปลอดภัย

**Files:**
- Create: `docs/plans/browser-automation-mvp.md`

**Step 1: Document capabilities and constraints**
- open URL
- allowlisted actions only
- explicit user-triggered behavior

**Step 2: Define verification approach**
- วิธีทดสอบจาก tool bench

### Task 4: Add mission history design

**Objective:** วาง data model สำหรับเก็บ mission history อย่างเป็นระบบ

**Files:**
- Create: `docs/plans/mission-history.md`
- Modify: `services/storage.js`

**Step 1: Define schema**
- mission id
- prompt
- selected agents
- tool results summary
- createdAt

**Step 2: Add non-breaking storage helpers**
- `listMissionHistory()`
- `appendMissionHistory()`

**Step 3: Verify**
Run: `node --check services/storage.js && npm run check`
Expected: PASS

### Task 5: Create GitHub execution backlog

**Objective:** แปลงแผนหลักเป็น GitHub issues ที่พร้อมหยิบไปทำต่อ

**Files:**
- Create: GitHub issues in `tiekungsos/agent-friday`

**Step 1: Create issue for packaging**
**Step 2: Create issue for calendar/reminders**
**Step 3: Create issue for browser automation**
**Step 4: Create issue for mission history**

**Step 5: Verify**
- issue ถูกสร้างครบ
- title และ body ชัดเจน
