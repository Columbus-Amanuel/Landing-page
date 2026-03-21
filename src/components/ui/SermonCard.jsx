import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { PlayCircleIcon } from '@heroicons/react/24/solid';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

const CATEGORY_AM = {
  'Sunday Message': 'የእሁድ ስብከት',
  'Bible Study': 'የመጽሐፍ ቅዱስ ጥናት',
  'Special Series': 'ልዩ ተከታታይ',
  'Guest Speaker': 'የእንግዳ ተናጋሪ',
  'General': 'አጠቃላይ',
};

export default function SermonCard({ sermon }) {
  const sermonDate = sermon.date?.toDate ? sermon.date.toDate() : new Date(sermon.date);
  const { t, language } = useLanguage();
  const am = language === 'am';

  const title = am && sermon.titleAm ? sermon.titleAm : sermon.title;
  const description = am && sermon.descriptionAm ? sermon.descriptionAm : sermon.description;
  const category = sermon.category || 'General';
  const categoryLabel = am ? (CATEGORY_AM[category] || category) : category;

  return (
    <div className="sermon-card">
      {sermon.thumbnailUrl && (
        <div className="sermon-card-thumbnail">
          <img src={sermon.thumbnailUrl} alt={title} />
          {sermon.videoUrl && (
            <PlayCircleIcon className="sermon-play-icon" aria-hidden />
          )}
        </div>
      )}
      <div className="sermon-card-body">
        <span className="sermon-category">{categoryLabel}</span>
        <h3 className="sermon-card-title">{title}</h3>
        <p className="sermon-speaker">{sermon.speaker}</p>
        <p className="sermon-date">{format(sermonDate, 'MMMM d, yyyy')}</p>
        {sermon.scripture && (
          <p className="sermon-scripture sermon-scripture--with-icon">
            <BookOpenIcon className="sermon-inline-icon" aria-hidden />
            {sermon.scripture}
          </p>
        )}
        {description && <p className="sermon-card-desc">{description}</p>}
        <div className="sermon-card-actions">
          <Link to={`/sermons/${sermon.id}`} className="btn btn-primary btn-sm">{t('sermons.watchListen')}</Link>
          {sermon.notesUrl && (
            <a href={sermon.notesUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
              {t('sermons.notes')}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
