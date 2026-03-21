import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  BookOpenIcon,
  CalendarDaysIcon,
  DocumentArrowDownIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { getSermonById } from '../services/sermonsService';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import BackLink from '../components/ui/BackLink';

const CATEGORY_AM = {
  'Sunday Message': 'የእሁድ ስብከት',
  'Bible Study': 'የመጽሐፍ ቅዱስ ጥናት',
  'Special Series': 'ልዩ ተከታታይ',
  'Guest Speaker': 'የእንግዳ ተናጋሪ',
};

export default function SermonDetail() {
  const { id } = useParams();
  const [sermon, setSermon] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  const am = language === 'am';

  useEffect(() => {
    getSermonById(id).then(setSermon).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner center size="lg" />;
  if (!sermon) {
    return (
      <div className="container section">
        <p>{t('sermons.notFound')} <Link to="/sermons">{t('sermons.backToSermons')}</Link></p>
      </div>
    );
  }

  const sermonDate = sermon.date?.toDate ? sermon.date.toDate() : new Date(sermon.date);
  const title = am && sermon.titleAm ? sermon.titleAm : sermon.title;
  const description = am && sermon.descriptionAm ? sermon.descriptionAm : sermon.description;
  const category = sermon.category || '';
  const categoryLabel = am ? (CATEGORY_AM[category] || category) : category;

  return (
    <div className="page-sermon-detail">
      <section className="section">
        <div className="container container-narrow">
          <BackLink to="/sermons">{t('sermons.backToSermons')}</BackLink>
          {categoryLabel && <span className="sermon-category-badge">{categoryLabel}</span>}
          <h1 className="sermon-detail-title">{title}</h1>
          <div className="sermon-detail-meta">
            <span className="meta-inline">
              <UserIcon aria-hidden />
              {sermon.speaker}
            </span>
            <span className="meta-inline">
              <CalendarDaysIcon aria-hidden />
              {format(sermonDate, 'MMMM d, yyyy')}
            </span>
            {sermon.scripture && (
              <span className="meta-inline">
                <BookOpenIcon aria-hidden />
                {sermon.scripture}
              </span>
            )}
          </div>

          {sermon.videoUrl && (
            <div className="sermon-video-wrapper">
              {sermon.videoUrl.includes('youtube') || sermon.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={sermon.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  title={title}
                  allowFullScreen
                  className="sermon-video"
                />
              ) : (
                <video controls src={sermon.videoUrl} className="sermon-video" />
              )}
            </div>
          )}

          {sermon.audioUrl && !sermon.videoUrl && (
            <div className="sermon-audio-wrapper">
              <audio controls src={sermon.audioUrl} className="sermon-audio" />
            </div>
          )}

          {description && <div className="sermon-description"><p>{description}</p></div>}

          {sermon.notesUrl && (
            <a
              href={sermon.notesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <DocumentArrowDownIcon className="btn-inline-icon" aria-hidden />
              {t('sermons.downloadNotes')}
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
