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
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { logoutUser } from '@/services/authService';
import { ROUTES } from '@/constants/routes';
import { PRIMARY_NAV, CONNECT_NAV } from '@/constants/nav';
import { getInitials } from '@/lib/format';
import LanguageToggle from '@/components/common/LanguageToggle';
import { cn } from '@/lib/utils';
import { getRoleAbbrev, isStaffRole } from '@/lib/roles';
import NavDropdown from './NavDropdown';
import MobileNav from './MobileNav';

const NAV_LINK_BASE =
  'font-mono-label relative inline-flex items-center px-2.5 py-2 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

function NavItem({ to, labelKey, end }) {
  const { t } = useLanguage();
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(NAV_LINK_BASE, isActive ? 'text-accent' : 'text-foreground')
      }
    >
      {({ isActive }) => (
        <>
          {t(labelKey)}
          {isActive && (
            <span
              aria-hidden="true"
              className="absolute inset-x-2.5 -bottom-0.5 h-0.5 bg-accent"
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
          'font-mono-label inline-flex h-10 items-center bg-accent px-5 font-semibold text-accent-foreground transition-colors hover:bg-accent/90',
          isActive && 'bg-accent/90',
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
  const { ministriesNav } = useSiteSettings();
  const { pathname } = useLocation();
  // Hide the navbar entirely on auth pages so they render as standalone screens.
  if (pathname === ROUTES.login || pathname === ROUTES.register) return null;

  const contactLink = CONNECT_NAV.find((item) => item.key === 'contact');

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-foreground bg-navbar/95 backdrop-blur supports-[backdrop-filter]:bg-navbar/90">
      <div className="mx-auto flex h-[var(--navbar-height)] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to={ROUTES.home}
          className="flex min-w-0 max-sm:flex-1 items-center gap-3 text-primary transition-opacity hover:opacity-90"
        >
          <img
            src="/logo.png"
            alt=""
            className="h-11 w-11 shrink-0 rounded-full bg-white object-contain"
          />
          <span className="flex min-w-0 flex-col justify-center leading-tight">
            <span className="font-mono-label truncate text-[0.65rem] text-muted-foreground">
              EuccOnline.com
            </span>
            <span className="font-hero text-sm font-black uppercase tracking-tight sm:text-base">
              <span className="block truncate sm:hidden">{t('common.churchNameShort')}</span>
              <span className="hidden truncate sm:block">{t('common.churchName')}</span>
            </span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-0.5 xl:ml-8 lg:flex">
          {PRIMARY_NAV.map(({ key, ...item }) => (
            <NavItem key={key} {...item} />
          ))}
          <NavDropdown label={t('nav.ministries')} items={ministriesNav} />
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
            <Button
              asChild
              size="sm"
              variant="outline"
              className="font-mono-label hidden h-10 rounded-none border-2 border-foreground px-4 hover:bg-foreground hover:text-background lg:inline-flex"
            >
              <Link to={ROUTES.login}>{t('common.signIn')}</Link>
            </Button>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
