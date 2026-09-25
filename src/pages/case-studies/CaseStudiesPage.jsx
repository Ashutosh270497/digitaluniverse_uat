import { getPublishedCaseStudies } from '../../content/caseStudies.ts';
import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx';
import CaseStudyCard from '../../components/case-studies/CaseStudyCard.jsx';
import MarketingLayout from '../../components/layout/MarketingLayout.jsx';
import RealClientDashboards from '../home/sections/RealClientDashboards.jsx';
import ConversionSection from '../../features/lead-capture/ConversionSection.jsx';
const publishedCaseStudies = getPublishedCaseStudies();
const CaseStudiesPage = () => (
  <MarketingLayout>
    <section className="section-space bg-amazon-dark text-white"><div className="section-shell"><Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Account results' }]} className="text-gray-300" /><p className="mt-9 text-xs font-bold uppercase tracking-[0.18em] text-primary-300">Account results</p><h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Amazon sales snapshots and client results</h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-300">Explore sales activity from accounts supported by Digital Universe Pro. Each snapshot is shown with its marketplace and reporting period.</p></div></section>
    {publishedCaseStudies.length > 0 && <section className="section-space bg-white" aria-label="Published case studies"><div className="section-shell grid gap-6 lg:grid-cols-3">{publishedCaseStudies.map(caseStudy => <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} />)}</div></section>}
    <RealClientDashboards />
    <ConversionSection />
  </MarketingLayout>
);
export default CaseStudiesPage;
