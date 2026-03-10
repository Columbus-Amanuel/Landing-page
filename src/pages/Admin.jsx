import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '../services/eventsService';
import { getSermons, createSermon, updateSermon, deleteSermon } from '../services/sermonsService';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// ─── Helpers ────────────────────────────────────────────────────────────────

function toDateStr(firestoreDate) {
  if (!firestoreDate) return '';
  const d = firestoreDate?.toDate ? firestoreDate.toDate() : new Date(firestoreDate);
  return format(d, 'yyyy-MM-dd');
}

function toTimestamp(dateStr) {
  return Timestamp.fromDate(new Date(dateStr));
}

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

// ─── Blank form states ───────────────────────────────────────────────────────

const BLANK_EVENT = { title: '', description: '', date: '', location: '', imageUrl: '' };

const BLANK_SERMON = {
  title: '', speaker: '', date: '', category: 'Message',
  scripture: '', description: '', videoUrl: '', audioUrl: '', thumbnailUrl: '', notesUrl: '',
};

const SERMON_CATEGORIES = ['Message', 'Teaching', 'Special', 'Youth', "Women's", "Men's"];

// ─── Sub-components ──────────────────────────────────────────────────────────

function EventForm({ initial, onSave, onCancel, saving }) {
  const [data, setData] = useState(initial);
  const set = (field) => (e) => setData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.title || !data.date) return;
    onSave({ ...data, date: toTimestamp(data.date) });
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Title *</label>
          <input className="form-input" value={data.title} onChange={set('title')} required />
        </div>
        <div className="form-group">
          <label>Date *</label>
          <input type="date" className="form-input" value={data.date} onChange={set('date')} required />
        </div>
      </div>
      <div className="form-group">
        <label>Location</label>
        <input className="form-input" value={data.location} onChange={set('location')} placeholder="e.g. 1055 McNaughten Rd, Columbus, OH" />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea className="form-input" rows={3} value={data.description} onChange={set('description')} />
      </div>
      <div className="form-group">
        <label>Image URL</label>
        <input className="form-input" value={data.imageUrl} onChange={set('imageUrl')} placeholder="https://..." />
      </div>
      <div className="admin-form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Event'}
        </button>
      </div>
    </form>
  );
}

