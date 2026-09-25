import { Mail, MessageCircle, Phone } from 'lucide-react';
import { MARKETING_ROUTES } from '../../config/routes.js';
import { SITE_CONFIG, getMailtoHref, getTelHref, getWhatsAppUrl } from '../../config/site.js';
import { trackContactClick } from '../../analytics/index.js';
import AuditForm from '../../features/lead-capture/AuditForm.jsx';
import AIProjectInquiry from '../../features/ai-services/AIProjectInquiry.jsx';
import Breadcrumbs from '../../components/ui/Breadcrumbs.jsx';
import MarketingLayout from '../../components/layout/MarketingLayout.jsx';
import { getSeoRoute } from '../../config/seo.js';

const ContactPage = ({ requestedService }) => {
  const seoRoute = getSeoRoute(MARKETING_ROUTES.contact.path);
  const whatsappUrl = getWhatsAppUrl(
    'Hello, I would like to discuss a free Amazon audit with Digital Universe Pro.',
  );

  return (
    <MarketingLayout>
      <section className="bg-amazon-dark py-14 text-white md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
          <Breadcrumbs
            items={[{ label: 'Home', href: '/' }, { label: seoRoute.breadcrumbLabel }]}
            className="text-gray-300"
          />
          <p className="mt-10 text-sm font-extrabold uppercase tracking-[0.18em] text-primary-300">
            Contact Digital Universe Pro
          </p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">{seoRoute.h1}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-gray-300">
            Discuss your next Amazon opportunity or an AI project. Request an account audit, or tell us what you would like to build and automate.
          </p>
        </div>
      </section>

      <section className="bg-amazon-cream py-14 md:py-20" aria-labelledby="contact-options-heading">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-10">
          <div>
            <h2 id="contact-options-heading" className="text-3xl font-black text-amazon-dark">
              Contact options
            </h2>
            <div className="mt-7 space-y-4">
              <a
                href={getMailtoHref()}
                onClick={() => trackContactClick('email', 'contact_page')}
                className="flex items-center gap-3 font-bold text-primary-900 underline underline-offset-4"
              >
                <Mail className="h-5 w-5" aria-hidden="true" />
                {SITE_CONFIG.contact.email}
              </a>
              <a
                href={getTelHref()}
                onClick={() => trackContactClick('phone', 'contact_page')}
                className="flex items-center gap-3 font-bold text-primary-900 underline underline-offset-4"
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                {SITE_CONFIG.contact.phoneDisplay}
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackContactClick('whatsapp', 'contact_page')}
                className="flex items-center gap-3 font-bold text-primary-900 underline underline-offset-4"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                WhatsApp Digital Universe Pro
              </a>
            </div>
            <p className="mt-7 leading-relaxed text-gray-600">Please share only the information needed for your enquiry. Do not send account passwords or sensitive customer data.</p>
          </div>
          <AuditForm formLocation="contact_page" />
        </div>
      </section>

      <AIProjectInquiry requestedService={requestedService} />
    </MarketingLayout>
  );
};

export default ContactPage;
