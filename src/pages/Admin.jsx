import { useEffect, useState } from 'react';
import {
  createYouthVideo,
  deleteYouthVideo,
  getYouthPageContent,
  getYouthVideos,
  updateYouthPageContent,
} from '../services/youthVideosService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';

const defaultPageForm = {
  heroTitleEn: '',
  heroTitleAm: '',
  heroSubtitleEn: '',
  heroSubtitleAm: '',
  ministrySectionTitleEn: '',
  ministrySectionTitleAm: '',
  videosSectionTitleEn: '',
  videosSectionTitleAm: '',
  cardOneTitleEn: '',
  cardOneTitleAm: '',
  cardOneDescriptionEn: '',
  cardOneDescriptionAm: '',
  cardTwoTitleEn: '',
  cardTwoTitleAm: '',
  cardTwoDescriptionEn: '',
  cardTwoDescriptionAm: '',
  cardThreeTitleEn: '',
  cardThreeTitleAm: '',
  cardThreeDescriptionEn: '',
  cardThreeDescriptionAm: '',
};

export default function Admin() {
  const { language } = useLanguage();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoSubmitting, setVideoSubmitting] = useState(false);
  const [contentSubmitting, setContentSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [contentMessage, setContentMessage] = useState('');
  const [videoFormData, setVideoFormData] = useState({
    title: '',
    url: '',
    description: '',
    speaker: '',
    category: '',
    duration: '',
    thumbnailUrl: '',
    sortOrder: 0,
  });
  const [pageFormData, setPageFormData] = useState(defaultPageForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const [videoList, pageContent] = await Promise.all([getYouthVideos(), getYouthPageContent()]);
      setVideos(videoList);
      if (pageContent) {
        setPageFormData((prev) => ({ ...prev, ...pageContent }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onVideoInputChange = (event) => {
    const { name, value } = event.target;
    setVideoFormData((prev) => ({
      ...prev,
      [name]: name === 'sortOrder' ? Number(value) : value,
    }));
  };

  const onPageInputChange = (event) => {
    const { name, value } = event.target;
    setPageFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVideoSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!videoFormData.url.trim()) {
      setError(language === 'am' ? 'እባክዎ የYouTube ሊንክ ያስገቡ።' : 'Please enter a YouTube link.');
      return;
    }

    setVideoSubmitting(true);
    try {
      await createYouthVideo({
        title: videoFormData.title.trim(),
        description: videoFormData.description.trim(),
        url: videoFormData.url.trim(),
        speaker: videoFormData.speaker.trim(),
        category: videoFormData.category.trim(),
        duration: videoFormData.duration.trim(),
        thumbnailUrl: videoFormData.thumbnailUrl.trim(),
        sortOrder: Number(videoFormData.sortOrder) || 0,
      });
      setVideoFormData({
        title: '',
        url: '',
        description: '',
        speaker: '',
        category: '',
        duration: '',
        thumbnailUrl: '',
        sortOrder: 0,
      });
      await loadData();
    } catch {
      setError(language === 'am' ? 'ቪዲዮ ማከል አልተሳካም።' : 'Unable to add video.');
    } finally {
      setVideoSubmitting(false);
    }
  };

  const handlePageSubmit = async (event) => {
    event.preventDefault();
    setContentMessage('');
    setContentSubmitting(true);
    try {
      await updateYouthPageContent(pageFormData);
      setContentMessage(language === 'am' ? 'የገጽ ይዘት ተቀምጧል።' : 'Page content saved successfully.');
    } catch {
      setContentMessage(language === 'am' ? 'የገጽ ይዘት ማስቀመጥ አልተሳካም።' : 'Unable to save page content.');
    } finally {
      setContentSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteYouthVideo(id);
    await loadData();
  };

  return (
    <div className="page-admin">
      <section className="page-hero">
        <h1>{language === 'am' ? 'አስተዳዳሪ ፓነል' : 'Admin Panel'}</h1>
        <p>{language === 'am' ? 'የወጣቶች እና የህፃናት ገጽ የጽሁፍ እና የቪዲዮ ይዘትን ያስተዳድሩ።' : 'Manage text and video content for the Youth & Children page.'}</p>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="admin-card">
            <h2>{language === 'am' ? 'የገጽ ይዘት (EN/AM)' : 'Page Content (EN/AM)'}</h2>
            <form onSubmit={handlePageSubmit} className="admin-form admin-form-grid">
              {Object.keys(defaultPageForm).map((field) => (
                <label key={field}>
                  {field}
                  <input name={field} value={pageFormData[field] || ''} onChange={onPageInputChange} className="form-input" />
                </label>
              ))}

              {contentMessage && <p className="error-text">{contentMessage}</p>}
              <button type="submit" className="btn btn-primary" disabled={contentSubmitting}>
                {contentSubmitting ? 'Saving...' : (language === 'am' ? 'የገጽ ይዘት አስቀምጥ' : 'Save Page Content')}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container container-narrow">
          <div className="admin-card">
            <h2>{language === 'am' ? 'አዲስ ቪዲዮ አክል' : 'Add New Video'}</h2>
            <form onSubmit={handleVideoSubmit} className="admin-form">
              <label>
                {language === 'am' ? 'ርዕስ' : 'Title'}
                <input name="title" value={videoFormData.title} onChange={onVideoInputChange} className="form-input" />
              </label>
              <label>
                YouTube URL *
                <input name="url" value={videoFormData.url} onChange={onVideoInputChange} className="form-input" placeholder="https://www.youtube.com/watch?v=..." required />
              </label>
              <label>
                {language === 'am' ? 'ማብራሪያ' : 'Description'}
                <textarea name="description" value={videoFormData.description} onChange={onVideoInputChange} className="form-input" rows={3} />
              </label>
              <label>
                {language === 'am' ? 'ተናጋሪ' : 'Speaker'}
                <input name="speaker" value={videoFormData.speaker} onChange={onVideoInputChange} className="form-input" />
              </label>
              <label>
                {language === 'am' ? 'ምድብ' : 'Category'}
                <input name="category" value={videoFormData.category} onChange={onVideoInputChange} className="form-input" />
              </label>
              <label>
                {language === 'am' ? 'ቆይታ' : 'Duration'}
                <input name="duration" value={videoFormData.duration} onChange={onVideoInputChange} className="form-input" placeholder="e.g. 12:40" />
              </label>
              <label>
                {language === 'am' ? 'Thumbnail URL' : 'Thumbnail URL'}
                <input name="thumbnailUrl" value={videoFormData.thumbnailUrl} onChange={onVideoInputChange} className="form-input" />
              </label>
              <label>
                {language === 'am' ? 'የቅደም ተከተል' : 'Sort Order'}
                <input type="number" name="sortOrder" value={videoFormData.sortOrder} onChange={onVideoInputChange} className="form-input" />
              </label>

              {error && <p className="error-text">{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={videoSubmitting}>
                {videoSubmitting ? (language === 'am' ? 'በመጫን ላይ...' : 'Saving...') : (language === 'am' ? 'ቪዲዮ አክል' : 'Add Video')}
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
                    <p className="text-sm">{video.speaker} {video.category ? `• ${video.category}` : ''} {video.duration ? `• ${video.duration}` : ''}</p>
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
