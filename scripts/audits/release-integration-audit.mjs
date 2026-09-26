import { launchChrome, connectToPage, closeChrome, wait, evaluate } from '../lib/browser.mjs'
import assert from 'node:assert/strict'
import { SEO_ROUTES } from '../../src/config/seo.js'
import { SITE_CONFIG, SPN_SERVICES, SPN_INDIA_SERVICES } from '../../src/config/site.js'

const BASE_URL = process.env.AUDIT_BASE_URL ?? 'http://127.0.0.1:4173/'
const EXPECT_CONSENT = process.env.AUDIT_EXPECT_CONSENT === 'true'
const EXPECTED_CRO_EXPERIMENT = process.env.AUDIT_EXPECT_CRO_EXPERIMENT ?? ''
const WAIT_MS = 250

const getPreviewPath = (pathname) => {
  if (pathname === '/' || pathname.endsWith('.html')) return pathname
  return `${pathname.replace(/\/+$/, '')}/`
}


const navigate = async (client, path) => {
  const targetUrl = new URL(path, BASE_URL)
  await client.send('Page.navigate', { url: targetUrl.toString() })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    const pageState = await evaluate(client, `({
      pathname: location.pathname,
      readyState: document.readyState,
      hasHeading: Boolean(document.querySelector('h1')),
    })`).catch(() => null)
    if (
      pageState?.pathname === targetUrl.pathname
      && pageState.readyState === 'complete'
      && pageState.hasHeading
    ) break
    await wait(50)
  }
  await wait(WAIT_MS)
  assert.equal(await waitForBrowserCondition(client, `Boolean(document.querySelector('h1')) && !document.querySelector('#root > main > p[role="status"]')`, 10000), true, `${path} page ready for interaction`)
}

const pressKey = async (client, key, code = key) => {
  const virtualKeyCode = { Enter: 13, Escape: 27, ' ': 32, Tab: 9, ArrowLeft: 37, ArrowRight: 39 }[key] ?? 0
  const keyParams = {
    key,
    code,
    windowsVirtualKeyCode: virtualKeyCode,
    nativeVirtualKeyCode: virtualKeyCode,
  }
  await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...keyParams })
  if (key === 'Enter' || key === ' ') {
    await client.send('Input.dispatchKeyEvent', {
      type: 'char',
      ...keyParams,
      text: key === 'Enter' ? '\r' : ' ',
      unmodifiedText: key === 'Enter' ? '\r' : ' ',
    })
  }
  await client.send('Input.dispatchKeyEvent', { type: 'keyUp', ...keyParams })
  await wait(80)
}

const waitForBrowserCondition = async (client, expression, timeoutMilliseconds = 4_000) => {
  const deadline = Date.now() + timeoutMilliseconds
  while (Date.now() < deadline) {
    if (await evaluate(client, expression)) return true
    await wait(80)
  }
  return false
}

