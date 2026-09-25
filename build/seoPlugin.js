import { SITE_CONFIG, SPN_SERVICES } from '../src/config/site.js'
import { readFileSync } from 'node:fs'
import { relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  BRAND_IMAGE_PATH,
  BRAND_IMAGE_URL,
  buildRobotsTxt,
  buildSitemapXml,
  buildStructuredData,
  getCanonicalUrl,
  getSeoRouteByEntry,
} from '../src/config/seo.js'
import { FAQ_ITEMS } from '../src/content/serviceContent.ts'

const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url))
const brandLogoSource = fileURLToPath(new URL('../src/assets/brand_logos/logo.jpg', import.meta.url))

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

const getEntryFromContext = (context) =>
  relative(sourceRoot, context.filename).replaceAll('\\', '/')

const createAmazonCredentialsHtml = () => [
  `<p><a href="${escapeHtml(SITE_CONFIG.amazonAdsPartnerUrl)}">Amazon Ads Verified Partner</a></p>`,
  ...SITE_CONFIG.spnRegions.map((region) => [
    `<h3>Amazon SPN — ${escapeHtml(region.label)}</h3>`,
    '<ul>',
    ...SPN_SERVICES.map((service) =>
      `<li><a href="${escapeHtml(region.links[service.key])}">${escapeHtml(service.label)} — ${escapeHtml(region.label)}</a></li>`),
    '</ul>',
  ].join('')),
].join('')

const createStaticSearchShell = (route) => {
  const actionHref = route.kind === 'contact' ? '/' : '/contact'
  const actionLabel = route.kind === 'contact' ? 'Return to homepage' : 'Request My Free Amazon Audit'

  return [
    '<div id="root">',
    '<main class="seo-static-shell" style="margin:0 auto;max-width:960px;padding:64px 24px;font-family:Arial,sans-serif;color:#111827">',
    `<p style="font-weight:700;color:#b45309">${escapeHtml(SITE_CONFIG.brandName)}</p>`,
    `<h1 style="font-size:clamp(2rem,5vw,3.75rem);line-height:1.08">${escapeHtml(route.h1)}</h1>`,
    `<p style="max-width:760px;font-size:1.125rem;line-height:1.7">${escapeHtml(route.description)}</p>`,
    `<p><a href="${actionHref}" style="font-weight:700;color:#92400e">${actionLabel}</a></p>`,
    '</main>',
    '</div>',
  ].join('')
}

const createSeoHeadTags = (route) => {
  const canonicalUrl = getCanonicalUrl(route)
  const tags = [
    { tag: 'title', children: route.title, injectTo: 'head' },
    { tag: 'meta', attrs: { name: 'description', content: route.description }, injectTo: 'head' },
    {
      tag: 'meta',
      attrs: { name: 'robots', content: route.indexable ? 'index, follow' : 'noindex, nofollow' },
      injectTo: 'head',
    },
    { tag: 'meta', attrs: { name: 'theme-color', content: '#111827' }, injectTo: 'head' },
    {
      tag: 'link',
      attrs: { rel: 'icon', type: 'image/jpeg', sizes: '300x300', href: BRAND_IMAGE_PATH },
      injectTo: 'head',
    },
    {
      tag: 'link',
      attrs: { rel: 'apple-touch-icon', sizes: '300x300', href: BRAND_IMAGE_PATH },
      injectTo: 'head',
    },
    { tag: 'meta', attrs: { property: 'og:site_name', content: SITE_CONFIG.brandName }, injectTo: 'head' },
    { tag: 'meta', attrs: { property: 'og:locale', content: 'en_IN' }, injectTo: 'head' },
    { tag: 'meta', attrs: { property: 'og:type', content: 'website' }, injectTo: 'head' },
    { tag: 'meta', attrs: { property: 'og:title', content: route.title }, injectTo: 'head' },
    { tag: 'meta', attrs: { property: 'og:description', content: route.description }, injectTo: 'head' },
    {
      tag: 'meta',
      attrs: { property: 'og:image', content: BRAND_IMAGE_URL },
      injectTo: 'head',
    },
    {
      tag: 'meta',
      attrs: { property: 'og:image:alt', content: 'Digital Universe Pro logo' },
      injectTo: 'head',
    },
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary' }, injectTo: 'head' },
    { tag: 'meta', attrs: { name: 'twitter:title', content: route.title }, injectTo: 'head' },
    { tag: 'meta', attrs: { name: 'twitter:description', content: route.description }, injectTo: 'head' },
    {
      tag: 'meta',
      attrs: { name: 'twitter:image', content: BRAND_IMAGE_URL },
      injectTo: 'head',
    },
    {
      tag: 'meta',
      attrs: { name: 'twitter:image:alt', content: 'Digital Universe Pro logo' },
      injectTo: 'head',
    },
  ]

  if (canonicalUrl) {
    tags.push(
      { tag: 'link', attrs: { rel: 'canonical', href: canonicalUrl }, injectTo: 'head' },
      { tag: 'meta', attrs: { property: 'og:url', content: canonicalUrl }, injectTo: 'head' },
    )
  }

  for (const schema of buildStructuredData(route, FAQ_ITEMS)) {
    tags.push({
      tag: 'script',
      attrs: { type: 'application/ld+json' },
      children: JSON.stringify(schema),
      injectTo: 'head',
    })
  }

  return tags
}

export const technicalSeoPlugin = () => {
  let isBuild = false

  return {
    name: 'digital-universe-pro-technical-seo',
    configResolved(config) {
      isBuild = config.command === 'build'
    },
    buildStart() {
      if (!isBuild) return

      this.emitFile({
        type: 'asset',
        fileName: BRAND_IMAGE_PATH.slice(1),
        source: readFileSync(brandLogoSource),
      })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: buildRobotsTxt() })
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemapXml() })
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        const route = getSeoRouteByEntry(getEntryFromContext(context))
        if (!route) return html

        return {
          html: html
            .replace('<div id="root"></div>', createStaticSearchShell(route))
            .replace('<!-- amazon-credentials: generated from src/config/site.js -->', createAmazonCredentialsHtml()),
          tags: createSeoHeadTags(route),
        }
      },
    },
  }
}
