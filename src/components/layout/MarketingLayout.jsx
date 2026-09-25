import Footer from './Footer.jsx';
import InternalPageHeader from './InternalPageHeader.jsx';
import SkipLink from '../ui/SkipLink.jsx';

const MarketingLayout = ({ children }) => (
  <div className="min-h-screen bg-white">
    <SkipLink />
    <InternalPageHeader />
    <main id="main-content">{children}</main>
    <Footer />
  </div>
);

export default MarketingLayout;
