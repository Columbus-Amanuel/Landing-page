import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { ROUTES, buildPath } from '@/constants/routes';
import {
  listAllMinistriesAdmin,
  createMinistry,
  deleteMinistry,
  normalizeMinistrySlug,
  newMinistryTemplate,
} from '@/services/ministriesService';

export default function AdminMinistries() {
  const { t } = useLanguage();
  const { refresh: refreshSiteSettings } = useSiteSettings();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [slugIn, setSlugIn] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [labelAm, setLabelAm] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    listAllMinistriesAdmin()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const maxSort = rows.reduce((m, r) => Math.max(m, r.sortOrder ?? 0), -1);

  const handleCreate = async () => {
    const slug = normalizeMinistrySlug(slugIn);
    setSaving(true);
    try {
      await createMinistry({
        ...newMinistryTemplate(),
        slug,
        navLabelEn: labelEn.trim() || slug,
        navLabelAm: labelAm.trim() || labelEn.trim() || slug,
        sortOrder: maxSort + 1,
      });
      toast.success(t('admin.flash.saved'));
      setAddOpen(false);
      setSlugIn('');
      setLabelEn('');
      setLabelAm('');
      load();
      await refreshSiteSettings();
    } catch (err) {
      toast.error(err?.message || t('admin.flash.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-hero text-3xl font-semibold text-primary md:text-4xl">
            {t('admin.ministries.title')}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('admin.ministries.subtitle')}</p>
        </div>
        <Button type="button" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> {t('admin.ministries.add')}
        </Button>
      </header>

      <Card className="mb-8 border-dashed border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col gap-2 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{t('admin.ministries.legacyHint')}</p>
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.adminYouth}>
              {t('admin.ministries.legacyLink')} <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingSpinner size="lg" center />
      ) : rows.length === 0 ? (
        <EmptyState title={t('admin.ministries.empty')} />
      ) : (
        <div className="space-y-3">
          {rows.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-display text-lg font-semibold text-primary">{m.navLabelEn || m.slug}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('admin.ministries.publicUrl')}{' '}
                    <Link className="text-accent underline-offset-2 hover:underline" to={`/ministries/${encodeURIComponent(m.slug)}`}>
                      /ministries/{m.slug}
                    </Link>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {m.enabled === false ? t('admin.ministries.hidden') : t('admin.ministries.visible')}
                    {' · '}
                    {t('admin.ministries.sections')}: {(m.sections || []).length}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={buildPath(ROUTES.adminMinistryEdit, { ministryId: m.id })}>
                      <Pencil className="h-4 w-4" /> {t('admin.edit')}
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" /> {t('admin.delete')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('admin.confirmDelete')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('admin.confirmDeleteBody')}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={async () => {
                            try {
                              await deleteMinistry(m.id);
                              toast.success(t('admin.flash.deleted'));
                              load();
                              await refreshSiteSettings();
                            } catch (err) {
                              toast.error(err?.message || t('admin.flash.error'));
                            }
                          }}
                        >
                          {t('admin.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.ministries.addTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="min-slug">{t('admin.ministries.field.slug')}</Label>
              <Input
                id="min-slug"
                value={slugIn}
                onChange={(e) => setSlugIn(e.target.value)}
                placeholder="mens-fellowship"
              />
              <p className="text-xs text-muted-foreground">{t('admin.ministries.field.slugHint')}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min-en">{t('admin.ministries.field.navEn')}</Label>
              <Input id="min-en" value={labelEn} onChange={(e) => setLabelEn(e.target.value)} placeholder="Men's fellowship" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min-am">{t('admin.ministries.field.navAm')}</Label>
              <Input id="min-am" value={labelAm} onChange={(e) => setLabelAm(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>
              {t('admin.cancel')}
            </Button>
            <Button type="button" disabled={saving} onClick={handleCreate}>
              {saving ? t('common.loading') : t('admin.ministries.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
