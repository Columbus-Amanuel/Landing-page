import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Inbox, Mail, MessageSquare, Phone, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  return (
    <Badge variant={variant} className="shrink-0 px-1.5 py-0 text-[10px] font-semibold uppercase">
      {status}
    </Badge>
  );
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
    <div className="bg-card px-3 py-2 hover:bg-muted/25">
      <div className="flex min-w-0 items-start gap-2">
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="truncate font-display text-sm font-semibold leading-tight text-primary">
              {message.firstName} {message.lastName}
            </p>
            <StatusBadge status={message.status} />
          </div>
          <p className="truncate text-[11px] leading-tight text-muted-foreground">
            {formatDate(message.createdAt, 'MMM d, yyyy h:mm a')} — {message.subject}
          </p>
          <p className="line-clamp-2 whitespace-pre-line text-xs leading-snug text-foreground/90">
            {message.message}
          </p>
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1 border-t border-border/60 pt-1.5">
        {message.email && (
          <Button asChild variant="ghost" size="sm" className="h-7 max-w-[min(100%,14rem)] px-2 text-[11px]">
            <a href={toMailtoHref(message.email)} className="flex min-w-0 items-center gap-1">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{message.email}</span>
            </a>
          </Button>
        )}
        {message.phone && (
          <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-[11px]">
            <a href={toTelHref(message.phone)} className="flex items-center gap-1">
              <Phone className="h-3 w-3 shrink-0" />
              {message.phone}
            </a>
          </Button>
        )}
        <div className="ms-auto flex shrink-0 flex-wrap justify-end gap-1">
          {message.status !== 'read' && (
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => handleStatus('read')}>
              {t('admin.messages.markRead')}
            </Button>
          )}
          {message.status !== 'resolved' && (
            <Button size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => handleStatus('resolved')}>
              <CheckCircle2 className="h-3 w-3" />
              {t('admin.messages.resolve')}
            </Button>
          )}
        </div>
      </div>
    </div>
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
    <div className="bg-card px-3 py-2 hover:bg-muted/25">
      <div className="flex min-w-0 items-start gap-2">
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="truncate font-display text-sm font-semibold leading-tight text-primary">{request.name}</p>
            <StatusBadge status={request.status} />
          </div>
          <p className="text-[11px] leading-tight text-muted-foreground">
            {formatDate(request.createdAt, 'MMM d, yyyy h:mm a')}
            {request.isPrivate && (
              <span className="ms-1.5 text-accent">· {t('admin.messages.private')}</span>
            )}
          </p>
          <p className="line-clamp-2 whitespace-pre-line text-xs leading-snug text-foreground/90">{request.request}</p>
        </div>
      </div>
      {request.status !== 'resolved' && (
        <div className="mt-1.5 flex justify-end gap-1 border-t border-border/60 pt-1.5">
          <Button size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => handleStatus('resolved')}>
            <CheckCircle2 className="h-3 w-3" />
            {t('admin.messages.resolve')}
          </Button>
        </div>
      )}
    </div>
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
      <header className="mb-4">
        <h1 className="font-hero text-2xl font-semibold leading-tight text-primary md:text-3xl">
          {t('admin.messages.title')}
        </h1>
        <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">{t('admin.messages.subtitle')}</p>
      </header>

      <Tabs defaultValue="contact">
        <TabsList className="h-8 gap-0.5 p-0.5">
          <TabsTrigger value="contact" className="gap-1 px-2 py-1 text-xs">
            <Mail className="h-3.5 w-3.5" />
            {t('admin.messages.contactTab')} ({messages.length})
          </TabsTrigger>
          <TabsTrigger value="prayer" className="gap-1 px-2 py-1 text-xs">
            <MessageSquare className="h-3.5 w-3.5" />
            {t('admin.messages.prayerTab')} ({prayers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="mt-2">
          {loading ? (
            <LoadingSpinner size="lg" center />
          ) : messages.length === 0 ? (
            <EmptyState icon={Inbox} title={t('admin.messages.emptyContact')} />
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
              {messages.map((m) => (
                <ContactMessageCard key={m.id} message={m} onChanged={refresh} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="prayer" className="mt-2">
          {loading ? (
            <LoadingSpinner size="lg" center />
          ) : prayers.length === 0 ? (
            <EmptyState icon={Inbox} title={t('admin.messages.emptyPrayer')} />
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
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
