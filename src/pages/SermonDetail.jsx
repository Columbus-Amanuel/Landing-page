import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getSermonById } from '../services/sermonsService';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function SermonDetail() {
  const { id } = useParams();
  const [sermon, setSermon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSermonById(id).then(setSermon).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner center size="lg" />;
  if (!sermon) return (
    <div className="container section">
      <p>Sermon not found. <Link to="/sermons">Back to Sermons</Link></p>
    </div>
  );

  const sermonDate = sermon.date?.toDate ? sermon.date.toDate() : new Date(sermon.date);

  return (
    <div className="page-sermon-detail">
      <section className="section">
        <div className="container container-narrow">
          <Link to="/sermons" className="back-link">← Back to Sermons</Link>

          <span className="sermon-category-badge">{sermon.category}</span>
          <h1 className="sermon-detail-title">{sermon.title}</h1>
          <div className="sermon-detail-meta">
            <span>👤 {sermon.speaker}</span>
            <span>📅 {format(sermonDate, 'MMMM d, yyyy')}</span>
            {sermon.scripture && <span>📖 {sermon.scripture}</span>}
          </div>

          {/* Video Player */}
          {sermon.videoUrl && (
            <div className="sermon-video-wrapper">
              {sermon.videoUrl.includes('youtube') ? (
                <iframe
                  src={sermon.videoUrl.replace('watch?v=', 'embed/')}
                  title={sermon.title}
                  allowFullScreen
                  className="sermon-video"
                />
              ) : (
                <video controls src={sermon.videoUrl} className="sermon-video" />
              )}
            </div>
          )}

          {/* Audio Player */}
          {sermon.audioUrl && !sermon.videoUrl && (
            <div className="sermon-audio-wrapper">
              <audio controls src={sermon.audioUrl} className="sermon-audio" />
            </div>
          )}

          {/* Description */}
          {sermon.description && (
            <div className="sermon-description">
              <p>{sermon.description}</p>
            </div>
          )}

          {/* Notes Download */}
          {sermon.notesUrl && (
            <a href={sermon.notesUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              📄 Download Sermon Notes
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
