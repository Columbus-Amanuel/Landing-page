import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Inline error banner shown when a fetch fails. Defaults to a generic title;
 * pass `title` or `description` to override.
 */
export default function ErrorState({ title = 'Something went wrong', description, className }) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  );
}
