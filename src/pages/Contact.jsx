import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { submitContactForm, submitPrayerRequest } from '../services/contactService';
import {
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Contact() {
  const [activeTab, setActiveTab] = useState('contact');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { churchInfo } = useSiteSettings();
  const { t, language } = useLanguage();

  const am = language === 'am';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmitContact = async (data) => {
    setSubmitting(true);
    try {
      await submitContactForm(data);
      setSubmitted(true);
      reset();
    } catch {
      alert(am ? 'ችግር ተፈጥሯል። እንደገና ይሞክሩ።' : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitPrayer = async (data) => {
    setSubmitting(true);
    try {
      await submitPrayerRequest(data);
      setSubmitted(true);
      reset();
    } catch {
      alert(am ? 'ችግር ተፈጥሯል። እንደገና ይሞክሩ።' : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const { address, city, state, zip, phone, email, serviceTimes } = churchInfo;
  const fullAddress = [address, city && state ? `${city}, ${state}` : city || state, zip].filter(Boolean).join(' ');

  if (submitted) {
    return (
      <div className="page-contact">
        <section className="section">
          <div className="container container-narrow text-center">
            <div className="success-state">
              <CheckCircleIcon className="success-icon" aria-hidden />
              <h2>{t('contact.thankYouTitle')}</h2>
              <p>{activeTab === 'contact' ? t('contact.contactThanks') : t('contact.prayerThanks')}</p>
              <button className="btn btn-primary" onClick={() => setSubmitted(false)}>
                {t('contact.sendAnother')}
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-contact">
      <section className="page-hero">
        <h1>{t('contact.heroTitle')}</h1>
        <p>{t('contact.heroSubtitle')}</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Form */}
            <div className="contact-form-wrapper">
              <div className="tab-group">
                <button className={`tab ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>
                  {t('contact.contactTab')}
                </button>
                <button className={`tab ${activeTab === 'prayer' ? 'active' : ''}`} onClick={() => setActiveTab('prayer')}>
                  {t('contact.prayerTab')}
                </button>
              </div>

              {activeTab === 'contact' ? (
                <form onSubmit={handleSubmit(onSubmitContact)} className="form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>{am ? 'የመጀመሪያ ስም' : 'First Name'} *</label>
                      <input {...register('firstName', { required: t('common.required') })} className="form-input" />
                      {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
                    </div>
                    <div className="form-group">
                      <label>{am ? 'የአባት ስም' : 'Last Name'} *</label>
                      <input {...register('lastName', { required: t('common.required') })} className="form-input" />
                      {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('contact.email')} *</label>
                    <input type="email" {...register('email', { required: t('common.required') })} className="form-input" />
                    {errors.email && <span className="form-error">{errors.email.message}</span>}
                  </div>
                  <div className="form-group">
                    <label>{t('contact.phone')}</label>
                    <input type="tel" {...register('phone')} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>{am ? 'ርዕሰ ጉዳይ' : 'Subject'} *</label>
                    <select {...register('subject', { required: t('common.required') })} className="form-input">
                      <option value="">{am ? 'ርዕሰ ጉዳይ ይምረጡ…' : 'Select a topic…'}</option>
                      <option value="General Inquiry">{am ? 'አጠቃላይ ጥያቄ' : 'General Inquiry'}</option>
                      <option value="Membership">{am ? 'አባልነት' : 'Membership'}</option>
                      <option value="Volunteering">{am ? 'በፈቃደኝነት ማገልገል' : 'Volunteering'}</option>
                      <option value="Baptism">{am ? 'ጥምቀት' : 'Baptism'}</option>
                      <option value="Counseling">{am ? 'ምክር' : 'Counseling'}</option>
                      <option value="Other">{am ? 'ሌላ' : 'Other'}</option>
                    </select>
                    {errors.subject && <span className="form-error">{errors.subject.message}</span>}
                  </div>
                  <div className="form-group">
                    <label>{am ? 'መልዕክት' : 'Message'} *</label>
                    <textarea rows={5} {...register('message', { required: t('common.required') })} className="form-input" />
                    {errors.message && <span className="form-error">{errors.message.message}</span>}
                  </div>
                  <button type="submit" disabled={submitting} className="btn btn-primary btn-full">
                    {submitting ? t('contact.sending') : t('contact.sendMessage')}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit(onSubmitPrayer)} className="form">
                  <div className="form-group">
                    <label>{am ? 'ስምዎ' : 'Your Name'}</label>
                    <input {...register('name')} className="form-input" placeholder={am ? 'ሳይታወቅ ካስፈለገ' : 'Anonymous if preferred'} />
                  </div>
                  <div className="form-group">
                    <label>{t('contact.email')} ({am ? 'አማራጭ' : 'optional'})</label>
                    <input type="email" {...register('email')} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>{am ? 'የጸሎት ልመና' : 'Prayer Request'} *</label>
                    <textarea
                      rows={6}
                      {...register('request', { required: am ? 'ልመናዎን ያጋሩ' : 'Please share your request' })}
                      className="form-input"
                      placeholder={am ? 'የጸሎት ልመናዎን እዚህ ያጋሩ…' : 'Share your prayer request here…'}
                    />
                    {errors.request && <span className="form-error">{errors.request.message}</span>}
                  </div>
                  <div className="form-group form-checkbox">
                    <input type="checkbox" id="private" {...register('isPrivate')} />
                    <label htmlFor="private">
                      {am ? 'ልመናውን ሚስጥራዊ ያድርጉ (ለፓስተሩ ብቻ)' : "Keep this request private (pastor's eyes only)"}
                    </label>
                  </div>
                  <button type="submit" disabled={submitting} className="btn btn-primary btn-full">
                    {submitting ? t('contact.submitting') : t('contact.submitPrayer')}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info sidebar */}
            <div className="contact-info">
              <h3>{t('contact.getInTouch')}</h3>
              {fullAddress && (
                <div className="contact-info-item">
                  <MapPinIcon className="contact-info-icon" aria-hidden />
                  <div>
                    <strong>{t('contact.address')}</strong>
                    <p>{address}</p>
                    {city && <p>{city}{state ? `, ${state}` : ''}{zip ? ` ${zip}` : ''}</p>}
                  </div>
                </div>
              )}
              {phone && (
                <div className="contact-info-item">
                  <PhoneIcon className="contact-info-icon" aria-hidden />
                  <div>
                    <strong>{t('contact.phone')}</strong>
                    <a href={`tel:${phone.replace(/\D/g, '')}`}>{phone}</a>
                  </div>
                </div>
              )}
              {email && (
                <div className="contact-info-item">
                  <EnvelopeIcon className="contact-info-icon" aria-hidden />
                  <div>
                    <strong>{t('contact.email')}</strong>
                    <a href={`mailto:${email}`}>{email}</a>
                  </div>
                </div>
              )}
              {serviceTimes && serviceTimes.length > 0 && (
                <div className="contact-info-item">
                  <ClockIcon className="contact-info-icon" aria-hidden />
                  <div>
                    <strong>{t('contact.serviceTimes')}</strong>
                    {serviceTimes.map((st, i) => (
                      <p key={i}>{am && st.dayAm ? st.dayAm : st.day}: {st.time}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
