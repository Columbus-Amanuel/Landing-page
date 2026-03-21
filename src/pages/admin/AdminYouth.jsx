import { useEffect, useState } from 'react';
import {
  createYouthVideo,
  defaultYouthPageFormState,
  deleteYouthVideo,
  getYouthPageContent,
  getYouthVideos,
  normalizeYouthPageContent,
  updateYouthPageContent,
  updateYouthVideo,
} from '../../services/youthVideosService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AdminFlashMessage from '../../components/ui/AdminFlashMessage';
import { useLanguage } from '../../contexts/LanguageContext';

const PAGE_SECTIONS = [
  {
    title: 'Hero',
    fields: [
      { key: 'heroTitleEn', label: 'Hero title (EN)' },
      { key: 'heroTitleAm', label: 'Hero title (Amharic)' },
      { key: 'heroSubtitleEn', label: 'Hero subtitle (EN)', multiline: true },
      { key: 'heroSubtitleAm', label: 'Hero subtitle (Amharic)', multiline: true },
    ],
  },
  {
    title: 'Intro spotlight (optional)',
    fields: [
      { key: 'introTitleEn', label: 'Intro title (EN)' },
      { key: 'introTitleAm', label: 'Intro title (Amharic)' },
      { key: 'introBodyEn', label: 'Intro body (EN)', multiline: true },
      { key: 'introBodyAm', label: 'Intro body (Amharic)', multiline: true },
    ],
  },
  {
    title: 'Stats row (“At a glance”)',
    fields: [
      { key: 'statsSectionTitleEn', label: 'Section title (EN)' },
      { key: 'statsSectionTitleAm', label: 'Section title (Amharic)' },
      { key: 'stat1Value', label: 'Stat 1 value (e.g. 4:00 PM)' },
      { key: 'stat1LabelEn', label: 'Stat 1 label (EN)' },
      { key: 'stat1LabelAm', label: 'Stat 1 label (Amharic)' },
      { key: 'stat2Value', label: 'Stat 2 value' },
      { key: 'stat2LabelEn', label: 'Stat 2 label (EN)' },
      { key: 'stat2LabelAm', label: 'Stat 2 label (Amharic)' },
      { key: 'stat3Value', label: 'Stat 3 value' },
      { key: 'stat3LabelEn', label: 'Stat 3 label (EN)' },
      { key: 'stat3LabelAm', label: 'Stat 3 label (Amharic)' },
    ],
  },
  {
    title: 'Ministry cards section',
    fields: [
      { key: 'ministrySectionTitleEn', label: 'Section title (EN)' },
      { key: 'ministrySectionTitleAm', label: 'Section title (Amharic)' },
      { key: 'cardOneTitleEn', label: 'Card 1 title (EN)' },
      { key: 'cardOneTitleAm', label: 'Card 1 title (Amharic)' },
      { key: 'cardOneDescriptionEn', label: 'Card 1 description (EN)', multiline: true },
      { key: 'cardOneDescriptionAm', label: 'Card 1 description (Amharic)', multiline: true },
      { key: 'cardTwoTitleEn', label: 'Card 2 title (EN)' },
      { key: 'cardTwoTitleAm', label: 'Card 2 title (Amharic)' },
      { key: 'cardTwoDescriptionEn', label: 'Card 2 description (EN)', multiline: true },
      { key: 'cardTwoDescriptionAm', label: 'Card 2 description (Amharic)', multiline: true },
      { key: 'cardThreeTitleEn', label: 'Card 3 title (EN)' },
      { key: 'cardThreeTitleAm', label: 'Card 3 title (Amharic)' },
      { key: 'cardThreeDescriptionEn', label: 'Card 3 description (EN)', multiline: true },
      { key: 'cardThreeDescriptionAm', label: 'Card 3 description (Amharic)', multiline: true },
    ],
  },
  {
    title: 'FAQ section',
    fields: [
      { key: 'faqSectionTitleEn', label: 'Section title (EN)' },
      { key: 'faqSectionTitleAm', label: 'Section title (Amharic)' },
    ],
  },
  {
    title: 'Videos section',
    fields: [
      { key: 'videosSectionTitleEn', label: 'Section title (EN)' },
      { key: 'videosSectionTitleAm', label: 'Section title (Amharic)' },
      { key: 'emptyVideosMessageEn', label: 'Empty state message (EN)' },
      { key: 'emptyVideosMessageAm', label: 'Empty state message (Amharic)' },
    ],
  },
  {
    title: 'Bottom call-to-action',
    fields: [
      { key: 'ctaTitleEn', label: 'CTA heading (EN)' },
      { key: 'ctaTitleAm', label: 'CTA heading (Amharic)' },
      { key: 'ctaButtonEn', label: 'Button label (EN)' },
      { key: 'ctaButtonAm', label: 'Button label (Amharic)' },
      { key: 'ctaHref', label: 'Button link (e.g. /contact or https://…)' },
    ],
  },
];

