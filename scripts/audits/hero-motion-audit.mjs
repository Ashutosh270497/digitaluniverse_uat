import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { HERO_HEADLINE, HERO_MESSAGES, HERO_MESSAGE_PREFIX } from '../../src/content/hero.js';
import { launchChrome, connectToPage, closeChrome, evaluate, wait, waitForCondition } from '../lib/browser.mjs';

const baseUrl = process.env.AUDIT_BASE_URL ?? 'http://127.0.0.1:4173/';
const output = new URL('../../artifacts/audits/', import.meta.url);
mkdirSync(output, { recursive: true });
const browser = await launchChrome();
let client;
const errors = [];
const results = [];
const text = () => evaluate(client, `document.querySelector('[data-hero-message]').textContent`);

try {
  client = await connectToPage(browser.browserWebSocketUrl);
  await Promise.all([client.send('Page.enable'), client.send('Runtime.enable')]);
  await client.send('Page.bringToFront');
  client.on('Runtime.exceptionThrown', event => errors.push(event.exceptionDetails?.text));

  for (const width of [1440, 320, 390, 768, 1024]) {
    await client.send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 500 });
    await client.send('Page.bringToFront');
    await client.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    await client.send('Page.navigate', { url: new URL(`/?hero_audit=${width}`, baseUrl).href });
    await waitForCondition(client, `document.querySelector('[data-hero-motion]')?.dataset.heroMotion === 'playing'`, 'visible headline starts');
    assert.equal(await evaluate(client, `document.querySelector('h1').getAttribute('aria-label')`), HERO_HEADLINE);
    assert.equal(await evaluate(client, `document.querySelectorAll('h1').length`), 1);
    assert.equal(await evaluate(client, `document.querySelector('[data-hero-motion-control]')`), null, 'headline pause button removed');
    const height = await evaluate(client, `document.querySelector('h1').getBoundingClientRect().height`);

    if (width === 1440) {
      const messages = new Set();
      const deadline = Date.now() + 50_000;
      let completeMessage = '';
      let completeSince = 0;
      let readingPauses = 0;
      while (messages.size < HERO_MESSAGES.length && Date.now() < deadline) {
        const current = await text();
        if (HERO_MESSAGES.some(message => `${HERO_MESSAGE_PREFIX}${message}` === current)) {
          messages.add(current);
          if (current !== completeMessage) { completeMessage = current; completeSince = Date.now(); }
        } else if (completeMessage) {
          assert.ok(Date.now() - completeSince >= 4500, 'complete messages allow at least 4.5 seconds of observed reading time');
          readingPauses += 1;
          completeMessage = '';
        }
        assert.equal(await evaluate(client, `document.querySelector('h1').getBoundingClientRect().height`), height, 'typing does not shift heading layout');
        await wait(150);
      }
      assert.deepEqual([...messages].sort(), HERO_MESSAGES.map(message => HERO_MESSAGE_PREFIX + message).sort(), 'all four recorded headlines appear');
      assert.equal(readingPauses, 3, 'longer reading time verified between messages');
    }

    assert.equal(await evaluate(client, `document.documentElement.scrollWidth > innerWidth`), false, `${width}: no overflow`);
    if ([390, 1440].includes(width)) {
      const rect = await evaluate(client, `(()=>{const r=document.querySelector('#home').getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height}})()`);
      const screenshot = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...rect, scale: 1 } });
      writeFileSync(new URL(`hero-recording-${width}.png`, output), Buffer.from(screenshot.data, 'base64'));
    }
    await evaluate(client, `document.querySelector('#services').scrollIntoView({behavior:'instant'})`);
    await waitForCondition(client, `document.querySelector('[data-hero-motion]').dataset.heroMotion === 'paused'`, 'offscreen pause');
    const offscreenText = await text();
    await wait(250);
    assert.equal(await text(), offscreenText);
    await evaluate(client, `window.scrollTo({top:0,behavior:'instant'})`);
    await client.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await waitForCondition(client, `document.querySelector('[data-hero-motion]').dataset.heroMotion === 'paused'`, 'reduced-motion static headline');
    const reducedText = await text();
    await wait(150);
    assert.equal(await text(), reducedText);
    assert.ok(HERO_MESSAGES.some(message => HERO_MESSAGE_PREFIX + message === reducedText));
    results.push({ width, layout: 'stable', pauseButton: 'removed', ...(width === 1440 ? { readingPauses: 'passed' } : {}), offscreenPause: 'passed', reducedMotion: 'passed' });
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ results, recordedMessages: 4, errors }, null, 2));
} finally {
  client?.socket.close();
  await closeChrome(browser);
}
