import { FOUNDER_PERFORMANCE } from '../../../content/businessMetrics.ts';

const Stats = () => (
  <section id="performance" aria-labelledby="performance-heading" className="border-y border-gray-200 bg-white py-10 md:py-12">
    <div className="section-shell">
      <div className="mb-7 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <h2 id="performance-heading" className="text-xl font-bold tracking-tight text-amazon-dark">Amazon experience that adds up.</h2>
        <p className="text-sm text-gray-600">{FOUNDER_PERFORMANCE.source}</p>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        {FOUNDER_PERFORMANCE.metrics.map(metric => (
          <div key={metric.id} data-founder-metric={metric.id} className="flex flex-col border-l-2 border-primary-400 pl-5">
            <dt className="mt-2 text-sm font-medium text-gray-600">{metric.label}</dt>
            <dd className="order-first text-4xl font-bold tracking-tight text-amazon-dark sm:text-5xl">{metric.value}</dd>
          </div>
        ))}
      </dl>
      <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-gray-200 pt-5">
        {FOUNDER_PERFORMANCE.supporting.map(metric => (
          <div key={metric.id} className="flex flex-wrap gap-2 text-sm">
            <dt className="text-gray-600">{metric.label}</dt>
            <dd className="order-first font-bold text-amazon-dark">{metric.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-gray-500">Figures supplied by our founder. Individual account results vary.</p>
    </div>
  </section>
);

export default Stats;
