export type SpnServiceKey =
  | 'accountManagement'
  | 'advertising'
  | 'cataloging'
  | 'enhancedBrandContent';

export interface ServiceDefinition {
  id: string;
  title: string;
  summary: string;
  whoItIsFor: string;
  problemsSolved: readonly string[];
  deliverables: readonly string[];
  reportingCadence: string | null;
  expectedClientInvolvement: readonly string[];
  notIncluded: readonly string[] | null;
  primaryOutcome: string;
  relevantCaseStudySlug: string | null;
  spnServiceKey: SpnServiceKey | null;
  pageContent?: ServicePageContent;
}

export interface ServicePageContent {
  audienceLabel?: string;
  spnHeading?: string;
  problemsHeading?: string;
  outcomeHeading?: string;
  outcomeBenefits?: readonly string[];
  deliverablesHeading?: string;
  deliverableGroups?: readonly { title: string; items: readonly string[] }[];
  clientInvolvementHeading?: string;
  strategy?: { title: string; description: string; ctaLabel: string };
  processSteps?: readonly Pick<ProcessStep, 'number' | 'title' | 'description'>[];
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  agencyOutput: string;
  clientResponsibility: string;
}

export interface EngagementTerm {
  key:
    | 'pricing-model'
    | 'minimum-engagement'
    | 'pricing-factors'
    | 'onboarding-timeline'
    | 'starting-price';
  label: string;
  value: string | null;
  missingMessage: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const PPC_DELIVERABLE_GROUPS = [
  {
    title: 'Campaign Management',
    items: [
      'Sponsored Products campaign management',
      'Sponsored Brands campaign management',
      'Sponsored Display campaign management',
    ],
  },
  {
    title: 'Keyword & Search Term Optimisation',
    items: ['Keyword research', 'Search-term analysis', 'Negative keyword management', 'Match-type optimisation'],
  },
  {
    title: 'Bid & Budget Optimisation',
    items: ['Bid adjustments', 'Budget allocation', 'Placement optimisation'],
  },
  {
    title: 'Performance Monitoring',
    items: ['ACOS/TACoS monitoring', 'Conversion analysis', 'Campaign performance reviews', 'Ongoing optimisation'],
  },
] as const;

const PPC_PAGE_CONTENT: ServicePageContent = {
  audienceLabel: "Who it's for:",
  spnHeading: 'Explore Our Amazon Services →',
  problemsHeading: 'Common Amazon PPC Challenges We Solve',
  outcomeHeading: 'What You Can Expect',
  outcomeBenefits: [
    'Better budget allocation',
    'More efficient keyword and search-term targeting',
    'Improved campaign visibility',
    'Ongoing performance optimisation',
  ],
  deliverablesHeading: "What's Included in Our PPC Management",
  deliverableGroups: PPC_DELIVERABLE_GROUPS,
  clientInvolvementHeading: 'What We Need From You',
  strategy: {
    title: 'A Strategy Built Around Your Account',
    description: 'Every Amazon account is different. We review your products, margins, competition, existing campaigns and growth objectives before defining the right PPC strategy.',
    ctaLabel: 'Request Your PPC Audit',
  },
  processSteps: [
    {
      number: '01',
      title: 'Account Audit',
      description: 'Review your ASINs, campaigns, search terms, account health and current PPC performance.',
    },
    {
      number: '02',
      title: 'Strategy & Campaign Plan',
      description: 'Identify optimisation opportunities and create a structured PPC action plan.',
    },
    {
      number: '03',
      title: 'Implementation & Optimisation',
      description: 'Apply campaign, keyword, bid, budget and targeting changes based on the agreed strategy.',
    },
    {
      number: '04',
      title: 'Reporting & Continuous Optimisation',
      description: 'Monitor performance, identify opportunities and continuously optimise campaigns based on account data.',
    },
  ],
};

const ACCOUNT_DELIVERABLE_GROUPS = [
  {
    title: 'Account Health',
    items: [
      'Account-health monitoring and priority issue tracking',
      'Policy and performance-related issue coordination',
      'Account status reviews',
    ],
  },
  {
    title: 'Seller Support',
    items: [
      'Seller Support case coordination',
      'Follow-up on open cases',
      'Documentation and escalation support',
    ],
  },
  {
    title: 'Catalogue & Operations',
    items: [
      'Catalogue issue coordination',
      'Listing/variation issue support',
      'Operational task tracking',
    ],
  },
  {
    title: 'Account Priorities',
    items: [
      'Regular account reviews',
      'Priority-based action planning',
      'Performance and operational updates',
    ],
  },
] as const;

const ACCOUNT_PAGE_CONTENT: ServicePageContent = {
  audienceLabel: "Who it's for:",
  problemsHeading: 'Common Amazon Account Challenges We Solve',
  outcomeHeading: 'What You Can Expect',
  outcomeBenefits: [
    'Faster identification of account issues',
    'Structured Seller Support coordination',
    'Better tracking of operational priorities',
    'Regular attention to account health and catalogue issues',
  ],
  deliverablesHeading: "What's Included in Amazon Account Management",
  deliverableGroups: ACCOUNT_DELIVERABLE_GROUPS,
  clientInvolvementHeading: 'What We Need From You',
  strategy: {
    title: 'Account Management Built Around Your Priorities',
    description: 'Every Amazon account has different operational requirements. We review your account structure, current issues, catalogue and business priorities before defining the right support scope.',
    ctaLabel: 'Discuss Your Account',
  },
};

export const SERVICES: readonly ServiceDefinition[] = [
  {
    id: 'amazon-ppc-profitability',
    title: 'Amazon PPC and profitability management',
    summary:
      'Strategic Sponsored Products, Sponsored Brands and Sponsored Display campaigns designed to improve visibility, control ad spend and grow profitable sales.',
    whoItIsFor:
      'Established Amazon sellers looking to improve PPC efficiency, reduce wasted ad spend and scale profitable campaigns.',
    problemsSolved: [
      'Wasted ad spend from irrelevant or low-performing search terms',
      'Campaign structures that make optimisation and performance analysis difficult',
      'Inefficient bids and budgets across campaigns',
      'Limited visibility into ACOS, TACoS and conversion performance',
    ],
    deliverables: PPC_DELIVERABLE_GROUPS.flatMap((group) => group.items),
    reportingCadence: null,
    expectedClientInvolvement: [
      'Access to Seller Central / advertising account',
      'Current margins and target profitability',
      'Product priorities and campaign objectives',
      'Relevant pricing, promotions and inventory information',
    ],
    notIncluded: null,
    primaryOutcome:
      'More control over ad spend, clearer campaign performance and a structured optimisation process focused on profitable growth.',
    relevantCaseStudySlug: null,
    spnServiceKey: 'advertising',
    pageContent: PPC_PAGE_CONTENT,
  },
  {
    id: 'account-management-health',
    title: 'Account management and account health',
    summary:
      'End-to-end Amazon account support covering account health, Seller Support coordination, catalogue management and day-to-day operational priorities.',
    whoItIsFor:
      'Brands and sellers who need reliable Amazon account support, issue resolution and ongoing operational management.',
    problemsSolved: [
      'Account-health alerts and operational issues without clear ownership',
      'Seller Support cases that remain unresolved or require repeated follow-up',
      'Catalogue and account issues affecting day-to-day operations',
      'Important account tasks without structured tracking or follow-through',
    ],
    deliverables: ACCOUNT_DELIVERABLE_GROUPS.flatMap((group) => group.items),
    reportingCadence: null,
    expectedClientInvolvement: [
      'Required Seller Central permissions/access',
      'Brand, product and account information',
      'Relevant business documents when required',
      'Approval for actions that require account-owner confirmation',
    ],
    notIncluded: null,
    primaryOutcome:
      'Clear ownership and structured follow-through across your Amazon account priorities, helping you stay organised and respond to issues efficiently.',
    relevantCaseStudySlug: null,
    spnServiceKey: 'accountManagement',
    pageContent: ACCOUNT_PAGE_CONTENT,
  },
  {
    id: 'listing-seo-catalog',
    title: 'Listing SEO and catalog optimisation',
    summary:
      'Optimised titles, bullet points, descriptions and backend keywords built around relevant search terms and conversion-focused content.',
    whoItIsFor:
      'For brands and sellers whose products are difficult to discover, underperforming in search or need stronger listing content.',
    problemsSolved: [
      'Titles, bullets, and descriptions that do not communicate the product clearly',
      'Catalog attributes, variations, or suppression issues that need investigation',
      'Search-term opportunities that are not reflected in approved listing copy',
    ],
    deliverables: [
      'ASIN, catalog, and listing-quality review for the agreed product set',
      'Search-term and customer-language inputs for listing copy',
      'Recommended title, bullet, and description changes using approved product facts',
      'Catalog issue and content-submission tracker for work included in scope',
    ],
    reportingCadence: null,
    expectedClientInvolvement: [
      'Provide accurate product specifications, claims, and compliance documents',
      'Supply approved images, brand language, and restricted-keyword guidance',
      'Review and approve copy before submission',
    ],
    notIncluded: null,
    primaryOutcome:
      'Clearer, more accurate listings aligned with relevant Amazon search behaviour.',
    relevantCaseStudySlug: null,
    spnServiceKey: 'cataloging',
    pageContent: { audienceLabel: "Who it's for:" },
  },
  {
    id: 'brand-content-storefront',
    title: 'A+ Content, Brand Story and Storefront',
    summary:
      'A structured brand-content system for eligible Amazon detail pages and Storefront experiences.',
    whoItIsFor:
      'Brand Registry-eligible businesses that need clearer product education and more consistent brand presentation.',
    problemsSolved: [
      'Product benefits and differentiation that are difficult to understand',
      'Inconsistent messaging between listings, Brand Story, and Storefront',
      'No agreed content hierarchy or module plan for Amazon creative',
    ],
    deliverables: [
      'Review of existing A+ Content, Brand Story, and Storefront structure',
      'Messaging hierarchy and recommended module or page plan',
      'Copy and creative brief based on client-approved claims and assets',
      'Submission and revision tracking for deliverables included in scope',
    ],
    reportingCadence: null,
    expectedClientInvolvement: [
      'Confirm Brand Registry and feature eligibility',
      'Supply brand guidelines, source files, product claims, and image rights',
      'Approve copy, design direction, and final assets',
    ],
    notIncluded: null,
    primaryOutcome:
      'A clearer and more consistent Amazon brand experience for eligible products.',
    relevantCaseStudySlug: null,
    spnServiceKey: 'enhancedBrandContent',
  },
  {
    id: 'product-launch-growth',
    title: 'Product launch and growth strategy',
    summary:
      'A launch plan that connects listing readiness, inventory, advertising, responsibilities, and measurement.',
    whoItIsFor:
      'Established brands introducing a new ASIN or entering Amazon with a consumer product line.',
    problemsSolved: [
      'Launch dependencies spread across catalog, inventory, content, and advertising',
      'No shared sequence for pre-launch, launch, and early optimisation work',
      'Success measures that are not defined before spend begins',
    ],
    deliverables: [
      'Launch-readiness diagnosis across the agreed Amazon workstreams',
      'Prioritised launch plan with dependencies, owners, and decision points',
      'Initial catalog, content, and advertising work defined in the proposal',
      'Measurement plan using agreed baselines, targets, and review windows',
    ],
    reportingCadence: null,
    expectedClientInvolvement: [
      'Confirm launch dates, inventory readiness, pricing inputs, and product priorities',
      'Provide product evidence, compliance information, and approved creative',
      'Approve launch budget, scope, and material changes',
    ],
    notIncluded: null,
    primaryOutcome:
      'A coordinated Amazon launch with documented owners, dependencies, and measures.',
    relevantCaseStudySlug: null,
    spnServiceKey: null,
  },
  {
    id: 'india-global-expansion',
    title: 'India-to-global marketplace expansion',
    summary:
      'A marketplace-readiness and sequencing plan for brands evaluating expansion between India and other Amazon markets.',
    whoItIsFor:
      'Brands already established in one market that need to assess operational and commercial readiness for another.',
    problemsSolved: [
      'Unclear readiness across account setup, catalog, logistics, compliance, and advertising',
      'No prioritised order for target-market launches',
      'Listing and campaign assumptions that have not been reviewed for the destination market',
    ],
    deliverables: [
      'Readiness and gap assessment for the marketplaces named in the proposal',
      'Phased market-entry plan with dependencies, owners, and decision points',
      'Catalog, content, and advertising localisation plan within the agreed scope',
      'Measurement framework for launch and early-market review',
    ],
    reportingCadence: null,
    expectedClientInvolvement: [
      'Name the target marketplaces and commercial priorities',
      'Confirm tax, compliance, logistics, inventory, and account-readiness inputs',
      'Provide approved translations, product evidence, assets, and local pricing inputs',
    ],
    notIncluded: null,
    primaryOutcome:
      'A documented go-to-market sequence for the Amazon marketplaces confirmed in scope.',
    relevantCaseStudySlug: null,
    spnServiceKey: null,
  },
];

export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    number: '01',
    title: 'Account diagnosis',
    description:
      'Review the store, ASINs, available performance data, account-health issues, and stated commercial priorities.',
    agencyOutput:
      'A concise diagnosis separating confirmed issues, missing information, and the highest-priority opportunities.',
    clientResponsibility:
      'Provide accurate account context, the requested Amazon URL, and any access or exports agreed for the review.',
  },
  {
    number: '02',
    title: 'Growth plan and commercial proposal',
    description:
      'Translate the diagnosis into a prioritised plan and a written proposal before delivery begins.',
    agencyOutput:
      'Proposed services, deliverables, responsibilities, measurement approach, fees, term, cadence, exclusions, and start conditions.',
    clientResponsibility:
      'Review the scope, clarify assumptions, approve commercial terms, and name decision-makers.',
  },
  {
    number: '03',
    title: 'Implementation and optimisation',
    description:
      'Complete the approved account, PPC, catalog, content, launch, or expansion work in the agreed order.',
    agencyOutput:
      'A maintained delivery backlog with completed actions, open dependencies, and requested approvals.',
    clientResponsibility:
      'Keep access and business inputs current, respond to approvals, and flag inventory, pricing, or product changes.',
  },
  {
    number: '04',
    title: 'Reporting and continuous improvement',
    description:
      'Compare agreed measures with their documented baselines and decide the next actions.',
    agencyOutput:
      'Performance and delivery reporting using agreed definitions, sources, time windows, and review cadence.',
    clientResponsibility:
      'Review results in commercial context and approve the next priorities, budgets, or scope changes.',
  },
];

