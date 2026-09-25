import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ExternalLink, Globe2, Pause, Play, ShieldCheck } from 'lucide-react';
import { VERIFIED_MARKETPLACE_LOCATIONS } from '../../content/marketplaceCoverage.ts';
import { SITE_CONFIG, SPN_SERVICES } from '../../config/site.js';
import { PRIMARY_AUDIT_ROUTE } from '../lead-capture/primaryCta.js';
import './coverage.css';

const GlobalCoverageVisual = lazy(() => import('./GlobalCoverageVisual.jsx'));
const locations = VERIFIED_MARKETPLACE_LOCATIONS;

class VisualErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() { return { failed: true }; }

  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

const GlobalCoverageSection = () => {
  const sectionRef = useRef(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [inViewport, setInViewport] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tourPlaying, setTourPlaying] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [selection, setSelection] = useState({ id: locations[0].id, revision: 0 });
  const activeRegion = locations.find(location => location.id === selection.id);
  const directory = SITE_CONFIG.spnRegions.find(region => region.code === activeRegion.directoryCode);
  const activeIndex = locations.indexOf(activeRegion);
  const animationActive = inViewport && documentVisible && !reducedMotion && !motionPaused;

  useEffect(() => {
    const target = sectionRef.current;
    if (!target || !('IntersectionObserver' in window)) {
      const timer = window.setTimeout(() => { setNearViewport(true); setInViewport(true); }, 0);
      return () => window.clearTimeout(timer);
    }
    const preloadObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearViewport(true);
        preloadObserver.disconnect();
      }
    }, { rootMargin: '300px 0px' });
    const visibilityObserver = new IntersectionObserver(([entry]) => setInViewport(entry.isIntersecting), { threshold: 0.15 });
    preloadObserver.observe(target);
    visibilityObserver.observe(target);
    return () => { preloadObserver.disconnect(); visibilityObserver.disconnect(); };
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(media.matches);
      if (media.matches) setTourPlaying(false);
    };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const update = () => setDocumentVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    if (!tourPlaying || !animationActive) return undefined;
    const timer = window.setInterval(() => {
      setSelection(previous => {
        const index = locations.findIndex(location => location.id === previous.id);
        return { id: locations[(index + 1) % locations.length].id, revision: previous.revision + 1 };
      });
    }, 6000);
    return () => window.clearInterval(timer);
  }, [tourPlaying, animationActive]);

  const selectRegion = (id) => {
    setTourPlaying(false);
    setSelection(previous => ({ id, revision: previous.revision + 1 }));
  };

  return (
    <section ref={sectionRef} id="global-coverage" aria-labelledby="global-coverage-heading" className="coverage-section section-space text-white">
      <div className="section-shell">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-300">One partner. A world of opportunity.</p>
            <h2 id="global-coverage-heading" className="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl">Where will your brand go next?</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">Explore our Amazon support across North America, Europe and Asia. Select a region to start.</p>
          </div>
          <div className="flex items-center gap-3 self-start rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-slate-200">
            <Globe2 className="h-4 w-4 text-primary-300" aria-hidden="true" />3 regions. Connected expertise.
          </div>
        </div>

        <div
          className="coverage-explorer mt-9 overflow-hidden rounded-3xl border border-white/15"
          onFocusCapture={event => { if (!event.target.closest('[data-map-tour]')) setTourPlaying(false); }}
        >
          <div className="grid lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-5 sm:px-6">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-primary-300" />Marketplace explorer</p>
                {!reducedMotion && (
                  <div className="flex flex-wrap items-center gap-1">
                    <button type="button" data-map-motion aria-pressed={motionPaused} onClick={() => { setMotionPaused(paused => !paused); setTourPlaying(false); }} className="coverage-text-control">
                      {motionPaused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
                      {motionPaused ? 'Play map animation' : 'Pause map animation'}
                    </button>
                    <button type="button" data-map-tour aria-pressed={tourPlaying} onClick={() => { setMotionPaused(false); setTourPlaying(playing => !playing); }} className="coverage-text-control">
                      {tourPlaying ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
                      {tourPlaying ? 'Pause tour' : 'Play region tour'}
                    </button>
                  </div>
                )}
              </div>
              <VisualErrorBoundary fallback={<div className="coverage-map-placeholder"><Globe2 className="h-12 w-12 text-primary-300" aria-hidden="true" /><p>Explore a region using the buttons below.</p></div>}>
                <Suspense fallback={<div className="coverage-map-placeholder" role="status"><Globe2 className="h-12 w-12 text-primary-300" aria-hidden="true" /><p>Opening your world of opportunity…</p></div>}>
                  {nearViewport ? (
                    <GlobalCoverageVisual
                      selection={selection}
                      onSelectRegion={selectRegion}
                      onInteract={() => setTourPlaying(false)}
                      animationActive={animationActive}
                      reducedMotion={reducedMotion}
                    />
                  ) : <div className="coverage-map-placeholder" aria-hidden="true"><Globe2 className="h-12 w-12 text-primary-300" /></div>}
                </Suspense>
              </VisualErrorBoundary>
              <div className="grid grid-cols-3 gap-2 border-t border-white/10 p-3 sm:gap-3 sm:p-5" role="group" aria-label="Choose a marketplace region">
                {locations.map((location, index) => (
                  <button key={location.id} type="button" data-region-select={location.id} aria-pressed={location.id === selection.id} aria-controls="coverage-region-details" onClick={() => selectRegion(location.id)} className="coverage-region-button">
                    <span className="text-xs font-semibold opacity-70">0{index + 1}</span>
                    <span className="text-xs font-semibold sm:text-sm">{location.label}</span>
                    <ArrowRight className="hidden h-4 w-4 sm:block" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>

            <aside id="coverage-region-details" aria-labelledby="coverage-region-title" className="coverage-region-panel">
              <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary-300">
                <span>Explore the region</span><span className="text-slate-400">0{activeIndex + 1} / 03</span>
              </div>
              <h3 id="coverage-region-title" className="mt-4 text-3xl font-bold tracking-tight">{activeRegion.label}</h3>
              <p className="mt-4 text-base font-semibold text-white">{activeRegion.headline}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{activeRegion.description}</p>
              <ul className="mt-5 space-y-2.5">
                {activeRegion.focus.map(item => <li key={item} className="flex items-center gap-2 text-sm text-slate-200"><Check className="h-4 w-4 shrink-0 text-primary-300" aria-hidden="true" />{item}</li>)}
              </ul>
              <div className="mt-6 border-t border-white/15 pt-5">
                <p className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-primary-300" aria-hidden="true" />Amazon SPN · {directory.label}</p>
                <ul className="mt-2">
                  {SPN_SERVICES.map(service => (
                    <li key={service.key}><a href={directory.links[service.key]} data-region-directory={directory.code} target="_blank" rel="noopener noreferrer" className="coverage-directory-link">{service.label}<ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="sr-only"> — {directory.label} (opens in a new tab)</span></a></li>
                  ))}
                </ul>
              </div>
              <a href={PRIMARY_AUDIT_ROUTE} className="button-primary mt-6 w-full">Discuss your expansion<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
            </aside>
          </div>
        </div>
        <p role="status" aria-live={tourPlaying ? 'off' : 'polite'} className="sr-only">{activeRegion.label} selected. Details and {directory.label} partner links updated.</p>
        <div className="mt-5 flex flex-col justify-between gap-3 text-xs leading-relaxed text-slate-400 sm:flex-row">
          <p className="max-w-2xl">Regions show marketplace support, not office locations. Specific countries and scope are agreed with you before work begins.</p>
          <a href="#amazon-credentials" className="shrink-0 self-start rounded text-sm font-semibold text-primary-300 underline underline-offset-4 hover:text-primary-200">View all partner listings</a>
        </div>
      </div>
    </section>
  );
};

export default GlobalCoverageSection;
