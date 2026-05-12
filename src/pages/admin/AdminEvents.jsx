import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Save, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '@/services/eventsService';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, toDate } from '@/lib/format';

const emptyEvent = {
  title: '',
  titleAm: '',
  description: '',
  descriptionAm: '',
  details: '',
  detailsAm: '',
  location: '',
  locationAm: '',
  date: '',
  imageUrl: '',
  registrationUrl: '',
};

function toDateInputValue(value) {
  const d = toDate(value);
  if (!d) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EventEditor({ event, onSaved, trigger }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(event?.id);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { ...emptyEvent, ...event, date: toDateInputValue(event?.date) },
  });

  useEffect(() => {
    if (open) reset({ ...emptyEvent, ...event, date: toDateInputValue(event?.date) });
  }, [open, event, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        date: data.date ? new Date(data.date) : null,
      };
      if (isEdit) {
        await updateEvent(event.id, payload);
      } else {
        await createEvent(payload);
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
          <DialogTitle>{isEdit ? t('admin.events.edit') : t('admin.events.new')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <BilingualField label={t('admin.events.field.title')} nameEn="title" nameAm="titleAm" register={register} required />
          {errors.title && <p className="-mt-2 text-xs text-destructive">{t('common.required')}</p>}
          <BilingualField label={t('admin.events.field.description')} nameEn="description" nameAm="descriptionAm" register={register} textarea rows={2} />
          <BilingualField label={t('admin.events.field.details')} nameEn="details" nameAm="detailsAm" register={register} textarea rows={4} />
          <BilingualField label={t('admin.events.field.location')} nameEn="location" nameAm="locationAm" register={register} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>{t('admin.events.field.date')}</Label>
              <Input type="datetime-local" {...register('date', { required: true })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t('admin.events.field.imageUrl')}</Label>
              <Input type="url" {...register('imageUrl')} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t('admin.events.field.registrationUrl')}</Label>
            <Input type="url" {...register('registrationUrl')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t('admin.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              <Save /> {saving ? t('common.loading') : t('admin.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EventRow({ event, onChanged }) {
  const { t, pickLocalized } = useLanguage();

  const handleDelete = async () => {
    try {
      await deleteEvent(event.id);
      toast.success(t('admin.flash.deleted'));
      onChanged();
    } catch (err) {
      toast.error(err?.message || t('admin.flash.error'));
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg font-semibold text-primary">
            {pickLocalized(event, 'title')}
          </p>
          <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(event.date, 'MMM d, yyyy h:mm a')}
            {pickLocalized(event, 'location') && <span>· {pickLocalized(event, 'location')}</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <EventEditor
            event={event}
            onSaved={onChanged}
            trigger={
              <Button variant="outline" size="sm"><Pencil /> {t('admin.edit')}</Button>
            }
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
                <AlertDialogDescription>
                  {t('admin.confirmDeleteBody')}
                </AlertDialogDescription>
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

export default function AdminEvents() {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    getAllEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-hero text-3xl font-semibold text-primary md:text-4xl">
            {t('admin.events.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('admin.events.subtitle')}</p>
        </div>
        <EventEditor
          onSaved={refresh}
          trigger={
            <Button size="lg"><Plus /> {t('admin.events.new')}</Button>
          }
        />
      </header>

      {loading ? (
        <LoadingSpinner size="lg" center />
      ) : events.length === 0 ? (
        <EmptyState icon={Calendar} title={t('admin.events.empty')} />
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <EventRow key={event.id} event={event} onChanged={refresh} />
          ))}
        </div>
      )}
    </>
  );
}
