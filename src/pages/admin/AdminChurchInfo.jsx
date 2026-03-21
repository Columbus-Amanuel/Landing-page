import { useEffect, useState } from 'react';
import { getChurchInfo, updateChurchInfo } from '../../services/siteSettingsService';
import { useSiteSettings, DEFAULT_CHURCH_INFO } from '../../contexts/SiteSettingsContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AdminFlashMessage from '../../components/ui/AdminFlashMessage';
import { VALUE_ICON_OPTIONS, normalizeValueIconKey } from '../../utils/valueIcons';

function BilingualInput({ label, fieldEn, fieldAm, value, valueAm, onChange }) {
  return (
    <div className="bilingual-group">
      <label className="bilingual-label">
        <span className="bilingual-lang-tag">EN</span> {label}
        <input className="form-input" value={value || ''} onChange={(e) => onChange(fieldEn, e.target.value)} />
      </label>
      <label className="bilingual-label">
        <span className="bilingual-lang-tag am">አማ</span> {label} (አማርኛ)
        <input className="form-input" value={valueAm || ''} onChange={(e) => onChange(fieldAm, e.target.value)} />
      </label>
    </div>
  );
}

function BilingualTextarea({ label, fieldEn, fieldAm, value, valueAm, onChange, rows = 3 }) {
  return (
    <div className="bilingual-group">
      <label className="bilingual-label">
        <span className="bilingual-lang-tag">EN</span> {label}
        <textarea className="form-input" rows={rows} value={value || ''} onChange={(e) => onChange(fieldEn, e.target.value)} />
      </label>
      <label className="bilingual-label">
        <span className="bilingual-lang-tag am">አማ</span> {label} (አማርኛ)
        <textarea className="form-input" rows={rows} value={valueAm || ''} onChange={(e) => onChange(fieldAm, e.target.value)} />
      </label>
    </div>
  );
}

