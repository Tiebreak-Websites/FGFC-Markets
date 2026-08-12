/**
 * Headless QA harness: drives system Edge/Chrome over the dev server,
 * captures screenshots at three viewports, records console errors and
 * failed requests, checks overflow / lazy images, and exercises the
 * mobile menu and the contact form.
 *
 *   node scripts/qa.mjs <output-dir> [baseUrl]
 */
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const out = process.argv[2];
const base = process.argv[3] || 'http://localhost:4321';
if (!out) {
  console.error('Usage: node scripts/qa.mjs <output-dir> [baseUrl]');
  process.exit(1);
}
await mkdir(out, { recursive: true });

const candidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];
const executablePath = candidates.find((p) => existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath, headless: true });
const results = [];

const viewports = [
  ['desktop', 1440, 900],
  ['tablet', 768, 1024],
  ['mobile', 375, 812],
];

for (const [name, width, height] of viewports) {
  const page = await browser.newPage();
  const errors = [];
  const failed = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => failed.push(`${r.url()} → ${r.failure()?.errorText}`));

  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(`${base}/`, { waitUntil: 'networkidle0', timeout: 60000 });

  // progressive scroll: triggers reveals + lazy images, mirrors a real visit
  await page.evaluate(async () => {
    const d = (ms) => new Promise((r) => setTimeout(r, ms));
    const H = () => document.body.scrollHeight;
    for (let y = 0; y < H(); y += window.innerHeight * 0.7) {
      window.scrollTo(0, y);
      await d(150);
    }
    window.scrollTo(0, H());
    await d(450);
    window.scrollTo(0, 0);
    await d(450);
  });

  const audit = await page.evaluate(() => {
    const imgs = [...document.images].map((i) => ({
      src: (i.currentSrc || i.src || '(none)').split('/').pop(),
      ok: i.complete && i.naturalWidth > 0,
    }));
    return {
      overflowX:
        document.scrollingElement.scrollWidth - document.documentElement.clientWidth,
      imgsBroken: imgs.filter((i) => !i.ok),
      imgCount: imgs.length,
      burgerShown:
        getComputedStyle(document.querySelector('.burger')).display !== 'none',
      railShown: getComputedStyle(document.querySelector('.rail')).display !== 'none',
      revealedCount: document.querySelectorAll('[data-reveal].is-in').length,
      revealTotal: document.querySelectorAll('[data-reveal]').length,
    };
  });

  await page.screenshot({ path: `${out}/${name}-full.png`, fullPage: true });
  await sleep(300);
  await page.screenshot({ path: `${out}/${name}-hero.png` });

  if (name === 'mobile') {
    await page.click('.burger');
    await sleep(750);
    await page.screenshot({ path: `${out}/${name}-menu.png` });
    await page.keyboard.press('Escape');
    await sleep(400);
    audit.menuClosesOnEsc = await page.evaluate(
      () => !document.documentElement.classList.contains('menu-open')
    );
  }

  if (name === 'desktop') {
    // empty submit → validation errors
    await page.evaluate(() =>
      document.querySelector('#reach-us').scrollIntoView({ block: 'start' })
    );
    await sleep(900);
    await page.click('#contact-form button[type="submit"]');
    await sleep(500);
    audit.errorFieldsOnEmptySubmit = await page.evaluate(
      () => document.querySelectorAll('.field.is-error').length
    );
    await page.screenshot({ path: `${out}/form-errors.png` });

    // valid submit → success panel
    await page.type('#f-first', 'Quality');
    await page.type('#f-last', 'Assurance');
    await page.type('#f-email', 'qa@example.com');
    await page.type('#f-subject', 'QA pass');
    await page.type('#f-message', 'This is an automated QA submission.');
    await page.click('#contact-form button[type="submit"]');
    await sleep(1600);
    audit.successShown = await page.evaluate(() =>
      document.getElementById('form-card').classList.contains('is-sent')
    );
    await page.screenshot({ path: `${out}/form-success.png` });
  }

  results.push({ name, errors, failed, audit });
  await page.close();
}

// legal page spot-check
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(`${base}/privacy`, { waitUntil: 'networkidle0', timeout: 60000 });
await page.screenshot({ path: `${out}/legal-privacy.png`, fullPage: true });
const legal404 = await page.evaluate(() => document.title.includes('404'));
await page.close();
results.push({ name: 'legal-privacy', legal404 });

console.log(JSON.stringify(results, null, 1));
await browser.close();