const emptyVideoForm = () => ({
  title: '',
  titleAm: '',
  description: '',
  descriptionAm: '',
  url: '',
  speaker: '',
  category: '',
  duration: '',
  thumbnailUrl: '',
  sortOrder: 0,
});

export default function AdminYouth() {
  const { language } = useLanguage();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoSubmitting, setVideoSubmitting] = useState(false);
  const [contentSubmitting, setContentSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [contentMessage, setContentMessage] = useState('');
  const [videoFormData, setVideoFormData] = useState(emptyVideoForm);
  const [pageFormData, setPageFormData] = useState(defaultYouthPageFormState);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editVideoForm, setEditVideoForm] = useState(emptyVideoForm);
  const [videoUpdateSubmitting, setVideoUpdateSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [videoList, pageContent] = await Promise.all([getYouthVideos(), getYouthPageContent()]);
      setVideos(videoList);
      setPageFormData(normalizeYouthPageContent(pageContent));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

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

  const addFaq = () => {
    setPageFormData((prev) => ({
      ...prev,
      faqs: [...(prev.faqs || []), { questionEn: '', questionAm: '', answerEn: '', answerAm: '' }],
    }));
  };

  const removeFaq = (index) => {
    setPageFormData((prev) => ({
      ...prev,
      faqs: (prev.faqs || []).filter((_, i) => i !== index),
    }));
  };

  const onFaqChange = (index, field, value) => {
    setPageFormData((prev) => {
      const next = [...(prev.faqs || [])];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, faqs: next };
    });
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
        titleAm: videoFormData.titleAm.trim(),
        description: videoFormData.description.trim(),
        descriptionAm: videoFormData.descriptionAm.trim(),
        url: videoFormData.url.trim(),
        speaker: videoFormData.speaker.trim(),
        category: videoFormData.category.trim(),
        duration: videoFormData.duration.trim(),
        thumbnailUrl: videoFormData.thumbnailUrl.trim(),
        sortOrder: Number(videoFormData.sortOrder) || 0,
      });
      setVideoFormData(emptyVideoForm());
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
    if (!window.confirm('Delete this video?')) return;
    await deleteYouthVideo(id);
    if (editingVideoId === id) {
      setEditingVideoId(null);
    }
    await loadData();
  };

  const startEditVideo = (video) => {
    setEditingVideoId(video.id);
    setEditVideoForm({
      title: video.title || '',
      titleAm: video.titleAm || '',
      description: video.description || '',
      descriptionAm: video.descriptionAm || '',
      url: video.url || '',
      speaker: video.speaker || '',
      category: video.category || '',
      duration: video.duration || '',
      thumbnailUrl: video.thumbnailUrl || '',
      sortOrder: Number(video.sortOrder) || 0,
    });
  };

  const cancelEditVideo = () => {
    setEditingVideoId(null);
  };

  const onEditVideoChange = (event) => {
    const { name, value } = event.target;
    setEditVideoForm((prev) => ({
      ...prev,
      [name]: name === 'sortOrder' ? Number(value) : value,
    }));
  };

  const handleUpdateVideo = async (event) => {
    event.preventDefault();
    if (!editingVideoId) return;
    setVideoUpdateSubmitting(true);
    try {
      await updateYouthVideo(editingVideoId, {
        title: editVideoForm.title.trim(),
        titleAm: editVideoForm.titleAm.trim(),
        description: editVideoForm.description.trim(),
        descriptionAm: editVideoForm.descriptionAm.trim(),
        url: editVideoForm.url.trim(),
        speaker: editVideoForm.speaker.trim(),
        category: editVideoForm.category.trim(),
        duration: editVideoForm.duration.trim(),
        thumbnailUrl: editVideoForm.thumbnailUrl.trim(),
        sortOrder: Number(editVideoForm.sortOrder) || 0,
      });
      setEditingVideoId(null);
      await loadData();
    } catch {
      setError(language === 'am' ? 'ቪዲዮ ማዘመን አልተሳካም።' : 'Unable to update video.');
    } finally {
      setVideoUpdateSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="admin-page-title">
        {language === 'am' ? 'የወጣቶች እና ህፃናት ገጽ' : 'Youth & Children'}
      </h1>

      <div className="admin-card">
        <h2>{language === 'am' ? 'የገጽ ይዘት (EN/AM)' : 'Page content (all public copy)'}</h2>
        <form onSubmit={handlePageSubmit} className="admin-form">
          {PAGE_SECTIONS.map((section) => (
            <fieldset key={section.title} className="admin-fieldset">
              <legend>{section.title}</legend>
              <div className="admin-form-grid">
                {section.fields.map(({ key, label, multiline }) => (
                  <label key={key}>
                    {label}
                    {multiline ? (
                      <textarea
                        name={key}
                        value={pageFormData[key] || ''}
                        onChange={onPageInputChange}
                        className="form-input"
                        rows={3}
                      />
                    ) : (
                      <input
                        name={key}
                        value={pageFormData[key] || ''}
                        onChange={onPageInputChange}
                        className="form-input"
                      />
                    )}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          <fieldset className="admin-fieldset">
            <legend>FAQ items</legend>
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>
              Add questions and answers for the accordion on the public page. Leave rows empty to hide them.
            </p>
            {(pageFormData.faqs || []).map((faq, index) => (
              <div key={index} className="admin-faq-row">
                <div className="admin-form-grid">
                  <label>
                    Question (EN)
                    <input
                      value={faq.questionEn || ''}
                      onChange={(e) => onFaqChange(index, 'questionEn', e.target.value)}
                      className="form-input"
                    />
                  </label>
                  <label>
                    Question (Amharic)
                    <input
                      value={faq.questionAm || ''}
                      onChange={(e) => onFaqChange(index, 'questionAm', e.target.value)}
                      className="form-input"
                    />
                  </label>
                  <label>
                    Answer (EN)
                    <textarea
                      value={faq.answerEn || ''}
                      onChange={(e) => onFaqChange(index, 'answerEn', e.target.value)}
                      className="form-input"
                      rows={2}
                    />
                  </label>
                  <label>
                    Answer (Amharic)
                    <textarea
                      value={faq.answerAm || ''}
                      onChange={(e) => onFaqChange(index, 'answerAm', e.target.value)}
                      className="form-input"
                      rows={2}
                    />
                  </label>
                </div>
                <button type="button" className="btn btn-outline btn-sm admin-faq-remove" onClick={() => removeFaq(index)}>
                  Remove FAQ
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" onClick={addFaq}>
              Add FAQ
            </button>
          </fieldset>

          <AdminFlashMessage message={contentMessage} />
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={contentSubmitting}>
              {contentSubmitting ? 'Saving…' : (language === 'am' ? 'የገጽ ይዘት አስቀምጥ' : 'Save page content')}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h2>{language === 'am' ? 'አዲስ ቪዲዮ አክል' : 'Add new video'}</h2>
        <form onSubmit={handleVideoSubmit} className="admin-form">
          <div className="admin-form-grid">
            <label>
              {language === 'am' ? 'ርዕስ (EN)' : 'Title (EN)'}
              <input name="title" value={videoFormData.title} onChange={onVideoInputChange} className="form-input" />
            </label>
            <label>
              {language === 'am' ? 'ርዕስ (አማ)' : 'Title (Amharic)'}
              <input name="titleAm" value={videoFormData.titleAm} onChange={onVideoInputChange} className="form-input" />
            </label>
          </div>
          <label>
            YouTube URL *
            <input
              name="url"
              value={videoFormData.url}
              onChange={onVideoInputChange}
              className="form-input"
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </label>
          <div className="admin-form-grid">
            <label>
              {language === 'am' ? 'ማብራሪያ (EN)' : 'Description (EN)'}
              <textarea name="description" value={videoFormData.description} onChange={onVideoInputChange} className="form-input" rows={3} />
            </label>
            <label>
              {language === 'am' ? 'ማብራሪያ (አማ)' : 'Description (Amharic)'}
              <textarea name="descriptionAm" value={videoFormData.descriptionAm} onChange={onVideoInputChange} className="form-input" rows={3} />
            </label>
          </div>
          <div className="admin-field-grid">
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
              {language === 'am' ? 'የቅደም ተከተል' : 'Sort order'}
              <input type="number" name="sortOrder" value={videoFormData.sortOrder} onChange={onVideoInputChange} className="form-input" />
            </label>
          </div>
          <label>
            Thumbnail URL (optional — defaults to YouTube still)
            <input name="thumbnailUrl" value={videoFormData.thumbnailUrl} onChange={onVideoInputChange} className="form-input" />
          </label>
          {error && <p className="error-text">{error}</p>}
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={videoSubmitting}>
              {videoSubmitting ? (language === 'am' ? 'በመጫን ላይ…' : 'Saving…') : (language === 'am' ? 'ቪዲዮ አክል' : 'Add video')}
            </button>
          </div>
        </form>
      </div>

      <h2 className="section-title">{language === 'am' ? 'የተጨመሩ ቪዲዮዎች' : 'Videos'}</h2>
      {loading ? (
        <LoadingSpinner center />
      ) : videos.length === 0 ? (
        <p className="empty-state text-center">
          {language === 'am' ? 'ምንም ቪዲዮ አልተጨመረም።' : 'No videos added yet.'}
        </p>
      ) : (
        <div className="admin-list">
          {videos.map((video) => (
            <div key={video.id} className="admin-list-item admin-list-item-stack">
              {editingVideoId === video.id ? (
                <form onSubmit={handleUpdateVideo} className="admin-form admin-form-tight">
                  <div className="admin-form-grid">
                    <label>
                      Title (EN)
                      <input name="title" value={editVideoForm.title} onChange={onEditVideoChange} className="form-input" />
                    </label>
                    <label>
                      Title (Amharic)
                      <input name="titleAm" value={editVideoForm.titleAm} onChange={onEditVideoChange} className="form-input" />
                    </label>
                  </div>
                  <label>
                    YouTube URL *
                    <input name="url" value={editVideoForm.url} onChange={onEditVideoChange} className="form-input" required />
                  </label>
                  <div className="admin-form-grid">
                    <label>
                      Description (EN)
                      <textarea name="description" value={editVideoForm.description} onChange={onEditVideoChange} className="form-input" rows={2} />
                    </label>
                    <label>
                      Description (Amharic)
                      <textarea name="descriptionAm" value={editVideoForm.descriptionAm} onChange={onEditVideoChange} className="form-input" rows={2} />
                    </label>
                  </div>
                  <div className="admin-field-grid">
                    <label>
                      Speaker
                      <input name="speaker" value={editVideoForm.speaker} onChange={onEditVideoChange} className="form-input" />
                    </label>
                    <label>
                      Category
                      <input name="category" value={editVideoForm.category} onChange={onEditVideoChange} className="form-input" />
                    </label>
                    <label>
                      Duration
                      <input name="duration" value={editVideoForm.duration} onChange={onEditVideoChange} className="form-input" />
                    </label>
                    <label>
                      Sort order
                      <input type="number" name="sortOrder" value={editVideoForm.sortOrder} onChange={onEditVideoChange} className="form-input" />
                    </label>
                  </div>
                  <label>
                    Thumbnail URL
                    <input name="thumbnailUrl" value={editVideoForm.thumbnailUrl} onChange={onEditVideoChange} className="form-input" />
                  </label>
                  <div className="admin-form-actions">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={videoUpdateSubmitting}>
                      {videoUpdateSubmitting ? 'Saving…' : 'Save changes'}
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={cancelEditVideo}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="admin-list-item-info">
                    <h3>{video.title || video.titleAm || 'Untitled video'}</h3>
                    <p className="text-sm text-muted">{video.url}</p>
                    <p className="text-sm">
                      {[video.speaker, video.category, video.duration].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                  <div className="admin-list-item-actions">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => startEditVideo(video)}>
                      {language === 'am' ? 'አርም' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleDelete(video.id)}
                    >
                      {language === 'am' ? 'ሰርዝ' : 'Delete'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