const routeAudit = async (client) => {
  const results = []
  for (const route of SEO_ROUTES.filter((item) => item.kind !== 'not-found')) {
    await navigate(client, getPreviewPath(route.path))
    const expectedH1 = EXPECTED_CRO_EXPERIMENT === 'hero_positioning' && route.path === '/'
      ? 'Build Profitable Amazon Growth Across India and Global Marketplaces'
      : route.h1
    assert.equal(
      await waitForBrowserCondition(
        client,
        `(document.querySelector('h1')?.getAttribute('aria-label') || document.querySelector('h1')?.textContent?.trim()) === ${JSON.stringify(expectedH1)}`,
      ),
      true,
      `${route.path} React route render`,
    )
    const result = await evaluate(client, `(() => ({
      title: document.title,
      h1: (document.querySelector('h1')?.getAttribute('aria-label') || document.querySelector('h1')?.textContent?.trim()) ?? '',
      mains: document.querySelectorAll('main').length,
      unnamedLinks: [...document.querySelectorAll('a[href]')]
        .filter((link) => !(link.getAttribute('aria-label') || link.textContent.trim() || link.querySelector('img[alt]:not([alt=""])')))
        .map((link) => link.outerHTML.slice(0, 180)),
      unsafeBlankLinks: [...document.querySelectorAll('a[target="_blank"]')]
        .filter((link) => !/noopener|noreferrer/.test(link.rel))
        .map((link) => link.href),
      placeholderLinks: [...document.querySelectorAll('a[href]')]
        .filter((link) => ['', '#'].includes(link.getAttribute('href')?.trim()))
        .map((link) => link.outerHTML.slice(0, 180)),
      hrefs: [...document.querySelectorAll('a[href]')].map((link) => link.href),
      footerBadges: [...document.querySelectorAll('footer [data-amazon-partner-badge]')].map(link => ({ kind: link.dataset.amazonPartnerBadge, href: link.getAttribute('href') })),
    }))()`)

    assert.equal(result.title, route.title, `${route.path} document title`)
    assert.equal(result.h1, expectedH1, `${route.path} H1`)
    assert.equal(result.mains, 1, `${route.path} one main landmark`)
    assert.deepEqual(result.unnamedLinks, [], `${route.path} accessible link names`)
    assert.deepEqual(result.unsafeBlankLinks, [], `${route.path} safe new-tab links`)
    assert.deepEqual(result.placeholderLinks, [], `${route.path} no placeholder links`)
    assert.deepEqual(result.footerBadges, [
      { kind: 'ads', href: SITE_CONFIG.amazonAdsPartnerUrl },
      { kind: 'spn', href: '/#amazon-credentials' },
    ], `${route.path} shared partner badges`)
    results.push({ path: route.path, hrefs: result.hrefs })
  }

  await navigate(client, '/404.html')
  assert.equal(
    await waitForBrowserCondition(
      client,
      `(document.querySelector('h1')?.getAttribute('aria-label') || document.querySelector('h1')?.textContent?.trim()) === 'Page not found'`,
    ),
    true,
    '404 React route render',
  )
  const notFound = await evaluate(client, `({
    h1: (document.querySelector('h1')?.getAttribute('aria-label') || document.querySelector('h1')?.textContent?.trim()),
    robots: document.querySelector('meta[name="robots"]')?.content,
  })`)
  assert.equal(notFound.h1, 'Page not found')
  assert.equal(notFound.robots, 'noindex, nofollow')

  await navigate(client, '/thank-you.html')
  const legacyStatus = await evaluate(client, `({
    title: document.title,
    h1: (document.querySelector('h1')?.getAttribute('aria-label') || document.querySelector('h1')?.textContent?.trim()),
    robots: document.querySelector('meta[name="robots"]')?.content,
    hrefs: [...document.querySelectorAll('a[href]')].map((link) => link.href),
    unsafeBlankLinks: [...document.querySelectorAll('a[target="_blank"]')]
      .filter((link) => !/noopener|noreferrer/.test(link.rel))
      .map((link) => link.href),
  })`)
  assert.equal(legacyStatus.title, 'Audit Request Status | Digital Universe Pro')
  assert.equal(legacyStatus.h1, 'Return to the audit form')
  assert.equal(legacyStatus.robots, 'noindex, nofollow')
  assert.deepEqual(legacyStatus.unsafeBlankLinks, [])
  results.push({ path: '/thank-you.html', hrefs: legacyStatus.hrefs })

  return results
}

