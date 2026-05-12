import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
import { getInitials } from '@/lib/format';
import LanguageToggle from '@/components/common/LanguageToggle';
import BrandCrossIcon from '@/components/common/BrandCrossIcon';
import { cn } from '@/lib/utils';
import { getRoleAbbrev, isStaffRole } from '@/lib/roles';
import NavDropdown from './NavDropdown';
import MobileNav from './MobileNav';

const NAV_LINK_BASE =
  'relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

function NavItem({ to, labelKey, end }) {
  const { t } = useLanguage();
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(NAV_LINK_BASE, isActive ? 'text-primary' : 'text-muted-foreground')
      }
    >
      {({ isActive }) => (
        <>
          {t(labelKey)}
          {isActive && (
            <span
              aria-hidden="true"
              className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent"
            />
          )}
        </>
      )}
    </NavLink>
  );
}

function GiveLink() {
  const { t } = useLanguage();
  return (
    <NavLink
      to={ROUTES.give}
      className={({ isActive }) =>
        cn(
          'inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90',
          isActive && 'bg-primary/90',
        )
      }
    >
      {t('nav.give')}
    </NavLink>
  );
}

function UserMenu() {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const isAdmin = isStaffRole(profile?.role);
  const photoSrc = profile?.photoURL || user?.photoURL;

  const handleLogout = async () => {
    await logoutUser();
    navigate(ROUTES.home);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`${t('nav.hi')} ${profile?.displayName || user?.email || ''}`}
        >
          <Avatar className="h-9 w-9">
            {photoSrc ? <AvatarImage src={photoSrc} alt="" /> : null}
            <AvatarFallback>
              {getInitials(profile?.displayName || user?.email || 'EU')}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[14rem]">
        <DropdownMenuLabel className="normal-case">
          <span className="text-xs text-muted-foreground">
            {t('nav.hi')}, {language === 'am' ? '' : ''}
          </span>
          <p className="mt-0.5 flex flex-wrap items-baseline gap-2 text-sm font-semibold text-foreground">
            <span>{profile?.displayName || user?.email}</span>
            {/* TEMPORARY: m / a / s — remove when no longer needed */}
            <span className="font-mono text-xs font-normal text-muted-foreground" title="m=member, a=admin, s=super-admin">
              ({getRoleAbbrev(profile?.role)})
            </span>
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={ROUTES.profileUpdate} className="cursor-pointer gap-2">
            <UserCircle2 className="h-4 w-4" />
            {t('nav.completeProfile')}
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to={ROUTES.admin} className="cursor-pointer gap-2">
              <ShieldCheck className="h-4 w-4" />
              {t('nav.admin')}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            handleLogout();
          }}
          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {t('common.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Navbar() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { pathname } = useLocation();
  // Hide the navbar entirely on auth pages so they render as standalone screens.
  if (pathname === ROUTES.login || pathname === ROUTES.register) return null;

  const contactLink = CONNECT_NAV.find((item) => item.key === 'contact');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-navbar/95 backdrop-blur supports-[backdrop-filter]:bg-navbar/85">
      <div className="mx-auto flex h-[var(--navbar-height)] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to={ROUTES.home}
          className="flex items-center gap-3 font-display text-base font-semibold text-primary transition-opacity hover:opacity-90"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md text-primary">
            <BrandCrossIcon size={20} />
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              EuccOnline.com
            </span>
            <span>{t('common.churchName')}</span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {PRIMARY_NAV.map(({ key, ...item }) => (
            <NavItem key={key} {...item} />
          ))}
          <NavDropdown label={t('nav.ministries')} items={MINISTRIES_NAV} />
          <NavDropdown label={t('nav.media')} items={MEDIA_NAV} />
          {contactLink && (
            <NavItem
              key={contactLink.key}
              to={contactLink.to}
              labelKey={contactLink.labelKey}
              end={contactLink.end}
            />
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:gap-3">
          <div className="hidden lg:block">
            <GiveLink />
          </div>
          <LanguageToggle className="hidden md:inline-flex" />
          {user ? (
            <div className="hidden lg:block">
              <UserMenu />
            </div>
          ) : (
            <Button asChild size="sm" className="hidden lg:inline-flex">
              <Link to={ROUTES.login}>{t('common.signIn')}</Link>
            </Button>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
