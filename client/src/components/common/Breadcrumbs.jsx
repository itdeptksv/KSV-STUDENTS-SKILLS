import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-slate-500 mb-6 flex-wrap gap-1">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-blue-600 transition-colors text-slate-400 hover:text-slate-600"
        title="Home"
      >
        <Home size={15} />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={item.label || index} className="flex items-center gap-1">
            <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="hover:text-blue-600 font-medium text-slate-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-slate-800" aria-current="page">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
