import { Quote } from 'lucide-react';
import { getFeaturedTestimonials } from '../../../content/socialProof.ts';
const testimonials = getFeaturedTestimonials(3);
const Testimonials = () => (
  <section id="testimonials" aria-labelledby="testimonials-heading" className="section-space bg-white">
    <div className="section-shell">
      <div className="home-section-intro"><div><p className="eyebrow">In our clients’ words</p><h2 id="testimonials-heading" className="section-title">Good work.<br />Lasting relationships.</h2></div><p className="home-section-description">The people behind the brands, on what it’s like to work with Digital Universe Pro.</p></div>
      <div className="mt-9 grid gap-5 lg:grid-cols-3">
        {testimonials.map(testimonial => {
          const excerpt = testimonial.quote.split(/(?<=\.) /)[0];
          return <figure key={testimonial.id} className="home-testimonial flex flex-col rounded-2xl border border-gray-200 p-6 lg:p-7">
            <Quote className="h-6 w-6 text-primary-800" aria-hidden="true" />
            <blockquote className="mt-5 text-lg leading-relaxed text-amazon-dark">“{excerpt}”</blockquote>
            <figcaption className="mt-6 font-bold text-amazon-dark">{testimonial.clientName}</figcaption>
            <time dateTime={testimonial.date} className="mt-1 text-sm text-gray-600">{new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${testimonial.date}T00:00:00Z`))}</time>
            <details className="mt-5 border-t border-gray-200 pt-3"><summary className="cursor-pointer rounded py-2 text-sm font-semibold text-primary-800">Read full testimonial</summary><p className="mt-3 text-sm leading-relaxed text-gray-600">“{testimonial.quote}”</p><p className="mt-3 text-xs leading-relaxed text-gray-500">Republished from our previous website. Original review-platform record unavailable.</p>{testimonial.sourceUrl && <a href={testimonial.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary-800 underline">View original review<span className="sr-only"> (opens in a new tab)</span></a>}</details>
          </figure>;
        })}
      </div>
    </div>
  </section>
);
export default Testimonials;
