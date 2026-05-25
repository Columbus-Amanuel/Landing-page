import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Side-by-side EN / AM input pair backed by react-hook-form's `register`.
 * Single source of truth for all admin bilingual content forms.
 *
 * @param {object} props
 * @param {string} props.label              - User-facing label (shared by both fields)
 * @param {string} props.nameEn             - react-hook-form name for English value
 * @param {string} props.nameAm             - react-hook-form name for Amharic value
 * @param {ReturnType<typeof import('react-hook-form').useForm>['register']} props.register
 * @param {boolean} [props.required]
 * @param {boolean} [props.textarea]
 * @param {number} [props.rows]
 * @param {string} [props.placeholder]
 */
export default function BilingualField({
  label,
  nameEn,
  nameAm,
  register,
  required = false,
  textarea = false,
  rows = 3,
  placeholder,
  className,
}) {
  const Field = textarea ? Textarea : Input;
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2', className)}>
      <div className="flex flex-col gap-1.5">
        <Label className="inline-flex items-center gap-2">
          <Badge variant="default" className="text-[0.6rem]">EN</Badge>
          {label}
        </Label>
        <Field
          rows={textarea ? rows : undefined}
          placeholder={placeholder}
          {...register(nameEn, required ? { required: true } : {})}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="inline-flex items-center gap-2">
          <Badge variant="accent" className="text-[0.6rem]">አማ</Badge>
          {label}
        </Label>
        <Field
          rows={textarea ? rows : undefined}
          placeholder={placeholder}
          {...register(nameAm)}
        />
      </div>
    </div>
  );
}
