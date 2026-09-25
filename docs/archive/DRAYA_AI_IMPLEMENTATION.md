# Draya AI Section — Implementation Plan

> Landing page: ScaleAmazon (`amazon-agency-landing`)
> Feature: Add Draya AI agency cross-sell section + header navigation
> Date planned: 2026-05-02

---

## Overview

Two-touchpoint strategy to surface Draya AI services on the existing ScaleAmazon landing page without disrupting the Amazon conversion funnel.

| Touchpoint | Location | Purpose |
|------------|----------|---------|
| Header dropdown | `StickyHeader.jsx` | Persistent discovery for all scroll depths |
| Dedicated section | Between `BookConsultation` and `FAQ` | Primary cross-sell for engaged visitors |

---

## Draya AI Services (6 total)

| # | Service | Description |
|---|---------|-------------|
| 1 | Website Development | Professional websites, landing pages, portfolios, and business websites built to generate leads and build trust |
| 2 | Shopify Development | Custom Shopify stores, product pages, payment setup, shipping setup, and conversion-focused ecommerce design |
| 3 | Marketplace Services | Support for selling on Flipkart, Meesho, JioMart, Ajio, Walmart, eBay, Amazon, and other online marketplaces |
| 4 | Social Media Marketing | Content strategy, creatives, captions, reels ideas, ad creatives, and lead generation campaigns |
| 5 | AI Automation | AI chatbots, AI agents, workflow automation, customer support automation, and internal productivity tools |
| 6 | AI SaaS & MVP Development | AI-powered web apps, dashboards, portals, and SaaS MVPs for startups and businesses |

---

## Color System for Draya AI

Use a distinct palette from ScaleAmazon's amber/gold to signal a separate brand.

| Role | Hex | Usage |
|------|-----|-------|
| Primary | `#4F46E5` (Indigo 600) | Buttons, badges, icon backgrounds |
| Primary dark | `#4338CA` (Indigo 700) | Button hover states |
| Accent | `#7C3AED` (Violet 600) | Gradient end, card accents |
| Section bg | `#0F0A1E` | Dark section background |
| Card bg | `rgba(255,255,255,0.05)` | Glassmorphism cards |
| Card border | `rgba(79,70,229,0.3)` | Card borders, hover: `rgba(79,70,229,0.7)` |
| Gradient | `#4F46E5 → #7C3AED` | Buttons, section headings, icons |

---

## Page Render Order — After Implementation

```
UrgencyBanner
StickyHeader            ← MODIFIED: add "Our Platforms" dropdown
HeroWithForm
LiveActivityTicker
Stats
AchievementBadges
TrustedBrands
ClientLogosMarquee
Services                ← Amazon services (unchanged)
RealClientDashboards
ROICalculator
CaseStudies
Testimonials
MeetTheExpert
WhyChooseUs
IsItWorthIt
BookConsultation        ← Amazon pitch ends here
━━━━━━━━━━━━━━━━━━━━━
DrayaAISection          ← NEW COMPONENT
━━━━━━━━━━━━━━━━━━━━━
FAQ
ContactForm
Footer
WhatsAppFAB
SocialProofPopup
```

---

## Step 1 — Update StickyHeader

**File:** `src/components/StickyHeader.jsx`

### What to change

Replace the plain brand logo area with a nav that includes an `"Our Platforms"` dropdown.

### Dropdown content

```
Our Platforms ▾
├── ◆ ScaleAmazon    → Amazon growth, PPC, listing (current page — scroll to top)
└── ◆ Draya AI       → Websites, AI, Shopify, Social Media (external link, new tab)
```

### Behaviour rules
- Dropdown opens on hover (desktop) and on tap (mobile)
- `ScaleAmazon` entry scrolls to page top
- `Draya AI` entry opens Draya AI website in a new tab (`target="_blank"`)
- Dropdown closes on outside click
- On mobile, collapse into a simple two-item list inside a slide-down menu

### State needed
```js
const [platformsOpen, setPlatformsOpen] = useState(false);
```

---

## Step 2 — Create DrayaAISection Component

**File:** `src/components/DrayaAISection.jsx` ← create new file

### Section layout

```
┌────────────────────────────────────────────────────────────┐
│  [Badge] "Powered by Draya AI"                              │
│                                                             │
│  Headline:                                                  │
│  "Need More Than Amazon?                                    │
│   We've Got You Covered."                                   │
│                                                             │
│  Subtitle:                                                  │
│  "Full-stack digital services — websites, AI, Shopify,      │
│   social media, and marketplace growth for your brand."     │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Website  │  │ Shopify  │  │Marketplace│  ← Row 1        │
│  └──────────┘  └──────────┘  └──────────┘                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Social   │  │AI Automat│  │ AI SaaS  │  ← Row 2        │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                             │
│  [ Explore Draya AI → ]   [ WhatsApp Draya AI ]            │
└────────────────────────────────────────────────────────────┘
```

### Service card layout (per card)

