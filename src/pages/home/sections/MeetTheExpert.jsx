import { ArrowRight, Check } from 'lucide-react';
import expertPhotoLarge from '../../../assets/amazon_pics/gautam-soni-1067.webp';
import expertPhotoSmall from '../../../assets/amazon_pics/gautam-soni-600.webp';
const MeetTheExpert = () => (
  <section id="about" aria-labelledby="about-heading" className="section-space bg-amazon-cream">
    <div className="section-shell grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
      <div className="founder-portrait relative mx-auto w-full max-w-sm">
        <img src={expertPhotoSmall} srcSet={`${expertPhotoSmall} 600w, ${expertPhotoLarge} 1067w`} sizes="(min-width: 1024px) 384px, 85vw" alt="Gautam Soni, founder of Digital Universe Pro" width="1067" height="1600" loading="lazy" decoding="async" className="aspect-[4/5] w-full rounded-2xl object-cover object-center" />
        <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-amazon-dark/95 px-5 py-4 text-white"><p className="font-bold">Gautam Soni</p><p className="mt-1 text-sm text-primary-300">Founder · Amazon Marketplace Strategist</p></div>
      </div>
      <div>
        <p className="eyebrow">The person behind the plan</p><h2 id="about-heading" className="section-title">Meet Gautam Soni.</h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">Five years of Amazon experience, with a practical focus on advertising, product launches and account growth. Gautam connects the details of your account with the bigger picture for your brand.</p>
        <ul className="mt-7 space-y-4 text-gray-700">{['Founder-led strategy and account priorities', 'Connected thinking across PPC, listings and content', 'Clear responsibilities and regular review points'].map(item => <li key={item} className="flex items-start gap-3"><Check className="mt-1 h-4 w-4 shrink-0 text-primary-800" aria-hidden="true" />{item}</li>)}</ul>
        <div className="founder-principles"><span>Strategy</span><span>Ownership</span><span>Clear communication</span></div>
        <a href="/about" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded font-semibold text-primary-800 hover:text-primary-900">More about our approach<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
      </div>
    </div>
  </section>
);
export default MeetTheExpert;
