export interface AiService {
  id: string;
  title: string;
  icon: 'agents' | 'saas' | 'knowledge' | 'workflow' | 'strategy' | 'infrastructure';
  description: string;
  listHeading: string;
  capabilities: readonly string[];
}

// Service scope supplied by the business in the September 2026 reference slides.
// Copy is edited for clarity; duplicate SaaS bullets have been consolidated.
export const AI_SERVICES: readonly AiService[] = [
  {
    id: 'custom-ai-agents',
    title: 'Custom AI Agents',
    icon: 'agents',
    description: 'Build intelligent agents that take repetitive work off your team’s plate. Connect customer support, sales, research and internal operations with the tools you already use.',
    listHeading: 'Use cases',
    capabilities: ['Customer support automation', 'Sales and lead qualification', 'Internal knowledge assistants', 'Research and data processing', 'Business process optimization'],
  },
  {
    id: 'ai-saas-development',
    title: 'AI-Powered SaaS Development',
    icon: 'saas',
    description: 'Turn your idea into an AI-enabled software product. From an early MVP to a scalable application, we design and build features around your users and business needs.',
    listHeading: 'Our capabilities',
    capabilities: ['End-to-end product development', 'AI feature integration', 'MVP development and deployment', 'User-centered application design', 'Scalable SaaS architecture'],
  },
  {
    id: 'rag-knowledge-systems',
    title: 'RAG & Knowledge Systems',
    icon: 'knowledge',
    description: 'Connect AI to your business knowledge. Retrieval-augmented generation (RAG) helps teams find relevant documents and get answers grounded in the information you provide.',
    listHeading: 'Applications',
    capabilities: ['Internal knowledge bases', 'Document intelligence solutions', 'Semantic search systems', 'AI copilots for teams', 'Enterprise information retrieval'],
  },
  {
    id: 'workflow-automation',
    title: 'Workflow Automation',
    icon: 'workflow',
    description: 'Connect your systems and simplify everyday operations. We design workflows that reduce repetitive handoffs and help your team focus on work that needs their attention.',
    listHeading: 'Automation areas',
    capabilities: ['Order and inventory processing', 'CRM and marketing automation', 'Data synchronization', 'Reporting and notifications', 'Cross-platform integrations'],
  },
  {
    id: 'ai-strategy-consulting',
    title: 'AI Strategy & Consulting',
    icon: 'strategy',
    description: 'Find the right starting point for AI in your organization. Assess opportunities, prioritize useful applications and build a practical roadmap around your business goals.',
    listHeading: 'Services include',
    capabilities: ['AI readiness assessment', 'Opportunity identification', 'Implementation roadmaps', 'Process optimization', 'Strategic AI guidance'],
  },
  {
    id: 'mlops-ai-infrastructure',
    title: 'MLOps & AI Infrastructure',
    icon: 'infrastructure',
    description: 'Take AI from development into everyday use. Set up deployment, monitoring and cloud infrastructure to support reliable operation as your applications and business grow.',
    listHeading: 'Services include',
    capabilities: ['AI model deployment', 'Infrastructure setup and optimization', 'Performance monitoring', 'Security and compliance support', 'Scalable cloud implementations'],
  },
];
