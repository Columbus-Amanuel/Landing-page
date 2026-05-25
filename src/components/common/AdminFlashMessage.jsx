import { CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

/**
 * Inline save-feedback message for admin forms. Use the `sonner` toaster for
 * transient toasts; use this when you want a persistent panel inside the form.
 *
 * @param {{ status?: 'success'|'error'|null, message?: string, className?: string }} props
 */
export default function AdminFlashMessage({ status, message, className }) {
  if (!status || !message) return null;
  const Icon = status === 'success' ? CheckCircle2 : XCircle;
  return (
    <Alert
      variant={status === 'success' ? 'success' : 'destructive'}
      className={cn(className)}
    >
      <Icon />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
