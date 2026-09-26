import { FOUNDER_PERFORMANCE } from '../../../content/businessMetrics.ts';

const Stats = () => (
  <section id="performance" aria-labelledby="performance-heading" className="border-y border-gray-200 bg-white py-10 md:py-12">
    <div className="section-shell">
      <div className="mb-7 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <h2 id="performance-heading" className="text-xl font-bold tracking-tight text-amazon-dark">Amazon expertise that drives growth.</h2>
        <p className="text-sm text-gray-600">Agency performance highlights</p>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        {FOUNDER_PERFORMANCE.metrics.map(metric => (
          <div key={metric.id} data-founder-metric={metric.id} className="flex flex-col border-l-2 border-primary-400 pl-5">
            <dt className="mt-2 text-sm font-medium text-gray-600">{metric.label}</dt>
            <dd className="order-first text-3xl font-bold tracking-tight text-amazon-dark min-[360px]:text-4xl sm:text-5xl">{metric.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-gray-500">Figures are based on reported agency performance and may vary by account.</p>
    </div>
  </section>
);

export default Stats;
