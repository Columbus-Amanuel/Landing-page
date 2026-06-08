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
import {
  ASSIGNABLE_FAMILY_RELATIONSHIPS,
  familyRelationshipLabelKey,
} from '@/lib/familyRelationships';
import { cn } from '@/lib/utils';

const emptyRow = () => ({ toUserId: '', relationship: 'child', note: '' });

function userLabel(u) {
  return u.displayName || u.email || u.id;
}

/**
 * Editable family links for a user.
 *
 * @param {object} props
 * @param {string} props.userId profile being edited (excluded from picker)
 * @param {Array<{ id: string, displayName?: string, email?: string }>} props.users
 * @param {Array<{ toUserId: string, relationship: string, note?: string }>} props.links
 * @param {(rows: Array<{ toUserId: string, relationship: string, note?: string }>) => void} props.onChange
 * @param {boolean} [props.disabled]
 */
export default function UserFamilyEditor({
  userId,
  users,
  links,
  onChange,
  disabled = false,
}) {
  const { t } = useLanguage();

  const rows = links.length ? links : [emptyRow()];
  const usedUserIds = new Set(rows.map((r) => r.toUserId).filter(Boolean));

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

  const pickerUsers = users.filter((u) => u.id !== userId);

  return (
    <fieldset className="rounded-lg border border-border p-5">
      <legend className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        {t('admin.users.family.section')}
      </legend>

      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">{t('admin.users.family.hint')}</p>

        {rows.map((row, index) => {
          const availableUsers = pickerUsers.filter(
            (u) => u.id === row.toUserId || !usedUserIds.has(u.id),
          );

          return (
            <div
              key={`${index}-${row.toUserId || 'new'}`}
              className={cn(
                'grid gap-3 rounded-lg border border-border/70 bg-muted/20 p-3',
                'sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]',
                'sm:items-end',
              )}
            >
              <div className="flex flex-col gap-2">
                <Label className="text-xs">{t('admin.users.family.member')}</Label>
                <Select
                  value={row.toUserId || undefined}
                  onValueChange={(value) => updateRow(index, { toUserId: value })}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.users.family.selectMember')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {userLabel(u)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs">{t('admin.users.family.relationship')}</Label>
                <Select
                  value={row.relationship || 'child'}
                  onValueChange={(value) => updateRow(index, { relationship: value })}
                  disabled={disabled || !row.toUserId}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNABLE_FAMILY_RELATIONSHIPS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {t(familyRelationshipLabelKey(r))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs">{t('admin.users.family.note')}</Label>
                <Input
                  value={row.note || ''}
                  onChange={(e) => updateRow(index, { note: e.target.value })}
                  placeholder={t('admin.users.family.notePlaceholder')}
                  disabled={disabled || !row.toUserId}
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                disabled={disabled || rows.length === 1}
                onClick={() => removeRow(index)}
                aria-label={t('admin.users.family.remove')}
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
          disabled={
            disabled
            || pickerUsers.length === 0
            || usedUserIds.size >= pickerUsers.length
          }
          onClick={addRow}
        >
          <Plus className="h-4 w-4" />
          {t('admin.users.family.add')}
        </Button>
      </div>
    </fieldset>
  );
}

/**
 * Read-only family list for profile view.
 *
 * @param {object} props
 * @param {Array<{ toUserId: string, relationship: string, note?: string | null }>} props.links
 * @param {Array<{ id: string, displayName?: string, email?: string }>} props.users
 */
export function UserFamilyList({ links, users }) {
  const { t } = useLanguage();

  if (!links.length) {
    return <p className="text-sm text-muted-foreground">{t('admin.users.family.empty')}</p>;
  }

  const userById = Object.fromEntries(users.map((u) => [u.id, u]));

  return (
    <ul className="space-y-2">
      {links.map((link) => {
        const person = userById[link.toUserId];
        const name = person ? userLabel(person) : link.toUserId;
        return (
          <li
            key={`${link.toUserId}-${link.relationship}`}
            className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-sm"
          >
            <span className="font-medium text-primary">{name}</span>
            <span className="text-muted-foreground">
              {' '}
              —
              {' '}
            </span>
            <span className="font-medium text-foreground">
              {t(familyRelationshipLabelKey(link.relationship))}
            </span>
            {link.note ? (
              <p className="mt-1 text-xs text-muted-foreground">{link.note}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
