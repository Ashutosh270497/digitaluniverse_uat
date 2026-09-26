import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { launchChrome, connectToPage, closeChrome, evaluate, wait, waitForCondition } from '../lib/browser.mjs';

const BASE_URL = process.env.AUDIT_BASE_URL ?? 'http://127.0.0.1:4173/';
const output = new URL('../../artifacts/audits/', import.meta.url);
mkdirSync(output, { recursive: true });
const browser = await launchChrome({ forceFallback: true });
let client;
const errors = [];
const results = [];

const navigate = async path => {
  await evaluate(client, 'window.__aiAuditPreviousDocument = true');
  const { loaderId } = await client.send('Page.navigate', { url: new URL(path, BASE_URL).href });
  if (loaderId) await waitForCondition(client, '!window.__aiAuditPreviousDocument', 'new document');
  await waitForCondition(client, `Boolean(document.querySelector('header')) && !document.querySelector('#root > main > p[role="status"]')`, 'page render');
};
const screenshot = async (selector, filename) => {
  await evaluate(client, "window.scrollTo({top:0,behavior:'instant'})");
  await wait(100);
  const rect = await evaluate(client, `(()=>{const r=document.querySelector('${selector}').getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height}})()`);
  const image = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...rect, scale: 1 } });
  writeFileSync(new URL(filename, output), Buffer.from(image.data, 'base64'));
};

