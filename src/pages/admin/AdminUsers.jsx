import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Pencil, Save, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MemberProfileForm from '@/components/common/MemberProfileForm';
import UserMinistriesEditor, { UserMinistriesList } from '@/components/common/UserMinistriesEditor';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, toDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ASSIGNABLE_ROLES, normalizeUserRole, ROLES } from '@/lib/roles';
import {
  fetchUserDetail,
  fetchUserDirectoryPage,
  rebuildUserDirectoryIndex,
  updateUserProfile,
  updateUserRole,
  USER_DIRECTORY_PAGE_SIZE,
} from '@/services/usersAdminService';
import { listAllMinistriesAdmin } from '@/services/ministriesService';
import { listUserMinistries, replaceUserMinistries } from '@/services/userMinistriesService';

const emptyProfile = {
  displayName: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  dateOfBirth: '',
  occupation: '',
  ministryInterests: '',
  bio: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
};

function profileToFormValues(detail) {
  return {
    ...emptyProfile,
    displayName: detail?.displayName || '',
    phone: detail?.phone || '',
    address: detail?.address || '',
    city: detail?.city || '',
    state: detail?.state || '',
    zip: detail?.zip || '',
    dateOfBirth: detail?.dateOfBirth || '',
    occupation: detail?.occupation || '',
    ministryInterests: detail?.ministryInterests || '',
    bio: detail?.bio || '',
    emergencyContactName: detail?.emergencyContactName || '',
    emergencyContactPhone: detail?.emergencyContactPhone || '',
  };
}

function AdminPageHeader({ title, description }) {
  return (
    <header className="mb-4 flex flex-col gap-1">
      <h1 className="font-hero text-2xl font-semibold text-primary md:text-3xl">{title}</h1>
      {description && (
        <p className="max-w-2xl text-xs leading-snug text-muted-foreground line-clamp-2">{description}</p>
      )}
    </header>
  );
}

function roleLabelKey(role) {
  if (role === ROLES.SUPER_ADMIN) return 'admin.users.role.superAdmin';
  if (role === ROLES.ADMIN) return 'admin.users.role.admin';
  return 'admin.users.role.member';
}

function roleBadgeVariant(role) {
  const r = normalizeUserRole(role);
  if (r === ROLES.SUPER_ADMIN) return 'accent';
  if (r === ROLES.ADMIN) return 'default';
  return 'secondary';
}

function membershipToEditorRow(row) {
  return {
    ministryId: row.ministryId,
    role: row.role,
    note: row.note || '',
  };
}

function cleanMembershipsForSave(rows) {
  return rows
    .filter((row) => row.ministryId)
    .map(({ ministryId, role, note }) => ({ ministryId, role, note }));
}