const internalLinkAudit = async (client, routeResults) => {
  const baseOrigin = new URL(BASE_URL).origin
  const internalTargets = new Map()
  const externalTargets = new Set()
  for (const route of routeResults) {
    for (const href of route.hrefs) {
      const url = new URL(href)
      if (url.origin !== baseOrigin) {
        assert.ok(
          ['https:', 'mailto:', 'tel:'].includes(url.protocol),
          `${route.path} safe external protocol: ${href}`,
        )
        if (url.protocol === 'mailto:') assert.match(url.pathname, /^[^@\s]+@[^@\s]+\.[^@\s]+$/)
        if (url.protocol === 'tel:') assert.match(url.pathname, /^\+[1-9]\d{7,14}$/)
        externalTargets.add(href)
        continue
      }
      const key = `${url.pathname}${url.hash}`
      internalTargets.set(key, { pathname: url.pathname, hash: url.hash })
    }
  }

  for (const target of internalTargets.values()) {
    const previewPath = getPreviewPath(target.pathname)
    const response = await fetch(new URL(previewPath, BASE_URL))
    assert.equal(response.status, 200, `${target.pathname} internal response`)
    if (target.hash) {
      await navigate(client, `${previewPath}${target.hash}`)
      const targetId = decodeURIComponent(target.hash.slice(1))
      const exists = await waitForBrowserCondition(
        client,
        `Boolean(document.getElementById(${JSON.stringify(targetId)}))`,
      )
      assert.equal(exists, true, `${target.pathname}${target.hash} anchor target`)
    }
  }

  return {
    internal: [...internalTargets.keys()].sort(),
    external: [...externalTargets].sort(),
  }
}

const homeInteractionAudit = async (client) => {
  console.log('  homepage: pointer CTAs')
  await navigate(client, '/')
  assert.equal(await waitForBrowserCondition(client, `Boolean(document.querySelector('#services'))`), true, 'homepage sections mounted')
  const primaryCtaCount = await evaluate(client, `(() => {
    const labels = ['Request My Free Amazon Audit', 'Get My Amazon Growth Plan'];
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const formInitiallyPresent = Boolean(document.getElementById('primary-audit-form'));
    const buttons = [...document.querySelectorAll('button')]
      .filter((button) => button.type !== 'submit' && labels.some((label) => button.textContent.includes(label)) && visible(button));
    for (const button of buttons) {
      button.click();
      if (formInitiallyPresent && document.activeElement?.id !== 'primary-audit-name') {
        throw new Error('A primary audit CTA did not focus the first field.');
      }
    }
    return buttons.length;
  })()`)
  const expectedPrimaryCtas = EXPECTED_CRO_EXPERIMENT === 'form_presentation' ? 4 : 3
  assert.equal(primaryCtaCount, expectedPrimaryCtas, `homepage primary CTA coverage: ${primaryCtaCount}`)
  assert.equal(
    await waitForBrowserCondition(client, `document.activeElement?.id === 'primary-audit-name'`),
    true,
    'homepage pointer CTA focus',
  )

  console.log('  homepage: keyboard primary CTA')
  await navigate(client, '/')
  await evaluate(client, `document.querySelector('header button')?.focus()`)
  const focusedHeaderControl = await evaluate(client, `({
    activeId: document.activeElement?.id,
    activeText: document.activeElement?.textContent?.trim(),
    href: location.href,
  })`)
  assert.ok(
    ['Request My Free Amazon Audit', 'Get My Amazon Growth Plan']
      .some((label) => focusedHeaderControl.activeText?.includes(label)),
    `keyboard CTA focus: ${JSON.stringify(focusedHeaderControl)}`,
  )
  await pressKey(client, 'Enter')
  assert.equal(await evaluate(client, `document.activeElement?.id`), 'primary-audit-name')

  console.log('  homepage: keyboard secondary CTA')
  await navigate(client, '/')
  await evaluate(client, `([...document.querySelectorAll('a[href="/amazon-spn"]')]
    .find((link) => link.textContent.includes('Explore Our SPN Page')))?.focus()`)
  await pressKey(client, 'Enter')
  assert.equal(await waitForBrowserCondition(client, `document.querySelectorAll('[data-spn-service]').length === 4`), true, 'SPN page renders after keyboard navigation')
  assert.deepEqual(await evaluate(client, `[...document.querySelectorAll('[data-spn-service]')].map(link => link.href)`), SPN_INDIA_SERVICES.map(service => service.url))

  console.log('  homepage: keyboard FAQ')
  await navigate(client, '/')
  await evaluate(client, `document.querySelector('#faq button[aria-controls]')?.focus()`)
  await pressKey(client, 'Enter')
  assert.equal(
    await evaluate(client, `document.querySelector('#faq button[aria-controls]')?.getAttribute('aria-expanded')`),
    'true',
  )

  console.log('  homepage: mobile menu')
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
    screenWidth: 390,
    screenHeight: 844,
  })
  console.log('  homepage: mobile metrics applied')
  await navigate(client, '/?release_viewport=mobile')
  console.log('  homepage: mobile page loaded')
  await evaluate(client, `document.getElementById('mobile-menu-toggle')?.focus()`)
  console.log('  homepage: mobile toggle focused')
  await pressKey(client, 'Enter')
  console.log('  homepage: mobile menu opened')
  assert.equal(await evaluate(client, `document.getElementById('mobile-menu-toggle')?.getAttribute('aria-expanded')`), 'true')
  await evaluate(client, `document.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'Escape',
    code: 'Escape',
    bubbles: true,
  }))`)
  await wait(80)
  console.log('  homepage: mobile menu closed')
  assert.equal(await evaluate(client, `document.getElementById('mobile-menu-toggle')?.getAttribute('aria-expanded')`), 'false')
  assert.equal(await evaluate(client, `document.activeElement?.id`), 'mobile-menu-toggle')

  console.log('  homepage: complete')
}

