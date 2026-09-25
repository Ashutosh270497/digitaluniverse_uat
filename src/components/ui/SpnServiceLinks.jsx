import { ExternalLink } from 'lucide-react';
import { getSpnServiceLinks } from '../../config/site.js';

const SpnServiceLinks = ({ serviceKey, dark = false }) => {
  const links = getSpnServiceLinks(serviceKey);
  if (links.length === 0) return null;

  return (
    <div className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
      <p className="font-semibold">Related Amazon SPN listings</p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
        {links.map(({ code, label, url }) => (
          <li key={code}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex min-h-8 items-center gap-1.5 rounded font-extrabold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${dark ? 'text-primary-300 hover:text-primary-200' : 'text-primary-800 hover:text-primary-900'}`}
            >
              {label}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SpnServiceLinks;
