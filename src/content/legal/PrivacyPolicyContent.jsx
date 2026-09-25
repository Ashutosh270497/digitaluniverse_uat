const PrivacyPolicyContent = () => (
  <div className="mt-8 space-y-9 text-lg leading-relaxed text-gray-300">
    <p>
      At Digital Universe Pro, we respect your privacy and are committed to protecting your
      personal information.
    </p>

    <section aria-labelledby="information-we-collect-heading">
      <h2 id="information-we-collect-heading" className="text-2xl font-extrabold text-white">
        Information We Collect
      </h2>
      <p className="mt-4">
        We may collect information such as your name, email address, phone number, company/brand
        details, Amazon store URL, and other information you provide through our website or
        enquiry forms.
      </p>
    </section>

    <section aria-labelledby="how-we-use-information-heading">
      <h2 id="how-we-use-information-heading" className="text-2xl font-extrabold text-white">
        How We Use Your Information
      </h2>
      <p className="mt-4">We use your information to:</p>
      <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-primary-400">
        <li>Respond to your enquiries</li>
        <li>Provide Amazon account management and consulting services</li>
        <li>Contact you regarding our services and offers</li>
        <li>Improve our services and customer experience</li>
      </ul>
    </section>

    <section aria-labelledby="information-sharing-heading">
      <h2 id="information-sharing-heading" className="text-2xl font-extrabold text-white">
        Information Sharing
      </h2>
      <p className="mt-4">
        We do not sell or rent your personal information. We may share information with trusted
        service providers when necessary to provide our services or operate our business.
      </p>
    </section>

    <section aria-labelledby="data-security-heading">
      <h2 id="data-security-heading" className="text-2xl font-extrabold text-white">
        Data Security
      </h2>
      <p className="mt-4">
        We take reasonable measures to protect your personal information from unauthorized
        access, misuse, or disclosure.
      </p>
    </section>

    <section aria-labelledby="your-rights-heading">
      <h2 id="your-rights-heading" className="text-2xl font-extrabold text-white">
        Your Rights
      </h2>
      <p className="mt-4">
        You may contact us to request access, correction, or deletion of your personal
        information, where applicable.
      </p>
    </section>

    <section aria-labelledby="privacy-contact-heading">
      <h2 id="privacy-contact-heading" className="text-2xl font-extrabold text-white">
        Contact Us
      </h2>
      <address className="mt-4 not-italic">
        <p className="font-bold text-white">Digital Universe Pro</p>
        <p>
          Email:{' '}
          <a
            href="mailto:support@digitaluniversepro.co"
            className="rounded font-semibold text-primary-300 underline decoration-primary-400/60 underline-offset-4 hover:text-primary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            support@digitaluniversepro.co
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
    </section>

    <p className="border-t border-white/10 pt-8">
      By submitting your information through our forms, you agree to the collection and use of
      your information as described in this Privacy Policy.
    </p>
  </div>
);

export default PrivacyPolicyContent;