const croTreatmentAudit = async (client) => {
  if (!EXPECTED_CRO_EXPERIMENT) return null

  await navigate(client, '/')
  const checks = {
    hero_positioning: async () => assert.equal(
      await evaluate(client, `document.querySelector('h1')?.textContent.trim()`),
      'Build Profitable Amazon Growth Across India and Global Marketplaces',
    ),
    primary_cta_copy: async () => assert.equal(
      await evaluate(client, `([...document.querySelectorAll('button')]
        .filter((button) => button.offsetWidth > 0 && button.textContent.includes('Get My Amazon Growth Plan'))).length >= 4`),
      true,
    ),
    form_presentation: async () => {
      assert.equal(await evaluate(client, `Boolean(document.getElementById('primary-audit-form'))`), false)
      assert.equal(
        await evaluate(client, `Boolean(document.querySelector('button[aria-controls="primary-audit-form-region"]'))`),
        true,
      )
    },
    revenue_range_field: async () => {
      await navigate(client, '/contact/')
      assert.equal(
        await evaluate(client, `Boolean(document.getElementById('primary-audit-monthly-revenue'))`),
        false,
      )
    },
  }

  assert.ok(checks[EXPECTED_CRO_EXPERIMENT], `unknown CRO treatment ${EXPECTED_CRO_EXPERIMENT}`)
  await checks[EXPECTED_CRO_EXPERIMENT]()
  return EXPECTED_CRO_EXPERIMENT
}

const setFormValuesExpression = ({ contact = 'qa@example.com', monthlyRevenue = '10k-50k' } = {}) => `(() => {
  const setValue = (element, value) => {
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value');
    descriptor.set.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  };
  setValue(document.getElementById('primary-audit-name'), 'Release QA');
  setValue(document.getElementById('primary-audit-contact'), ${JSON.stringify(contact)});
  const revenue = document.getElementById('primary-audit-monthly-revenue');
  if (revenue) setValue(revenue, ${JSON.stringify(monthlyRevenue)});
})()`

