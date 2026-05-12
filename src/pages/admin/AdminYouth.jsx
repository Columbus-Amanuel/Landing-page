import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, Plus, Trash2, Video, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
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
import BilingualField from '@/components/common/BilingualField';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { updateYouthContent } from '@/services/siteSettingsService';
import {
  getYouthVideos,
  createYouthVideo,
  updateYouthVideo,
  deleteYouthVideo,
} from '@/services/youthVideosService';

function ContentTab() {
  const { t } = useLanguage();
  const { youthContent, refresh } = useSiteSettings();
  const form = useForm({ defaultValues: youthContent });
  const stats = useFieldArray({ control: form.control, name: 'stats' });
  const ministries = useFieldArray({ control: form.control, name: 'ministries' });
  const faqs = useFieldArray({ control: form.control, name: 'faqs' });
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    form.reset(youthContent);
    setReady(true);
  }, [youthContent, form]);

  if (!ready) return <LoadingSpinner size="lg" center />;

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await updateYouthContent(data);
      await refresh();
      toast.success(t('admin.flash.saved'));
    } catch (err) {
      toast.error(err?.message || t('admin.flash.error'));
    } finally {
      setSaving(false);
    }
  };

  const enAm = (base) => ({ nameEn: `${base}En`, nameAm: `${base}Am` });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardContent className="space-y-5 p-6">
          <h2 className="font-display text-lg font-semibold text-primary">{t('admin.youth.hero')}</h2>
          <BilingualField label="Hero title" {...enAm('heroTitle')} register={form.register} />
          <BilingualField label="Hero subtitle" {...enAm('heroSubtitle')} register={form.register} textarea rows={2} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          <h2 className="font-display text-lg font-semibold text-primary">{t('admin.youth.intro')}</h2>
          <BilingualField label="Title" {...enAm('introTitle')} register={form.register} />
          <BilingualField label="Body" {...enAm('introBody')} register={form.register} textarea rows={3} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-primary">{t('admin.youth.stats')}</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => stats.append({ valueEn: '', labelEn: '', labelAm: '' })}>
              <Plus /> {t('admin.add')}
            </Button>
          </div>
          {stats.fields.map((field, idx) => (
            <div key={field.id} className="rounded-md border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">#{idx + 1}</p>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => stats.remove(idx)}>
                  <Trash2 />
                </Button>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <Field label="Value"><Input {...form.register(`stats.${idx}.valueEn`)} /></Field>
                <Field label="Label (EN)"><Input {...form.register(`stats.${idx}.labelEn`)} /></Field>
                <Field label="Label (AM)"><Input {...form.register(`stats.${idx}.labelAm`)} /></Field>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-primary">{t('admin.youth.ministries')}</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => ministries.append({ titleEn: '', titleAm: '', bodyEn: '', bodyAm: '' })}>
              <Plus /> {t('admin.add')}
            </Button>
          </div>
          {ministries.fields.map((field, idx) => (
            <div key={field.id} className="rounded-md border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">#{idx + 1}</p>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => ministries.remove(idx)}>
                  <Trash2 />
                </Button>
              </div>
              <div className="mt-3 space-y-4">
                <BilingualField label="Title" nameEn={`ministries.${idx}.titleEn`} nameAm={`ministries.${idx}.titleAm`} register={form.register} />
                <BilingualField label="Body" nameEn={`ministries.${idx}.bodyEn`} nameAm={`ministries.${idx}.bodyAm`} register={form.register} textarea rows={2} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-primary">{t('admin.youth.faqs')}</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => faqs.append({ questionEn: '', questionAm: '', answerEn: '', answerAm: '' })}>
              <Plus /> {t('admin.add')}
            </Button>
          </div>
          {faqs.fields.map((field, idx) => (
            <div key={field.id} className="rounded-md border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">#{idx + 1}</p>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => faqs.remove(idx)}>
                  <Trash2 />
                </Button>
              </div>
              <div className="mt-3 space-y-4">
                <BilingualField label="Question" nameEn={`faqs.${idx}.questionEn`} nameAm={`faqs.${idx}.questionAm`} register={form.register} />
                <BilingualField label="Answer" nameEn={`faqs.${idx}.answerEn`} nameAm={`faqs.${idx}.answerAm`} register={form.register} textarea rows={3} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          <h2 className="font-display text-lg font-semibold text-primary">{t('admin.youth.cta')}</h2>
          <BilingualField label="CTA title" {...enAm('ctaTitle')} register={form.register} />
          <BilingualField label="CTA button" {...enAm('ctaButton')} register={form.register} />
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button type="submit" size="lg" disabled={saving}>
          <Save /> {saving ? t('common.loading') : t('admin.save')}
        </Button>
      </div>
    </form>
  );
}

const EMPTY_VIDEO = {
  title: '',
  titleAm: '',
  description: '',
  descriptionAm: '',
  url: '',
  sortOrder: 0,
};

function YouthVideoEditor({ video, trigger, onSaved }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: video || EMPTY_VIDEO,
  });
  useEffect(() => {
    if (open) reset(video || EMPTY_VIDEO);
  }, [open, video, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (video?.id) {
        await updateYouthVideo(video.id, data);
      } else {
        await createYouthVideo(data);
      }
      toast.success(t('admin.flash.saved'));
      setOpen(false);
      onSaved?.();
    } catch (err) {
      toast.error(err?.message || t('admin.flash.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{video?.id ? t('admin.youth.editVideo') : t('admin.youth.newVideo')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <BilingualField label="Title" nameEn="title" nameAm="titleAm" register={register} />
          <BilingualField label="Description" nameEn="description" nameAm="descriptionAm" register={register} textarea rows={2} />
          <Field label="YouTube URL"><Input type="url" placeholder="https://youtu.be/..." {...register('url', { required: true })} /></Field>
          <Field label="Sort order"><Input type="number" {...register('sortOrder', { valueAsNumber: true })} /></Field>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t('admin.cancel')}</Button>
            <Button type="submit" disabled={saving}>
              <Save /> {saving ? t('common.loading') : t('admin.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VideosTab() {
  const { t, pickLocalized } = useLanguage();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    getYouthVideos().then(setVideos).catch(() => setVideos([])).finally(() => setLoading(false));
  };
  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteYouthVideo(id);
      toast.success(t('admin.flash.deleted'));
      refresh();
    } catch (err) {
      toast.error(err?.message || t('admin.flash.error'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <YouthVideoEditor trigger={<Button><Plus /> {t('admin.youth.newVideo')}</Button>} onSaved={refresh} />
      </div>
      {loading ? (
        <LoadingSpinner size="lg" center />
      ) : videos.length === 0 ? (
        <EmptyState icon={Video} title={t('admin.youth.noVideos')} />
      ) : (
        videos.map((v) => (
          <Card key={v.id}>
            <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-display text-lg font-semibold text-primary">{pickLocalized(v, 'title') || v.url}</p>
                <p className="text-xs text-muted-foreground">{v.url}</p>
              </div>
              <div className="flex gap-2">
                <YouthVideoEditor
                  video={v}
                  onSaved={refresh}
                  trigger={<Button variant="outline" size="sm"><Pencil /> {t('admin.edit')}</Button>}
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 /> {t('admin.delete')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('admin.confirmDelete')}</AlertDialogTitle>
                      <AlertDialogDescription>{t('admin.confirmDeleteBody')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(v.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {t('admin.delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export default function AdminYouth() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('content');

  return (
    <>
      <header className="mb-8">
        <h1 className="font-hero text-3xl font-semibold text-primary md:text-4xl">
          {t('admin.youth.title')}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('admin.youth.subtitle')}</p>
      </header>

      <div className="mb-6 inline-flex rounded-lg border border-border bg-card p-1">
        {[
          { id: 'content', label: t('admin.youth.tabs.content') },
          { id: 'videos', label: t('admin.youth.tabs.videos') },
        ].map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => setTab(it.id)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === it.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {it.label}
          </button>
        ))}
      </div>

      {tab === 'content' ? <ContentTab /> : <VideosTab />}
    </>
  );
}
