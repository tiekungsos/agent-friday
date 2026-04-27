# GitHub Issues Backlog Draft

ใช้ไฟล์นี้เป็น backlog พร้อมคัดลอกไปสร้าง issue ได้ทันที ถ้ายังไม่สะดวกเรียก GitHub API จาก environment นี้

## 1. Phase 5: build native macOS packaging and release pipeline
**Goal:** Create a reliable release flow for Friday Jarvis on Mac.

**Scope:**
- verify `npm run build:mac` on a real Mac
- document prerequisites and smoke test flow
- validate tray, shortcut, settings, and tool bench after build
- prepare for future signing/notarization

**Reference:**
- `docs/release-checklist.md`
- `docs/plans/phase-5-native-operator-foundations.md`

## 2. Phase 5: add calendar and reminders tool interfaces
**Goal:** Let Friday read and create calendar / reminders tasks through native-friendly tool abstractions.

**Scope:**
- design tool contracts for `calendar.listToday`, `calendar.createEvent`, `reminders.list`, `reminders.create`
- expose them in tool bench
- keep implementation safe and explicit

**Reference:**
- `docs/ROADMAP.md`
- `docs/plans/phase-5-native-operator-foundations.md`

## 3. Phase 5: add browser automation MVP with safe allowlist
**Goal:** Give Friday a small but useful browser automation layer.

**Scope:**
- open URLs intentionally from tool bench
- define allowlisted actions only
- document security constraints and verification plan
- prepare structure for future richer browser tasks

**Reference:**
- `docs/ROADMAP.md`
- `docs/plans/phase-5-native-operator-foundations.md`

## 4. Phase 5: add structured mission history storage
**Goal:** Persist mission execution history for replay, debugging, and better agent context.

**Scope:**
- store mission id, prompt, selected agents, tool summary, timestamps
- add storage helpers for append/list
- keep it non-breaking with current memory and notes storage

**Reference:**
- `docs/ROADMAP.md`
- `docs/plans/phase-5-native-operator-foundations.md`