const formAudit = async (client) => {
  await navigate(client, '/contact/#primary-audit-form')
  assert.equal(
    await waitForBrowserCondition(client, `document.activeElement?.id === 'primary-audit-name'`),
    true,
    'cross-page audit target focus',
  )

  await evaluate(client, `document.getElementById('primary-audit-form').requestSubmit()`)
  await wait(100)
  assert.equal(await evaluate(client, `document.activeElement?.id`), 'primary-audit-name')
  assert.ok(await evaluate(client, `(() => {
    const expected = document.getElementById('primary-audit-monthly-revenue') ? 3 : 2;
    return document.querySelectorAll('[aria-invalid="true"]').length >= expected;
  })()`))

  await evaluate(client, setFormValuesExpression({ contact: 'not-an-email' }))
  await evaluate(client, `document.getElementById('primary-audit-form').requestSubmit()`)
  await wait(100)
  assert.equal(await evaluate(client, `document.activeElement?.id`), 'primary-audit-contact')

  assert.equal(await evaluate(client, `document.querySelector('[name="amazonUrl"]')`), null, 'Amazon URL field is removed')

  await evaluate(client, setFormValuesExpression())
  await evaluate(client, `(() => {
    window.__qaFetchMode = 'failure';
    window.fetch = async () => new Response(
      JSON.stringify(window.__qaFetchMode === 'success'
        ? { delivered: true, message: 'QA delivery acknowledged.' }
        : { delivered: false, message: 'QA simulated delivery failure.' }),
      { status: window.__qaFetchMode === 'success' ? 200 : 502, headers: { 'Content-Type': 'application/json' } },
    );
    document.getElementById('primary-audit-form').requestSubmit();
  })()`)
  assert.equal(
    await waitForBrowserCondition(client, `document.body.textContent.includes('QA simulated delivery failure.')`),
    true,
    'form failure state',
  )
  assert.equal(await evaluate(client, `document.body.textContent.includes('We received your audit request.')`), false)

  await evaluate(client, `(() => {
    window.__qaFetchMode = 'success';
    document.getElementById('primary-audit-form').requestSubmit();
  })()`)
  assert.equal(
    await waitForBrowserCondition(client, `document.body.textContent.includes('We received your audit request.')`),
    true,
    'form retry success state',
  )
  const success = await evaluate(client, `({
    receipt: document.body.textContent.includes('QA delivery acknowledged.'),
    whatsapp: Boolean(document.querySelector('a[href^="https://wa.me/"]')),
    calendar: Boolean(document.querySelector('a[href*="calendar"], a[href*="calendly"]')),
  })`)
  assert.equal(success.receipt, true)
  assert.equal(success.whatsapp, true)
  assert.equal(success.calendar, false, 'calendar remains absent without an approved URL')

  await navigate(client, '/contact/?release_form=keyboard#primary-audit-form')
  assert.equal(
    await waitForBrowserCondition(client, `Boolean(document.getElementById('primary-audit-form'))`),
    true,
    'keyboard form reload',
  )
  await evaluate(client, setFormValuesExpression())
  await evaluate(client, `(() => {
    window.fetch = async () => new Response(
      JSON.stringify({ delivered: true, message: 'Keyboard QA delivery acknowledged.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
    document.querySelector('#primary-audit-form button[type="submit"]').focus();
  })()`)
  await pressKey(client, 'Enter')
  assert.equal(
    await waitForBrowserCondition(client, `document.body.textContent.includes('Keyboard QA delivery acknowledged.')`),
    true,
    'keyboard form submission',
  )
}

