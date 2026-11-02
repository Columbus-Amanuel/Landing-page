import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import BilingualField from '@/components/common/BilingualField';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { updateGivingSettings } from '@/services/siteSettingsService';

export default function AdminGiving() {
  const { t } = useLanguage();
  const { givingSettings, refresh } = useSiteSettings();
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm({ defaultValues: givingSettings });
  const funds = useFieldArray({ control: form.control, name: 'funds' });

  useEffect(() => {
    form.reset(givingSettings);
    setReady(true);
  }, [givingSettings, form]);

  if (!ready) return <LoadingSpinner size="lg" center />;

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await updateGivingSettings(data);
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
      <header className="mb-8">
        <h1 className="font-hero text-3xl font-semibold text-primary md:text-4xl">
          {t('admin.giving.title')}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('admin.giving.subtitle')}</p>
      </header>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Channels */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <div>
              <h2 className="font-display text-lg font-semibold text-primary">{t('admin.giving.channels')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('admin.giving.channelsHelp')}</p>
            </div>

            <Channel title={t('give.check')} enabledName="checkEnabled" control={form.control} showLabel={t('admin.giving.field.showOnPage')}>
              <Field label={t('admin.giving.field.checksPayableTo')}>
                <Input {...form.register('checksPayableTo')} placeholder="EUCC" />
              </Field>
            </Channel>

            <Channel title={t('give.cashApp')} enabledName="cashAppEnabled" control={form.control} showLabel={t('admin.giving.field.showOnPage')}>
              <Field label={t('admin.giving.field.cashAppTag')}>
                <Input {...form.register('cashAppCashtag')} placeholder="EmmanuelUnitedCbus" />
              </Field>
              <Field label={t('admin.giving.field.cashApp')}>
                <Input {...form.register('cashAppNumber')} placeholder="614-999-2488" />
              </Field>
            </Channel>

            <Channel title={t('give.zelle')} enabledName="zelleEnabled" control={form.control} showLabel={t('admin.giving.field.showOnPage')}>
              <Field label={t('admin.giving.field.zelle')}>
                <Input {...form.register('zelleNumber')} placeholder="614-999-2488" />
              </Field>
              <Field label={t('admin.giving.field.zelleName')}>
                <Input {...form.register('zelleName')} placeholder="EMMANUEL UNITED CHURCH OF COLUMBUS" />
              </Field>
            </Channel>

            <Channel title={t('give.venmo')} enabledName="venmoEnabled" control={form.control} showLabel={t('admin.giving.field.showOnPage')}>
              <Field label={t('admin.giving.field.venmo')}>
                <Input {...form.register('venmoUsername')} placeholder="YourVenmoName" />
              </Field>
            </Channel>

            <Channel title={t('give.paypal')} enabledName="paypalEnabled" control={form.control} showLabel={t('admin.giving.field.showOnPage')}>
              <Field label={t('admin.giving.field.paypal')}>
                <Input {...form.register('paypalHandle')} placeholder="YourPayPalName" />
              </Field>
            </Channel>

            <Channel title={t('give.giveOnline')} enabledName="onlineGivingEnabled" control={form.control} showLabel={t('admin.giving.field.showOnPage')}>
              <Field label={t('admin.giving.field.onlineUrl')}>
                <Input type="url" {...form.register('onlineGivingUrl')} placeholder="https://" />
              </Field>
            </Channel>
          </CardContent>
        </Card>

        {/* Scripture */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <h2 className="font-display text-lg font-semibold text-primary">{t('admin.giving.scripture')}</h2>
            <BilingualField label={t('admin.giving.field.scripture')} nameEn="scriptureText" nameAm="scriptureTextAm" register={form.register} textarea rows={3} />
            <BilingualField label={t('admin.giving.field.cite')} nameEn="scriptureCite" nameAm="scriptureCiteAm" register={form.register} />
          </CardContent>
        </Card>

        {/* Planned */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <h2 className="font-display text-lg font-semibold text-primary">{t('admin.giving.planned')}</h2>
            <BilingualField label={t('admin.giving.field.planned')} nameEn="plannedGivingText" nameAm="plannedGivingTextAm" register={form.register} textarea rows={3} />
          </CardContent>
        </Card>

        {/* Funds */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-primary">{t('admin.giving.funds')}</h2>
              <Button type="button" variant="outline" size="sm" onClick={() => funds.append({ id: `fund-${Date.now()}`, label: '', labelAm: '', desc: '', descAm: '' })}>
                <Plus /> {t('admin.add')}
              </Button>
            </div>
            <div className="space-y-4">
              {funds.fields.map((field, idx) => (
                <div key={field.id} className="rounded-md border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">#{idx + 1}</p>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => funds.remove(idx)}>
                      <Trash2 />
                    </Button>
                  </div>
                  <div className="mt-3 space-y-4">
                    <Field label="ID"><Input {...form.register(`funds.${idx}.id`)} /></Field>
                    <BilingualField label="Label" nameEn={`funds.${idx}.label`} nameAm={`funds.${idx}.labelAm`} register={form.register} />
                    <BilingualField label="Description" nameEn={`funds.${idx}.desc`} nameAm={`funds.${idx}.descAm`} register={form.register} textarea rows={2} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-4 z-10 flex justify-end">
          <Button type="submit" size="lg" disabled={saving}>
            <Save /> {saving ? t('common.loading') : t('admin.save')}
          </Button>
        </div>
      </form>
    </>
  );
}

function Channel({ title, enabledName, control, showLabel, children }) {
  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          <Label htmlFor={enabledName} className="text-xs text-muted-foreground">{showLabel}</Label>
          <Controller
            name={enabledName}
            control={control}
            render={({ field }) => (
              <Switch
                id={enabledName}
                type="button"
                checked={field.value !== false}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
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
