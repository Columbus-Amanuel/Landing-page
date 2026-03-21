import { useEffect, useState } from 'react';
import { getGivingSettings, updateGivingSettings } from '../../services/siteSettingsService';
import { useSiteSettings, DEFAULT_GIVING } from '../../contexts/SiteSettingsContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AdminFlashMessage from '../../components/ui/AdminFlashMessage';

export default function AdminGiving() {
  const { reloadSettings } = useSiteSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [giving, setGiving] = useState(null);

  useEffect(() => {
    getGivingSettings().then((data) => {
      setGiving(data ? { ...DEFAULT_GIVING, ...data } : { ...DEFAULT_GIVING });
      setLoading(false);
    });
  }, []);

  const set = (field, value) => setGiving((prev) => ({ ...prev, [field]: value }));

  const updateFund = (i, key, value) => {
    const funds = [...(giving.funds || [])];
    funds[i] = { ...funds[i], [key]: value };
    set('funds', funds);
  };

  const removeFund = (i) => set('funds', (giving.funds || []).filter((_, idx) => idx !== i));

  const addFund = () =>
    set('funds', [...(giving.funds || []), { id: '', label: '', labelAm: '', desc: '', descAm: '' }]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateGivingSettings(giving);
      reloadSettings();
      setMessage('Saved successfully.');
    } catch {
      setMessage('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !giving) return <LoadingSpinner center />;

  return (
    <div>
      <h1 className="admin-page-title">Giving Settings</h1>
      <p className="admin-page-subtitle">
        All text fields support both English and Amharic.
      </p>
      <form onSubmit={handleSave} className="admin-form-sections">

        {/* Online Giving */}
        <section className="admin-section">
          <h2>Online Giving</h2>
          <p className="admin-section-hint">
            Enter your payment processor link (Stripe, Tithe.ly, Pushpay, etc.). Leave blank to show a &ldquo;coming soon&rdquo; notice.
          </p>
          <label>
            Online Giving URL
            <input
              className="form-input"
              value={giving.onlineGivingUrl || ''}
              onChange={(e) => set('onlineGivingUrl', e.target.value)}
              placeholder="https://give.example.com/eeucc"
            />
          </label>
        </section>

        {/* Giving Funds */}
        <section className="admin-section">
          <h2>Giving Funds</h2>
          <p className="admin-section-hint">
            Funds appear in the dropdown and the &ldquo;Where Your Giving Goes&rdquo; section on the Give page.
          </p>
          {(giving.funds || []).map((fund, i) => (
            <div key={i} className="admin-array-row admin-array-row-stacked">
              <label>
                Fund ID (used internally, e.g. &ldquo;general&rdquo;)
                <input className="form-input" placeholder="general" value={fund.id || ''} onChange={(e) => updateFund(i, 'id', e.target.value)} />
              </label>
              <div className="bilingual-group">
                <label className="bilingual-label">
                  <span className="bilingual-lang-tag">EN</span> Fund Label
                  <input className="form-input" placeholder="General Fund" value={fund.label || ''} onChange={(e) => updateFund(i, 'label', e.target.value)} />
                </label>
                <label className="bilingual-label">
                  <span className="bilingual-lang-tag am">አማ</span> Fund Label (አማርኛ)
                  <input className="form-input" placeholder="አጠቃላይ ፈንድ" value={fund.labelAm || ''} onChange={(e) => updateFund(i, 'labelAm', e.target.value)} />
                </label>
              </div>
              <div className="bilingual-group">
                <label className="bilingual-label">
                  <span className="bilingual-lang-tag">EN</span> Description
                  <input className="form-input" placeholder="Supports all church ministries..." value={fund.desc || ''} onChange={(e) => updateFund(i, 'desc', e.target.value)} />
                </label>
                <label className="bilingual-label">
                  <span className="bilingual-lang-tag am">አማ</span> Description (አማርኛ)
                  <input className="form-input" placeholder="ሁሉንም አገልግሎቶችን ይደግፋል..." value={fund.descAm || ''} onChange={(e) => updateFund(i, 'descAm', e.target.value)} />
                </label>
              </div>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => removeFund(i)}>Remove Fund</button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={addFund}>+ Add Fund</button>
        </section>

        {/* Give by Mail */}
        <section className="admin-section">
          <h2>Give by Mail</h2>
          <div className="admin-field-grid">
            <label>
              Checks Payable To
              <input className="form-input" value={giving.mailPayableTo || ''} onChange={(e) => set('mailPayableTo', e.target.value)} />
            </label>
          </div>
          <label>
            Mailing Address (shown as-is, supports line breaks)
            <textarea
              className="form-input"
              rows={3}
              value={giving.mailAddress || ''}
              onChange={(e) => set('mailAddress', e.target.value)}
              placeholder="1055 McNaughten Rd&#10;Columbus, OH 43213"
            />
          </label>
        </section>

        {/* Text to Give */}
        <section className="admin-section">
          <h2>Text to Give</h2>
          <p className="admin-section-hint">Leave both fields blank to hide this section on the Give page.</p>
          <div className="admin-field-grid">
            <label>
              Phone Number
              <input className="form-input" value={giving.textNumber || ''} onChange={(e) => set('textNumber', e.target.value)} placeholder="(555) 555-5555" />
            </label>
            <label>
              Keyword
              <input className="form-input" value={giving.textKeyword || ''} onChange={(e) => set('textKeyword', e.target.value)} placeholder="GIVE" />
            </label>
          </div>
        </section>

        {/* Planned Giving Text */}
        <section className="admin-section">
          <h2>Planned Giving Description</h2>
          <p className="admin-section-hint">Paragraph shown under the &ldquo;Planned Giving&rdquo; heading. Leave blank to use the default text.</p>
          <div className="bilingual-group">
            <label className="bilingual-label">
              <span className="bilingual-lang-tag">EN</span> Planned Giving Text
              <textarea className="form-input" rows={3} value={giving.plannedGivingText || ''} onChange={(e) => set('plannedGivingText', e.target.value)} placeholder="Consider leaving a legacy gift in your estate planning…" />
            </label>
            <label className="bilingual-label">
              <span className="bilingual-lang-tag am">አማ</span> Planned Giving Text (አማርኛ)
              <textarea className="form-input" rows={3} value={giving.plannedGivingTextAm || ''} onChange={(e) => set('plannedGivingTextAm', e.target.value)} placeholder="በሀብት ዕቅድዎ ውስጥ ስጦታ ያስቡ…" />
            </label>
          </div>
        </section>

        {/* Scripture */}
        <section className="admin-section">
          <h2>Giving Scripture</h2>
          <div className="bilingual-group">
            <label className="bilingual-label">
              <span className="bilingual-lang-tag">EN</span> Scripture Text
              <textarea className="form-input" rows={3} value={giving.scriptureText || ''} onChange={(e) => set('scriptureText', e.target.value)} />
            </label>
            <label className="bilingual-label">
              <span className="bilingual-lang-tag am">አማ</span> Scripture Text (አማርኛ)
              <textarea className="form-input" rows={3} value={giving.scriptureTextAm || ''} onChange={(e) => set('scriptureTextAm', e.target.value)} />
            </label>
          </div>
          <div className="bilingual-group">
            <label className="bilingual-label">
              <span className="bilingual-lang-tag">EN</span> Citation
              <input className="form-input" value={giving.scriptureCite || ''} onChange={(e) => set('scriptureCite', e.target.value)} placeholder="2 Corinthians 9:7" />
            </label>
            <label className="bilingual-label">
              <span className="bilingual-lang-tag am">አማ</span> Citation (አማርኛ)
              <input className="form-input" value={giving.scriptureCiteAm || ''} onChange={(e) => set('scriptureCiteAm', e.target.value)} placeholder="2 ቆሮንቶስ 9:7" />
            </label>
          </div>
        </section>

        <AdminFlashMessage message={message} />
        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Giving Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
