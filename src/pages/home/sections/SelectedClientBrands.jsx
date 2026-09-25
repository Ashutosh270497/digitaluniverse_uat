import { getApprovedClientBrandsByRegion } from '../../../content/socialProof.ts';
const groups = ['International', 'India'];
const ClientLogos = ({ brands }) => (
  <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
    {brands.map(brand => <li key={brand.id} data-client-brand-id={brand.id} className="flex h-24 items-center justify-center rounded-xl border border-gray-200 bg-white p-4 sm:h-28 sm:p-5"><img src={brand.logo} alt={brand.name} width={brand.logoWidth} height={brand.logoHeight} loading="lazy" decoding="async" className="max-h-16 w-full object-contain" /></li>)}
  </ul>
);
const SelectedClientBrands = () => (
  <section id="client-brands" aria-labelledby="selected-client-brands-heading" className="bg-white py-10 md:py-12">
    <div className="section-shell">
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <h2 id="selected-client-brands-heading" className="text-lg font-bold text-amazon-dark">In good company.</h2>
        <p className="text-sm text-gray-600">Supporting Indian and international brands on Amazon.</p>
      </div>
      <ClientLogos brands={groups.flatMap(region => getApprovedClientBrandsByRegion(region).slice(0, 3))} />
      <details className="group mt-4">
        <summary className="mx-auto flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded text-sm font-semibold text-primary-800">Explore all client brands<span aria-hidden="true" className="group-open:rotate-45">+</span></summary>
        {groups.map(region => <div key={region} className="mt-5"><h3 className="mb-3 text-sm font-bold text-amazon-dark">{region === 'India' ? 'Indian' : 'International'} clients</h3><ClientLogos brands={getApprovedClientBrandsByRegion(region)} /></div>)}
      </details>
    </div>
  </section>
);
export default SelectedClientBrands;
