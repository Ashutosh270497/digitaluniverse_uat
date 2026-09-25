import { useEffect } from 'react';
import StickyHeader from '../../components/layout/StickyHeader.jsx';
import HeroWithForm from './sections/HeroWithForm.jsx';
import AmazonTrustBar from './sections/AmazonTrustBar.jsx';
import SelectedClientBrands from './sections/SelectedClientBrands.jsx';
import Stats from './sections/Stats.jsx';
import Services from './sections/Services.jsx';
import AIServices from './sections/AIServices.jsx';
import GlobalCoverageSection from '../../features/global-coverage/GlobalCoverageSection.jsx';
import RealClientDashboards from './sections/RealClientDashboards.jsx';
import WorkingProcess from './sections/WorkingProcess.jsx';
import MeetTheExpert from './sections/MeetTheExpert.jsx';
import Testimonials from './sections/Testimonials.jsx';
import GrowthCalculatorSection from './sections/GrowthCalculatorSection.jsx';
import FAQ from './sections/FAQ.jsx';
import FinalConversionSection from './sections/FinalConversionSection.jsx';
import Footer from '../../components/layout/Footer.jsx';
import SkipLink from '../../components/ui/SkipLink.jsx';
import './home.css';

function HomePage() {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return undefined;
    // Lazy route rendering happens after the browser's initial fragment lookup.
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  return (
    <div className="home-page min-h-screen overflow-x-hidden bg-white">
      <SkipLink />
      <StickyHeader />
      <main id="main-content">
        <HeroWithForm />
        <AmazonTrustBar />
        <SelectedClientBrands />
        <Stats />
        <Services />
        <AIServices />
        <RealClientDashboards />
        <GrowthCalculatorSection />
        <WorkingProcess />
        <MeetTheExpert />
        <Testimonials />
        <GlobalCoverageSection />
        <FAQ />
        <FinalConversionSection />
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
