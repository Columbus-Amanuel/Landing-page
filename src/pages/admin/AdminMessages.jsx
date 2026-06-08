import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Inbox,
  Mail,
  MessageSquare,
  Phone,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  UserRound,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  assignContactMessage,
  assignPrayerRequest,
  fetchStaffForAssignment,
  getContactMessages,
  getPrayerRequests,
  updateContactMessageStatus,
  updatePrayerRequestStatus,
} from '@/services/contactService';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { formatDate, toMailtoHref, toTelHref } from '@/lib/format';

const STATUS_FILTERS = ['open', 'resolved', 'all'];
const UNASSIGNED_VALUE = '__unassigned__';

function isOpenItem(status) {
  return status !== 'resolved';
}

function filterByStatus(items, filter) {
  if (filter === 'all') return items;
  if (filter === 'resolved') return items.filter((item) => item.status === 'resolved');
  return items.filter((item) => isOpenItem(item.status));
}

function countOpen(items) {
  return items.filter((item) => isOpenItem(item.status)).length;
}

function actorFromProfile(user, profile) {
  return {
    uid: user?.uid,
    displayName: profile?.displayName || user?.displayName || user?.email || 'Staff',
    email: profile?.email || user?.email,
  };
}

function StatusBadge({ status }) {
  const { t } = useLanguage();
  const variant =
    status === 'resolved' || status === 'read'
      ? 'success'
      : status === 'active'
        ? 'warning'
        : 'destructive';
  const labelKey = `admin.messages.status.${status}`;
  return (
    <Badge variant={variant} className="shrink-0 px-1.5 py-0 text-[10px] font-semibold uppercase">
      {t(labelKey)}
    </Badge>
  );
}

function AssigneeBadge({ name }) {
  if (!name) return null;
  return (
    <Badge variant="outline" className="max-w-[10rem] shrink-0 gap-1 px-1.5 py-0 text-[10px] font-medium normal-case">
      <UserRound className="h-3 w-3 shrink-0" />
      <span className="truncate">{name}</span>
    </Badge>
  );
}

function ResolvedByLine({ item }) {
  const { t } = useLanguage();
  if (item.status !== 'resolved' || !item.resolvedByName) return null;

  const dateStr = item.resolvedAt ? formatDate(item.resolvedAt, 'MMM d, yyyy h:mm a') : '';
  const text = t('admin.messages.resolvedBy')
    .replace('{name}', item.resolvedByName)
    .replace('{date}', dateStr);

  return <p className="text-[11px] text-muted-foreground">{text}</p>;
}