function UserProfileModal({
  open,
  onOpenChange,
  detail,
  detailLoading,
  detailError,
  draftRole,
  onDraftRoleChange,
  roleDirty,
  saving,
  onSaveRole,
  listTitle,
  ministries,
  memberships,
  t,
}) {
  const renderProfileField = (labelKey, value) => (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t(labelKey)}</p>
      <p className="mt-0.5 text-sm text-foreground">{value && String(value).trim() ? value : '—'}</p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,40rem)] max-w-lg overflow-y-auto">
        {detailError && (
          <ErrorState title={t('admin.users.detailError')} description={detailError.message} />
        )}
        {detailLoading && !detail && !detailError && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="md" />
          </div>
        )}
        {detail && (
          <div className="space-y-5">
            <DialogHeader className="text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {t('admin.users.profile')}
              </p>
              <DialogTitle className="mt-1 font-display text-xl md:text-2xl">
                {detail.displayName || detail.email || detail.id || listTitle}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              {renderProfileField('admin.users.field.email', detail.email)}
              {renderProfileField('admin.users.field.phone', detail.phone)}
              {renderProfileField('admin.users.field.city', detail.city)}
              {renderProfileField('admin.users.field.state', detail.state)}
              {renderProfileField('admin.users.field.uid', detail.uid || detail.id)}
              {renderProfileField(
                'admin.users.field.joined',
                formatDate(toDate(detail.createdAt), 'MMM d, yyyy') || '—',
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <Label htmlFor="user-role">{t('admin.users.accessLevel')}</Label>
              <Select value={draftRole} onValueChange={onDraftRoleChange}>
                <SelectTrigger id="user-role" className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {t(roleLabelKey(r))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t('admin.users.accessLevelHint')}</p>
              <Button type="button" disabled={!roleDirty || saving} onClick={onSaveRole}>
                {t('admin.users.saveRole')}
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('admin.users.ministries.section')}
              </p>
              <UserMinistriesList memberships={memberships} ministries={ministries} />
            </div>

            {(detail.bio || detail.ministryInterests) && (
              <>
                <Separator />
                <div className="grid gap-4">
                  {detail.bio ? renderProfileField('admin.users.field.bio', detail.bio) : null}
                  {detail.ministryInterests
                    ? renderProfileField('admin.users.field.ministry', detail.ministryInterests)
                    : null}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function UserEditModal({ open, onOpenChange, userId, onSaved, ministries, t }) {
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [memberships, setMemberships] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: emptyProfile,
  });

  useEffect(() => {
    if (!open || !userId) {
      setLoadError(null);
      setError('');
      setMemberships([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    Promise.all([fetchUserDetail(userId), listUserMinistries(userId)])
      .then(([detail, userMemberships]) => {
        if (cancelled) return;
        if (!detail) {
          setLoadError(new Error(t('admin.users.detailError')));
          return;
        }
        setEmail(detail.email || '');
        reset(profileToFormValues(detail));
        const rows = userMemberships.map(membershipToEditorRow);
        setMemberships(rows.length ? rows : [{ ministryId: '', role: 'member', note: '' }]);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, userId, reset, t]);

  const onSubmit = async (values) => {
    if (!userId) return;
    setError('');
    setSubmitting(true);
    try {
      const ministryPayload = cleanMembershipsForSave(memberships);
      await updateUserProfile(userId, values);
      await replaceUserMinistries(userId, ministryPayload);
      onSaved(userId, values, ministryPayload);
      onOpenChange(false);
      toast.success(t('admin.flash.saved'));
    } catch (err) {
      setError(err?.message || t('profileUpdate.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92dvh,44rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4 text-left">
          <DialogTitle className="font-display text-xl md:text-2xl">{t('admin.users.editTitle')}</DialogTitle>
          <p className="text-sm text-muted-foreground">{t('admin.users.editSubtitle')}</p>
        </DialogHeader>

        {loadError && (
          <div className="px-6 py-6">
            <ErrorState title={t('admin.users.detailError')} description={loadError.message} />
          </div>
        )}
        {loading && !loadError && (
          <div className="flex justify-center px-6 py-12">
            <LoadingSpinner size="md" />
          </div>
        )}
        {!loading && !loadError && userId && (
          <MemberProfileForm
            email={email}
            register={register}
            errors={errors}
            onSubmit={handleSubmit(onSubmit)}
            submitting={submitting}
            error={error}
            stickyFooter
            afterFields={(
              <UserMinistriesEditor
                ministries={ministries}
                memberships={memberships}
                onChange={setMemberships}
                disabled={submitting}
              />
            )}
            footer={(
              <DialogFooter className="gap-2 sm:justify-end">
                <Button type="button" variant="outline" disabled={submitting} onClick={() => onOpenChange(false)}>
                  {t('admin.cancel')}
                </Button>
                <Button type="submit" disabled={submitting}>
                  <Save className="h-4 w-4" />
                  {submitting ? t('common.loading') : t('profileUpdate.save')}
                </Button>
              </DialogFooter>
            )}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsers() {
  const { t } = useLanguage();
  const { user } = useAuth();
  /** Each loaded page: rows from `userIndex`, cursor end doc, whether another page may exist. */
  const [pages, setPages] = useState([]);
  const [pageIdx, setPageIdx] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [draftRole, setDraftRole] = useState(ROLES.MEMBER);
  const [saving, setSaving] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [allMinistries, setAllMinistries] = useState([]);
  const [viewMemberships, setViewMemberships] = useState([]);

  useEffect(() => {
    listAllMinistriesAdmin().then(setAllMinistries).catch(() => setAllMinistries([]));
  }, []);

  const loadFirstPage = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const { items, lastDoc, hasMore } = await fetchUserDirectoryPage(USER_DIRECTORY_PAGE_SIZE, null);
      setPages([{ rows: items, lastDoc, hasMoreAfter: hasMore }]);
      setPageIdx(0);
      setSelectedId((prev) => (prev && items.some((r) => r.id === prev) ? prev : null));
    } catch (err) {
      setListError(err);
      setPages([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setDetailError(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);
    fetchUserDetail(selectedId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((err) => {
        if (!cancelled) setDetailError(err);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setViewMemberships([]);
      return;
    }
    let cancelled = false;
    listUserMinistries(selectedId)
      .then((rows) => {
        if (!cancelled) setViewMemberships(rows);
      })
      .catch(() => {
        if (!cancelled) setViewMemberships([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  useEffect(() => {
    if (detail) setDraftRole(normalizeUserRole(detail.role));
  }, [detail?.id, detail?.role]);

  const currentRows = pages[pageIdx]?.rows ?? [];
  const hasNextPage = Boolean(pages[pageIdx]?.hasMoreAfter);
  const hasPrevPage = pageIdx > 0;
  const listEmpty = !listLoading && !listError && pages[0] && pages[0].rows.length === 0;

  const goNextPage = async () => {
    const cur = pages[pageIdx];
    if (!cur) return;
    if (pageIdx + 1 < pages.length) {
      setPageIdx((i) => i + 1);
      return;
    }
    if (!cur.hasMoreAfter || !cur.lastDoc) return;
    setListLoading(true);
    try {
      const { items, lastDoc, hasMore } = await fetchUserDirectoryPage(USER_DIRECTORY_PAGE_SIZE, cur.lastDoc);
      setPages((prev) => [...prev, { rows: items, lastDoc, hasMoreAfter: hasMore }]);
      setPageIdx((i) => i + 1);
    } catch (err) {
      toast.error(err?.message || t('admin.flash.error'));
    } finally {
      setListLoading(false);
    }
  };

  const goPrevPage = () => {
    if (pageIdx > 0) setPageIdx((i) => i - 1);
  };

  const handleRebuildDirectory = async () => {
    setRebuilding(true);
    try {
      const n = await rebuildUserDirectoryIndex();
      toast.success(`${t('admin.users.syncDone')} (${n})`);
      await loadFirstPage();
    } catch (err) {
      toast.error(err?.message || t('admin.flash.error'));
    } finally {
      setRebuilding(false);
    }
  };

  const currentRole = detail ? normalizeUserRole(detail.role) : ROLES.MEMBER;
  const roleDirty = Boolean(detail && draftRole !== currentRole);

  const handleSaveRole = async () => {
    if (!detail || !selectedId || !roleDirty) return;
    setSaving(true);
    try {
      await updateUserRole(selectedId, draftRole);
      const next = await fetchUserDetail(selectedId);
      setDetail(next);
      setPages((prev) =>
        prev.map((p, i) =>
          i === pageIdx
            ? {
                ...p,
                rows: p.rows.map((r) => (r.id === selectedId ? { ...r, role: draftRole } : r)),
              }
            : p,
        ),
      );
      toast.success(t('admin.flash.saved'));
    } catch (err) {
      toast.error(err?.message || t('admin.flash.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleProfileSaved = (uid, values, ministryPayload = []) => {
    const displayName = (values.displayName || '').trim();
    setPages((prev) =>
      prev.map((p, i) =>
        i === pageIdx
          ? {
              ...p,
              rows: p.rows.map((r) =>
                r.id === uid ? { ...r, displayName: displayName || r.displayName } : r,
              ),
            }
          : p,
      ),
    );
    if (selectedId === uid) {
      setDetail((prev) => (prev ? { ...prev, ...values, displayName: displayName || prev.displayName } : prev));
      setViewMemberships(
        ministryPayload.map((row) => ({
          id: `${uid}_${row.ministryId}`,
          uid,
          ministryId: row.ministryId,
          role: row.role,
          note: row.note || null,
        })),
      );
    }
  };

  const handleModalOpenChange = (open) => {
    if (!open) setSelectedId(null);
  };

  const handleEditOpenChange = (open) => {
    if (!open) setEditId(null);
  };

  const selectedRow = currentRows.find((r) => r.id === selectedId);
  const listTitle = selectedRow?.displayName || selectedRow?.email || selectedId || '';

  if (listLoading && pages.length === 0) return <LoadingSpinner size="lg" center />;
  if (listError) {
    return (
      <div className="mx-auto max-w-lg">
        <AdminPageHeader title={t('admin.users.title')} description={t('admin.users.subtitle')} />
        <ErrorState title={t('admin.users.loadError')} description={listError.message} />
      </div>
    );
  }

  if (listEmpty) {
    return (
      <div>
        <AdminPageHeader title={t('admin.users.title')} description={t('admin.users.subtitle')} />
        <EmptyState icon={Users} title={t('admin.users.empty')} description={t('admin.users.syncDirectoryHint')} />
        <div className="mt-6 flex justify-center">
          <Button type="button" disabled={rebuilding} onClick={handleRebuildDirectory}>
            {rebuilding ? t('common.loading') : t('admin.users.syncDirectory')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader title={t('admin.users.title')} description={t('admin.users.subtitle')} />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {USER_DIRECTORY_PAGE_SIZE}
          {' '}
          {t('admin.users.perPage')}
        </p>
        <Button type="button" variant="outline" size="sm" disabled={rebuilding} onClick={handleRebuildDirectory}>
          {rebuilding ? t('common.loading') : t('admin.users.syncDirectory')}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('admin.users.col.name')}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('admin.users.col.email')}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('admin.users.col.role')}
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:table-cell">
                    {t('admin.users.col.joined')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('admin.users.col.edit')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listLoading && pages.length > 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center">
                      <LoadingSpinner size="md" />
                    </td>
                  </tr>
                ) : (
                  currentRows.map((u) => {
                    const nr = normalizeUserRole(u.role);
                    const isSelf = user?.uid === u.id;
                    const displayName = u.displayName || '—';
                    const email = u.email || '—';
                    const joined = formatDate(toDate(u.createdAt), 'MMM d, yyyy') || '—';

                    return (
                      <tr
                        key={u.id}
                        tabIndex={0}
                        role="button"
                        onClick={() => setSelectedId(u.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedId(u.id);
                          }
                        }}
                        className={cn(
                          'cursor-pointer transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                          selectedId === u.id && 'bg-primary/5',
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="truncate font-medium text-primary">{displayName}</span>
                            {isSelf && (
                              <Badge
                                variant="secondary"
                                className="shrink-0 px-1.5 py-0 text-[10px] font-semibold uppercase"
                              >
                                {t('admin.users.you')}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="max-w-[14rem] truncate px-4 py-3 text-muted-foreground" title={email}>
                          {email}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={roleBadgeVariant(nr)} className="text-[11px]">
                            {t(roleLabelKey(nr))}
                          </Badge>
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground sm:table-cell">
                          {joined}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 px-2"
                            aria-label={`${t('admin.edit')} ${displayName}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditId(u.id);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{t('admin.edit')}</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {t('admin.users.pageLabel')}
              {' '}
              {pageIdx + 1}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-2"
                disabled={!hasPrevPage || listLoading}
                onClick={goPrevPage}
                aria-label={t('admin.users.prevPage')}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{t('admin.users.prevPage')}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-2"
                disabled={!(pageIdx + 1 < pages.length || hasNextPage) || listLoading}
                onClick={goNextPage}
                aria-label={t('admin.users.nextPage')}
              >
                <span className="hidden sm:inline">{t('admin.users.nextPage')}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <UserProfileModal
        open={Boolean(selectedId)}
        onOpenChange={handleModalOpenChange}
        detail={detail}
        detailLoading={detailLoading}
        detailError={detailError}
        draftRole={draftRole}
        onDraftRoleChange={setDraftRole}
        roleDirty={roleDirty}
        saving={saving}
        onSaveRole={handleSaveRole}
        listTitle={listTitle}
        ministries={allMinistries}
        memberships={viewMemberships}
        t={t}
      />

      <UserEditModal
        open={Boolean(editId)}
        onOpenChange={handleEditOpenChange}
        userId={editId}
        onSaved={handleProfileSaved}
        ministries={allMinistries}
        t={t}
      />
    </div>
  );
}
