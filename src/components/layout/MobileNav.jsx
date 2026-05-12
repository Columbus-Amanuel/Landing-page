import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, LogIn, LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { logoutUser } from '@/services/authService';
import { ROUTES } from '@/constants/routes';
import {
  PRIMARY_NAV,
  MINISTRIES_NAV,
  MEDIA_NAV,
  CONNECT_NAV,
} from '@/constants/nav';
import LanguageToggle from '@/components/common/LanguageToggle';
import BrandCrossIcon from '@/components/common/BrandCrossIcon';
import { cn } from '@/lib/utils';
import { isStaffRole } from '@/lib/roles';
import { useState } from 'react';

function MobileGroup({ titleKey, items, onSelect, t }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-col gap-1">
      <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        {t(titleKey)}
      </p>
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.key}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={onSelect}
              className={({ isActive }) =>
                cn(
                  'block rounded-md px-3 py-2.5 text-base font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-secondary',
                  item.emphasize &&
                    'bg-accent text-accent-foreground hover:bg-accent/90 mt-1',
                )
              }
            >
              {t(item.labelKey)}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Hamburger button + Radix Sheet drawer that mirrors the desktop nav for
 * mobile / tablet viewports. Reads from the same `constants/nav.js` arrays
 * so the menus never drift apart.
 */
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const handleLogout = async () => {
    await logoutUser();
    close();
    navigate(ROUTES.home);
  };

  const isAdmin = isStaffRole(profile?.role);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={t('nav.openMenu')}
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[88%] max-w-sm flex-col gap-6 px-5">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BrandCrossIcon className="text-primary" size={22} />
            <span className="font-display text-base">{t('common.churchName')}</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto pb-4">
          <MobileGroup titleKey="nav.main" items={PRIMARY_NAV} onSelect={close} t={t} />
          <MobileGroup titleKey="nav.ministries" items={MINISTRIES_NAV} onSelect={close} t={t} />
          <MobileGroup titleKey="nav.media" items={MEDIA_NAV} onSelect={close} t={t} />
          <MobileGroup titleKey="nav.connect" items={CONNECT_NAV} onSelect={close} t={t} />

          {(user || isAdmin) && (
            <>
              <Separator />
              <div className="flex flex-col gap-1">
                <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  {t('nav.account')}
                </p>
                {user && (
                  <NavLink
                    to={ROUTES.profileUpdate}
                    onClick={close}
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                  >
                    <UserCircle2 className="h-4 w-4" />
                    {t('nav.completeProfile')}
                  </NavLink>
                )}
                {isAdmin && (
                  <NavLink
                    to={ROUTES.admin}
                    onClick={close}
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {t('nav.admin')}
                  </NavLink>
                )}
              </div>
            </>
          )}
        </nav>

        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <LanguageToggle className="self-start" />
          {user ? (
            <Button variant="outline" onClick={handleLogout} className="w-full">
              <LogOut /> {t('common.logout')}
            </Button>
          ) : (
            <Button asChild className="w-full">
              <NavLink to={ROUTES.login} onClick={close}>
                <LogIn /> {t('common.signIn')}
              </NavLink>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