const revenueCurrencyAudit = async (client) => {
  if (EXPECTED_CRO_EXPERIMENT === 'revenue_range_field') return { omittedByExperiment: true }
  for (const path of ['/', '/contact/']) {
    await navigate(client, path)
    await waitForBrowserCondition(client, `Boolean(document.querySelector('#primary-audit-currency-usd'))`)
    const currencyCases = [['USD', '10k-50k', '$10,000–$50,000'], ['INR', '1l-5l', '₹1,00,000–₹5,00,000'], ['GBP', '10k-50k', '£10,000–£50,000']]
    for (const [currency, range, label] of currencyCases) {
      await evaluate(client, `document.getElementById('primary-audit-currency-${currency.toLowerCase()}').click()`)
      assert.equal(await waitForBrowserCondition(client, `document.querySelector('#primary-audit-monthly-revenue').value === ''`), true, `${currency}: range clears on currency change`)
      await evaluate(client, setFormValuesExpression({ monthlyRevenue: range }))
      assert.equal(await evaluate(client, `document.querySelector('#primary-audit-monthly-revenue').selectedOptions[0].textContent`), label)
      await evaluate(client, `(() => {
        window.__qaCurrencyPayload = null;
        window.fetch = async (_url, options) => {
          window.__qaCurrencyPayload = JSON.parse(options.body);
          return new Response(JSON.stringify({delivered:false,message:'QA simulated delivery failure.'}), {status:502,headers:{'Content-Type':'application/json'}});
        };
        document.getElementById('primary-audit-form').requestSubmit();
      })()`)
      assert.equal(await waitForBrowserCondition(client, `Boolean(window.__qaCurrencyPayload)`), true, `${currency}: submission reaches API transport`)
      const submitted = await evaluate(client, 'window.__qaCurrencyPayload')
      assert.equal(submitted.revenueCurrency, currency)
      assert.equal(submitted.monthlyRevenue, range)
      assert.equal('amazonUrl' in submitted, false)
    }
    // Native radio keyboard selection must also reset a monetary range.
    await evaluate(client, `document.querySelector('#primary-audit-currency-gbp').focus()`)
    await pressKey(client, 'ArrowLeft')
    assert.equal(await waitForBrowserCondition(client, `document.querySelector('#primary-audit-currency-inr').checked`), true, 'currency supports arrow-key selection')
    assert.equal(await evaluate(client, `document.querySelector('#primary-audit-monthly-revenue').value`), '')
    await evaluate(client, setFormValuesExpression({ monthlyRevenue: 'not-selling-yet' }))
    await evaluate(client, `document.querySelector('#primary-audit-currency-usd').click()`)
    assert.equal(await waitForBrowserCondition(client, `document.querySelector('#primary-audit-monthly-revenue').value === 'not-selling-yet'`), true, 'non-monetary answer survives currency changes')
  }
  return {currencies:3,forms:2,keyboard:'passed',payloads:'passed'}
}

const partnerBadgeAudit = async (client) => {
  await navigate(client, '/')
  await evaluate(client, `document.querySelector('#home [data-amazon-partner-badge="spn"]').focus()`)
  await pressKey(client, 'Enter')
  assert.equal(await waitForBrowserCondition(client, `location.hash === '#amazon-credentials' && document.querySelector('#amazon-credentials details')?.open`), true, 'SPN badge opens the directory using the keyboard')
  const directoryUrls = SITE_CONFIG.spnRegions.flatMap(region => SPN_SERVICES.map(service => region.links[service.key])).sort()
  assert.deepEqual(await evaluate(client, `[...document.querySelectorAll('#amazon-credentials a')].map(link => link.href).sort()`), directoryUrls, 'all configured regional service links remain available')

  await evaluate(client, `document.querySelector('#amazon-credentials summary').click(); document.querySelector('footer [data-amazon-partner-badge="spn"]').click()`)
  assert.equal(await evaluate(client, `document.querySelector('#amazon-credentials details').open`), true, 'repeated badge clicks reopen a collapsed directory when the hash is unchanged')

  await navigate(client, '/about/')
  await evaluate(client, `document.querySelector('main [data-amazon-partner-badge="spn"]').click()`)
  assert.equal(await waitForBrowserCondition(client, `location.pathname === '/' && document.querySelector('#amazon-credentials details')?.open`), true, 'badge navigation from another page opens the directory')

  await navigate(client, '/#amazon-credentials')
  assert.equal(await evaluate(client, `document.querySelector('#amazon-credentials details').open`), true, 'direct directory URLs work in a fresh page')

  for (const [id, code] of [['north-america', 'US'], ['europe', 'UK'], ['asia', 'IN']]) {
    await evaluate(client, `document.querySelector('[data-region-select="${id}"]').click()`)
    const directory = SITE_CONFIG.spnRegions.find(region => region.code === code)
    assert.equal(await waitForBrowserCondition(client, `document.querySelector('#coverage-region-details [data-amazon-partner-badge="spn"]').href === ${JSON.stringify(directory.links.accountManagement)}`), true, `${code}: the map badge follows the selected region`)
  }
  return { keyboard: 'passed', repeatClick: 'passed', crossPage: 'passed', deepLink: 'passed', regionalLinks: directoryUrls.length, mapRegions: 3 }
}

