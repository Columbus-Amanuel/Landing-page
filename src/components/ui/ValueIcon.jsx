import {
  AcademicCapIcon,
  BookOpenIcon,
  GlobeAltIcon,
  HandRaisedIcon,
  HeartIcon,
  MusicalNoteIcon,
  SparklesIcon,
  SunIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { normalizeValueIconKey } from '../../utils/valueIcons';

const ICONS = {
  handRaised: HandRaisedIcon,
  bookOpen: BookOpenIcon,
  userGroup: UserGroupIcon,
  globeAlt: GlobeAltIcon,
  heart: HeartIcon,
  musicalNote: MusicalNoteIcon,
  sparkles: SparklesIcon,
  sun: SunIcon,
  academicCap: AcademicCapIcon,
};

export default function ValueIcon({ iconKey }) {
  const key = normalizeValueIconKey(iconKey);
  const Icon = ICONS[key] || SparklesIcon;
  return (
    <span className="value-icon" aria-hidden>
      <Icon />
    </span>
  );
}
