#!/usr/bin/env node
// Render the 1200x630 social preview cards in static/og/ with headless Chrome.
//
// Text is copied from the pages' own front matter and hugo.toml; update it here
// when a title or metric changes, then rerun: node tools/gen-og.mjs
// CHROME overrides the browser path.
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = new URL('../static/og/', import.meta.url).pathname;

const cards = [
  { file: 'site.png', title: 'lucassantanna.ca', name: "Lucas Sant' Anna",
    line: 'I design platforms and lead the teams that build them.' },
  { file: 'kubernetes-platform-architecture.png', kicker: 'Technical Work',
    title: 'Kubernetes Platform Architecture',
    metric: 'No downtime', note: 'ECS to EKS, no maintenance window' },
  { file: 'building-devops-engineering.png', kicker: 'Leadership',
    title: 'Building DevOps Engineering at Fortis',
    metric: '10 engineers', note: 'four areas, four countries' },
];

// Light theme tokens from assets/css/main.css.
const page = c => `<!doctype html><meta charset="utf-8"><style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; padding: 80px 88px; background: #f8f9f7; color: #202528;
    font-family: Inter, "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    display: flex; flex-direction: column; border-top: 12px solid #2e637a; }
  .kicker { font: 500 28px ui-monospace, "SF Mono", Menlo, monospace; color: #2e637a; }
  h1 { margin-top: 36px; font-size: 76px; line-height: 1.08; letter-spacing: -0.02em; font-weight: 700; }
  .who { margin-top: 40px; font-size: 48px; font-weight: 600; }
  .line { margin-top: 16px; font-size: 40px; line-height: 1.3; color: #667079; }
  .metric { margin-top: auto; font-size: 44px; font-weight: 600; color: #2e637a; }
  .note { margin-top: 8px; font-size: 30px; color: #667079; }
  .name { margin-top: auto; font-size: 28px; color: #667079; }
</style>
${c.kicker ? `<div class="kicker">${c.kicker}</div>` : ''}
<h1>${c.title}</h1>
${c.name ? `<p class="who">${c.name}</p>` : ''}
${c.line ? `<p class="line">${c.line}</p>` : ''}
${c.metric ? `<p class="metric">${c.metric}</p><p class="note">${c.note}</p>` : '<p class="name">Metro Vancouver, Canada</p>'}`;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), 'og-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9334',
  `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });

try {
  let target;
  for (let i = 0; i < 40 && !target; i++) {
    await sleep(250);
    try {
      target = (await (await fetch('http://127.0.0.1:9334/json')).json()).find(t => t.type === 'page');
    } catch {}
  }
  if (!target) throw new Error('Chrome did not start');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => (ws.onopen = r));
  let id = 0;
  const pending = {};
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (pending[m.id]) { pending[m.id](m.result); delete pending[m.id]; }
  };
  const send = (method, params = {}) =>
    new Promise(r => { pending[++id] = r; ws.send(JSON.stringify({ id, method, params })); });

  await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
  mkdirSync(OUT, { recursive: true });
  for (const c of cards) {
    await send('Page.navigate', { url: 'data:text/html;base64,' + Buffer.from(page(c)).toString('base64') });
    await sleep(500);
    const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 } });
    writeFileSync(join(OUT, c.file), Buffer.from(data, 'base64'));
    console.log('wrote static/og/' + c.file);
  }
  ws.close();
} finally {
  chrome.kill();
}
