import { Link } from 'react-router-dom';
import {
  BuildingLibraryIcon,
  CalendarDaysIcon,
  MicrophoneIcon,
  BanknotesIcon,
  UserGroupIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

const sections = [
  {
    to: '/admin/church-info',
    icon: BuildingLibraryIcon,
    label: 'Church Info',
    desc: 'Address, phone, service times, story, beliefs, and home page values',
  },
  {
    to: '/admin/events',
    icon: CalendarDaysIcon,
    label: 'Events',
    desc: 'Create, edit, and delete upcoming church events',
  },
  {
    to: '/admin/sermons',
    icon: MicrophoneIcon,
    label: 'Sermons',
    desc: 'Upload and manage sermons with audio, video, and notes',
  },
  {
    to: '/admin/giving',
    icon: BanknotesIcon,
    label: 'Giving',
    desc: 'Edit giving funds, online payment link, and mailing address',
  },
  {
    to: '/admin/youth',
    icon: UserGroupIcon,
    label: 'Youth & Children',
    desc: 'Manage Youth & Children page content and YouTube videos',
  },
  {
    to: '/admin/messages',
    icon: EnvelopeIcon,
    label: 'Messages',
    desc: 'View contact form submissions and prayer requests',
  },
];

export default function AdminDashboard() {
  const { language } = useLanguage();

  return (
    <div>
      <h1 className="admin-page-title">
        {language === 'am' ? 'ዳሽቦርድ' : 'Dashboard'}
      </h1>
      <p className="admin-page-subtitle">
        {language === 'am'
          ? 'ከዚህ በታች ያሉትን ክፍሎች ጠቅ ያድርጉ።'
          : 'Select a section below to manage your church website content.'}
      </p>
      <div className="admin-dashboard-grid">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.to} to={section.to} className="admin-dashboard-card">
              <div className="admin-dashboard-card-icon-wrap" aria-hidden>
                <Icon className="admin-dashboard-card-icon" />
              </div>
              <h3>{section.label}</h3>
              <p>{section.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
