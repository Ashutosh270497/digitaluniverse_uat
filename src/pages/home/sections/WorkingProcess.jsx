import { ArrowUpRight, Compass, ListChecks, RefreshCw, Rocket } from 'lucide-react';
const steps = [
  { title: 'Understand your account', Icon: Compass, copy: 'We review your store, priorities and the opportunities you want to explore.', output: 'An account diagnosis' },
  { title: 'Build your plan', Icon: ListChecks, copy: 'Agree the services, responsibilities and measures that matter to your business.', output: 'A focused scope of work' },
  { title: 'Put it into action', Icon: Rocket, copy: 'Coordinate advertising, content and account work around your agreed priorities.', output: 'Coordinated execution' },
  { title: 'Review and refine', Icon: RefreshCw, copy: 'Review performance in context and decide where to focus next.', output: 'Clear next steps' },
];
const WorkingProcess = () => (
  <section id="process" aria-labelledby="process-heading" className="section-space bg-white">
    <div className="section-shell">
      <div className="home-section-intro"><div><p className="eyebrow">From possibility to a plan</p><h2 id="process-heading" className="section-title">Clear priorities.<br />Connected execution.</h2></div><p className="home-section-description">A thoughtful process turns account insights into useful action. Here’s how we work with your Amazon business.</p></div>
      <ol className="home-process-grid">
        {steps.map((step, index) => { const Icon = step.Icon; return <li key={step.title}><div className="process-step-top"><span className="process-number">0{index + 1}</span><Icon className="h-6 w-6" aria-hidden="true" /></div><h3>{step.title}</h3><p>{step.copy}</p><div className="process-output"><span>{step.output}</span><ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" /></div></li>; })}
      </ol>
    </div>
  </section>
);
export default WorkingProcess;
