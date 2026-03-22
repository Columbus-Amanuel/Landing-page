import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import {
  getSermons,
  createSermon,
  updateSermon,
  deleteSermon,
  uploadSermonAudio,
} from '../../services/sermonsService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const CATEGORIES = ['Sunday Message', 'Bible Study', 'Special Series', 'Guest Speaker'];

const EMPTY_FORM = {
  title: '', titleAm: '',
  speaker: '',
  date: '',
  category: 'Sunday Message',
  scripture: '',
  description: '', descriptionAm: '',
  videoUrl: '',
  thumbnailUrl: '',
  notesUrl: '',
};

export default function AdminSermons() {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingAudioPath, setEditingAudioPath] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [audioFile, setAudioFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await getSermons(100);
    setSermons(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setEditingAudioPath(null);
    setAudioFile(null);
    setShowForm(true);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEdit = (sermon) => {
    let dateStr = '';
    if (sermon.date) {
      const d = sermon.date.toDate ? sermon.date.toDate() : new Date(sermon.date);
      dateStr = format(d, 'yyyy-MM-dd');
    }
    setForm({
      title: sermon.title || '',
      titleAm: sermon.titleAm || '',
      speaker: sermon.speaker || '',
      date: dateStr,
      category: sermon.category || 'Sunday Message',
      scripture: sermon.scripture || '',
      description: sermon.description || '',
      descriptionAm: sermon.descriptionAm || '',
      videoUrl: sermon.videoUrl || '',
      thumbnailUrl: sermon.thumbnailUrl || '',
      notesUrl: sermon.notesUrl || '',
    });
    setEditingId(sermon.id);
    setEditingAudioPath(sermon.audioUrl || null);
    setAudioFile(null);
    setShowForm(true);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.speaker.trim() || !form.date) {
      setError('English title, speaker, and date are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = {
        title: form.title.trim(),
        titleAm: form.titleAm.trim(),
        speaker: form.speaker.trim(),
        date: Timestamp.fromDate(new Date(form.date)),
        category: form.category,
        scripture: form.scripture.trim(),
        description: form.description.trim(),
        descriptionAm: form.descriptionAm.trim(),
        videoUrl: form.videoUrl.trim(),
        thumbnailUrl: form.thumbnailUrl.trim(),
        notesUrl: form.notesUrl.trim(),
      };

      let sermonId = editingId;
      if (editingId) {
        await updateSermon(editingId, data);
      } else {
        const ref = await createSermon(data);
        sermonId = ref.id;
      }

      if (audioFile && sermonId) {
        setUploadProgress(1);
        const audioUrl = await uploadSermonAudio(audioFile, sermonId, setUploadProgress);
        await updateSermon(sermonId, { audioUrl, audioPath: `sermons/audio/${sermonId}/${audioFile.name}` });
      }

      setShowForm(false);
      setEditingId(null);
      setEditingAudioPath(null);
      setUploadProgress(0);
      await load();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sermon) => {
    if (!window.confirm('Delete this sermon? This cannot be undone.')) return;
    await deleteSermon(sermon.id, sermon.audioPath);
    await load();
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Sermons</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Sermon</button>
      </div>

      {showForm && (
        <div className="admin-card">
          <h2>{editingId ? 'Edit Sermon' : 'New Sermon'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">

            <div className="bilingual-group">
              <label className="bilingual-label">
                <span className="bilingual-lang-tag">EN</span> Title *
                <input className="form-input" value={form.title} onChange={(e) => setField('title', e.target.value)} required />
              </label>
              <label className="bilingual-label">
                <span className="bilingual-lang-tag am">አማ</span> Title (አማርኛ)
                <input className="form-input" value={form.titleAm} onChange={(e) => setField('titleAm', e.target.value)} />
              </label>
            </div>

            <div className="admin-field-grid">
              <label>
                Speaker *
                <input className="form-input" value={form.speaker} onChange={(e) => setField('speaker', e.target.value)} required />
              </label>
              <label>
                Date *
                <input type="date" className="form-input" value={form.date} onChange={(e) => setField('date', e.target.value)} required />
              </label>
              <label>
                Category
                <select className="form-input" value={form.category} onChange={(e) => setField('category', e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label>
                Scripture Reference
                <input className="form-input" value={form.scripture} onChange={(e) => setField('scripture', e.target.value)} placeholder="e.g. John 3:16–17" />
              </label>
            </div>

            <div className="bilingual-group">
              <label className="bilingual-label">
                <span className="bilingual-lang-tag">EN</span> Description
                <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setField('description', e.target.value)} />
              </label>
              <label className="bilingual-label">
                <span className="bilingual-lang-tag am">አማ</span> Description (አማርኛ)
                <textarea className="form-input" rows={3} value={form.descriptionAm} onChange={(e) => setField('descriptionAm', e.target.value)} />
              </label>
            </div>

            <label>
              Video URL (YouTube or direct link)
              <input className="form-input" value={form.videoUrl} onChange={(e) => setField('videoUrl', e.target.value)} placeholder="https://youtube.com/watch?v=…" />
            </label>
            <label>
              Thumbnail URL
              <input className="form-input" value={form.thumbnailUrl} onChange={(e) => setField('thumbnailUrl', e.target.value)} placeholder="https://…" />
            </label>
            <label>
              Notes / Outline URL
              <input className="form-input" value={form.notesUrl} onChange={(e) => setField('notesUrl', e.target.value)} placeholder="https://…" />
            </label>
            <label>
              Audio File (MP3 / M4A)
              {editingAudioPath && (
                <p className="admin-section-hint">Audio already uploaded. Upload a new file to replace it.</p>
              )}
              <input type="file" accept="audio/*" className="form-input" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
            </label>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="upload-progress-wrapper">
                <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
                <span className="upload-progress-label">{Math.round(uploadProgress)}%</span>
              </div>
            )}

            {error && <p className="error-text">{error}</p>}
            <div className="admin-form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Update Sermon' : 'Create Sermon'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingSpinner center />
      ) : sermons.length === 0 ? (
        <p className="empty-state">No sermons yet. Click &ldquo;Add Sermon&rdquo; to create one.</p>
      ) : (
        <div className="admin-list">
          {sermons.map((sermon) => {
            const dateObj = sermon.date?.toDate ? sermon.date.toDate() : new Date(sermon.date);
            return (
              <div key={sermon.id} className="admin-list-item">
                <div className="admin-list-item-info">
                  <h3>
                    {sermon.title}
                    {sermon.titleAm && <span className="text-muted"> / {sermon.titleAm}</span>}
                  </h3>
                  <p className="text-sm text-muted">
                    {format(dateObj, 'MMMM d, yyyy')} &bull; {sermon.speaker} &bull; {sermon.category}
                  </p>
                  {sermon.scripture && <p className="text-sm">{sermon.scripture}</p>}
                  <div className="admin-list-item-badges">
                    {sermon.videoUrl && <span className="badge badge-info">Video</span>}
                    {sermon.audioUrl && <span className="badge badge-info">Audio</span>}
                    {sermon.notesUrl && <span className="badge badge-info">Notes</span>}
                    {sermon.titleAm && <span className="badge badge-info">አማርኛ</span>}
                  </div>
                </div>
                <div className="admin-list-item-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(sermon)}>Edit</button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleDelete(sermon)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
