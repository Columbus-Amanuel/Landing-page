import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * Shared member profile fields (account, contact, personal, emergency).
 * Parent owns `react-hook-form` state and passes `register` / `errors`.
 *
 * @param {object} props
 * @param {string} [props.email] read-only sign-in email
 * @param {import('react-hook-form').UseFormRegister} props.register
 * @param {import('react-hook-form').FieldErrors} props.errors
 * @param {(e?: React.BaseSyntheticEvent) => void} props.onSubmit
 * @param {boolean} [props.submitting]
 * @param {string} [props.error]
 * @param {React.ReactNode} [props.footer] save/cancel actions
 * @param {boolean} [props.stickyFooter] pin footer outside the scrollable fields (modals)
 * @param {React.ReactNode} [props.afterFields] extra fields rendered after emergency contact
 */
export default function MemberProfileForm({
  email = '',
  register,
  errors,
  onSubmit,
  submitting = false,
  error = '',
  footer,
  stickyFooter = false,
  afterFields,
}) {
  const { t } = useLanguage();

  const fields = (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Fieldset legend={t('profileUpdate.sectionAccount')}>
        <FieldRow>
          <Field label={t('profileUpdate.fullName')} error={errors.displayName?.message}>
            <Input
              autoComplete="name"
              aria-invalid={Boolean(errors.displayName)}
              disabled={submitting}
              {...register('displayName', { required: t('common.required') })}
            />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label={t('profileUpdate.email')}>
            <Input value={email} disabled readOnly className="bg-muted/50" />
          </Field>
        </FieldRow>
      </Fieldset>

      <Fieldset legend={t('profileUpdate.sectionContact')}>
        <FieldRow>
          <Field label={t('profileUpdate.phone')}>
            <Input type="tel" autoComplete="tel" disabled={submitting} {...register('phone')} />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label={t('profileUpdate.street')}>
            <Input autoComplete="street-address" disabled={submitting} {...register('address')} />
          </Field>
        </FieldRow>
        <FieldRow cols={3}>
          <Field label={t('profileUpdate.city')}>
            <Input autoComplete="address-level2" disabled={submitting} {...register('city')} />
          </Field>
          <Field label={t('profileUpdate.state')}>
            <Input autoComplete="address-level1" disabled={submitting} {...register('state')} />
          </Field>
          <Field label={t('profileUpdate.zip')}>
            <Input autoComplete="postal-code" disabled={submitting} {...register('zip')} />
          </Field>
        </FieldRow>
      </Fieldset>

      <Fieldset legend={t('profileUpdate.sectionPersonal')}>
        <FieldRow cols={2}>
          <Field label={t('profileUpdate.dateOfBirth')}>
            <Input type="date" disabled={submitting} {...register('dateOfBirth')} />
          </Field>
          <Field label={t('profileUpdate.occupation')}>
            <Input disabled={submitting} {...register('occupation')} />
          </Field>
        </FieldRow>
        <Field label={t('profileUpdate.bio')}>
          <Textarea
            rows={3}
            disabled={submitting}
            {...register('bio')}
            placeholder={t('profileUpdate.bioPlaceholder')}
          />
        </Field>
        <Field label={t('profileUpdate.ministryInterests')}>
          <Textarea
            rows={3}
            disabled={submitting}
            {...register('ministryInterests')}
            placeholder={t('profileUpdate.ministryPlaceholder')}
          />
        </Field>
      </Fieldset>

      <Fieldset legend={t('profileUpdate.sectionEmergency')}>
        <FieldRow cols={2}>
          <Field label={t('profileUpdate.emergencyName')}>
            <Input disabled={submitting} {...register('emergencyContactName')} />
          </Field>
          <Field label={t('profileUpdate.emergencyPhone')}>
            <Input type="tel" disabled={submitting} {...register('emergencyContactPhone')} />
          </Field>
        </FieldRow>
      </Fieldset>

      {afterFields}
    </>
  );

  return (
    <form
      onSubmit={onSubmit}
      className={cn('flex flex-col gap-6', stickyFooter && footer && 'min-h-0 flex-1')}
    >
      {stickyFooter && footer ? (
        <>
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-6 pt-4">
            {fields}
          </div>
          <div className="shrink-0 border-t border-border bg-card px-6 py-4">
            {footer}
          </div>
        </>
      ) : (
        <>
          {fields}
          {footer}
        </>
      )}
    </form>
  );
}

function Fieldset({ legend, children }) {
  return (
    <fieldset className="rounded-lg border border-border p-5">
      <legend className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        {legend}
      </legend>
      <div className="flex flex-col gap-4">{children}</div>
    </fieldset>
  );
}

function FieldRow({ cols = 1, children }) {
  const grid =
    cols === 3 ? 'grid-cols-1 sm:grid-cols-3' : cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1';
  return <div className={`grid gap-4 ${grid}`}>{children}</div>;
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
