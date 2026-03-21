import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function BackLink({ to, children }) {
  return (
    <Link to={to} className="back-link back-link--with-icon">
      <ArrowLeftIcon className="back-link__icon" aria-hidden />
      {children}
    </Link>
  );
}
