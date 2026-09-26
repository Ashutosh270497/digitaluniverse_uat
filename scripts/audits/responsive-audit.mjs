import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { launchChrome, connectToPage, closeChrome, evaluate, waitForCondition } from '../lib/browser.mjs'
import { SITE_CONFIG, SPN_SERVICES } from '../../src/config/site.js'

const BASE_URL = process.env.AUDIT_BASE_URL ?? 'http://127.0.0.1:4173/'
const VIEWPORTS = [320, 360, 390, 768, 1024, 1366, 1440]
const directoryUrls = SITE_CONFIG.spnRegions.flatMap(region => SPN_SERVICES.map(service => region.links[service.key])).sort()
const output = new URL('../../artifacts/audits/', import.meta.url)
mkdirSync(output, { recursive: true })
const browser = await launchChrome({ forceFallback: true })
let client
const results = []
const errors = []
const stateExpression = `(() => {
  const visible = el => {
    if (el.closest('[hidden], [aria-hidden="true"], dialog:not([open])')) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== 'hidden' && el.getClientRects().length > 0;
  };
  const name = el => el.getAttribute('aria-label') || el.labels?.[0]?.textContent?.trim() || el.textContent.trim() || el.querySelector('img')?.alt;
  const overflow = [...document.querySelectorAll('main *, footer *')].filter(visible).filter(el => {
    if (el.closest('[data-global-map-frame]') || el.closest('[role="tooltip"]')) return false;
    const rect = el.getBoundingClientRect();
    return rect.left < -1 || rect.right > innerWidth + 1;
  }).map(el => el.tagName + '.' + (typeof el.className === 'string' ? el.className.slice(0,80) : ''));
  const interactive = [...document.querySelectorAll('button, a[href], input:not([type="hidden"]), select, summary')].filter(visible).filter(el => el.tabIndex >= 0);
  const fields = [...document.querySelectorAll('input:not([type="hidden"]), select')].filter(visible).filter(el=>el.tabIndex>=0);
  const faq = [...document.querySelectorAll('#faq button[aria-controls]')];
  const header = document.querySelector('header button');
  const headerRect = header.getBoundingClientRect();
  const founder = document.querySelector('#performance').innerText;
  return {
    width: innerWidth,
    overflow,
    unnamed: interactive.filter(el=>!name(el)).map(el=>el.outerHTML.slice(0,120)),
    unlabeled: fields.filter(el=>!el.labels?.length && !el.getAttribute('aria-label')).map(el=>el.id),
    smallInputs: fields.filter(el=>el.type!=='radio' && Number.parseFloat(getComputedStyle(el).fontSize)<16).map(el=>el.id),
    headerFits: headerRect.left >= 0 && headerRect.right <= innerWidth && headerRect.height >= 40,
    faqValid: faq.length === 8 && faq.every(el=>document.getElementById(el.getAttribute('aria-controls')) && ['true','false'].includes(el.getAttribute('aria-expanded'))),
    internalNotes: /repository|Figure withheld|Business input required|not approved public terms/i.test(document.body.innerText),
    founderFigures: ['50+', 'Brands & Sellers Supported', '15+', 'Amazon Categories', '5+', 'Global Amazon Marketplaces', '5+ Years', 'Combined Amazon Experience'].every(value=>founder.includes(value)),
    duplicateIds: [...new Set([...document.querySelectorAll('[id]')].map(el=>el.id))].filter(id=>document.querySelectorAll('[id="'+id+'"]').length>1),
    credentials: [...document.querySelectorAll('#amazon-credentials a')].map(a=>a.href).sort(),
    safeExternalLinks: [...document.querySelectorAll('a[target="_blank"]')].every(a=>a.rel.includes('noopener') && a.rel.includes('noreferrer')),
    images: [...document.querySelectorAll('main img, footer img')].filter(visible).map(img=>({ alt:img.alt, complete:img.complete, width:img.naturalWidth })),
    contacts: ['mailto:', 'tel:', 'https://wa.me/'].every(prefix=>[...document.querySelectorAll('a')].some(a=>a.href.startsWith(prefix))),
    lazyCalculator: !performance.getEntriesByType('resource').some(resource=>resource.name.includes('/ROICalculator-')),
  };
})()`

