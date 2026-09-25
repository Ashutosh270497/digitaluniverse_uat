import Footer from '../components/layout/Footer.jsx';
import { MARKETING_ROUTES } from '../config/routes.js';

const NotFoundPage = () => (
  <div className="min-h-screen bg-amazon-dark text-white">
    <main id="main-content" className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-bold uppercase tracking-[0.2em] text-primary-400">404</p>
      <h1 className="mt-4 text-4xl font-black sm:text-5xl">Page not found</h1>
      <p className="mt-5 text-lg text-gray-300">The requested page does not exist.</p>
      <a
        href="/"
        className="mt-8 rounded-lg bg-primary-500 px-7 py-4 font-bold text-amazon-dark hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        Return to Digital Universe Pro
      </a>
      <nav aria-label="Helpful pages" className="mt-8">
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-bold text-primary-300">
          <li><a href={MARKETING_ROUTES.amazonPpcManagement.path} className="underline underline-offset-4">Amazon PPC Management</a></li>
          <li><a href={MARKETING_ROUTES.amazonAccountManagement.path} className="underline underline-offset-4">Account Management</a></li>
          <li><a href={MARKETING_ROUTES.contact.path} className="underline underline-offset-4">Contact</a></li>
        </ul>
      </nav>
    </main>
    <Footer />
  </div>
);

export default NotFoundPage;
