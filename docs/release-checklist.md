# Release Checklist for Friday Jarvis Mac

## Before build
- ติดตั้ง Node.js / npm บน Mac
- clone repo ล่าสุด
- ตั้ง `OPENAI_API_KEY` ถ้าต้องการใช้ LLM จริง
- เตรียม app icon / branding ถ้าจะปล่อยให้ผู้ใช้จริง

## Validation
```bash
npm install
npm run check
npm start
```

## Build
```bash
npm run build:mac
```

## Smoke test on Mac
- เปิดแอปได้
- command center โหลดครบ
- settings panel ทำงาน
- tool bench รัน basic tools ได้
- tray และ shortcut ใช้งานได้
- mission dispatch ทำงานทั้ง local brain และ LLM mode

## Release prep
- ยืนยันชื่อ app และ version
- ยืนยัน `.gitignore` และ env handling
- ยืนยันว่าไม่มี secret ติด repo
- ถ้าจะปล่อย public ให้เพิ่ม code signing / notarization flow