function SermonForm({ initial, onSave, onCancel, saving }) {
  const [data, setData] = useState(initial);
  const set = (field) => (e) => setData((prev) => ({ ...prev, [field]: e.target.value }));

  const embedPreview = getYouTubeEmbedUrl(data.videoUrl);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.title || !data.date || !data.speaker) return;
    onSave({ ...data, date: toTimestamp(data.date) });
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Title *</label>
          <input className="form-input" value={data.title} onChange={set('title')} required />
        </div>
        <div className="form-group">
          <label>Speaker *</label>
          <input className="form-input" value={data.speaker} onChange={set('speaker')} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Date *</label>
          <input type="date" className="form-input" value={data.date} onChange={set('date')} required />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select className="form-input" value={data.category} onChange={set('category')}>
            {SERMON_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Scripture Reference</label>
        <input className="form-input" value={data.scripture} onChange={set('scripture')} placeholder="e.g. John 3:16" />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea className="form-input" rows={3} value={data.description} onChange={set('description')} />
      </div>
      <div className="form-group">
        <label>YouTube Video URL</label>
        <input
          className="form-input"
          value={data.videoUrl}
          onChange={set('videoUrl')}
          placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
        />
        {data.videoUrl && !embedPreview && (
          <span className="form-error">Invalid YouTube URL — check the link and try again.</span>
        )}
        {embedPreview && (
          <div className="admin-video-preview">
            <iframe src={embedPreview} title="Preview" allowFullScreen />
          </div>
        )}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Audio URL</label>
          <input className="form-input" value={data.audioUrl} onChange={set('audioUrl')} placeholder="https://..." />
        </div>
        <div className="form-group">
          <label>Thumbnail URL</label>
          <input className="form-input" value={data.thumbnailUrl} onChange={set('thumbnailUrl')} placeholder="https://..." />
        </div>
      </div>
      <div className="form-group">
        <label>Sermon Notes URL (PDF)</label>
        <input className="form-input" value={data.notesUrl} onChange={set('notesUrl')} placeholder="https://..." />
      </div>
      <div className="admin-form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Sermon'}
        </button>
      </div>
    </form>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────

export default function Admin() {
  const [tab, setTab] = useState('events');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState(null); // null | 'new' | 'edit'
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = tab === 'events' ? await getAllEvents() : await getSermons(100);
      setItems(data);
    } catch {
      showToast('Failed to load items.', 'error');
    } finally {
      setLoading(false);
    }
  }, [tab, showToast]);

  useEffect(() => {
    setFormMode(null);
    setEditing(null);
    load();
  }, [load]);

  const openNew = () => {
    setEditing(tab === 'events' ? { ...BLANK_EVENT } : { ...BLANK_SERMON });
    setFormMode('new');
  };

  const openEdit = (item) => {
    const dateStr = toDateStr(item.date);
    setEditing({ ...item, date: dateStr });
    setFormMode('edit');
  };

  const closeForm = () => {
    setFormMode(null);
    setEditing(null);
  };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (formMode === 'new') {
        if (tab === 'events') await createEvent(data);
        else await createSermon(data);
        showToast(`${tab === 'events' ? 'Event' : 'Sermon'} created.`, 'success');
      } else {
        const { id, ...rest } = data;
        if (tab === 'events') await updateEvent(id, rest);
        else await updateSermon(id, rest);
        showToast(`${tab === 'events' ? 'Event' : 'Sermon'} updated.`, 'success');
      }
      closeForm();
      load();
    } catch {
      showToast('Save failed. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      if (tab === 'events') await deleteEvent(item.id);
      else await deleteSermon(item.id, null);
      showToast('Deleted.', 'success');
      load();
    } catch {
      showToast('Delete failed.', 'error');
    }
  };

  const formatDate = (firestoreDate) => {
    if (!firestoreDate) return '—';
    try {
      const d = firestoreDate?.toDate ? firestoreDate.toDate() : new Date(firestoreDate);
      return format(d, 'MMM d, yyyy');
    } catch {
      return '—';
    }
  };

  return (
    <div className="page-admin">
      <section className="page-hero">
        <h1>Admin Dashboard</h1>
        <p>Manage events and sermons.</p>
      </section>

      <section className="section">
        <div className="container">

          {/* Tabs */}
          <div className="tab-group">
            <button className={`tab${tab === 'events' ? ' active' : ''}`} onClick={() => setTab('events')}>
              Events
            </button>
            <button className={`tab${tab === 'sermons' ? ' active' : ''}`} onClick={() => setTab('sermons')}>
              Sermons
            </button>
          </div>

          {/* Toolbar */}
          <div className="admin-toolbar">
            <h2 className="admin-section-title">
              {tab === 'events' ? 'All Events' : 'All Sermons'}
              <span className="admin-count">{items.length}</span>
            </h2>
            {!formMode && (
              <button className="btn btn-primary" onClick={openNew}>
                + New {tab === 'events' ? 'Event' : 'Sermon'}
              </button>
            )}
          </div>

          {/* Inline form */}
          {formMode && editing && (
            <div className="admin-form-wrapper">
              <h3 className="admin-form-title">
                {formMode === 'new' ? 'New' : 'Edit'} {tab === 'events' ? 'Event' : 'Sermon'}
              </h3>
              {tab === 'events' ? (
                <EventForm initial={editing} onSave={handleSave} onCancel={closeForm} saving={saving} />
              ) : (
                <SermonForm initial={editing} onSave={handleSave} onCancel={closeForm} saving={saving} />
              )}
            </div>
          )}

          {/* List */}
          {loading ? (
            <LoadingSpinner center />
          ) : items.length === 0 ? (
            <p className="empty-state">No {tab} yet. Create one above.</p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    {tab === 'sermons' && <th>Speaker</th>}
                    {tab === 'sermons' && <th>Category</th>}
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      {tab === 'sermons' && <td>{item.speaker}</td>}
                      {tab === 'sermons' && <td><span className="admin-badge">{item.category}</span></td>}
                      <td>{formatDate(item.date)}</td>
                      <td className="admin-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
