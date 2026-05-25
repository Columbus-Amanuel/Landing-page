import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Save, Mic } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  getSermons,
  createSermon,
  updateSermon,
  deleteSermon,
} from '@/services/sermonsService';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, toDate } from '@/lib/format';
import { SERMON_CATEGORIES } from '@/constants/sermonCategories';

const emptySermon = {
  title: '',
  titleAm: '',
  description: '',
  descriptionAm: '',
  speaker: '',
  scripture: '',
  category: 'sunday',
  date: '',
  videoUrl: '',
  audioUrl: '',
  thumbnailUrl: '',
  notesUrl: '',
};

function toDateInputValue(value) {
  const d = toDate(value);
  if (!d) return '';
  return d.toISOString().slice(0, 10);
}

function SermonEditor({ sermon, onSaved, trigger }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(sermon?.id);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: { ...emptySermon, ...sermon, date: toDateInputValue(sermon?.date) },
  });

  useEffect(() => {
    if (open) reset({ ...emptySermon, ...sermon, date: toDateInputValue(sermon?.date) });
  }, [open, sermon, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, date: data.date ? new Date(data.date) : null };
      if (isEdit) {
        await updateSermon(sermon.id, payload);
      } else {
        await createSermon(payload);
      }
      toast.success(t('admin.flash.saved'));
      setOpen(false);
      onSaved();
    } catch (err) {
      toast.error(err?.message || t('admin.flash.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('admin.sermons.edit') : t('admin.sermons.new')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <BilingualField label={t('admin.sermons.field.title')} nameEn="title" nameAm="titleAm" register={register} required />
          <BilingualField label={t('admin.sermons.field.description')} nameEn="description" nameAm="descriptionAm" register={register} textarea rows={3} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('admin.sermons.field.speaker')}><Input {...register('speaker')} /></Field>
            <Field label={t('admin.sermons.field.scripture')}><Input {...register('scripture')} /></Field>
            <Field label={t('admin.sermons.field.date')}><Input type="date" {...register('date')} /></Field>
            <Field label={t('admin.sermons.field.category')}>
              <Select defaultValue={watch('category')} onValueChange={(v) => setValue('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERMON_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{t(cat.labelKey)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label={t('admin.sermons.field.videoUrl')}><Input type="url" {...register('videoUrl')} placeholder="https://youtu.be/..." /></Field>
          <Field label={t('admin.sermons.field.audioUrl')}><Input type="url" {...register('audioUrl')} /></Field>
          <Field label={t('admin.sermons.field.thumbnailUrl')}><Input type="url" {...register('thumbnailUrl')} /></Field>
          <Field label={t('admin.sermons.field.notesUrl')}><Input type="url" {...register('notesUrl')} /></Field>

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

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SermonRow({ sermon, onChanged }) {
  const { t, pickLocalized } = useLanguage();
  const handleDelete = async () => {
    try {
      await deleteSermon(sermon.id);
      toast.success(t('admin.flash.deleted'));
      onChanged();
    } catch (err) {
      toast.error(err?.message || t('admin.flash.error'));
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-display text-lg font-semibold text-primary">{pickLocalized(sermon, 'title')}</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {sermon.category && <Badge variant="muted">{sermon.category}</Badge>}
            {sermon.speaker && <span>{sermon.speaker}</span>}
            {sermon.date && <span>· {formatDate(sermon.date)}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <SermonEditor sermon={sermon} onSaved={onChanged} trigger={<Button variant="outline" size="sm"><Pencil /> {t('admin.edit')}</Button>} />
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
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t('admin.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminSermons() {
  const { t } = useLanguage();
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    getSermons(100)
      .then(setSermons)
      .catch(() => setSermons([]))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  return (
    <>
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-hero text-3xl font-semibold text-primary md:text-4xl">
            {t('admin.sermons.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('admin.sermons.subtitle')}</p>
        </div>
        <SermonEditor onSaved={refresh} trigger={<Button size="lg"><Plus /> {t('admin.sermons.new')}</Button>} />
      </header>

      {loading ? (
        <LoadingSpinner size="lg" center />
      ) : sermons.length === 0 ? (
        <EmptyState icon={Mic} title={t('admin.sermons.empty')} />
      ) : (
        <div className="space-y-4">
          {sermons.map((sermon) => (
            <SermonRow key={sermon.id} sermon={sermon} onChanged={refresh} />
          ))}
        </div>
      )}
    </>
  );
}