const attributionAndConsentAudit = async (client) => {
  await navigate(
    client,
    '/?utm_source=release-qa&utm_medium=test&utm_campaign=pre-release&utm_content=hero&utm_term=amazon-ppc&email=private@example.com',
  )
  assert.equal(await evaluate(client, `location.search`), '')

  const consentState = await evaluate(client, `({
    banner: Boolean(document.querySelector('[aria-labelledby="analytics-consent-heading"]')),
    cookieSettings: [...document.querySelectorAll('button')].some((button) => button.textContent.trim() === 'Cookie settings'),
    providerScripts: document.querySelectorAll('script[data-analytics-provider]').length,
  })`)

  if (!EXPECT_CONSENT) {
    assert.deepEqual(consentState, { banner: false, cookieSettings: false, providerScripts: 0 })
    return consentState
  }

  assert.equal(consentState.banner, true)
  assert.equal(consentState.cookieSettings, true)
  assert.equal(consentState.providerScripts, 0)
  await evaluate(client, `([...document.querySelectorAll('button')]
    .find((button) => button.textContent.includes('Decline analytics'))).click()`)
  assert.equal(await evaluate(client, `document.querySelectorAll('script[data-analytics-provider]').length`), 0)
  await evaluate(client, `([...document.querySelectorAll('button')]
    .find((button) => button.textContent.trim() === 'Cookie settings')).click()`)
  assert.equal(await evaluate(client, `Boolean(document.querySelector('[aria-labelledby="analytics-consent-heading"]'))`), true)
  await evaluate(client, `([...document.querySelectorAll('button')]
    .find((button) => button.textContent.includes('Accept analytics'))).click()`)
  await wait(100)
  assert.equal(
    await evaluate(client, `document.querySelectorAll('script[data-analytics-provider]').length`),
    0,
    'test-mode build must not load provider scripts',
  )
  return consentState
}

const main = async () => {
  const session = await launchChrome()
  const browserErrors = []

  try {
    const client = await connectToPage(session.browserWebSocketUrl, BASE_URL)
    client.on('Runtime.exceptionThrown', (event) => {
      browserErrors.push(event.exceptionDetails?.exception?.description ?? event.exceptionDetails?.text)
    })
    await Promise.all([
      client.send('Page.enable'),
      client.send('Runtime.enable'),
      client.send('Network.enable'),
    ])
    await client.send('Page.bringToFront')

    console.log('Release integration audit: routes')
    const routeResults = await routeAudit(client)
    console.log('Release integration audit: internal links')
    const links = await internalLinkAudit(client, routeResults)
    console.log('Release integration audit: CRO treatment')
    const croTreatment = await croTreatmentAudit(client)
    console.log('Release integration audit: homepage interactions')
    await homeInteractionAudit(client)
    console.log('Release integration audit: Amazon partner badges')
    const partnerBadges = await partnerBadgeAudit(client)
    console.log('Release integration audit: form flows')
    await formAudit(client)
    console.log('Release integration audit: revenue currencies')
    const revenueCurrencies = await revenueCurrencyAudit(client)
    console.log('Release integration audit: attribution and consent')
    const consent = await attributionAndConsentAudit(client)

    assert.deepEqual(browserErrors, [], 'uncaught browser exceptions')
    console.log(JSON.stringify({
      baseUrl: BASE_URL,
      routes: routeResults.map((route) => route.path),
      internalLinks: links.internal,
      externalLinks: links.external,
      croTreatment,
      partnerBadges,
      revenueCurrencies,
      consent,
      browserErrors,
    }, null, 2))

    client.socket.close()
  } finally {
    await closeChrome(session)
  }
}

await main()
