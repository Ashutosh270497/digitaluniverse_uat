import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { launchChrome, connectToPage, closeChrome, wait, evaluate, waitForCondition } from '../lib/browser.mjs';
import { SITE_CONFIG, SPN_SERVICES } from '../../src/config/site.js';

const BASE_URL = process.env.AUDIT_BASE_URL ?? 'http://127.0.0.1:4173/';
const output = new URL('../../artifacts/audits/', import.meta.url);
mkdirSync(output, { recursive: true });
const regions = [['north-america', 'US', 'North America'], ['europe', 'UK', 'Europe'], ['asia', 'IN', 'Asia']];
const screenshot = async (client, filename) => {
  const rect = await evaluate(client, `(() => {const r=document.querySelector('#global-coverage').getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height}})()`);
  const result = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...rect, scale: 1 } });
  writeFileSync(new URL(filename, output), Buffer.from(result.data, 'base64'));
};

const run = async (width, { reducedMotion = false, forceFallback = false } = {}) => {
  const browser = await launchChrome({ forceFallback });
  let client;
  try {
    client = await connectToPage(browser.browserWebSocketUrl);
    await Promise.all([client.send('Page.enable'), client.send('Runtime.enable'), client.send('Network.enable')]);
    await client.send('Page.bringToFront');
    await client.send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 500 });
    await client.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reducedMotion ? 'reduce' : 'no-preference' }] });
    await client.send('Page.navigate', { url: BASE_URL });
    await waitForCondition(client, `Boolean(document.querySelector('#global-coverage'))`, 'homepage');
    assert.equal(await evaluate(client, `performance.getEntriesByType('resource').some(r=>r.name.includes('GlobalCoverageVisual-'))`), false, 'map stays lazy before approaching it');
    await evaluate(client, `document.querySelector('#global-coverage').scrollIntoView({behavior:'instant'})`);
    await waitForCondition(client, `Boolean(document.querySelector('[data-map-ready]'))`, 'interactive map');
    await wait(850);
    assert.equal(await evaluate(client, `document.querySelectorAll('[data-map-marker]').length`), 3);
    assert.equal(await evaluate(client, `document.querySelectorAll('[data-region-select]').length`), 3);
    assert.equal(await evaluate(client, `document.querySelector('[data-map-zoom]').dataset.mapZoom`), '1.00');
    if ([390, 1440].includes(width) && !reducedMotion) await screenshot(client, `interactive-map-${width}.png`);

    for (const [id, code, label] of regions) {
      await evaluate(client, `document.querySelector('[data-region-select="${id}"]').click()`);
      await waitForCondition(client, `document.querySelector('#coverage-region-title').textContent === '${label}'`, 'selected region panel');
      assert.equal(await evaluate(client, `document.querySelector('[data-region-select="${id}"]').getAttribute('aria-pressed')`), 'true');
      assert.equal(await evaluate(client, `document.querySelector('[data-map-marker="${id}"]').getAttribute('aria-pressed')`), 'true');
      assert.equal(await evaluate(client, `document.querySelector('[data-map-zoom]').dataset.mapZoom`), '1.65');
      const actual = await evaluate(client, `[...document.querySelectorAll('[data-region-directory]')].map(a=>a.href).sort()`);
      const directory = SITE_CONFIG.spnRegions.find(region => region.code === code);
      assert.deepEqual(actual, SPN_SERVICES.map(service => directory.links[service.key]).sort());
      assert.equal(await evaluate(client, `document.querySelector('#coverage-region-details a.button-primary').getAttribute('href')`), '/contact#primary-audit-form');
    }
    await evaluate(client, `document.querySelector('button[aria-label="Reset world view"]').click()`);
    await wait(800);
    // Native keyboard activation on the actual map pin, not just the region buttons.
    await evaluate(client, `document.querySelector('[data-map-marker="europe"]').focus()`);
    assert.equal(await evaluate(client, `document.activeElement.dataset.mapMarker`), 'europe', 'map marker receives keyboard focus');
    await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await client.send('Input.dispatchKeyEvent', { type: 'char', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' });
    await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await waitForCondition(client, `document.querySelector('#coverage-region-title').textContent === 'Europe'`, 'keyboard marker selection');
    assert.equal(await evaluate(client, `document.activeElement.dataset.mapMarker`), 'europe', 'region selection preserves focus');
    await evaluate(client, `document.querySelector('button[aria-label="Zoom in"]').click()`);
    await wait(800);
    assert.equal(await evaluate(client, `document.querySelector('[data-map-zoom]').dataset.mapZoom`), '2.00');

    if (width === 1440) {
      await evaluate(client, `document.querySelector('[data-map-zoom]').scrollIntoView({behavior:'instant',block:'center'})`);
      const rect = await evaluate(client, `(()=>{const r=document.querySelector('[data-map-zoom]').getBoundingClientRect();return {x:r.left+r.width*.35,y:r.top+r.height*.65}})()`);
      const before = await evaluate(client, `document.querySelector('[data-map-camera]').style.transform`);
      await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', buttons: 1, clickCount: 1, ...rect });
      await client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', buttons: 1, x: rect.x + 75, y: rect.y + 15 });
      await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', buttons: 0, clickCount: 1, x: rect.x + 75, y: rect.y + 15 });
      assert.notEqual(await evaluate(client, `document.querySelector('[data-map-camera]').style.transform`), before, 'pointer drag pans map');
    }

    await evaluate(client, `document.querySelector('[data-map-zoom]').focus()`);
    await client.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Home', code: 'Home', windowsVirtualKeyCode: 36 });
    await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Home', code: 'Home', windowsVirtualKeyCode: 36 });
    await wait(800);
    assert.equal(await evaluate(client, `document.querySelector('[data-map-zoom]').dataset.mapZoom`), '1.00');
    assert.equal(await evaluate(client, `document.querySelector('button[aria-label="Zoom out"]').disabled`), true);
    assert.equal(await evaluate(client, `document.documentElement.scrollWidth > innerWidth`), false, 'no page overflow');
    assert.equal(await evaluate(client, `[...document.querySelectorAll('#global-coverage button')].filter(b=>!b.hidden && b.getClientRects().length).every(b=>{const r=b.getBoundingClientRect();return r.width>=44 && r.height>=44})`), true, 'comfortable control targets');
    assert.equal(await evaluate(client, `document.querySelector('#global-coverage canvas') !== null`), false, 'works without canvas/WebGL');
    assert.equal(await evaluate(client, `performance.getEntriesByType('resource').some(r=>r.name.includes('GlobalCoverageWebGL-'))`), false);
    if (reducedMotion) {
      assert.equal(await evaluate(client, `document.querySelector('[data-map-tour]') === null`), true);
      assert.equal(await evaluate(client, `document.querySelector('[data-map-motion]') === null`), true);
      assert.equal(await evaluate(client, `getComputedStyle(document.querySelector('.coverage-route-travel')).animationName`), 'none');
      assert.equal(await evaluate(client, `getComputedStyle(document.querySelector('.coverage-route-signal')).display`), 'none');
    } else if (width === 1440) {
      const sampleMotion = () => evaluate(client, `(()=>{const dot=document.querySelector('.coverage-route-signal');const rect=dot.getBoundingClientRect();return {distance:getComputedStyle(dot).offsetDistance,x:rect.x,y:rect.y,flow:getComputedStyle(document.querySelector('.coverage-route-travel')).strokeDashoffset}})()`);
      const beforeMotion = await sampleMotion();
      await wait(450);
      const afterMotion = await sampleMotion();
      assert.notEqual(beforeMotion.distance, afterMotion.distance, 'signal keeps travelling after the original four-second cutoff');
      assert.notEqual(beforeMotion.x, afterMotion.x, 'signal actually moves on the map');
      assert.notEqual(beforeMotion.flow, afterMotion.flow, 'connections keep flowing');
      await evaluate(client, `document.querySelector('[data-map-motion]').click()`);
      await waitForCondition(client, `document.querySelector('[data-animation-active]').dataset.animationActive === 'false'`, 'manual motion pause');
      const frozen = await sampleMotion();
      await wait(450);
      assert.deepEqual(await sampleMotion(), frozen, 'pause freezes the visible flow and signals');
      await evaluate(client, `document.querySelector('[data-map-motion]').click()`);
      await waitForCondition(client, `document.querySelector('[data-animation-active]').dataset.animationActive === 'true'`, 'manual motion resume');
      await evaluate(client, `document.querySelector('[data-map-tour]').click()`);
      await waitForCondition(client, `document.querySelector('#coverage-region-title').textContent === 'Asia'`, 'tour advances region', 7500);
      await evaluate(client, `document.querySelector('[data-map-tour]').click()`);
      assert.equal(await evaluate(client, `document.querySelector('[data-map-tour]').getAttribute('aria-pressed')`), 'false');
      await evaluate(client, `document.querySelector('[data-map-tour]').click();window.scrollTo({top:0,behavior:'instant'})`);
      await waitForCondition(client, `document.querySelector('[data-animation-active]').dataset.animationActive === 'false'`, 'offscreen animation pauses');
      const pausedRegion = await evaluate(client, `document.querySelector('#coverage-region-title').textContent`);
      const offscreenMotion = await sampleMotion();
      await wait(6300);
      assert.equal(await evaluate(client, `document.querySelector('#coverage-region-title').textContent`), pausedRegion, 'tour does not advance offscreen');
      // The last selected region's camera can finish its transition while the
      // ambient animations are paused; compare their own progress, not page coordinates.
      const afterOffscreen = await sampleMotion();
      assert.equal(afterOffscreen.distance, offscreenMotion.distance, 'signals stop offscreen');
      assert.equal(afterOffscreen.flow, offscreenMotion.flow, 'connection flow stops offscreen');
    }
    const errors = client.events.filter(event => event.method === 'Runtime.exceptionThrown');
    assert.deepEqual(errors, []);
    return { width, reducedMotion, forceFallback, regions: 3, regionalLinks: 9, selection: 'passed', zoomAndReset: 'passed', keyboard: 'passed', ...(width === 1440 ? { continuousMotion: 'passed', pauseAndResume: 'passed' } : {}), webglRequests: 0 };
  } finally {
    client?.socket.close();
    await closeChrome(browser);
  }
};

const results = [];
for (const width of [1440, 390, 320, 768]) results.push(await run(width));
results.push(await run(1024, { reducedMotion: true, forceFallback: true }));
console.log(JSON.stringify({ results }, null, 2));
