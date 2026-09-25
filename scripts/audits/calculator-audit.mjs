import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { launchChrome, connectToPage, closeChrome, evaluate, wait, waitForCondition } from '../lib/browser.mjs';

const BASE_URL = process.env.AUDIT_BASE_URL ?? 'http://127.0.0.1:4173/';
const output = new URL('../../artifacts/audits/', import.meta.url);
mkdirSync(output, { recursive: true });
const browser = await launchChrome({ forceFallback: true });
const errors = [];
const submissions = [];
const results = [];
let client;

const click = selector => evaluate(client, `document.querySelector(${JSON.stringify(selector)}).click()`);
const pressKey = async (key, code = key) => {
  const keyCode = { Enter: 13, ArrowRight: 39 }[key];
  const params = { key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode };
  await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...params });
  if (key === 'Enter') await client.send('Input.dispatchKeyEvent', { type: 'char', ...params, text: '\r', unmodifiedText: '\r' });
  await client.send('Input.dispatchKeyEvent', { type: 'keyUp', ...params });
};
const input = async (selector, text) => {
  await evaluate(client, `document.querySelector(${JSON.stringify(selector)}).focus();document.querySelector(${JSON.stringify(selector)}).select()`);
  await client.send('Input.insertText', { text: String(text) });
};
const readResults = () => evaluate(client, `Object.fromEntries([...document.querySelectorAll('[data-result]')].map(el=>[el.dataset.result,el.firstChild.textContent.trim()]))`);
const calculate = async () => {
  await click('[data-calculate-potential]');
  await waitForCondition(client, `Boolean(document.querySelector('[data-calculator-results]'))`, 'calculated results');
  try {
    await waitForCondition(client, `document.activeElement.id === 'growth-calculator-results'`, 'result focus');
  } catch (error) {
    console.log(await evaluate(client, `({width:innerWidth,active:document.activeElement.outerHTML.slice(0,300),results:document.querySelector('[data-calculator-results]')?.textContent,focus:document.hasFocus(),visibility:document.visibilityState})`));
    throw error;
  }
  return readResults();
};
const assertNoResults = async () => assert.equal(await evaluate(client, `Boolean(document.querySelector('[data-calculator-results]'))`), false, 'edited inputs clear stale results');
const checkOverflow = async width => {
  const overflow = await evaluate(client, `(()=>{return [...document.querySelectorAll('#roi-calculator *')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).position!=='absolute'&&(r.left < -1 || r.right>innerWidth+1)}).map(el=>el.className)})()`);
  assert.deepEqual(overflow, [], `${width}: calculator overflow`);
};
const screenshot = async name => {
  await evaluate(client, `window.scrollTo({top:0,behavior:'instant'})`);
  await wait(120);
  const clip = await evaluate(client, `(()=>{const r=document.querySelector('#roi-calculator').getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height,scale:1}})()`);
  const image = await client.send('Page.captureScreenshot', {format:'png',captureBeyondViewport:true,clip});
  writeFileSync(new URL(name, output), Buffer.from(image.data,'base64'));
};

