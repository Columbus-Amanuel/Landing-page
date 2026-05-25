import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Standard "← Back to X" link used by detail pages.
 *
 * @param {{ to: string, children: React.ReactNode, className?: string }} props
 */
export default function BackLink({ to, children, className }) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-accent',
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Link>
  );
}
