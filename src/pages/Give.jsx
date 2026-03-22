import { useState } from 'react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Give() {
  const { givingSettings } = useSiteSettings();
  const { t, language } = useLanguage();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');

  const am = language === 'am';

  const {
    funds, onlineGivingUrl,
    mailPayableTo, mailAddress,
    textNumber, textKeyword,
    plannedGivingText, plannedGivingTextAm,
    scriptureText, scriptureTextAm,
    scriptureCite, scriptureCiteAm,
  } = givingSettings;

  const givingOptions = [25, 50, 100, 250, 500];

  const handleGiveNow = () => {
    if (onlineGivingUrl) {
      window.open(onlineGivingUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert(t('give.comingSoon'));
    }
  };

  const plannedText = am
    ? plannedGivingTextAm || plannedGivingText || t('give.plannedGivingDefault')
    : plannedGivingText || t('give.plannedGivingDefault');

  const scriptureDisplay = am
    ? scriptureTextAm || scriptureText
    : scriptureText;

  const scriptureCiteDisplay = am
    ? scriptureCiteAm || scriptureCite
    : scriptureCite;

  return (
    <div className="page-give">
      <section className="page-hero">
        <h1>{t('give.heroTitle')}</h1>
        <p>{t('give.heroSubtitle')}</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="give-grid">
            {/* Online Giving */}
            <div className="give-form-wrapper">
              <h2>{t('give.giveOnline')}</h2>
              <p className="give-subtitle">{t('give.giveOnlineSubtitle')}</p>

              <div className="give-form">
                {funds && funds.length > 0 && (
                  <div className="form-group">
                    <label>{t('give.selectFund')}</label>
                    <select className="form-input">
                      {funds.map((f) => (
                        <option key={f.id} value={f.id}>
                          {am && f.labelAm ? f.labelAm : f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>{t('give.frequency')}</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input type="radio" name="frequency" value="one-time" defaultChecked /> {t('give.oneTime')}
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="frequency" value="weekly" /> {t('give.weekly')}
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="frequency" value="monthly" /> {t('give.monthly')}
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('give.amount')}</label>
                  <div className="amount-grid">
                    {givingOptions.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        className={`amount-btn${selectedAmount === amt ? ' selected' : ''}`}
                        onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    className="form-input mt-2"
                    placeholder={t('give.customAmount')}
                    min="1"
                    step="1"
                    value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                  />
                </div>

                {!onlineGivingUrl && (
                  <div className="give-notice">
                    <p>🔒 {t('give.comingSoon')}</p>
                  </div>
                )}

                <button type="button" className="btn btn-primary btn-full btn-lg" onClick={handleGiveNow}>
                  {t('give.giveNow')}
                </button>
              </div>
            </div>

            {/* Other Ways to Give */}
            <div className="give-info">
              <h2>{t('give.otherWays')}</h2>

              {(mailPayableTo || mailAddress) && (
                <div className="give-method">
                  <h3>📮 {t('give.byMail')}</h3>
                  {mailPayableTo && (
                    <p>{t('give.checksPayable')} <strong>{mailPayableTo}</strong> {t('give.mailTo')}</p>
                  )}
                  {mailAddress && <p style={{ whiteSpace: 'pre-line' }}>{mailAddress}</p>}
                </div>
              )}

              {textNumber && (
                <div className="give-method">
                  <h3>📱 {t('give.textToGive')}</h3>
                  <p>
                    {am ? 'ጽሑፍ' : 'Text'} <strong>{textKeyword || 'GIVE'}</strong>{' '}
                    {am ? 'ወደ' : 'to'} <strong>{textNumber}</strong>{' '}
                    {t('give.textInstruction')}
                  </p>
                </div>
              )}

              <div className="give-method">
                <h3>💼 {t('give.plannedGiving')}</h3>
                <p>{plannedText}</p>
              </div>

              {funds && funds.length > 0 && (
                <div className="give-method">
                  <h3>📊 {t('give.whereGivingGoes')}</h3>
                  <ul className="give-breakdown">
                    {funds.map((f) => (
                      <li key={f.id}>
                        <strong>{am && f.labelAm ? f.labelAm : f.label}</strong>
                        {' '}—{' '}
                        {am && f.descAm ? f.descAm : f.desc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {scriptureDisplay && (
                <div className="give-scripture">
                  <blockquote>
                    &ldquo;{scriptureDisplay}&rdquo;
                    {scriptureCiteDisplay && <cite>— {scriptureCiteDisplay}</cite>}
                  </blockquote>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
