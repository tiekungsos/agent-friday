const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'main.js',
  'preload.js',
  'package.json',
  'renderer/index.html',
  'renderer/styles.css',
  'renderer/app.js',
  'services/storage.js',
  'services/toolbox.js',
  'services/assistant.js'
];

const base = path.resolve(__dirname, '..');
const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(base, file)));

if (missing.length) {
  console.error('Missing files:', missing.join(', '));
  process.exit(1);
}

const html = fs.readFileSync(path.join(base, 'renderer/index.html'), 'utf8');
const js = fs.readFileSync(path.join(base, 'renderer/app.js'), 'utf8');
const main = fs.readFileSync(path.join(base, 'main.js'), 'utf8');
const assistant = fs.readFileSync(path.join(base, 'services/assistant.js'), 'utf8');

if (
  !html.includes('Mission intelligence') ||
  !html.includes('Tool bench') ||
  !js.includes('executionPlanList') ||
  !main.includes('tool:run') ||
  !assistant.includes('buildExecutionPlan')
) {
  console.error('Core Phase 4 markers not found');
  process.exit(1);
}

console.log('Friday JARVIS Phase 4 structure looks good.');
