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

export const SERVICES: readonly ServiceDefinition[] = [
  {
    id: 'amazon-ppc-profitability',
    title: 'Amazon PPC and profitability management',
    summary:
      'Campaign decisions tied to agreed advertising-efficiency and margin inputs, not sales volume alone.',
    whoItIsFor:
      'Established sellers running Sponsored Ads who need tighter control over search terms, bids, budgets, ACoS, and TACoS.',
    problemsSolved: [
      'Wasted spend from weak targeting or unmanaged search terms',
      'Campaign structures that make budget and performance difficult to interpret',
      'Advertising decisions made without agreed margin or inventory context',
    ],
    deliverables: [
      'PPC account diagnosis covering campaign structure, targeting, bids, budgets, and search terms',
      'Prioritised optimisation backlog against client-approved ACoS, TACoS, and margin targets',
      'Campaign changes and budget allocation within the written scope',
      'Performance summary based on available Amazon Ads and Seller Central data',
    ],
    reportingCadence: null,
    expectedClientInvolvement: [
      'Provide margin or landed-cost inputs and approve commercial targets',
      'Approve media budgets and material campaign changes',
      'Share inventory, promotion, pricing, and product-priority changes',
    ],
    notIncluded: null,
    primaryOutcome:
      'More deliberate ad-spend allocation against documented profitability and growth targets.',
    relevantCaseStudySlug: null,
    spnServiceKey: 'advertising',
  },
  {
    id: 'account-management-health',
    title: 'Account management and account health',
    summary:
      'A documented operating rhythm for account-health issues, Seller Support cases, and agreed account priorities.',
    whoItIsFor:
      'Brands that need a clear operating owner for Amazon account tasks, issue tracking, and day-to-day coordination.',
    problemsSolved: [
      'Account-health alerts and operational issues without clear ownership',
      'Seller Support cases that are not tracked to a documented next action',
      'Competing account priorities with no shared delivery backlog',
    ],
    deliverables: [
      'Account-health review and prioritised issue register',
      'Action, dependency, and Seller Support case tracker',
      'Coordination of agreed account-management tasks',
      'Written status of open issues, owners, and next actions',
    ],
    reportingCadence: null,
    expectedClientInvolvement: [
      'Grant the Seller Central permissions agreed for the scope',
      'Supply requested business, identity, compliance, or product documents',
      'Respond to approvals and Amazon requests that require the account owner',
    ],
    notIncluded: null,
    primaryOutcome:
      'Clear ownership and follow-through for the account priorities included in the engagement.',
    relevantCaseStudySlug: null,
    spnServiceKey: 'accountManagement',
  },
  {
    id: 'listing-seo-catalog',
    title: 'Listing SEO and catalog optimisation',
    summary:
      'Accurate, search-aligned product detail pages supported by a structured catalog issue backlog.',
    whoItIsFor:
      'Brands with listings that are difficult to discover, inconsistent, suppressed, or unclear to shoppers.',
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
  { id: 'audit-scope', question: 'What does the free Amazon audit cover?', answer: 'The audit focuses on advertising efficiency, listing quality, account health and marketplace opportunities. Share your store or ASIN and priorities so the review can focus on your account.' },
  { id: 'marketplace-coverage', question: 'Which Amazon marketplaces do you support?', answer: 'We support brands across Amazon marketplaces in Europe, North America and Asia. Tell us your current and target marketplaces so we can discuss the support and scope you need.' },
  { id: 'services', question: 'Can I get help with just one part of my account?', answer: 'Yes. You can discuss PPC, account management, listing optimization, A+ content, product launches or marketplace expansion. Your proposal sets out the work included.' },
  { id: 'start-time', question: 'What happens after I request an audit?', answer: 'The team reviews the account details you share and contacts you using your selected method. You can then discuss priorities, scope and next steps.' },
  { id: 'seller-central-access', question: 'Do I need to share my Amazon password?', answer: 'Do not send passwords or sensitive account credentials through this website. Any account access needed for an engagement should be agreed separately, including the required permissions and who can authorize them.' },
  { id: 'pricing', question: 'How do I find out the price and engagement terms?', answer: 'Contact us with your account and the services you need. Ask for a written proposal covering fees, advertising spend, deliverables, reporting, the engagement period and cancellation terms before work begins.' },
  { id: 'ai-solutions', question: 'Can you help with AI beyond Amazon?', answer: 'Yes. Our AI services cover custom agents, AI-enabled SaaS, knowledge systems, workflow automation, strategy and AI infrastructure. Tell us about your tools, business needs and the process or product you want to improve.' },
  { id: 'growth-calculator', question: 'Are the calculator results a guarantee?', answer: 'No. The calculator models a scenario using your monthly revenue, ad spend and an editable additional-revenue multiplier. It totals that scenario over your chosen period. The revenue-to-spend ratio is not profit ROI, and actual results will depend on your business and the work agreed.' },
];
