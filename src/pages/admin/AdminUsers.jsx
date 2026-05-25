import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, toDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ASSIGNABLE_ROLES, getRoleAbbrev, normalizeUserRole, ROLES } from '@/lib/roles';
import {
  fetchUserDetail,
  fetchUserDirectoryPage,
  rebuildUserDirectoryIndex,
  updateUserRole,
  USER_DIRECTORY_PAGE_SIZE,
} from '@/services/usersAdminService';

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

export default function AdminUsers() {
  const { t } = useLanguage();
  const { user } = useAuth();
  /** Each loaded page: rows from `userIndex`, cursor end doc, whether another page may exist. */
  const [pages, setPages] = useState([]);
  const [pageIdx, setPageIdx] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [draftRole, setDraftRole] = useState(ROLES.MEMBER);
  const [saving, setSaving] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);

  const loadFirstPage = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const { items, lastDoc, hasMore } = await fetchUserDirectoryPage(USER_DIRECTORY_PAGE_SIZE, null);
      setPages([{ rows: items, lastDoc, hasMoreAfter: hasMore }]);
      setPageIdx(0);
      if (items.length) {
        setSelectedId((prev) => (prev && items.some((r) => r.id === prev) ? prev : items[0].id));
      } else {
        setSelectedId(null);
        setDetail(null);
      }
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

  const renderProfileField = (labelKey, value) => (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t(labelKey)}</p>
      <p className="mt-0.5 text-sm text-foreground">{value && String(value).trim() ? value : '—'}</p>
    </div>
  );

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

      <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(10.5rem,13rem)_minmax(0,1fr)] lg:items-start">
        <Card className="flex max-h-[min(42dvh,18rem)] min-h-0 flex-col overflow-hidden sm:max-h-[min(48dvh,22rem)] lg:sticky lg:top-[calc(var(--navbar-height)+1rem)] lg:max-h-[calc(100dvh-var(--navbar-height)-2rem)]">
          <CardContent className="flex min-h-0 flex-1 flex-col gap-0 p-0">
            <div className="flex shrink-0 items-center justify-between gap-1 border-b border-border px-1 py-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                disabled={!hasPrevPage || listLoading}
                onClick={goPrevPage}
                aria-label={t('admin.users.prevPage')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-0 truncate text-center text-[11px] text-muted-foreground">
                {t('admin.users.pageLabel')}
                {' '}
                {pageIdx + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                disabled={!(pageIdx + 1 < pages.length || hasNextPage) || listLoading}
                onClick={goNextPage}
                aria-label={t('admin.users.nextPage')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {listLoading && pages.length > 0 ? (
                <div className="flex justify-center py-6">
                  <LoadingSpinner size="md" />
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {currentRows.map((u) => {
                    const nr = normalizeUserRole(u.role);
                    const isSelf = user?.uid === u.id;
                    const label = u.displayName || u.email || u.id;
                    const abbrev = getRoleAbbrev(u.role);
                    return (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(u.id)}
                          className={cn(
                            'flex w-full min-w-0 items-center gap-1.5 px-2 py-1 text-left text-sm transition-colors hover:bg-muted/60',
                            u.id === selectedId && 'bg-primary/8',
                          )}
                        >
                          <span className="min-w-0 flex-1 truncate font-medium leading-tight text-foreground">
                            {label}
                          </span>
                          {isSelf && (
                            <Badge
                              variant="secondary"
                              className="shrink-0 px-1 py-0 text-[9px] font-semibold uppercase leading-none"
                            >
                              {t('admin.users.you')}
                            </Badge>
                          )}
                          <span
                            className="shrink-0 font-mono text-[10px] font-semibold tabular-nums text-muted-foreground"
                            title={t(roleLabelKey(nr))}
                          >
                            {abbrev}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[12rem]">
          <CardContent className="space-y-5 p-5 md:p-6">
            {!selectedId && (
              <p className="text-sm text-muted-foreground">{t('admin.users.selectMember')}</p>
            )}
            {selectedId && detailError && (
              <ErrorState title={t('admin.users.detailError')} description={detailError.message} />
            )}
            {selectedId && detailLoading && !detail && !detailError && (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="md" />
              </div>
            )}
            {selectedId && detail && (
              <>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    {t('admin.users.profile')}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-semibold text-primary md:text-2xl">
                    {detail.displayName || detail.email || detail.id || listTitle}
                  </h2>
                </div>

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
                  <Select value={draftRole} onValueChange={setDraftRole}>
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
                  <Button type="button" disabled={!roleDirty || saving} onClick={handleSaveRole}>
                    {t('admin.users.saveRole')}
                  </Button>
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
