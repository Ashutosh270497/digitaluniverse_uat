import { ChevronRight } from 'lucide-react';

const Breadcrumbs = ({ items, className = '' }) => (
  <nav aria-label="Breadcrumb" className={className}>
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {items.map((item, index) => {
        const isCurrent = index === items.length - 1;

        return (
          <li key={item.href ?? item.label} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4 opacity-60" aria-hidden="true" />}
            {isCurrent ? (
              <span aria-current="page" className="font-semibold">{item.label}</span>
            ) : (
              <a
                href={item.href}
                className="rounded underline decoration-current/40 underline-offset-4 hover:text-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              >
                {item.label}
              </a>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default Breadcrumbs;