function AssigneeSelect({ value, staff, onAssign, disabled }) {
  const { t } = useLanguage();
  const selectValue = value || UNASSIGNED_VALUE;

  return (
    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
      <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
        {t('admin.messages.assignTo')}
      </span>
      <Select
        value={selectValue}
        disabled={disabled}
        onValueChange={(next) => {
          if (next === UNASSIGNED_VALUE) {
            onAssign(null);
            return;
          }
          const person = staff.find((s) => s.id === next);
          if (person) {
            onAssign({
              uid: person.id,
              displayName: person.displayName || person.email || 'Staff',
              email: person.email,
            });
          }
        }}
      >
        <SelectTrigger className="h-8 w-full min-w-0 text-xs sm:max-w-[14rem]">
          <SelectValue placeholder={t('admin.messages.unassigned')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNASSIGNED_VALUE}>{t('admin.messages.unassigned')}</SelectItem>
          {staff.map((person) => (
            <SelectItem key={person.id} value={person.id}>
              {person.displayName || person.email || person.id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function StatusFilterBar({ filter, onChange, counts }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap items-center gap-1">
      {STATUS_FILTERS.map((key) => (
        <Button
          key={key}
          type="button"
          variant={filter === key ? 'default' : 'ghost'}
          size="sm"
          className="h-7 px-2.5 text-xs"
          onClick={() => onChange(key)}
        >
          {t(`admin.messages.filter.${key}`)}
          <span className={cn('tabular-nums', filter === key ? 'opacity-90' : 'text-muted-foreground')}>
            ({counts[key]})
          </span>
        </Button>
      ))}
    </div>
  );
}

function ContactMessageRow({ message, expanded, onToggle, onChanged, staff, actor }) {
  const { t } = useLanguage();
  const isUnread = message.status === 'unread';
  const [assigning, setAssigning] = useState(false);

  const handleStatus = async (status) => {
    try {
      await updateContactMessageStatus(message.id, status, status === 'resolved' ? actor : null);
      toast.success(t('admin.flash.saved'));
      onChanged();
    } catch (err) {
      toast.error(err?.message || t('admin.flash.error'));
    }
  };

  const handleAssign = async (assignee) => {
    setAssigning(true);
    try {
      await assignContactMessage(message.id, assignee);
      toast.success(t('admin.flash.saved'));
      onChanged();
    } catch (err) {
      toast.error(err?.message || t('admin.flash.error'));
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div
      className={cn(
        'border-b border-border last:border-b-0',
        isUnread && 'border-s-2 border-s-primary bg-primary/[0.03]',
        message.status === 'resolved' && 'opacity-75',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-2 px-3 py-2.5 text-start hover:bg-muted/30"
      >
        <span
          className={cn(
            'mt-1.5 h-2 w-2 shrink-0 rounded-full',
            isUnread ? 'bg-primary' : 'bg-transparent',
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="truncate font-display text-sm font-semibold text-foreground">
              {message.firstName} {message.lastName}
            </p>
            {!expanded && <StatusBadge status={message.status} />}
            {!expanded && <AssigneeBadge name={message.assignedToName} />}
          </div>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {formatDate(message.createdAt, 'MMM d, yyyy h:mm a')}
            {message.subject ? ` · ${message.subject}` : ''}
          </p>
          {!expanded && (
            <p className="mt-0.5 line-clamp-1 text-xs text-foreground/80">{message.message}</p>
          )}
          {!expanded && message.status === 'resolved' && (
            <div className="mt-0.5">
              <ResolvedByLine item={message} />
            </div>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-border/60 bg-muted/20 px-3 py-2.5 ps-7">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={message.status} />
            <AssigneeBadge name={message.assignedToName} />
          </div>
          <AssigneeSelect
            value={message.assignedToUid}
            staff={staff}
            disabled={assigning}
            onAssign={handleAssign}
          />
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{message.message}</p>
          <ResolvedByLine item={message} />
          <div className="flex flex-wrap items-center gap-1 pt-1">
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
              {message.status !== 'read' && message.status !== 'resolved' && (
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
      )}
    </div>
  );
}

function PrayerRequestRow({ request, expanded, onToggle, onChanged, staff, actor }) {
  const { t } = useLanguage();
  const isActive = request.status === 'active';
  const [assigning, setAssigning] = useState(false);

  const handleStatus = async (status) => {
    try {
      await updatePrayerRequestStatus(request.id, status, status === 'resolved' ? actor : null);
      toast.success(t('admin.flash.saved'));
      onChanged();
    } catch (err) {
      toast.error(err?.message || t('admin.flash.error'));
    }
  };

  const handleAssign = async (assignee) => {
    setAssigning(true);
    try {
      await assignPrayerRequest(request.id, assignee);
      toast.success(t('admin.flash.saved'));
      onChanged();
    } catch (err) {
      toast.error(err?.message || t('admin.flash.error'));
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div
      className={cn(
        'border-b border-border last:border-b-0',
        isActive && 'border-s-2 border-s-accent bg-accent/[0.03]',
        request.status === 'resolved' && 'opacity-75',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-2 px-3 py-2.5 text-start hover:bg-muted/30"
      >
        <span
          className={cn(
            'mt-1.5 h-2 w-2 shrink-0 rounded-full',
            isActive ? 'bg-accent' : 'bg-transparent',
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="truncate font-display text-sm font-semibold text-foreground">{request.name}</p>
            {!expanded && <StatusBadge status={request.status} />}
            {!expanded && <AssigneeBadge name={request.assignedToName} />}
            {request.isPrivate && !expanded && (
              <span className="text-[10px] font-medium uppercase tracking-wide text-accent">
                {t('admin.messages.private')}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {formatDate(request.createdAt, 'MMM d, yyyy h:mm a')}
          </p>
          {!expanded && (
            <p className="mt-0.5 line-clamp-1 text-xs text-foreground/80">{request.request}</p>
          )}
          {!expanded && request.status === 'resolved' && (
            <div className="mt-0.5">
              <ResolvedByLine item={request} />
            </div>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-border/60 bg-muted/20 px-3 py-2.5 ps-7">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} />
            <AssigneeBadge name={request.assignedToName} />
            {request.isPrivate && (
              <span className="text-[10px] font-medium uppercase tracking-wide text-accent">
                {t('admin.messages.private')}
              </span>
            )}
          </div>
          <AssigneeSelect
            value={request.assignedToUid}
            staff={staff}
            disabled={assigning}
            onAssign={handleAssign}
          />
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{request.request}</p>
          <ResolvedByLine item={request} />
          {request.status !== 'resolved' && (
            <div className="flex justify-end pt-1">
              <Button size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => handleStatus('resolved')}>
                <CheckCircle2 className="h-3 w-3" />
                {t('admin.messages.resolve')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MessageList({ items, filter, emptyTitle, renderRow }) {
  const filtered = useMemo(() => filterByStatus(items, filter), [items, filter]);

  if (filtered.length === 0) {
    return <EmptyState icon={Inbox} title={emptyTitle} />;
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">{filtered.map(renderRow)}</div>
  );
}

export default function AdminMessages() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const actor = useMemo(() => actorFromProfile(user, profile), [user, profile]);
  const [messages, setMessages] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contact');
  const [statusFilter, setStatusFilter] = useState('open');
  const [expandedContactId, setExpandedContactId] = useState(null);
  const [expandedPrayerId, setExpandedPrayerId] = useState(null);

  const refresh = () => {
    setLoading(true);
    Promise.all([getContactMessages(), getPrayerRequests(), fetchStaffForAssignment()])
      .then(([m, p, s]) => {
        setMessages(m);
        setPrayers(p);
        setStaff(s);
      })
      .catch(() => {
        setMessages([]);
        setPrayers([]);
        setStaff([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const contactCounts = useMemo(
    () => ({
      open: countOpen(messages),
      resolved: messages.filter((m) => m.status === 'resolved').length,
      all: messages.length,
    }),
    [messages],
  );

  const prayerCounts = useMemo(
    () => ({
      open: countOpen(prayers),
      resolved: prayers.filter((p) => p.status === 'resolved').length,
      all: prayers.length,
    }),
    [prayers],
  );

  const activeCounts = activeTab === 'contact' ? contactCounts : prayerCounts;
  const emptyContactTitle = t(`admin.messages.emptyContact.${statusFilter}`);
  const emptyPrayerTitle = t(`admin.messages.emptyPrayer.${statusFilter}`);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setExpandedContactId(null);
    setExpandedPrayerId(null);
  };

  return (
    <>
      <header className="mb-4">
        <h1 className="font-hero text-2xl font-semibold leading-tight text-primary md:text-3xl">
          {t('admin.messages.title')}
        </h1>
        <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">{t('admin.messages.subtitle')}</p>
      </header>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-8 gap-0.5 p-0.5">
            <TabsTrigger value="contact" className="gap-1 px-2 py-1 text-xs">
              <Mail className="h-3.5 w-3.5" />
              {t('admin.messages.contactTab')}
              {contactCounts.open > 0 && (
                <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold tabular-nums text-primary">
                  {contactCounts.open}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="prayer" className="gap-1 px-2 py-1 text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              {t('admin.messages.prayerTab')}
              {prayerCounts.open > 0 && (
                <span className="rounded-full bg-accent/15 px-1.5 text-[10px] font-semibold tabular-nums text-accent">
                  {prayerCounts.open}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <StatusFilterBar
            filter={statusFilter}
            onChange={(next) => {
              setStatusFilter(next);
              setExpandedContactId(null);
              setExpandedPrayerId(null);
            }}
            counts={activeCounts}
          />
        </div>

        <TabsContent value="contact" className="mt-3">
          {loading ? (
            <LoadingSpinner size="lg" center />
          ) : (
            <MessageList
              items={messages}
              filter={statusFilter}
              emptyTitle={emptyContactTitle}
              renderRow={(message) => (
                <ContactMessageRow
                  key={message.id}
                  message={message}
                  staff={staff}
                  actor={actor}
                  expanded={expandedContactId === message.id}
                  onToggle={() =>
                    setExpandedContactId((id) => (id === message.id ? null : message.id))
                  }
                  onChanged={refresh}
                />
              )}
            />
          )}
        </TabsContent>

        <TabsContent value="prayer" className="mt-3">
          {loading ? (
            <LoadingSpinner size="lg" center />
          ) : (
            <MessageList
              items={prayers}
              filter={statusFilter}
              emptyTitle={emptyPrayerTitle}
              renderRow={(request) => (
                <PrayerRequestRow
                  key={request.id}
                  request={request}
                  staff={staff}
                  actor={actor}
                  expanded={expandedPrayerId === request.id}
                  onToggle={() =>
                    setExpandedPrayerId((id) => (id === request.id ? null : request.id))
                  }
                  onChanged={refresh}
                />
              )}
            />
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
