import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { isGroupActive } from '@/constants/nav';
import { cn } from '@/lib/utils';

/**
 * Desktop dropdown for navbar groups (e.g. Ministries).
 *
 * @param {{ label: string, items: { key: string, to: string, labelKey?: string, labelEn?: string, labelAm?: string }[] }} props
 */
export default function NavDropdown({ label, items }) {
  const { pathname } = useLocation();
  const { t, language } = useLanguage();
  const groupActive = isGroupActive(pathname, items);

  const linkLabel = (item) => {
    if (item.labelKey) return t(item.labelKey);
    return language === 'am' && item.labelAm ? item.labelAm : item.labelEn;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'group inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          groupActive ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        {label}
        <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[14rem]">
        {items.map((item) => (
          <DropdownMenuItem key={item.key} asChild>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'w-full text-sm',
                  isActive ? 'font-semibold text-primary' : 'text-foreground',
                )
              }
            >
              {linkLabel(item)}
            </NavLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