try {
  client = await connectToPage(browser.browserWebSocketUrl);
  client.on('Runtime.exceptionThrown', event => errors.push(event.exceptionDetails?.text));
  client.on('Network.requestWillBeSent', event => { if (event.request.method === 'POST') submissions.push(event.request.url); });
  await Promise.all([client.send('Page.enable'),client.send('Runtime.enable'),client.send('Network.enable')]);
  await client.send('Page.bringToFront');
  await client.send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await client.send('Emulation.setDeviceMetricsOverride', {width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await client.send('Page.navigate', {url:BASE_URL});
  await waitForCondition(client, `Boolean(document.querySelector('#growth-calculator'))`, 'homepage');
  assert.equal(await evaluate(client, `performance.getEntriesByType('resource').some(r=>r.name.includes('/ROICalculator-'))`), false, 'calculator stays out of the initial page load');
  await evaluate(client, `document.querySelector('#growth-calculator').scrollIntoView({behavior:'instant'})`);
  await waitForCondition(client, `Boolean(document.querySelector('[data-calculate-potential]'))`, 'visible calculator without an extra reveal button');
  await assertNoResults();
  assert.deepEqual(await calculate(), {revenue:'$780,000','ad-spend':'$60,000',gain:'$180,000',ratio:'300%'});
  assert.match(await evaluate(client, `document.querySelector('.growth-monthly-context').textContent`), /\$65,000 per month/);
  for (const [period,revenue,spend,gain] of [[24,'$1,560,000','$120,000','$360,000'],[36,'$2,340,000','$180,000','$540,000']]) {
    await click(`[data-period="${period}"]`); await assertNoResults();
    assert.deepEqual(await calculate(), {revenue,'ad-spend':spend,gain,ratio:'300%'});
  }
  await click('[data-period="custom"]');
  await input('#roi-custom-months','18');
  assert.deepEqual(await calculate(), {revenue:'$1,170,000','ad-spend':'$90,000',gain:'$270,000',ratio:'300%'});
  for (const value of ['', '0', '121', '1.5']) {
    await input('#roi-custom-months',value);
    await click('[data-calculate-potential]');
    await assertNoResults();
    assert.equal(await evaluate(client, `document.querySelector('#roi-custom-months').validity.valid`), false);
  }
  await click('.growth-reset');
  await input('#roi-revenue-multiplier','1.5');
  assert.deepEqual(await calculate(), {revenue:'$690,000','ad-spend':'$60,000',gain:'$90,000',ratio:'150%'});
  await input('#roi-monthly-ad-spend','0');
  assert.deepEqual(await calculate(), {revenue:'$600,000','ad-spend':'$0',gain:'$0',ratio:'N/A'});
  for (const value of ['', '-1', '1000000001']) {
    await input('#roi-monthly-revenue',value); await click('[data-calculate-potential]'); await assertNoResults();
    assert.equal(await evaluate(client, `document.querySelector('#roi-monthly-revenue').validity.valid`), false);
  }
  await click('.growth-reset');
  await input('#roi-revenue-multiplier',21); await click('[data-calculate-potential]'); await assertNoResults();
  await click('.growth-reset');
  for (const [currency,revenue] of [['INR','₹6,24,00,000'],['GBP','£624,000'],['USD','$780,000']]) {
    await click(`[data-currency="${currency}"]`); await assertNoResults();
    assert.equal((await calculate()).revenue,revenue);
  }
  await evaluate(client, `document.querySelector('#roi-monthly-ad-spend-slider').focus()`);
  await pressKey('ArrowRight'); await assertNoResults();
  assert.equal(await evaluate(client, `document.querySelector('#roi-monthly-ad-spend').value`),'5000.01');
  await input('#roi-monthly-revenue', '12345.67');
  await pressKey('Enter');
  await waitForCondition(client, `Boolean(document.querySelector('[data-calculator-results]'))`, 'Enter calculates with latest typed value');
  assert.equal((await readResults()).revenue,'$328,148.40');
  await click('[data-calculator-cta]');
  assert.equal(await evaluate(client, 'document.activeElement.id'), 'primary-audit-name', 'CTA focuses actual audit form');

  for(const width of [320,390,768,1024,1440]) {
    await client.send('Emulation.setDeviceMetricsOverride', {width,height:1000,deviceScaleFactor:1,mobile:width<500});
    await client.send('Page.bringToFront');
    await click('.growth-reset');
    await checkOverflow(width);
    await calculate();
    await checkOverflow(width);
    if (width<1024) assert.equal(await evaluate(client, `(()=>{const r=document.querySelector('#growth-calculator-results').getBoundingClientRect();return r.top>=60&&r.top<innerHeight-60})()`),true,'mobile scrolls results into view');
    if([390,1440].includes(width)) await screenshot(`growth-calculator-${width}.png`);
    await input('#roi-monthly-revenue','1000000000');
    await input('#roi-monthly-ad-spend','1000000000');
    await input('#roi-revenue-multiplier','20');
    await click('[data-period="custom"]'); await input('#roi-custom-months','120');
    assert.equal((await calculate()).revenue,'$2,520,000,000,000');
    await checkOverflow(width);
    results.push({width,inputs:'passed',results:'passed',maximumValues:'passed'});
  }
  assert.deepEqual(submissions, [], 'calculator does not submit business inputs');
  assert.deepEqual(errors, [], 'uncaught browser errors');
  console.log(JSON.stringify({results,periods:'passed',currencies:3,validation:'passed',zeroSpend:'passed',editing:'passed',keyboard:'passed',cta:'passed',lazyLoad:'passed',submissions,errors},null,2));
} finally {client?.socket.close(); await closeChrome(browser);}
