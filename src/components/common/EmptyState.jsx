import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Soft "nothing here yet" panel. Pass `icon` for a custom illustration or
 * leave it blank to default to the Lucide `Inbox`.
 *
 * @param {{ icon?: React.ComponentType<{className?: string}>, title?: string, description?: string, action?: React.ReactNode, className?: string }} props
 */
export default function EmptyState({
  icon: IconComponent = Inbox,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/60 px-8 py-16 text-center',
        className,
      )}
    >
      <IconComponent className="mb-4 h-12 w-12 text-muted-foreground" strokeWidth={1.4} />
      {title && <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>}
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