try {
  client = await connectToPage(browser.browserWebSocketUrl)
  client.on('Runtime.exceptionThrown', event => errors.push(event.exceptionDetails?.text))
  await client.send('Page.enable')
  await client.send('Runtime.enable')
  await client.send('Page.bringToFront')
  await client.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  for (const width of VIEWPORTS) {
    await client.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 })
    await client.send('Page.navigate', { url: BASE_URL })
    await waitForCondition(client, `Boolean(document.querySelector('#performance'))`, 'homepage')
    await evaluate(client, `(async()=>{ for(const img of document.querySelectorAll('main img, footer img')) { img.loading='eager'; await img.decode().catch(()=>{}); } })()`)
    await evaluate(client, `document.querySelector('#global-coverage').scrollIntoView({behavior:'instant'})`)
    await waitForCondition(client, `Boolean(document.querySelector('[data-map-fallback]'))`, 'static regional map')
    await evaluate(client, `document.querySelector('#growth-calculator').scrollIntoView({behavior:'instant'})`)
    await waitForCondition(client, `Boolean(document.querySelector('#roi-calculator input[type="number"]'))`, 'growth calculator before visual capture')
    await evaluate(client, `window.scrollTo({top:0,behavior:'instant'})`)
    const state = await evaluate(client, stateExpression)
    assert.deepEqual(state.overflow, [], `${width}: overflow`)
    assert.deepEqual(state.unnamed, [], `${width}: unnamed controls`)
    assert.deepEqual(state.unlabeled, [], `${width}: unlabeled fields`)
    assert.deepEqual(state.smallInputs, [], `${width}: small input text`)
    assert.deepEqual(state.duplicateIds, [], `${width}: duplicate IDs`)
    for (const key of ['headerFits', 'faqValid', 'founderFigures', 'safeExternalLinks', 'contacts']) assert.equal(state[key], true, `${width}: ${key}`)
    assert.equal(state.internalNotes, false)
    assert.ok(state.images.every(image=>image.complete && image.width > 0))
    assert.deepEqual(state.credentials, directoryUrls)
    if ([390,1440].includes(width)) {
      const shot = await client.send('Page.captureScreenshot', {format:'png'})
      writeFileSync(new URL(`ui-refresh-hero-${width}.png`, output), Buffer.from(shot.data,'base64'))
      const metrics = await client.send('Page.getLayoutMetrics')
      const full = await client.send('Page.captureScreenshot', {format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:metrics.cssContentSize.height,scale:1}})
      writeFileSync(new URL(`ui-refresh-full-${width}.png`, output),Buffer.from(full.data,'base64'))
    }
    // The expanded credential directory and all published snapshots must also fit.
    await evaluate(client, `document.querySelector('#amazon-credentials details').open=true;document.querySelector('#client-brands details').open=true;document.querySelector('#sales-snapshots details').open=true`)
    const expanded = await evaluate(client, stateExpression)
    assert.deepEqual(expanded.overflow, [], `${width}: expanded sections overflow`)
    assert.equal(await evaluate(client, `document.querySelectorAll('[data-sales-snapshot-id]').length`), 5)
    const galleryButton = `document.querySelector('[data-sales-snapshot-id] button')`
    await evaluate(client, `${galleryButton}.focus(); ${galleryButton}.click()`)
    await waitForCondition(client, `Boolean(document.querySelector('dialog[open]'))`, 'screenshot dialog')
    assert.equal(await evaluate(client, `document.activeElement.getAttribute('aria-label')`), 'Close screenshot')
    assert.equal(await evaluate(client, `(()=>{const r=document.querySelector('dialog').getBoundingClientRect();return r.left>=0 && r.right<=innerWidth})()`), true)
    await client.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
    await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
    await waitForCondition(client, `!document.querySelector('dialog[open]')`, 'dialog dismissal')
    assert.equal(await evaluate(client, `document.activeElement === ${galleryButton}`), true, 'dialog restores trigger focus')
    await evaluate(client, `document.querySelector('#faq button').click()`)
    assert.equal(await evaluate(client, `document.querySelector('#faq button').getAttribute('aria-expanded')`),'true')
    await evaluate(client, `document.querySelector('#growth-calculator').scrollIntoView({behavior:'instant'})`)
    await waitForCondition(client, `Boolean(document.querySelector('#roi-calculator input[type="number"]'))`, 'growth calculator')
    assert.deepEqual((await evaluate(client, stateExpression)).overflow, [], `${width}: calculator overflow`)
    results.push({ width, layout: 'passed', credentials: directoryUrls.length, publishedSnapshots: 5, dialog: 'passed', founderFigures: 'passed' })
  }
  await evaluate(client, `const field=document.querySelector('#roi-calculator input[type="number"]');field.focus();field.select()`)
  await client.send('Input.insertText', { text: '1' })
  assert.equal(await evaluate(client, `document.querySelector('#roi-calculator input[type="number"]').value`), '1', 'number entry is not prematurely clamped')
  await evaluate(client, `document.querySelector('#roi-calculator input[type="number"]').select()`)
  await client.send('Input.insertText', { text: '20000' })
  await evaluate(client, `document.querySelector('#roi-calculator input[type="number"]').blur()`)
  assert.equal(await evaluate(client, `document.querySelector('#roi-calculator input[type="range"]').value`), '20000', 'number entry updates the scenario and slider')
  assert.equal(await evaluate(client, `getComputedStyle(document.documentElement).scrollBehavior`),'auto')
  assert.deepEqual(errors, [], 'uncaught browser errors')
  console.log(JSON.stringify({results,growthCalculator:'passed',reducedMotion:'passed',errors},null,2))
} finally {
  client?.socket.close()
  await closeChrome(browser)
}
