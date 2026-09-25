import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const ROICalculator = lazy(() => import('../../../features/roi-calculator/ROICalculator.jsx'));
const LoadingCalculator = () => <div className="section-shell min-h-[780px] py-20 text-center text-white"><p role="status">Loading growth calculator…</p></div>;

const GrowthCalculatorSection = () => {
  const sectionRef = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setReady(true);
        observer.disconnect();
      }
    }, { rootMargin: '600px' });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);
  const shouldLoad = ready || typeof window === 'undefined' || !('IntersectionObserver' in window);
  return <div ref={sectionRef} id="growth-calculator" className="scroll-mt-20 bg-amazon-dark">{shouldLoad ? <Suspense fallback={<LoadingCalculator />}><ROICalculator /></Suspense> : <LoadingCalculator />}</div>;
};

export default GrowthCalculatorSection;
