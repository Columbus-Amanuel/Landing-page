import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    let videoId;
    if (parsed.hostname === 'youtu.be') {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) return url;
      videoId = parsed.searchParams.get('v');
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}
import { format } from 'date-fns';
import { getSermonById } from '../services/sermonsService';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function SermonDetail() {
  const { id } = useParams();
  const [sermon, setSermon] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    getSermonById(id).then(setSermon).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner center size="lg" />;
  if (!sermon) return <div className="container section"><p>{language === 'am' ? 'ስብከቱ አልተገኘም።' : 'Sermon not found.'} <Link to="/sermons">{language === 'am' ? 'ወደ ስብከቶች ተመለስ' : 'Back to Sermons'}</Link></p></div>;

  const sermonDate = sermon.date?.toDate ? sermon.date.toDate() : new Date(sermon.date);

  return (
    <div className="page-sermon-detail">
      <section className="section">
        <div className="container container-narrow">
          <Link to="/sermons" className="back-link">← {language === 'am' ? 'ወደ ስብከቶች ተመለስ' : 'Back to Sermons'}</Link>
          <span className="sermon-category-badge">{sermon.category}</span>
          <h1 className="sermon-detail-title">{sermon.title}</h1>
          <div className="sermon-detail-meta">
            <span>👤 {sermon.speaker}</span>
            <span>📅 {format(sermonDate, 'MMMM d, yyyy')}</span>
            {sermon.scripture && <span>📖 {sermon.scripture}</span>}
          </div>

          {sermon.videoUrl && (
            <div className="sermon-video-wrapper">
              {getYouTubeEmbedUrl(sermon.videoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(sermon.videoUrl)}
                  title={sermon.title}
                  allowFullScreen
                  className="sermon-video"
                />
              ) : (
                <video controls src={sermon.videoUrl} className="sermon-video" />
              )}
            </div>
          )}

          {sermon.audioUrl && !sermon.videoUrl && <div className="sermon-audio-wrapper"><audio controls src={sermon.audioUrl} className="sermon-audio" /></div>}
          {sermon.description && <div className="sermon-description"><p>{sermon.description}</p></div>}

          {sermon.notesUrl && <a href={sermon.notesUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">📄 {language === 'am' ? 'የስብከት ማስታወሻዎችን አውርድ' : 'Download Sermon Notes'}</a>}
        </div>
      </section>
    </div>
  );
}
