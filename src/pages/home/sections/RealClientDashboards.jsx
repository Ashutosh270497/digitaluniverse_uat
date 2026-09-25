import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Maximize2, X } from 'lucide-react';
import { PUBLISHED_SALES_SNAPSHOTS } from '../../../content/salesSnapshots.ts';

const RealClientDashboards = () => {
  const [selected, setSelected] = useState(null);
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!selected) return undefined;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; };
  }, [selected]);
  const renderSnapshot = snapshot => (
    <figure key={snapshot.id} data-sales-snapshot-id={snapshot.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <button type="button" onClick={() => setSelected(snapshot)} className="group block w-full rounded-t-2xl text-left focus-visible:outline-offset-[-4px]" aria-label={`Enlarge screenshot: ${snapshot.marketplace}, ${snapshot.caption}`}>
        <img src={snapshot.previewImage} alt={snapshot.alt} width="1142" height="696" loading="lazy" decoding="async" className="w-full" />
        <span className="flex min-h-12 items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 text-sm font-semibold text-primary-800 group-hover:bg-primary-50">Enlarge screenshot<Maximize2 className="h-4 w-4" aria-hidden="true" /></span>
      </button>
      <figcaption className="flex flex-wrap justify-between gap-2 border-t border-gray-100 px-5 py-4 text-sm"><span className="font-bold text-amazon-dark">{snapshot.marketplace}</span><span className="text-gray-600">{snapshot.caption}</span></figcaption>
    </figure>
  );
  return (
    <section id="sales-snapshots" aria-labelledby="sales-snapshots-heading" className="section-space bg-amazon-cream">
      <span id="case-studies" className="scroll-mt-24" />
      <div className="section-shell">
        <div className="home-section-intro"><div><p className="eyebrow">Behind the numbers</p><h2 id="sales-snapshots-heading" className="section-title">Real accounts.<br />A closer look at the results.</h2></div><p className="home-section-description">Explore sales snapshots supplied by Digital Universe Pro, across Indian and international Amazon marketplaces.</p></div>
        <div className="mt-9 grid gap-6 md:grid-cols-2">{PUBLISHED_SALES_SNAPSHOTS.filter(snapshot => snapshot.featured).map(renderSnapshot)}</div>
        <details className="mt-6"><summary className="mx-auto flex min-h-12 w-fit cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-amazon-dark">View more sales snapshots</summary><div className="mt-6 grid gap-6 md:grid-cols-2">{PUBLISHED_SALES_SNAPSHOTS.filter(snapshot => !snapshot.featured).map(renderSnapshot)}</div></details>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-gray-600">These are account-level sales records for the periods shown. Sales totals alone do not measure the agency’s contribution or guarantee future results.</p>
        <a href="/#growth-calculator" className="snapshot-calculator-link">Now explore a scenario for your own account<span aria-hidden="true">↗</span></a>
      </div>
      <dialog ref={dialogRef} onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) dialogRef.current.close(); }} aria-labelledby="sales-dialog-title" className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-5xl overflow-auto rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-amazon-dark/80">
        {selected && <><div className="sticky top-0 flex items-center justify-between gap-3 border-b border-gray-200 bg-white p-4"><h2 id="sales-dialog-title" className="font-bold text-amazon-dark">{selected.marketplace} · {selected.caption}</h2><button type="button" autoFocus onClick={() => dialogRef.current.close()} aria-label="Close screenshot" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100"><X className="h-5 w-5" aria-hidden="true" /></button></div><img src={selected.previewImage} alt={selected.alt} width="1142" height="696" className="w-full" /><div className="border-t border-gray-200 p-4"><a href={selected.sourceImage} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded text-sm font-semibold text-primary-800 underline underline-offset-4">Open original source image<ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></div></>}
      </dialog>
    </section>
  );
};
export default RealClientDashboards;
