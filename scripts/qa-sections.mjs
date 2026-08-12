/**
 * Section-level screenshots for close inspection.
 *   node scripts/qa-sections.mjs <output-dir>
 */
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const out = process.argv[2];
await mkdir(out, { recursive: true });

const candidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];
const executablePath = candidates.find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath, headless: true });

const shots = [
  ['desktop', 1440, 900, ['#oversight', '#what-we-offer', '#reach-us', '#site-footer']],
  ['mobile', 375, 812, ['#overview', '#who-we-are', '#oversight', '#what-we-offer', '#reach-us']],
];

for (const [name, width, height, selectors] of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1.5 });
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(async () => {
    const d = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight * 0.7) {
      window.scrollTo(0, y);
      await d(120);
    }
    await d(400);
  });
  for (const sel of selectors) {
    const el = await page.$(sel);
    if (!el) continue;
    await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'start' }), sel);
    await sleep(650);
    const safe = sel.replace(/[#.]/g, '');
    await el.screenshot({ path: `${out}/${name}-${safe}.png` }).catch(async () => {
      await page.screenshot({ path: `${out}/${name}-${safe}.png` });
    });
  }
  await page.close();
}

await browser.close();
console.log('sections captured');
