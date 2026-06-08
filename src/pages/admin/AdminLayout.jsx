import { NavLink, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutGrid,
  Building2,
  CalendarDays,
  Mic,
  Heart,
  Sparkles,
  Inbox,
  Menu,
  Users,
  ImageIcon,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { ADMIN_NAV } from '@/constants/nav';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { isSuperAdminRole } from '@/lib/roles';
import { cn } from '@/lib/utils';
import AdminDashboard from './AdminDashboard';
import AdminChurchInfo from './AdminChurchInfo';
import AdminEvents from './AdminEvents';
import AdminSermons from './AdminSermons';
import AdminGiving from './AdminGiving';
import AdminMinistries from './AdminMinistries';
import AdminMinistryEdit from './AdminMinistryEdit';
import AdminYouth from './AdminYouth';
import AdminMessages from './AdminMessages';
import AdminUsers from './AdminUsers';
import AdminMedia from './AdminMedia';

const ICONS = {
  dashboard: LayoutGrid,
  churchInfo: Building2,
  events: CalendarDays,
  sermons: Mic,
  giving: Heart,
  ministries: Sparkles,
  messages: Inbox,
  users: Users,
  media: ImageIcon,
};

function SidebarLinks({ onSelect }) {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const navItems = ADMIN_NAV.filter(
    (item) => !item.requireSuperAdmin || isSuperAdminRole(profile?.role),
  );
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = ICONS[item.key] ?? LayoutGrid;
        return (
          <NavLink
            key={item.key}
            to={item.to}
            end={item.end}
            onClick={() => onSelect?.()}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent/15 text-sidebar-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {t(item.labelKey)}
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function AdminLayout() {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="grid min-h-[calc(100vh-var(--navbar-height))] grid-cols-1 lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-[var(--navbar-height)] hidden h-[calc(100vh-var(--navbar-height))] border-r border-sidebar-accent/10 bg-sidebar p-5 text-sidebar-foreground lg:block">
        <p className="mb-6 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-sidebar-accent">
          {t('admin.nav.section')}
        </p>
        <SidebarLinks />
      </aside>

      {/* Mobile sidebar trigger */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t('admin.nav.section')}>
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-sidebar p-5 text-sidebar-foreground">
            <SheetHeader>
              <SheetTitle className="text-sidebar-foreground">{t('admin.nav.section')}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <SidebarLinks onSelect={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <span className="font-display text-base font-semibold text-primary">
          {t('admin.title')}
        </span>
      </div>

      <main className="bg-muted/40 px-4 py-8 md:px-8 md:py-10">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="church-info" element={<AdminChurchInfo />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="sermons" element={<AdminSermons />} />
          <Route path="giving" element={<AdminGiving />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="ministries" element={<AdminMinistries />} />
          <Route path="ministries/:ministryId" element={<AdminMinistryEdit />} />
          <Route path="youth" element={<AdminYouth />} />
          <Route
            path="messages"
            element={(
              <ProtectedRoute superAdminOnly>
                <AdminMessages />
              </ProtectedRoute>
            )}
          />
          <Route
            path="users"
            element={(
              <ProtectedRoute superAdminOnly>
                <AdminUsers />
              </ProtectedRoute>
            )}
          />
        </Routes>
      </main>
    </div>
  );
}
