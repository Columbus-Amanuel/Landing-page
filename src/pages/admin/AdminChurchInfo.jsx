import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import BilingualField from '@/components/common/BilingualField';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { updateChurchInfo } from '@/services/siteSettingsService';
import { VALUE_ICON_KEYS } from '@/utils/valueIcons';

function AdminPageHeader({ title, description }) {
  return (
    <header className="mb-8 flex flex-col gap-2">
      <h1 className="font-hero text-3xl font-semibold text-primary md:text-4xl">{title}</h1>
      {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
    </header>
  );
}

export default function AdminChurchInfo() {
  const { t, language } = useLanguage();
  const { churchInfo, refresh } = useSiteSettings();
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  const form = useForm({ defaultValues: churchInfo });
  const serviceTimes = useFieldArray({ control: form.control, name: 'serviceTimes' });
  const values = useFieldArray({ control: form.control, name: 'values' });
  const beliefs = useFieldArray({ control: form.control, name: 'beliefs' });

  useEffect(() => {
    form.reset(churchInfo);
    setReady(true);
  }, [churchInfo, form]);

  if (!ready) return <LoadingSpinner size="lg" center />;

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await updateChurchInfo(data);
      await refresh();
      toast.success(t('admin.flash.saved'));
    } catch (err) {
      toast.error(err?.message || t('admin.flash.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title={t('admin.churchInfo.title')}
        description={t('admin.churchInfo.description')}
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Identity */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <h2 className="font-display text-lg font-semibold text-primary">{t('admin.churchInfo.identity')}</h2>
            <BilingualField
              label={language === 'am' ? 'መለያ ስም' : 'Tagline'}
              nameEn="tagline"
              nameAm="taglineAm"
              register={form.register}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>Church name</Label>
                <Input {...form.register('name')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Short name</Label>
                <Input {...form.register('shortName')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <h2 className="font-display text-lg font-semibold text-primary">{t('admin.churchInfo.contact')}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldGroup label="Address"><Input {...form.register('address')} /></FieldGroup>
              <FieldGroup label="City"><Input {...form.register('city')} /></FieldGroup>
              <FieldGroup label="State"><Input {...form.register('state')} /></FieldGroup>
              <FieldGroup label="ZIP"><Input {...form.register('zip')} /></FieldGroup>
              <FieldGroup label="Phone"><Input type="tel" {...form.register('phone')} /></FieldGroup>
              <FieldGroup label="Email"><Input type="email" {...form.register('email')} /></FieldGroup>
              <FieldGroup label="Facebook URL"><Input type="url" {...form.register('facebookUrl')} /></FieldGroup>
              <FieldGroup label="YouTube URL"><Input type="url" {...form.register('youtubeUrl')} /></FieldGroup>
              <FieldGroup label="Instagram URL"><Input type="url" {...form.register('instagramUrl')} /></FieldGroup>
            </div>
          </CardContent>
        </Card>

        {/* Pastor */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <h2 className="font-display text-lg font-semibold text-primary">{t('admin.churchInfo.pastor')}</h2>
            <BilingualField label="Pastor name" nameEn="pastorName" nameAm="pastorNameAm" register={form.register} />
            <BilingualField label="Pastor role" nameEn="pastorRole" nameAm="pastorRoleAm" register={form.register} />
            <FieldGroup label="Pastor email"><Input type="email" {...form.register('pastorEmail')} /></FieldGroup>
          </CardContent>
        </Card>

        {/* Mission + story */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <h2 className="font-display text-lg font-semibold text-primary">{t('admin.churchInfo.mission')}</h2>
            <BilingualField
              label="Mission statement"
              nameEn="missionStatement"
              nameAm="missionStatementAm"
              register={form.register}
              textarea
              rows={3}
            />
            <BilingualField
              label="Story — paragraph 1"
              nameEn="storyPara1"
              nameAm="storyPara1Am"
              register={form.register}
              textarea
              rows={3}
            />
            <BilingualField
              label="Story — paragraph 2"
              nameEn="storyPara2"
              nameAm="storyPara2Am"
              register={form.register}
              textarea
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Service times */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-primary">{t('admin.churchInfo.serviceTimes')}</h2>
              <Button type="button" variant="outline" size="sm" onClick={() => serviceTimes.append({ day: '', dayAm: '', time: '', note: '', noteAm: '' })}>
                <Plus /> {t('admin.add')}
              </Button>
            </div>
            <div className="space-y-4">
              {serviceTimes.fields.map((field, idx) => (
                <div key={field.id} className="rounded-md border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">#{idx + 1}</p>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => serviceTimes.remove(idx)}>
                      <Trash2 />
                    </Button>
                  </div>
                  <div className="mt-3 space-y-4">
                    <BilingualField label="Day" nameEn={`serviceTimes.${idx}.day`} nameAm={`serviceTimes.${idx}.dayAm`} register={form.register} />
                    <FieldGroup label="Time"><Input {...form.register(`serviceTimes.${idx}.time`)} /></FieldGroup>
                    <BilingualField label="Note" nameEn={`serviceTimes.${idx}.note`} nameAm={`serviceTimes.${idx}.noteAm`} register={form.register} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Values */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-primary">{t('admin.churchInfo.values')}</h2>
              <Button type="button" variant="outline" size="sm" onClick={() => values.append({ icon: 'sparkles', title: '', titleAm: '', desc: '', descAm: '' })}>
                <Plus /> {t('admin.add')}
              </Button>
            </div>
            <div className="space-y-4">
              {values.fields.map((field, idx) => (
                <div key={field.id} className="rounded-md border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">#{idx + 1}</p>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => values.remove(idx)}>
                      <Trash2 />
                    </Button>
                  </div>
                  <div className="mt-3 space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <Label>Icon</Label>
                      <Select
                        defaultValue={field.icon}
                        onValueChange={(v) => form.setValue(`values.${idx}.icon`, v)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {VALUE_ICON_KEYS.map((key) => (
                            <SelectItem key={key} value={key}>{key}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <BilingualField label="Title" nameEn={`values.${idx}.title`} nameAm={`values.${idx}.titleAm`} register={form.register} />
                    <BilingualField label="Description" nameEn={`values.${idx}.desc`} nameAm={`values.${idx}.descAm`} register={form.register} textarea rows={2} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Beliefs */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-primary">{t('admin.churchInfo.beliefs')}</h2>
              <Button type="button" variant="outline" size="sm" onClick={() => beliefs.append({ title: '', titleAm: '', desc: '', descAm: '' })}>
                <Plus /> {t('admin.add')}
              </Button>
            </div>
            <div className="space-y-4">
              {beliefs.fields.map((field, idx) => (
                <div key={field.id} className="rounded-md border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">#{idx + 1}</p>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => beliefs.remove(idx)}>
                      <Trash2 />
                    </Button>
                  </div>
                  <div className="mt-3 space-y-4">
                    <BilingualField label="Title" nameEn={`beliefs.${idx}.title`} nameAm={`beliefs.${idx}.titleAm`} register={form.register} />
                    <BilingualField label="Description" nameEn={`beliefs.${idx}.desc`} nameAm={`beliefs.${idx}.descAm`} register={form.register} textarea rows={3} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator />
        <div className="sticky bottom-4 z-10 flex justify-end">
          <Button type="submit" size="lg" disabled={saving}>
            <Save /> {saving ? t('common.loading') : t('admin.save')}
          </Button>
        </div>
      </form>
    </>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