export default function AdminChurchInfo() {
  const { reloadSettings } = useSiteSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [info, setInfo] = useState(null);

  useEffect(() => {
    getChurchInfo().then((data) => {
      setInfo(data ? { ...DEFAULT_CHURCH_INFO, ...data } : { ...DEFAULT_CHURCH_INFO });
      setLoading(false);
    });
  }, []);

  const set = (field, value) => setInfo((prev) => ({ ...prev, [field]: value }));

  const updateArrayItem = (field, index, key, value) => {
    const arr = [...(info[field] || [])];
    arr[index] = { ...arr[index], [key]: value };
    set(field, arr);
  };

  const removeArrayItem = (field, index) => {
    set(field, (info[field] || []).filter((_, i) => i !== index));
  };

  const addArrayItem = (field, template) => {
    set(field, [...(info[field] || []), template]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        ...info,
        values: (info.values || []).map((v) => ({
          ...v,
          icon: normalizeValueIconKey(v.icon),
        })),
      };
      await updateChurchInfo(payload);
      reloadSettings();
      setMessage('Saved successfully.');
    } catch {
      setMessage('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !info) return <LoadingSpinner center />;

  return (
    <div>
      <h1 className="admin-page-title">Church Info</h1>
      <p className="admin-page-subtitle">
        All text fields support both English and Amharic. The website displays the correct language based on the visitor&apos;s selection.
      </p>
      <form onSubmit={handleSave} className="admin-form-sections">

        {/* Basic Info — not bilingual (names are proper nouns / contact details) */}
        <section className="admin-section">
          <h2>Basic Information</h2>
          <div className="admin-field-grid">
            <label>
              Official English Name
              <input className="form-input" value={info.officialName || ''} onChange={(e) => set('officialName', e.target.value)} />
            </label>
            <label>
              Amharic Name
              <input className="form-input" value={info.amharicName || ''} onChange={(e) => set('amharicName', e.target.value)} />
            </label>
            <label>
              Street Address
              <input className="form-input" value={info.address || ''} onChange={(e) => set('address', e.target.value)} />
            </label>
            <label>
              City
              <input className="form-input" value={info.city || ''} onChange={(e) => set('city', e.target.value)} />
            </label>
            <label>
              State
              <input className="form-input" value={info.state || ''} onChange={(e) => set('state', e.target.value)} />
            </label>
            <label>
              ZIP Code
              <input className="form-input" value={info.zip || ''} onChange={(e) => set('zip', e.target.value)} />
            </label>
            <label>
              Phone Number
              <input className="form-input" value={info.phone || ''} onChange={(e) => set('phone', e.target.value)} />
            </label>
            <label>
              Email Address
              <input type="email" className="form-input" value={info.email || ''} onChange={(e) => set('email', e.target.value)} />
            </label>
            <label>
              Facebook URL
              <input className="form-input" value={info.facebookUrl || ''} onChange={(e) => set('facebookUrl', e.target.value)} />
            </label>
            <label>
              YouTube URL
              <input className="form-input" value={info.youtubeUrl || ''} onChange={(e) => set('youtubeUrl', e.target.value)} />
            </label>
          </div>
        </section>

        {/* Service Times */}
        <section className="admin-section">
          <h2>Service Times</h2>
          <p className="admin-section-hint">Displayed on Home, About, Contact, and Footer. Each time entry can have an Amharic day name and note.</p>
          {(info.serviceTimes || []).map((st, i) => (
            <div key={i} className="admin-array-row admin-array-row-stacked">
              <div className="admin-field-grid">
                <label>
                  Day (EN)
                  <input className="form-input" placeholder="Sunday" value={st.day || ''} onChange={(e) => updateArrayItem('serviceTimes', i, 'day', e.target.value)} />
                </label>
                <label>
                  Day (አማርኛ)
                  <input className="form-input" placeholder="እሁድ" value={st.dayAm || ''} onChange={(e) => updateArrayItem('serviceTimes', i, 'dayAm', e.target.value)} />
                </label>
                <label>
                  Time (same for both languages)
                  <input className="form-input" placeholder="4:00 PM – 7:00 PM" value={st.time || ''} onChange={(e) => updateArrayItem('serviceTimes', i, 'time', e.target.value)} />
                </label>
              </div>
              <div className="admin-field-grid">
                <label>
                  Note (EN)
                  <input className="form-input" placeholder="Main Worship Service" value={st.note || ''} onChange={(e) => updateArrayItem('serviceTimes', i, 'note', e.target.value)} />
                </label>
                <label>
                  Note (አማርኛ)
                  <input className="form-input" placeholder="ዋና የአምልኮ አገልግሎት" value={st.noteAm || ''} onChange={(e) => updateArrayItem('serviceTimes', i, 'noteAm', e.target.value)} />
                </label>
              </div>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => removeArrayItem('serviceTimes', i)}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => addArrayItem('serviceTimes', { day: '', dayAm: '', time: '', note: '', noteAm: '' })}>
            + Add Service Time
          </button>
        </section>

        {/* Mission Statement */}
        <section className="admin-section">
          <h2>Mission Statement</h2>
          <p className="admin-section-hint">Shown in the Mission section on the Home page.</p>
          <BilingualTextarea
            label="Mission Statement"
            fieldEn="missionStatement"
            fieldAm="missionStatementAm"
            value={info.missionStatement}
            valueAm={info.missionStatementAm}
            onChange={set}
            rows={3}
          />
        </section>

        {/* Our Story */}
        <section className="admin-section">
          <h2>Our Story</h2>
          <p className="admin-section-hint">Displayed on the About page.</p>
          <BilingualTextarea
            label="Paragraph 1"
            fieldEn="storyPara1"
            fieldAm="storyPara1Am"
            value={info.storyPara1}
            valueAm={info.storyPara1Am}
            onChange={set}
            rows={4}
          />
          <BilingualTextarea
            label="Paragraph 2"
            fieldEn="storyPara2"
            fieldAm="storyPara2Am"
            value={info.storyPara2}
            valueAm={info.storyPara2Am}
            onChange={set}
            rows={4}
          />
        </section>

        {/* Beliefs */}
        <section className="admin-section">
          <h2>What We Believe</h2>
          <p className="admin-section-hint">Displayed as a grid on the About page. Each belief requires an English and Amharic title and description.</p>
          {(info.beliefs || []).map((b, i) => (
            <div key={i} className="admin-array-row admin-array-row-stacked">
              <BilingualInput
                label="Belief Title"
                fieldEn="title"
                fieldAm="titleAm"
                value={b.title}
                valueAm={b.titleAm}
                onChange={(field, val) => updateArrayItem('beliefs', i, field, val)}
              />
              <BilingualTextarea
                label="Description"
                fieldEn="desc"
                fieldAm="descAm"
                value={b.desc}
                valueAm={b.descAm}
                onChange={(field, val) => updateArrayItem('beliefs', i, field, val)}
                rows={2}
              />
              <button type="button" className="btn btn-outline btn-sm" onClick={() => removeArrayItem('beliefs', i)}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => addArrayItem('beliefs', { title: '', titleAm: '', desc: '', descAm: '' })}>
            + Add Belief
          </button>
        </section>

        {/* Core Values */}
        <section className="admin-section">
          <h2>Core Values</h2>
          <p className="admin-section-hint">Shown as feature cards in the Mission section on the Home page.</p>
          {(info.values || []).map((v, i) => (
            <div key={i} className="admin-array-row admin-array-row-stacked">
              <label>
                Icon
                <select
                  className="form-input"
                  value={normalizeValueIconKey(v.icon)}
                  onChange={(e) => updateArrayItem('values', i, 'icon', e.target.value)}
                >
                  {VALUE_ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
              <BilingualInput
                label="Value Title"
                fieldEn="title"
                fieldAm="titleAm"
                value={v.title}
                valueAm={v.titleAm}
                onChange={(field, val) => updateArrayItem('values', i, field, val)}
              />
              <BilingualInput
                label="Short Description"
                fieldEn="desc"
                fieldAm="descAm"
                value={v.desc}
                valueAm={v.descAm}
                onChange={(field, val) => updateArrayItem('values', i, field, val)}
              />
              <button type="button" className="btn btn-outline btn-sm" onClick={() => removeArrayItem('values', i)}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => addArrayItem('values', { icon: 'handRaised', title: '', titleAm: '', desc: '', descAm: '' })}>
            + Add Value
          </button>
        </section>

        <AdminFlashMessage message={message} />
        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
