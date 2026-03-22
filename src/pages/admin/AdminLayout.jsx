import { NavLink, Routes, Route } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import AdminDashboard from './AdminDashboard';
import AdminChurchInfo from './AdminChurchInfo';
import AdminEvents from './AdminEvents';
import AdminSermons from './AdminSermons';
import AdminGiving from './AdminGiving';
import AdminYouth from './AdminYouth';
import AdminMessages from './AdminMessages';

const adminNav = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/church-info', label: 'Church Info' },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/sermons', label: 'Sermons' },
  { to: '/admin/giving', label: 'Giving' },
  { to: '/admin/youth', label: 'Youth & Children' },
  { to: '/admin/messages', label: 'Messages' },
];

export default function AdminLayout() {
  const { language } = useLanguage();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar-title">
          {language === 'am' ? 'አስተዳዳሪ ፓነል' : 'Admin Panel'}
        </h2>
        <nav className="admin-nav">
          {adminNav.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="admin-content">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="church-info" element={<AdminChurchInfo />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="sermons" element={<AdminSermons />} />
          <Route path="giving" element={<AdminGiving />} />
          <Route path="youth" element={<AdminYouth />} />
          <Route path="messages" element={<AdminMessages />} />
        </Routes>
      </main>
    </div>
  );
}