export const ENGAGEMENT_TERMS: readonly EngagementTerm[] = [
  {
    key: 'pricing-model',
    label: 'Pricing model',
    value: null,
    missingMessage:
      'Not approved for publication. Confirm whether each service is fixed-fee, retainer, performance-based, or a documented combination.',
  },
  {
    key: 'minimum-engagement',
    label: 'Minimum engagement period',
    value: null,
    missingMessage:
      'No minimum term, renewal structure, notice period, or cancellation rule is documented.',
  },
  {
    key: 'pricing-factors',
    label: 'What affects pricing',
    value: null,
    missingMessage:
      'The commercial pricing inputs and the way each input changes the fee have not been approved.',
  },
  {
    key: 'onboarding-timeline',
    label: 'Onboarding timeline',
    value: null,
    missingMessage:
      'No standard time from proposal acceptance to delivery start is documented.',
  },
  {
    key: 'starting-price',
    label: 'Starting price or range',
    value: null,
    missingMessage:
      'No approved starting fee, realistic range, currency, tax treatment, or media-spend treatment is available.',
  },
];

export const FAQ_ITEMS: readonly FaqItem[] = [
  { id: 'audit-scope', question: 'What does the free Amazon audit cover?', answer: 'The audit focuses on advertising efficiency, listing quality, account health and marketplace opportunities. Start with your contact details and revenue range. The team can request your store link and account priorities during follow-up.' },
  { id: 'marketplace-coverage', question: 'Which Amazon marketplaces do you support?', answer: 'We support brands across Amazon marketplaces in Europe, North America and Asia. Tell us your current and target marketplaces so we can discuss the support and scope you need.' },
  { id: 'services', question: 'Can I get help with just one part of my account?', answer: 'Yes. You can discuss PPC, account management, listing optimization, A+ content, product launches or marketplace expansion. Your proposal sets out the work included.' },
  { id: 'start-time', question: 'What happens after I request an audit?', answer: 'The team reviews the account details you share and contacts you using your selected method. You can then discuss priorities, scope and next steps.' },
  { id: 'seller-central-access', question: 'Do I need to share my Amazon password?', answer: 'Do not send passwords or sensitive account credentials through this website. Any account access needed for an engagement should be agreed separately, including the required permissions and who can authorize them.' },
  { id: 'pricing', question: 'How do I find out the price and engagement terms?', answer: 'Contact us with your account and the services you need. Ask for a written proposal covering fees, advertising spend, deliverables, reporting, the engagement period and cancellation terms before work begins.' },
  { id: 'revenue-currency', question: 'Which currency can I use for my revenue range?', answer: 'Choose US dollars (USD), Indian rupees (INR) or British pounds (GBP) in the audit form, then select the closest monthly Amazon revenue range. Ranges are in the currency you select; they are not exchange-rate conversions.' },
  { id: 'growth-calculator', question: 'Are the calculator results a guarantee?', answer: 'No. The calculator models a scenario using your monthly revenue, ad spend and an editable additional-revenue multiplier. It totals that scenario over your chosen period. The revenue-to-spend ratio is not profit ROI, and actual results will depend on your business and the work agreed.' },
];
