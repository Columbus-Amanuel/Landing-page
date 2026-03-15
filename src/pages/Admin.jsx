import { useEffect, useState } from 'react';
import { createYouthVideo, deleteYouthVideo, getYouthVideos } from '../services/youthVideosService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';

export default function Admin() {
  const { language } = useLanguage();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
  });

  const loadVideos = async () => {
    setLoading(true);
    try {
      const videoList = await getYouthVideos();
      setVideos(videoList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.url.trim()) {
      setError(language === 'am' ? 'እባክዎ የYouTube ሊንክ ያስገቡ።' : 'Please enter a YouTube link.');
      return;
    }

    setSubmitting(true);
    try {
      await createYouthVideo({
        title: formData.title.trim(),
        description: formData.description.trim(),
        url: formData.url.trim(),
      });
      setFormData({ title: '', description: '', url: '' });
      await loadVideos();
    } catch {
      setError(language === 'am' ? 'ቪዲዮ ማከል አልተሳካም።' : 'Unable to add video.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteYouthVideo(id);
    await loadVideos();
  };

  return (
    <div className="page-admin">
      <section className="page-hero">
        <h1>{language === 'am' ? 'አስተዳዳሪ ፓነል' : 'Admin Panel'}</h1>
        <p>{language === 'am' ? 'ለወጣቶች እና ለህፃናት ገጽ የYouTube ቪዲዮ ሊንኮችን ያስተዳድሩ።' : 'Manage YouTube video links for the Youth & Children page.'}</p>
      </section>

      <section className="section section-alt">
        <div className="container container-narrow">
          <div className="admin-card">
            <h2>{language === 'am' ? 'አዲስ ቪዲዮ አክል' : 'Add New Video'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <label>
                {language === 'am' ? 'ርዕስ' : 'Title'}
                <input name="title" value={formData.title} onChange={onChange} className="form-input" />
              </label>

              <label>
                YouTube URL *
                <input name="url" value={formData.url} onChange={onChange} className="form-input" placeholder="https://www.youtube.com/watch?v=..." required />
              </label>

              <label>
                {language === 'am' ? 'ማብራሪያ' : 'Description'}
                <textarea name="description" value={formData.description} onChange={onChange} className="form-input" rows={3} />
              </label>

              {error && <p className="error-text">{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (language === 'am' ? 'በመጫን ላይ...' : 'Saving...') : (language === 'am' ? 'ቪዲዮ አክል' : 'Add Video')}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container container-narrow">
          <h2 className="section-title">{language === 'am' ? 'የተጨመሩ ቪዲዮዎች' : 'Added Videos'}</h2>
          {loading ? (
            <LoadingSpinner center />
          ) : videos.length === 0 ? (
            <p className="empty-state text-center">{language === 'am' ? 'ምንም ቪዲዮ አልተጨመረም።' : 'No videos added yet.'}</p>
          ) : (
            <div className="admin-video-list">
              {videos.map((video) => (
                <div key={video.id} className="admin-video-item">
                  <div>
                    <h3>{video.title || 'Untitled Video'}</h3>
                    <p className="text-sm">{video.url}</p>
                  </div>
                  <button type="button" className="btn btn-outline" onClick={() => handleDelete(video.id)}>
                    {language === 'am' ? 'ሰርዝ' : 'Delete'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
