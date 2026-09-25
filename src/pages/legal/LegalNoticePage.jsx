import PrivacyPolicyContent from '../../content/legal/PrivacyPolicyContent.jsx';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Footer from '../../components/layout/Footer.jsx';
import { SITE_CONFIG } from '../../config/site.js';
import { LEGAL_REQUIREMENTS } from '../../content/legal/requirements.js';
import logo from '../../assets/brand_logos/logo.jpg';
import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx';
import SkipLink from '../../components/ui/SkipLink.jsx';
import TermsOfServiceContent from '../../content/legal/TermsOfServiceContent.jsx';

const LegalNoticePage = ({ route }) => {
  const missingInputs = LEGAL_REQUIREMENTS[route.key] ?? [];
  const isPrivacyPolicy = route.key === 'privacy';
  const isTermsOfService = route.key === 'terms';

  return (
    <div className="min-h-screen bg-amazon-dark text-white">
      <SkipLink />
      <header className="border-b border-white/10 bg-amazon-dark/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-10">
          <a href="/" className="inline-flex items-center gap-3" aria-label="Digital Universe Pro home">
            <img src={logo} alt="" width="300" height="300" className="h-12 w-12 object-contain" aria-hidden="true" />
            <span className="hidden text-lg font-bold text-white sm:inline sm:text-xl">{SITE_CONFIG.brandName}</span>
          </a>
          <a href="/" className="inline-flex items-center gap-2 font-semibold text-primary-400 hover:text-primary-300">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to website
          </a>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-24 lg:px-10">
        <Breadcrumbs
          items={[{ label: 'Home', href: '/' }, { label: route.title }]}
          className="mb-8 text-gray-300"
        />
        <div className="rounded-3xl border border-primary-500/25 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-sm sm:p-10 md:p-14">
          {!isPrivacyPolicy && !isTermsOfService && (
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-200">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              Not yet published
            </div>
          )}

          <h1 className="text-4xl font-black sm:text-5xl">{route.title}</h1>
          {isPrivacyPolicy ? (
            <PrivacyPolicyContent />
          ) : isTermsOfService ? (
            <TermsOfServiceContent />
          ) : (
            <>
              <p className="mt-6 text-lg leading-relaxed text-gray-300">
                This route is active, but Digital Universe Pro has not published this policy because the verified legal inputs required to prepare it have not been supplied.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-gray-300">
                No registered address, jurisdiction, retention period, processor list, contractual term, or other legal fact has been inferred.
              </p>

              <section className="mt-10 rounded-2xl border border-white/10 bg-black/20 p-6 sm:p-8" aria-labelledby="missing-inputs-heading">
                <h2 id="missing-inputs-heading" className="text-2xl font-extrabold text-primary-300">
                  Required verified inputs
                </h2>
                <ul className="mt-6 space-y-4 text-gray-300">
                  {missingInputs.map((input) => (
                    <li key={input} className="flex gap-3 leading-relaxed">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-400" aria-hidden="true" />
                      <span>{input}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="mt-10 border-t border-white/10 pt-8">
                <p className="text-gray-400">
                  Supply and approve the missing information before replacing this notice with policy text.
                </p>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegalNoticePage;
