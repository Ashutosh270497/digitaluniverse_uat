import { AlertTriangle } from 'lucide-react';
import { SITE_CONFIG } from '../../config/site.js';
import { LEGAL_REQUIREMENTS } from './requirements.js';

const List = ({ children }) => (
  <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-primary-400">{children}</ul>
);

const TermsSection = ({ number, title, children }) => {
  const headingId = `terms-section-${number}`;

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="text-2xl font-extrabold text-white">
        {number}. {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
};

const TermsOfServiceContent = () => (
  <div className="mt-8 space-y-10 text-lg leading-relaxed text-gray-300">
    <aside
      className="rounded-2xl border border-amber-300/35 bg-amber-300/10 p-6 sm:p-8"
      aria-labelledby="terms-draft-heading"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-200" aria-hidden="true" />
        <div>
          <h2 id="terms-draft-heading" className="text-xl font-extrabold text-amber-100">
            Draft — not yet effective
          </h2>
          <p className="mt-3 text-base leading-relaxed text-amber-50/90">
            This page maps the Terms of Service content supplied for Digital Universe Pro, but it
            is not yet an effective agreement. The missing business and legal details below must
            be confirmed and the final wording reviewed before publication.
          </p>
          <dl className="mt-5 grid gap-3 text-base sm:grid-cols-2">
            <div>
              <dt className="font-bold text-amber-100">Effective date</dt>
              <dd>Awaiting approval</dd>
            </div>
            <div>
              <dt className="font-bold text-amber-100">Last updated</dt>
              <dd>Awaiting approval</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="mt-7 border-t border-amber-200/20 pt-6" aria-labelledby="terms-required-inputs-heading">
        <h3 id="terms-required-inputs-heading" className="font-extrabold text-amber-100">
          Required before these Terms take effect
        </h3>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-base marker:text-amber-300">
          {LEGAL_REQUIREMENTS.terms.map((input) => <li key={input}>{input}</li>)}
        </ul>
      </section>
    </aside>

    <div className="space-y-4">
      <p>
        These Terms of Service (“Terms”) govern access to and use of the website located at{' '}
        <a
          href="/"
          className="rounded font-semibold text-primary-300 underline decoration-primary-400/60 underline-offset-4 hover:text-primary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        >
          digitaluniversepro.co
        </a>{' '}
        (“Website”) and any services offered through or in connection with the Website.
      </p>
      <p>
        The contracting legal entity, entity type, and registered or principal office for Digital
        Universe Pro must be confirmed before these Terms take effect. No legal operator or address
        has been inferred for this draft.
      </p>
      <p>
        Once these Terms are finalised and effective, accessing the Website, submitting an enquiry,
        requesting an audit, booking a consultation, accepting a proposal, or engaging us for
        services will constitute agreement to these Terms.
      </p>
      <p>If you do not agree with the final Terms, you should not use the Website or engage our services.</p>
      <p>
        If you accept the final Terms on behalf of a company, brand, or other organisation, you
        confirm that you have authority to bind that organisation.
      </p>
    </div>

    <TermsSection number="1" title="Nature of the Website">
      <p>
        The Website provides information about Digital Universe Pro and its Amazon marketplace
        consulting and management services.
      </p>
      <p>Depending on the agreed scope, our services may include:</p>
      <List>
        <li>Amazon PPC and advertising management;</li>
        <li>Amazon account management and account-health support;</li>
        <li>Listing SEO and catalogue optimisation;</li>
        <li>A+ Content, Brand Story and Storefront support;</li>
        <li>Product-launch and marketplace-growth strategy;</li>
        <li>Marketplace reporting and performance analysis;</li>
        <li>India-to-global Amazon marketplace expansion support; and</li>
        <li>Other related services described in an accepted proposal, order form, or Statement of Work.</li>
      </List>
      <p>
        Information on the Website is provided for general informational and marketing purposes.
        Website content does not constitute a binding offer, guaranteed quotation, or commitment to
        provide a particular service.
      </p>
      <p>We may accept or decline an enquiry at our discretion.</p>
    </TermsSection>

    <TermsSection number="2" title="Relationship With Client Agreements">
      <p>These Terms govern use of the Website and apply as baseline terms when you engage us.</p>
      <p>
        The exact scope, deliverables, timeline, fees, advertising budget, reporting frequency,
        responsibilities, cancellation rights, and other commercial terms for paid services must
        be specified in a written:
      </p>
      <List>
        <li>proposal;</li>
        <li>Service Agreement;</li>
        <li>Master Services Agreement;</li>
        <li>Statement of Work;</li>
        <li>order form; or</li>
        <li>other written agreement accepted by both parties.</li>
      </List>
      <p>
        If an accepted written agreement conflicts with these Terms, the accepted written agreement
        will control concerning that conflict.
      </p>
      <p>
        Our Privacy Policy governs personal information collected through the Website. Where we
        process personal data on behalf of a client, an applicable Data Processing Agreement or
        written service agreement may impose additional requirements.
      </p>
    </TermsSection>

    <TermsSection number="3" title="Business Use and Eligibility">
      <p>
        Our professional services are intended primarily for businesses, brands, professional
        Amazon sellers, and authorised representatives.
      </p>
      <p>You confirm that:</p>
      <List>
        <li>you are at least 18 years old;</li>
        <li>you can enter into a legally binding agreement;</li>
        <li>the information you provide is accurate and complete;</li>
        <li>you have authority to represent the relevant business or Amazon account; and</li>
        <li>your use of the Website and services complies with applicable laws.</li>
      </List>
      <p>
        Nothing in these Terms excludes rights that cannot lawfully be excluded, including any
        mandatory rights available to a person who legally qualifies as a consumer.
      </p>
    </TermsSection>

    <TermsSection number="4" title="Enquiries, Audits and Consultations">
      <p>
        Submitting an enquiry, requesting an account audit, or booking a consultation does not
        automatically create a client relationship.
      </p>
      <p>A client relationship begins only when:</p>
      <List>
        <li>we accept the engagement in writing;</li>
        <li>both parties accept the relevant commercial terms; and</li>
        <li>any required advance payment or onboarding requirement has been completed.</li>
      </List>
      <p>
        Any preliminary audit, consultation, forecast, or recommendation is based on the information
        available at that time. Its usefulness and accuracy may be affected by incomplete, inaccurate,
        or outdated information supplied by the prospective client.
      </p>
      <p>
        Unless explicitly stated otherwise in writing, free audits and consultations are preliminary
        assessments and not comprehensive legal, tax, financial, intellectual-property,
        product-compliance, or account-reinstatement reviews.
      </p>
    </TermsSection>

    <TermsSection number="5" title="Client Responsibilities">
      <p>To enable us to perform the services, the client must:</p>
      <List>
        <li>provide complete, accurate, and timely business information;</li>
        <li>provide the access, permissions, reports, and materials reasonably required;</li>
        <li>ensure that it is authorised to provide such access and materials;</li>
        <li>respond to requests for decisions, approvals, and information within a reasonable time;</li>
        <li>maintain sufficient advertising budgets and valid payment methods where applicable;</li>
        <li>review and approve listings, advertising claims, designs, and other materials when approval is requested;</li>
        <li>keep product, inventory, pricing, fulfilment, and compliance information accurate;</li>
        <li>comply with Amazon policies and all applicable laws;</li>
        <li>maintain control over its Amazon account and security settings;</li>
        <li>promptly notify us of account warnings, restrictions, security incidents, or policy notices; and</li>
        <li>cooperate with reasonable security and compliance procedures.</li>
      </List>
      <p>
        Any delay caused by missing information, access, approvals, payment, or client cooperation
        may extend the delivery timeline.
      </p>
      <p>The client remains responsible for its:</p>
      <List>
        <li>products and product safety;</li>
        <li>product claims and certifications;</li>
        <li>trademarks and intellectual property;</li>
        <li>pricing and inventory;</li>
        <li>taxes and regulatory registrations;</li>
        <li>customer service obligations;</li>
        <li>fulfilment and logistics;</li>
        <li>Seller Central and Amazon Ads accounts; and</li>
        <li>compliance with marketplace rules.</li>
      </List>
      <p>
        Unless expressly included in a written agreement, we do not act as the client’s legal, tax,
        regulatory, product-safety, or intellectual-property adviser.
      </p>
    </TermsSection>

    <TermsSection number="6" title="Amazon Account Access and Security">
      <p>
        Where account access is required, the client authorises us to access and manage only those
        areas reasonably necessary to perform the agreed services.
      </p>
      <p>
        Where available, the client should provide secure delegated or secondary-user permissions
        instead of sharing primary login credentials.
      </p>
      <p>The client must:</p>
      <List>
        <li>use appropriate access controls;</li>
        <li>enable multi-factor authentication where available;</li>
        <li>keep backup and recovery information current;</li>
        <li>promptly remove access when an engagement ends; and</li>
        <li>notify us immediately of suspected unauthorised activity.</li>
      </List>
      <p>
        We will take reasonable steps to protect access credentials and restrict access to personnel
        who require it for the agreed services.
      </p>
      <p>
        No online system or credential-management method can be guaranteed to be completely secure.
        Security responsibilities may be described in greater detail in the applicable Client
        Agreement or Data Processing Agreement.
      </p>
    </TermsSection>

    <TermsSection number="7" title="Amazon and Other Third-Party Platforms">
      <p>Digital Universe Pro is an independent service provider.</p>
      <p>Amazon, Seller Central, Amazon Ads, and other Amazon names, logos, and trademarks belong to their respective owners.</p>
      <p>
        Any Amazon Service Provider Network, Amazon Ads Partner, or similar status displayed on our
        Website will be described only in accordance with the applicable programme rules and
        available verification.
      </p>
      <p>Listing in a provider or partner network does not mean that Amazon guarantees, sponsors, or endorses:</p>
      <List>
        <li>our services;</li>
        <li>our recommendations;</li>
        <li>client results; or</li>
        <li>any particular business outcome.</li>
      </List>
      <p>
        Amazon and other marketplaces independently control their platforms, algorithms, policies,
        advertising systems, fees, and enforcement decisions.
      </p>
      <p>We do not control and cannot guarantee:</p>
      <List>
        <li>account approval or reinstatement;</li>
        <li>Buy Box eligibility;</li>
        <li>product ranking;</li>
        <li>listing approval;</li>
        <li>review acceptance;</li>
        <li>advertising availability;</li>
        <li>marketplace uptime;</li>
        <li>search-algorithm behaviour;</li>
        <li>policy interpretation;</li>
        <li>suspension or enforcement outcomes; or</li>
        <li>continued availability of any platform feature.</li>
      </List>
      <p>
        Clients remain responsible for actions taken in their marketplace accounts, including
        actions performed by authorised employees, contractors, and service providers.
      </p>
    </TermsSection>

    <TermsSection number="8" title="Marketplace and Advertising Compliance">
      <p>We will not knowingly perform or support activities that violate applicable marketplace policies or laws.</p>
      <p>Prohibited instructions include requests to:</p>
      <List>
        <li>create or manipulate fake reviews;</li>
        <li>incentivise prohibited ratings or feedback;</li>
        <li>generate fraudulent orders, clicks, or traffic;</li>
        <li>manipulate search ranking through prohibited practices;</li>
        <li>misuse buyer information;</li>
        <li>impersonate another person or business;</li>
        <li>infringe intellectual-property rights;</li>
        <li>submit misleading product claims;</li>
        <li>circumvent account restrictions;</li>
        <li>operate unauthorised duplicate accounts; or</li>
        <li>misuse marketplace or advertising systems.</li>
      </List>
      <p>
        We may refuse, pause, or terminate work that we reasonably believe is unlawful, fraudulent,
        unsafe, misleading, or inconsistent with applicable platform policies.
      </p>
    </TermsSection>

    <TermsSection number="9" title="Advertising Budgets and Platform Charges">
      <p>Unless an accepted written agreement states otherwise:</p>
      <List>
        <li>our professional fees do not include Amazon advertising spend;</li>
        <li>marketplace fees, advertising charges, and third-party costs are payable directly by the client;</li>
        <li>the client is responsible for approving advertising budgets and material budget changes;</li>
        <li>the client must maintain valid payment methods with the relevant platform; and</li>
        <li>taxes, logistics, photography, translation, compliance, software, and other third-party expenses are excluded.</li>
      </List>
      <p>
        Advertising platforms may pace, attribute, or report spend differently from projections.
        Small variations may occur because of platform processing, attribution windows, currency
        conversion, delayed reporting, or system behaviour outside our control.
      </p>
      <p>
        Where advertising management is included, we will use reasonable care to manage campaigns
        within the agreed strategy and budget parameters. No advertising budget guarantees a
        particular number of impressions, clicks, orders, or sales.
      </p>
    </TermsSection>

    <TermsSection number="10" title="Performance and Results Disclaimer">
      <p>We aim to provide professional, evidence-based marketplace services. However, business and advertising outcomes depend on factors including:</p>
      <List>
        <li>product demand;</li>
        <li>price and margins;</li>
        <li>competition;</li>
        <li>reviews and ratings;</li>
        <li>product quality;</li>
        <li>inventory availability;</li>
        <li>listing history;</li>
        <li>marketplace eligibility;</li>
        <li>advertising budget;</li>
        <li>client approvals;</li>
        <li>seasonality;</li>
        <li>fulfilment performance;</li>
        <li>Amazon policies and algorithms; and</li>
        <li>wider market conditions.</li>
      </List>
      <p>We do not guarantee:</p>
      <List>
        <li>revenue or profit;</li>
        <li>sales growth;</li>
        <li>ACoS, TACoS, or ROAS;</li>
        <li>conversion rates;</li>
        <li>organic ranking;</li>
        <li>Buy Box performance;</li>
        <li>account approval or reinstatement;</li>
        <li>specific launch results; or</li>
        <li>any other financial or marketplace outcome.</li>
      </List>
      <p>Forecasts, projections, and strategy recommendations are estimates rather than promises.</p>
      <p>
        Case studies, testimonials, and previous results describe particular engagements and do not
        guarantee that another client will achieve similar results.
      </p>
    </TermsSection>

    <TermsSection number="11" title="Fees, Invoicing and Taxes">
      <p>
        Fees, billing frequency, payment milestones, currencies, and payment methods will be
        specified in the applicable proposal, invoice, or Client Agreement.
      </p>
      <p>
        Unless expressly included in the quoted price, clients are responsible for applicable taxes,
        duties, bank fees, payment-processing charges, and legally required withholding.
      </p>
      <p>Where tax must be withheld, the client must provide the legally required withholding certificate or supporting documentation.</p>
      <p>
        Any advance payment, recurring retainer, refund, cancellation fee, or notice period will be
        governed by the applicable written agreement. These Website Terms do not independently
        create a recurring subscription or blanket no-refund policy.
      </p>
      <p>
        We may pause paid services for overdue undisputed invoices after providing reasonable notice,
        subject to the applicable Client Agreement.
      </p>
    </TermsSection>

    <TermsSection number="12" title="Client Materials">
      <p>
        “Client Materials” include product information, trademarks, photographs, videos, advertising
        content, account data, reports, business information, and other material supplied by or on
        behalf of the client.
      </p>
      <p>The client retains ownership of its Client Materials.</p>
      <p>
        The client grants us a limited, non-exclusive licence to access, reproduce, modify, and use
        Client Materials only as reasonably required to provide the agreed services.
      </p>
      <p>The client represents that:</p>
      <List>
        <li>it owns or has permission to use the Client Materials;</li>
        <li>the materials are accurate and lawful;</li>
        <li>our authorised use will not violate third-party rights; and</li>
        <li>required disclosures, licences, and consents have been obtained.</li>
      </List>
      <p>We may refuse to use material that appears unlawful, misleading, infringing, or inconsistent with marketplace policy.</p>
    </TermsSection>

    <TermsSection number="13" title="Deliverables and Intellectual Property">
      <p>
        The Website, including its text, design, graphics, software, branding, and original content,
        is owned by or licensed to Digital Universe Pro and is protected by applicable
        intellectual-property laws.
      </p>
      <p>
        You may not copy, reproduce, modify, distribute, sell, license, scrape, or commercially
        exploit Website content without written permission.
      </p>
      <p>
        Ownership and permitted use of client deliverables will be specified in the applicable
        Client Agreement or Statement of Work.
      </p>
      <p>Unless otherwise agreed:</p>
      <List>
        <li>the client retains ownership of Client Materials;</li>
        <li>we retain ownership of pre-existing methodologies, templates, processes, know-how, software, and internal tools;</li>
        <li>third-party materials remain subject to their original licences; and</li>
        <li>ownership transfer does not include third-party or pre-existing intellectual property.</li>
      </List>
    </TermsSection>

    <TermsSection number="14" title="Client Names, Logos and Case Studies">
      <p>
        We will not publicly present a client’s name, logo, testimonial, confidential results, or
        identifiable account data as social proof without appropriate permission.
      </p>
      <p>Where permission is granted, usage must remain within the agreed scope.</p>
      <p>We may use anonymised and aggregated performance information only where:</p>
      <List>
        <li>it does not identify the client;</li>
        <li>it does not expose confidential information or personal data;</li>
        <li>the applicable client agreement permits such use; and</li>
        <li>the presentation is accurate and not misleading.</li>
      </List>
      <p>
        A client may withdraw future use permission in accordance with the relevant written agreement,
        without requiring removal of materials that were lawfully published and cannot reasonably be recalled.
      </p>
    </TermsSection>

    <TermsSection number="15" title="Confidentiality">
      <p>Information exchanged before a formal engagement should not be assumed to be confidential unless:</p>
      <List>
        <li>it is covered by a separate non-disclosure agreement;</li>
        <li>the parties agree in writing that it is confidential; or</li>
        <li>its confidential nature is clear from the circumstances.</li>
      </List>
      <p>
        Do not submit trade secrets, primary passwords, or highly sensitive information through a
        general Website enquiry form.
      </p>
      <p>
        Confidentiality obligations for paid engagements will be governed by the applicable Client
        Agreement or non-disclosure agreement.
      </p>
      <p>
        Nothing prevents a party from disclosing information where required by law, regulation, or a
        valid order, subject to any legally permitted notice to the other party.
      </p>
    </TermsSection>

    <TermsSection number="16" title="Privacy and Data Protection">
      <p>
        Personal information collected through the Website is handled in accordance with our{' '}
        <a
          href={SITE_CONFIG.legalLinks.privacy}
          className="rounded font-semibold text-primary-300 underline decoration-primary-400/60 underline-offset-4 hover:text-primary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        >
          Privacy Policy
        </a>.
      </p>
      <p>
        Where client services require access to Seller Central, Amazon Ads, CRM, customer, employee,
        or other business data, the parties may enter into additional data-processing and security terms.
      </p>
      <p>Clients must not provide personal data that is unnecessary for the agreed services.</p>
      <p>
        Clients are responsible for ensuring that they have a lawful basis and appropriate authority
        to provide any personal data or account access to us.
      </p>
    </TermsSection>

    <TermsSection number="17" title="Acceptable Website Use">
      <p>You must not:</p>
      <List>
        <li>use the Website for unlawful, fraudulent, or abusive activity;</li>
        <li>attempt to gain unauthorised access to the Website or associated systems;</li>
        <li>upload malware or malicious code;</li>
        <li>interfere with Website security or availability;</li>
        <li>scrape, harvest, or collect information using unauthorised automated methods;</li>
        <li>impersonate Digital Universe Pro or another person;</li>
        <li>submit false or misleading enquiries;</li>
        <li>infringe our or another party’s intellectual-property rights; or</li>
        <li>use Website content to create a misleadingly similar or competing website.</li>
      </List>
      <p>
        We may restrict Website access where reasonably necessary to protect our users, systems,
        legal rights, or business operations.
      </p>
    </TermsSection>

    <TermsSection number="18" title="Third-Party Links and Services">
      <p>
        The Website may contain links to Amazon, scheduling services, payment providers, social-media
        platforms, and other third-party websites.
      </p>
      <p>Third-party services are governed by their own terms and privacy practices.</p>
      <p>We do not control and are not responsible for:</p>
      <List>
        <li>third-party website availability;</li>
        <li>third-party security;</li>
        <li>external content;</li>
        <li>platform-policy changes;</li>
        <li>third-party fees; or</li>
        <li>decisions taken by third-party service providers.</li>
      </List>
      <p>A link does not necessarily indicate endorsement unless explicitly stated.</p>
    </TermsSection>

    <TermsSection number="19" title="Suspension and Termination">
      <p>We may suspend access to the Website or refuse an enquiry where reasonably necessary because of:</p>
      <List>
        <li>unlawful or fraudulent conduct;</li>
        <li>security threats;</li>
        <li>misuse of the Website;</li>
        <li>material violation of these Terms; or</li>
        <li>legal or regulatory requirements.</li>
      </List>
      <p>Termination and notice requirements for paid services will be governed by the applicable Client Agreement.</p>
      <p>Upon termination:</p>
      <List>
        <li>outstanding undisputed fees remain payable;</li>
        <li>each party must return or delete confidential material as required by the applicable agreement;</li>
        <li>account access should be revoked promptly; and</li>
        <li>provisions intended to survive termination will remain effective.</li>
      </List>
    </TermsSection>

    <TermsSection number="20" title="Website Disclaimer">
      <p>The Website is provided on an “as available” basis.</p>
      <p>To the maximum extent permitted by law, we do not warrant that:</p>
      <List>
        <li>the Website will always be uninterrupted or error-free;</li>
        <li>all Website content will always be current;</li>
        <li>external links will remain available;</li>
        <li>submitting an enquiry will result in acceptance as a client; or</li>
        <li>Website information is suitable for every business situation.</li>
      </List>
      <p>Nothing on the Website constitutes legal, tax, accounting, investment, product-compliance, or regulatory advice.</p>
      <p>This section does not limit any express service commitment contained in an accepted Client Agreement.</p>
    </TermsSection>

    <TermsSection number="21" title="Limitation of Liability">
      <p className="rounded-xl border border-amber-300/25 bg-amber-300/10 p-4 text-base text-amber-50">
        The liability limits in this supplied draft require explicit business and legal approval
        before these Terms take effect.
      </p>
      <p>
        Nothing in these Terms limits liability that cannot lawfully be limited, including liability
        arising from fraud, wilful misconduct, or any other liability that applicable law prohibits us from excluding.
      </p>
      <p>
        To the maximum extent permitted by law, neither party will be liable for indirect, incidental,
        special, exemplary, or consequential losses, including loss of anticipated profits, business
        opportunity, goodwill, or data, except where such exclusion is prohibited by law.
      </p>
      <p>For paid services, any liability limit stated in the applicable Client Agreement will apply.</p>
      <p>
        If no separate liability limit has been agreed, the supplied draft limits aggregate liability
        arising from the affected paid services to the professional fees actually paid for those
        affected services during the six months immediately preceding the event giving rise to the claim.
      </p>
      <p>
        For claims arising solely from free use of the Website where no professional fees were paid,
        the supplied draft limits aggregate liability to INR 10,000.
      </p>
      <p>We are not responsible for losses caused by:</p>
      <List>
        <li>inaccurate or incomplete client information;</li>
        <li>client delay or failure to follow recommendations;</li>
        <li>unauthorised account access outside our reasonable control;</li>
        <li>Amazon or third-party platform outages;</li>
        <li>platform-policy or algorithm changes;</li>
        <li>marketplace enforcement decisions;</li>
        <li>rejected listings or advertisements;</li>
        <li>insufficient inventory or advertising funds; or</li>
        <li>events outside our reasonable control.</li>
      </List>
    </TermsSection>

    <TermsSection number="22" title="Indemnification">
      <p>
        To the extent permitted by law, you agree to indemnify and hold harmless Digital Universe Pro,
        its legal operator, personnel, and contractors from third-party claims, damages, penalties, and
        reasonable costs arising from:
      </p>
      <List>
        <li>products sold by or on behalf of your business;</li>
        <li>Client Materials supplied by you;</li>
        <li>false, misleading, or unlawful product claims;</li>
        <li>infringement of third-party rights by Client Materials;</li>
        <li>your violation of applicable laws or marketplace policies;</li>
        <li>instructions that you knew or reasonably should have known were unlawful; or</li>
        <li>your material breach of these Terms or an applicable Client Agreement.</li>
      </List>
      <p>
        We will provide reasonable notice of an indemnified claim and reasonable cooperation in its
        defence. No settlement may impose an admission or non-monetary obligation on an indemnified
        party without its consent.
      </p>
    </TermsSection>

    <TermsSection number="23" title="Force Majeure">
      <p>
        Neither party will be liable for delay or failure caused by events beyond its reasonable
        control, including natural disasters, war, civil disturbance, governmental action, widespread
        internet or cloud failure, labour disruption, cyberattack, platform outage, or major Amazon
        system or policy changes.
      </p>
      <p>The affected party must take reasonable steps to reduce the impact and resume performance.</p>
      <p>Force majeure does not excuse payment obligations that became due before the relevant event.</p>
    </TermsSection>

    <TermsSection number="24" title="Electronic Communications">
      <p>
        You consent to receiving service-related communications electronically, including by email,
        approved messaging channels, or electronic documents.
      </p>
      <p>Electronic acceptance, signatures, and records may be used where permitted by applicable law.</p>
      <p>Marketing communications will be sent only in accordance with applicable consent and opt-out requirements.</p>
    </TermsSection>

    <TermsSection number="25" title="Changes to These Terms">
      <p>We may update these Terms to reflect changes in our Website, services, law, or third-party platform requirements.</p>
      <p>The updated version will display a revised “Last updated” date.</p>
      <p>
        Material changes will apply prospectively. Changes to these Website Terms will not
        retrospectively alter a signed Client Agreement unless both parties agree in writing or the
        Client Agreement expressly permits the change.
      </p>
      <p>Continued use of the Website after revised Terms become effective constitutes acceptance of the updated Website Terms.</p>
    </TermsSection>

    <TermsSection number="26" title="Governing Law and Dispute Resolution">
      <p className="rounded-xl border border-amber-300/25 bg-amber-300/10 p-4 text-base text-amber-50">
        The supplied draft selects Indian law and arbitration, but the arbitration seat, venue, and
        court jurisdiction have not been confirmed. This section requires legal review and location
        approval before these Terms take effect.
      </p>
      <p>These draft Terms are intended to be governed by the laws of India, without regard to conflict-of-law principles.</p>
      <p>
        Before commencing formal proceedings, the parties will attempt in good faith to resolve a
        dispute through written notice and negotiation for at least 30 days.
      </p>
      <p>
        If the dispute is not resolved, the supplied draft refers it to arbitration in accordance
        with the Arbitration and Conciliation Act, 1996.
      </p>
      <p>The supplied arbitration clause states that arbitration will:</p>
      <List>
        <li>be conducted by one arbitrator mutually appointed by the parties or appointed in accordance with applicable law;</li>
        <li>have a legal seat and venue that must still be confirmed;</li>
        <li>be conducted in English; and</li>
        <li>result in a written and binding award.</li>
      </List>
      <p>
        The courts for applications for interim relief, enforcement of an arbitration award, and
        matters that cannot lawfully be arbitrated must still be confirmed.
      </p>
      <p>
        Nothing in this section prevents either party from seeking urgent injunctive relief to
        protect confidential information, intellectual property, data, or account security.
      </p>
      <p>
        Nothing in these Terms restricts any mandatory statutory right or forum available to a
        person who legally qualifies as a consumer.
      </p>
    </TermsSection>

    <TermsSection number="27" title="General Provisions">
      <section aria-labelledby="terms-entire-agreement-heading">
        <h3 id="terms-entire-agreement-heading" className="text-xl font-extrabold text-white">Entire agreement</h3>
        <p className="mt-3">
          These Terms, the Privacy Policy, and any applicable Client Agreement constitute the
          agreement between the relevant parties concerning their respective subject matter.
        </p>
      </section>
      <section aria-labelledby="terms-no-partnership-heading">
        <h3 id="terms-no-partnership-heading" className="text-xl font-extrabold text-white">No partnership or agency</h3>
        <p className="mt-3">Nothing in these Terms creates a partnership, joint venture, employment relationship, franchise, or legal agency relationship between the parties.</p>
        <p className="mt-3">Account-management authority granted for service delivery does not authorise us to bind the client to unrelated legal or commercial obligations.</p>
      </section>
      <section aria-labelledby="terms-assignment-heading">
        <h3 id="terms-assignment-heading" className="text-xl font-extrabold text-white">Assignment</h3>
        <p className="mt-3">You may not assign your rights or obligations relating to paid services without our prior written consent, except as permitted by an applicable Client Agreement.</p>
        <p className="mt-3">We may assign these Terms as part of a merger, restructuring, acquisition, or transfer of substantially all relevant business assets, subject to applicable law.</p>
      </section>
      <section aria-labelledby="terms-severability-heading">
        <h3 id="terms-severability-heading" className="text-xl font-extrabold text-white">Severability</h3>
        <p className="mt-3">If any provision is held invalid or unenforceable, the remaining provisions will continue to apply. The invalid provision will be modified only to the minimum extent necessary to make it enforceable.</p>
      </section>
      <section aria-labelledby="terms-waiver-heading">
        <h3 id="terms-waiver-heading" className="text-xl font-extrabold text-white">Waiver</h3>
        <p className="mt-3">Failure to enforce a provision does not waive the right to enforce it later.</p>
      </section>
      <section aria-labelledby="terms-beneficiaries-heading">
        <h3 id="terms-beneficiaries-heading" className="text-xl font-extrabold text-white">No third-party beneficiaries</h3>
        <p className="mt-3">Except where expressly stated, these Terms do not give rights to any third party.</p>
      </section>
      <section aria-labelledby="terms-headings-heading">
        <h3 id="terms-headings-heading" className="text-xl font-extrabold text-white">Headings</h3>
        <p className="mt-3">Headings are included for convenience and do not affect interpretation.</p>
      </section>
      <section aria-labelledby="terms-language-heading">
        <h3 id="terms-language-heading" className="text-xl font-extrabold text-white">Language</h3>
        <p className="mt-3">The English version of these Terms will control unless applicable law requires otherwise.</p>
      </section>
    </TermsSection>

    <TermsSection number="28" title="Contact Us">
      <p>Questions, notices, or concerns relating to these draft Terms may be sent to:</p>
      <address className="not-italic">
        <p className="font-bold text-white">{SITE_CONFIG.brandName}</p>
        <p>Legal operator: To be confirmed before these Terms take effect</p>
        <p>Registered or principal address: To be confirmed before these Terms take effect</p>
        <p>
          Email:{' '}
          <a
            href={`mailto:${SITE_CONFIG.contact.email}`}
            className="rounded font-semibold text-primary-300 underline decoration-primary-400/60 underline-offset-4 hover:text-primary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            {SITE_CONFIG.contact.email}
          </a>
        </p>
        <p>
          Website:{' '}
          <a
            href="/"
            className="rounded font-semibold text-primary-300 underline decoration-primary-400/60 underline-offset-4 hover:text-primary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            digitaluniversepro.co
          </a>
        </p>
      </address>
    </TermsSection>
  </div>
);

export default TermsOfServiceContent;
