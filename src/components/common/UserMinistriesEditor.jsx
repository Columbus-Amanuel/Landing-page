import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { ASSIGNABLE_MINISTRY_ROLES, ministryRoleLabelKey } from '@/lib/ministryRoles';
import { cn } from '@/lib/utils';

const emptyRow = () => ({ ministryId: '', role: 'member', note: '' });

/**
 * Editable list of ministry memberships for a user.
 *
 * @param {object} props
 * @param {Array<{ id: string, navLabelEn?: string, navLabelAm?: string, slug?: string }>} props.ministries
 * @param {Array<{ ministryId: string, role: string, note?: string }>} props.memberships
 * @param {(rows: Array<{ ministryId: string, role: string, note?: string }>) => void} props.onChange
 * @param {boolean} [props.disabled]
 */
export default function UserMinistriesEditor({ ministries, memberships, onChange, disabled = false }) {
  const { t, pickLocalized } = useLanguage();

  const rows = memberships.length ? memberships : [emptyRow()];

  const usedMinistryIds = new Set(rows.map((r) => r.ministryId).filter(Boolean));

  const updateRow = (index, patch) => {
    const next = rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange(next);
  };

  const removeRow = (index) => {
    const next = rows.filter((_, i) => i !== index);
    onChange(next.length ? next : [emptyRow()]);
  };

  const addRow = () => {
    onChange([...rows, emptyRow()]);
  };

  const ministryLabel = (m) => pickLocalized(m, 'navLabel') || m.slug || m.id;

  return (
    <fieldset className="rounded-lg border border-border p-5">
      <legend className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        {t('admin.users.ministries.section')}
      </legend>

      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">{t('admin.users.ministries.hint')}</p>

        {rows.map((row, index) => {
          const availableMinistries = ministries.filter(
            (m) => m.id === row.ministryId || !usedMinistryIds.has(m.id),
          );

          return (
            <div
              key={`${index}-${row.ministryId || 'new'}`}
              className={cn(
                'grid gap-3 rounded-lg border border-border/70 bg-muted/20 p-3',
                'sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]',
                'sm:items-end',
              )}
            >
              <div className="flex flex-col gap-2">
                <Label className="text-xs">{t('admin.users.ministries.ministry')}</Label>
                <Select
                  value={row.ministryId || undefined}
                  onValueChange={(value) => updateRow(index, { ministryId: value })}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.users.ministries.selectMinistry')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMinistries.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {ministryLabel(m)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs">{t('admin.users.ministries.role')}</Label>
                <Select
                  value={row.role || 'member'}
                  onValueChange={(value) => updateRow(index, { role: value })}
                  disabled={disabled || !row.ministryId}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNABLE_MINISTRY_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {t(ministryRoleLabelKey(r))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs">{t('admin.users.ministries.note')}</Label>
                <Input
                  value={row.note || ''}
                  onChange={(e) => updateRow(index, { note: e.target.value })}
                  placeholder={t('admin.users.ministries.notePlaceholder')}
                  disabled={disabled || !row.ministryId}
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                disabled={disabled || rows.length === 1}
                onClick={() => removeRow(index)}
                aria-label={t('admin.users.ministries.remove')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          disabled={disabled || ministries.length === 0 || usedMinistryIds.size >= ministries.length}
          onClick={addRow}
        >
          <Plus className="h-4 w-4" />
          {t('admin.users.ministries.add')}
        </Button>
      </div>
    </fieldset>
  );
}

/**
 * Read-only ministry membership list for profile view.
 *
 * @param {object} props
 * @param {Array<{ ministryId: string, role: string, note?: string | null }>} props.memberships
 * @param {Array<{ id: string, navLabelEn?: string, navLabelAm?: string, slug?: string }>} props.ministries
 */
export function UserMinistriesList({ memberships, ministries }) {
  const { t, pickLocalized } = useLanguage();

  if (!memberships.length) {
    return (
      <p className="text-sm text-muted-foreground">{t('admin.users.ministries.empty')}</p>
    );
  }

  const ministryById = Object.fromEntries(ministries.map((m) => [m.id, m]));

  return (
    <ul className="space-y-2">
      {memberships.map((m) => {
        const ministry = ministryById[m.ministryId];
        const name = ministry ? pickLocalized(ministry, 'navLabel') || ministry.slug : m.ministryId;
        return (
          <li
            key={`${m.ministryId}-${m.role}`}
            className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-sm"
          >
            <span className="font-medium text-foreground">{t(ministryRoleLabelKey(m.role))}</span>
            <span className="text-muted-foreground">
              {' '}
              {t('admin.users.ministries.of')}
              {' '}
            </span>
            <span className="font-medium text-primary">{name}</span>
            {m.note ? (
              <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
