import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useLanguage } from '../../contexts/LanguageContext';

export default function SermonCard({ sermon }) {
  const sermonDate = sermon.date?.toDate ? sermon.date.toDate() : new Date(sermon.date);
  const { language } = useLanguage();

  return (
    <div className="sermon-card">
      {sermon.thumbnailUrl && (
        <div className="sermon-card-thumbnail">
          <img src={sermon.thumbnailUrl} alt={sermon.title} />
          {sermon.videoUrl && <span className="play-icon">▶</span>}
        </div>
      )}
      <div className="sermon-card-body">
        <span className="sermon-category">{sermon.category || (language === 'am' ? 'አጠቃላይ' : 'General')}</span>
        <h3 className="sermon-card-title">{sermon.title}</h3>
        <p className="sermon-speaker">{sermon.speaker}</p>
        <p className="sermon-date">{format(sermonDate, 'MMMM d, yyyy')}</p>
        {sermon.scripture && <p className="sermon-scripture">📖 {sermon.scripture}</p>}
        <div className="sermon-card-actions">
          <Link to={`/sermons/${sermon.id}`} className="btn btn-primary btn-sm">{language === 'am' ? 'ይመልከቱ / ያዳምጡ' : 'Watch / Listen'}</Link>
          {sermon.notesUrl && (
            <a href={sermon.notesUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
              {language === 'am' ? 'ማስታወሻዎች' : 'Notes'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
