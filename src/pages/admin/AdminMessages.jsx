import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Inbox, Mail, MessageSquare, Phone, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  getContactMessages,
  getPrayerRequests,
  updateContactMessageStatus,
  updatePrayerRequestStatus,
} from '@/services/contactService';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, toMailtoHref, toTelHref } from '@/lib/format';

function StatusBadge({ status }) {
  const variant =
    status === 'resolved' || status === 'read'
      ? 'success'
      : status === 'active'
        ? 'warning'
        : 'destructive';
  return <Badge variant={variant} className="uppercase">{status}</Badge>;
}

function ContactMessageCard({ message, onChanged }) {
  const { t } = useLanguage();
  const handleStatus = async (status) => {
    try {
      await updateContactMessageStatus(message.id, status);
      toast.success(t('admin.flash.saved'));
      onChanged();
    } catch (err) {
      toast.error(err?.message || t('admin.flash.error'));
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-display text-base font-semibold text-primary">
              {message.firstName} {message.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(message.createdAt, 'MMM d, yyyy h:mm a')} — {message.subject}
            </p>
          </div>
          <StatusBadge status={message.status} />
        </div>
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{message.message}</p>
        <Separator />
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {message.email && (
            <Button asChild variant="ghost" size="sm">
              <a href={toMailtoHref(message.email)}><Mail /> {message.email}</a>
            </Button>
          )}
          {message.phone && (
            <Button asChild variant="ghost" size="sm">
              <a href={toTelHref(message.phone)}><Phone /> {message.phone}</a>
            </Button>
          )}
          <div className="ms-auto flex gap-2">
            {message.status !== 'read' && (
              <Button variant="outline" size="sm" onClick={() => handleStatus('read')}>
                {t('admin.messages.markRead')}
              </Button>
            )}
            {message.status !== 'resolved' && (
              <Button size="sm" onClick={() => handleStatus('resolved')}>
                <CheckCircle2 /> {t('admin.messages.resolve')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PrayerRequestCard({ request, onChanged }) {
  const { t } = useLanguage();
  const handleStatus = async (status) => {
    try {
      await updatePrayerRequestStatus(request.id, status);
      toast.success(t('admin.flash.saved'));
      onChanged();
    } catch (err) {
      toast.error(err?.message || t('admin.flash.error'));
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-display text-base font-semibold text-primary">{request.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(request.createdAt, 'MMM d, yyyy h:mm a')}
              {request.isPrivate && (
                <span className="ml-2 inline-flex items-center gap-1 text-accent">
                  · {t('admin.messages.private')}
                </span>
              )}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{request.request}</p>
        <Separator />
        <div className="flex justify-end gap-2">
          {request.status !== 'resolved' && (
            <Button size="sm" onClick={() => handleStatus('resolved')}>
              <CheckCircle2 /> {t('admin.messages.resolve')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminMessages() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    Promise.all([getContactMessages(), getPrayerRequests()])
      .then(([m, p]) => {
        setMessages(m);
        setPrayers(p);
      })
      .catch(() => {
        setMessages([]);
        setPrayers([]);
      })
      .finally(() => setLoading(false));
  };
  useEffect(refresh, []);

  return (
    <>
      <header className="mb-8">
        <h1 className="font-hero text-3xl font-semibold text-primary md:text-4xl">
          {t('admin.messages.title')}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('admin.messages.subtitle')}</p>
      </header>

      <Tabs defaultValue="contact">
        <TabsList>
          <TabsTrigger value="contact">
            <Mail className="h-4 w-4" />{t('admin.messages.contactTab')} ({messages.length})
          </TabsTrigger>
          <TabsTrigger value="prayer">
            <MessageSquare className="h-4 w-4" />{t('admin.messages.prayerTab')} ({prayers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contact">
          {loading ? (
            <LoadingSpinner size="lg" center />
          ) : messages.length === 0 ? (
            <EmptyState icon={Inbox} title={t('admin.messages.emptyContact')} />
          ) : (
            <div className="space-y-4">
              {messages.map((m) => (
                <ContactMessageCard key={m.id} message={m} onChanged={refresh} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="prayer">
          {loading ? (
            <LoadingSpinner size="lg" center />
          ) : prayers.length === 0 ? (
            <EmptyState icon={Inbox} title={t('admin.messages.emptyPrayer')} />
          ) : (
            <div className="space-y-4">
              {prayers.map((p) => (
                <PrayerRequestCard key={p.id} request={p} onChanged={refresh} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
