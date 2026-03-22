import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '../../services/eventsService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const EMPTY_FORM = {
  title: '', titleAm: '',
  description: '', descriptionAm: '',
  details: '', detailsAm: '',
  date: '',
  location: '', locationAm: '',
  imageUrl: '',
  registrationUrl: '',
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await getAllEvents();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEdit = (event) => {
    let dateStr = '';
    if (event.date) {
      const d = event.date.toDate ? event.date.toDate() : new Date(event.date);
      dateStr = format(d, "yyyy-MM-dd'T'HH:mm");
    }
    setForm({
      title: event.title || '',
      titleAm: event.titleAm || '',
      description: event.description || '',
      descriptionAm: event.descriptionAm || '',
      details: event.details || '',
      detailsAm: event.detailsAm || '',
      date: dateStr,
      location: event.location || '',
      locationAm: event.locationAm || '',
      imageUrl: event.imageUrl || '',
      registrationUrl: event.registrationUrl || '',
    });
    setEditingId(event.id);
    setShowForm(true);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.location.trim()) {
      setError('English title, date, and location are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = {
        title: form.title.trim(),
        titleAm: form.titleAm.trim(),
        description: form.description.trim(),
        descriptionAm: form.descriptionAm.trim(),
        details: form.details.trim(),
        detailsAm: form.detailsAm.trim(),
        date: Timestamp.fromDate(new Date(form.date)),
        location: form.location.trim(),
        locationAm: form.locationAm.trim(),
        imageUrl: form.imageUrl.trim(),
        registrationUrl: form.registrationUrl.trim(),
      };
      if (editingId) {
        await updateEvent(editingId, data);
      } else {
        await createEvent(data);
      }
      setShowForm(false);
      setEditingId(null);
      await load();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    await deleteEvent(id);
    await load();
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Events</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Event</button>
      </div>

      {showForm && (
        <div className="admin-card">
          <h2>{editingId ? 'Edit Event' : 'New Event'}</h2>
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

            <label>
              Date &amp; Time *
              <input type="datetime-local" className="form-input" value={form.date} onChange={(e) => setField('date', e.target.value)} required />
            </label>

            <div className="bilingual-group">
              <label className="bilingual-label">
                <span className="bilingual-lang-tag">EN</span> Location *
                <input className="form-input" value={form.location} onChange={(e) => setField('location', e.target.value)} required />
              </label>
              <label className="bilingual-label">
                <span className="bilingual-lang-tag am">አማ</span> Location (አማርኛ)
                <input className="form-input" value={form.locationAm} onChange={(e) => setField('locationAm', e.target.value)} />
              </label>
            </div>

            <div className="bilingual-group">
              <label className="bilingual-label">
                <span className="bilingual-lang-tag">EN</span> Short Description
                <textarea className="form-input" rows={2} value={form.description} onChange={(e) => setField('description', e.target.value)} />
              </label>
              <label className="bilingual-label">
                <span className="bilingual-lang-tag am">አማ</span> Short Description (አማርኛ)
                <textarea className="form-input" rows={2} value={form.descriptionAm} onChange={(e) => setField('descriptionAm', e.target.value)} />
              </label>
            </div>

            <div className="bilingual-group">
              <label className="bilingual-label">
                <span className="bilingual-lang-tag">EN</span> Full Details
                <textarea className="form-input" rows={4} value={form.details} onChange={(e) => setField('details', e.target.value)} />
              </label>
              <label className="bilingual-label">
                <span className="bilingual-lang-tag am">አማ</span> Full Details (አማርኛ)
                <textarea className="form-input" rows={4} value={form.detailsAm} onChange={(e) => setField('detailsAm', e.target.value)} />
              </label>
            </div>

            <label>
              Image URL
              <input className="form-input" value={form.imageUrl} onChange={(e) => setField('imageUrl', e.target.value)} placeholder="https://…" />
            </label>
            <label>
              Registration URL
              <input className="form-input" value={form.registrationUrl} onChange={(e) => setField('registrationUrl', e.target.value)} placeholder="https://…" />
            </label>

            {error && <p className="error-text">{error}</p>}
            <div className="admin-form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Update Event' : 'Create Event'}
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
      ) : events.length === 0 ? (
        <p className="empty-state">No events yet. Click &ldquo;Add Event&rdquo; to create one.</p>
      ) : (
        <div className="admin-list">
          {events.map((event) => {
            const dateObj = event.date?.toDate ? event.date.toDate() : new Date(event.date);
            return (
              <div key={event.id} className="admin-list-item">
                <div className="admin-list-item-info">
                  <h3>{event.title} {event.titleAm && <span className="text-muted">/ {event.titleAm}</span>}</h3>
                  <p className="text-sm text-muted">
                    {format(dateObj, 'MMMM d, yyyy h:mm a')} &bull; {event.location}
                    {event.locationAm && ` / ${event.locationAm}`}
                  </p>
                  {event.description && <p className="text-sm">{event.description}</p>}
                </div>
                <div className="admin-list-item-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(event)}>Edit</button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleDelete(event.id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