```
┌─────────────────────────────┐
│  [Icon]  Service Name       │
│                             │
│  Short description text     │
│  (2 lines max)              │
│                             │
│  → Learn More               │
└─────────────────────────────┘
```

### Animations
- Section entrance: `fadeInUp` on the heading block
- Cards: staggered `scaleIn` with 0.1s delay between each card
- Hover: card lifts (`y: -8`) with indigo glow (`rgba(79,70,229,0.4)`)
- All animations: `whileInView` with `viewport={{ once: true }}`

### CTA buttons
| Button | Label | Action |
|--------|-------|--------|
| Primary | `Explore Draya AI →` | Opens Draya AI website (new tab) |
| Secondary | `WhatsApp Draya AI` | Opens `wa.me` with pre-filled message: *"Hi, I'm interested in Draya AI services"* |

### Data array structure (hardcode in the component)
```js
const DRAYA_SERVICES = [
  {
    id: 1,
    icon: Globe,           // lucide-react
    title: 'Website Development',
    description: 'Professional websites, landing pages, portfolios, and business websites built to generate leads and build trust.',
    gradient: 'from-indigo-500 to-violet-600',
  },
  {
    id: 2,
    icon: ShoppingBag,
    title: 'Shopify Development',
    description: 'Custom Shopify stores, product pages, payment setup, shipping setup, and conversion-focused ecommerce design.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 3,
    icon: Store,
    title: 'Marketplace Services',
    description: 'Support for selling on Flipkart, Meesho, JioMart, Ajio, Walmart, eBay, Amazon, and other online marketplaces.',
    gradient: 'from-indigo-600 to-blue-600',
  },
  {
    id: 4,
    icon: Megaphone,
    title: 'Social Media Marketing',
    description: 'Content strategy, creatives, captions, reels ideas, ad creatives, and lead generation campaigns.',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: 5,
    icon: Bot,
    title: 'AI Automation',
    description: 'AI chatbots, AI agents, workflow automation, customer support automation, and internal productivity tools.',
    gradient: 'from-violet-600 to-indigo-700',
  },
  {
    id: 6,
    icon: Cpu,
    title: 'AI SaaS & MVP Development',
    description: 'AI-powered web apps, dashboards, portals, and SaaS MVPs for startups and businesses.',
    gradient: 'from-indigo-500 to-purple-700',
  },
];
```

### Icons to import from lucide-react
```js
import { Globe, ShoppingBag, Store, Megaphone, Bot, Cpu, ArrowRight, MessageCircle } from 'lucide-react';
```

> **Note:** `Store` and `Megaphone` may need to be verified against the installed lucide-react version.
> Fallback options: `Store → Building2`, `Megaphone → Mic`, `Bot → Zap`, `Cpu → Layers`

---

## Step 3 — Update App.jsx

**File:** `src/App.jsx`

### Changes

1. Add import at the top:
```js
import DrayaAISection from './components/DrayaAISection';
```

2. Insert component between `BookConsultation` and `FAQ`:
```jsx
<BookConsultation />
<DrayaAISection />   {/* ← add this line */}
<FAQ />
```

---

## Step 4 — Update config/site.js (optional but recommended)

Add Draya AI config so contact details can be updated from one place:

```js
export const DRAYA_CONFIG = {
  brandName: 'Draya AI',
  websiteUrl: 'https://drayaai.com',        // update with real URL
  whatsappNumber: '+91XXXXXXXXXX',           // update with Draya AI WhatsApp number
  whatsappMessage: "Hi, I'm interested in Draya AI services. Can you help me?",
};

export const getDrayaWhatsAppUrl = () =>
  `https://wa.me/${DRAYA_CONFIG.whatsappNumber}?text=${encodeURIComponent(DRAYA_CONFIG.whatsappMessage)}`;
```

---

## Things to Confirm Before Building

- [ ] Draya AI website URL (for the "Explore Draya AI" button)
- [ ] Draya AI WhatsApp number (separate from ScaleAmazon's number, or same?)
- [ ] Should the "Learn More" link on each card go to a section on Draya AI's site or open a modal?
- [ ] Should the contact form below (`ContactForm`) add a "Service type" option for Draya AI, or keep it Amazon-only?
- [ ] Verify lucide-react icon names against the installed version

---

## Files to Create / Modify

| Action | File |
|--------|------|
| MODIFY | `src/components/StickyHeader.jsx` |
| CREATE | `src/components/DrayaAISection.jsx` |
| MODIFY | `src/App.jsx` |
| MODIFY (optional) | `src/config/site.js` |

---

## Estimated Build Time

| Task | Time |
|------|------|
| StickyHeader dropdown | ~20 min |
| DrayaAISection component | ~45 min |
| App.jsx wiring + site.js config | ~5 min |
| Build + test + zip | ~5 min |
| **Total** | **~75 min** |

---

*Document created: 2026-05-02*
*Project: ScaleAmazon landing page | Feature: Draya AI cross-sell*