try {
  client = await connectToPage(browser.browserWebSocketUrl);
  client.on('Runtime.exceptionThrown', event => errors.push(event.exceptionDetails?.text));
  await Promise.all([client.send('Page.enable'), client.send('Runtime.enable')]);
  await client.send('Page.bringToFront');
  await client.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  for (const width of [320, 390, 768, 1024, 1440]) {
    await client.send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 500 });
    await client.send('Page.bringToFront');
    // Use a new document at each width: a same-URL fragment navigation can
    // retain the scroll position changed by the preceding screenshot.
    await navigate(`/ai-services/?audit_viewport=${width}#ai-services`);
    await waitForCondition(client, `Boolean(document.querySelector('[data-ai-service]'))`, 'AI services');
    await waitForCondition(client, `Math.abs(document.querySelector('#ai-services').getBoundingClientRect().top-24)<5`, `${width}: AI deep link positioning`);
    const state = await evaluate(client, `(()=>{
      const cards=[...document.querySelectorAll('[data-ai-service]')];
      return {
        cards:cards.map(card=>({id:card.dataset.aiService,title:card.querySelector('h3').textContent,capabilities:card.querySelectorAll('li').length,href:card.querySelector('a').getAttribute('href'),rect:{top:card.getBoundingClientRect().top,height:card.getBoundingClientRect().height},descriptionTop:card.querySelector('.ai-service-description').getBoundingClientRect().top,capabilitiesTop:card.querySelector('.ai-service-capabilities').getBoundingClientRect().top})),
        columns:getComputedStyle(document.querySelector('.ai-service-grid')).gridTemplateColumns.split(' ').length,
        overflow:document.documentElement.scrollWidth>innerWidth,
        background:getComputedStyle(document.querySelector('#ai-services')).backgroundColor,
        buttonColor:getComputedStyle(document.querySelector('#ai-services .button-primary')).backgroundColor,
        anchorVisible:Math.abs(document.querySelector('#ai-services').getBoundingClientRect().top-24)<5,
        headerLinks:[...document.querySelectorAll('header a')].map(a=>a.getAttribute('href')),
      };
    })()`);
    assert.equal(state.cards.length, 6);
    assert.equal(new Set(state.cards.map(card=>card.id)).size, 6);
    assert.equal(state.overflow, false);
    assert.equal(state.anchorVisible, true, `${width}: AI deep link`);
    assert.equal(state.buttonColor, 'rgb(255, 212, 0)', 'founder yellow on primary buttons');
    assert.equal(state.background, 'rgb(20, 21, 15)', 'warm charcoal replaces navy');
    assert.ok(state.headerLinks.includes('/ai-services'));
    for (const card of state.cards) {
      assert.equal(card.capabilities, 5);
      assert.equal(new URL(card.href, BASE_URL).searchParams.get('service'), card.id);
      assert.equal(new URL(card.href, BASE_URL).hash, '#ai-project');
    }
    for (let index=0;index<state.cards.length;index+=state.columns) {
      const row=state.cards.slice(index,index+state.columns);
      for(const property of ['descriptionTop','capabilitiesTop']) {
        assert.ok(Math.max(...row.map(card=>card[property]))-Math.min(...row.map(card=>card[property]))<2, `${width}: aligned ${property}`);
      }
      assert.ok(Math.max(...row.map(card=>card.rect.height))-Math.min(...row.map(card=>card.rect.height))<2, `${width}: equal card heights`);
    }
    if ([390,1440].includes(width)) await screenshot('#ai-services', `ai-services-${width}.png`);
    results.push({width,columns:state.columns,cards:6,alignment:'passed',yellowTheme:'passed'});
  }

  await navigate('/');
  assert.equal(await evaluate(client, `document.querySelector('#ai-services')`), null, 'AI services are removed from the homepage');
  assert.equal(await evaluate(client, `performance.getEntriesByType('resource').some(resource => resource.name.includes('/AIServicesPage-'))`), false, 'AI page stays lazy on the Amazon homepage');
  await evaluate(client, `document.querySelector('#home a[href="/ai-services"]').click()`);
  await waitForCondition(client, `Boolean(document.querySelector('[data-ai-service]'))`, 'hero AI link opens the standalone page');
  assert.equal(await evaluate(client, `document.querySelectorAll('h1').length`), 1, 'AI page has a single main heading');
  await navigate('/#ai-custom-ai-agents');
  await waitForCondition(client, `location.pathname.startsWith('/ai-services') && Boolean(document.querySelector('#ai-custom-ai-agents'))`, 'legacy AI section links redirect to the new page');

  const services = await evaluate(client, `[...document.querySelectorAll('[data-ai-service]')].map(card=>({id:card.dataset.aiService,title:card.querySelector('h3').textContent,href:card.querySelector('a').getAttribute('href')}))`);
  for (const service of services) {
    await navigate(service.href);
    await waitForCondition(client, `document.querySelector('#ai-project-service')?.value === '${service.id}'`, 'AI service preselection');
    await waitForCondition(client, `document.activeElement.id === 'ai-project-service'`, 'AI contact focus');
    const contacts = await evaluate(client, `({whatsapp:document.querySelector('[data-ai-whatsapp]').href,email:document.querySelector('[data-ai-email]').href})`);
    assert.ok(new URL(contacts.whatsapp).searchParams.get('text').includes(service.title));
    assert.ok(new URL(contacts.email).searchParams.get('subject').includes(service.title));
    assert.equal(new URL(contacts.whatsapp).hostname, 'wa.me');
    assert.equal(await evaluate(client, 'location.search'), '', 'URL privacy cleanup remains active');
  }
  await navigate('/contact?service=invalid-service#ai-project');
  await waitForCondition(client, `Boolean(document.querySelector('#ai-project-service'))`, 'generic AI contact');
  assert.equal(await evaluate(client, `document.querySelector('#ai-project-service').value`), '');
  await evaluate(client, `(()=>{const select=document.querySelector('#ai-project-service');select.value='workflow-automation';select.dispatchEvent(new Event('change',{bubbles:true}))})()`);
  await waitForCondition(client, `document.querySelector('[data-ai-whatsapp]').href.includes('Workflow%20Automation')`, 'changing selection updates enquiry');
  for (const width of [320,390,1440]) {
    await client.send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 500 });
    assert.equal(await evaluate(client, `document.documentElement.scrollWidth>innerWidth`), false, `${width}: contact overflow`);
    if(width===390) await screenshot('#ai-project', 'ai-project-contact-390.png');
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({results,serviceEnquiries:6,selectionChanges:'passed',unknownServiceFallback:'passed',errors},null,2));
} finally { client?.socket.close(); await closeChrome(browser); }
