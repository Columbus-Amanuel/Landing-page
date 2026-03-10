import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { submitContactForm, submitPrayerRequest } from '../services/contactService';
import { useToast } from '../contexts/ToastContext';

export default function Contact() {
  const [activeTab, setActiveTab] = useState('contact');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

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
      showToast('Something went wrong. Please try again.', 'error');
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
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-contact">
        <section className="section">
          <div className="container container-narrow text-center">
            <div className="success-state">
              <span className="success-icon">✅</span>
              <h2>Thank You!</h2>
              <p>
                {activeTab === 'contact'
                  ? 'Your message has been received. We\'ll get back to you within 1-2 business days.'
                  : 'Your prayer request has been received. Our prayer team will be lifting you up.'}
              </p>
              <button className="btn btn-primary" onClick={() => setSubmitted(false)}>
                Send Another
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
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Reach out anytime.</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Form */}
            <div className="contact-form-wrapper">
              <div className="tab-group">
                <button
                  className={`tab ${activeTab === 'contact' ? 'active' : ''}`}
                  onClick={() => setActiveTab('contact')}
                >
                  Contact Us
                </button>
                <button
                  className={`tab ${activeTab === 'prayer' ? 'active' : ''}`}
                  onClick={() => setActiveTab('prayer')}
                >
                  Prayer Request
                </button>
              </div>

              {activeTab === 'contact' ? (
                <form onSubmit={handleSubmit(onSubmitContact)} className="form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input {...register('firstName', { required: 'Required' })} className="form-input" />
                      {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input {...register('lastName', { required: 'Required' })} className="form-input" />
                      {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" {...register('email', { required: 'Required' })} className="form-input" />
                    {errors.email && <span className="form-error">{errors.email.message}</span>}
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" {...register('phone')} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Subject *</label>
                    <select {...register('subject', { required: 'Required' })} className="form-input">
                      <option value="">Select a topic...</option>
                      <option>General Inquiry</option>
                      <option>Membership</option>
                      <option>Volunteering</option>
                      <option>Baptism</option>
                      <option>Counseling</option>
                      <option>Other</option>
                    </select>
                    {errors.subject && <span className="form-error">{errors.subject.message}</span>}
                  </div>
                  <div className="form-group">
                    <label>Message *</label>
                    <textarea rows={5} {...register('message', { required: 'Required' })} className="form-input" />
                    {errors.message && <span className="form-error">{errors.message.message}</span>}
                  </div>
                  <button type="submit" disabled={submitting} className="btn btn-primary btn-full">
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit(onSubmitPrayer)} className="form">
                  <div className="form-group">
                    <label>Your Name</label>
                    <input {...register('name')} className="form-input" placeholder="Anonymous if preferred" />
                  </div>
                  <div className="form-group">
                    <label>Email (optional)</label>
                    <input type="email" {...register('email')} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Prayer Request *</label>
                    <textarea
                      rows={6}
                      {...register('request', { required: 'Please share your request' })}
                      className="form-input"
                      placeholder="Share your prayer request here..."
                    />
                    {errors.request && <span className="form-error">{errors.request.message}</span>}
                  </div>
                  <div className="form-group form-checkbox">
                    <input type="checkbox" id="private" {...register('isPrivate')} />
                    <label htmlFor="private">Keep this request private (pastor's eyes only)</label>
                  </div>
                  <button type="submit" disabled={submitting} className="btn btn-primary btn-full">
                    {submitting ? 'Submitting...' : 'Submit Prayer Request'}
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="contact-info">
              <h3>Get in Touch</h3>
              <div className="contact-info-item">
                <span>📍</span>
                <div>
                  <strong>Address</strong>
                  <p>1055 McNaughten Rd<br />Columbus, OH 43213</p>
                </div>
              </div>
              <div className="contact-info-item">
                <span>📞</span>
                <div>
                  <strong>Phone</strong>
                  <a href="tel:+16148435975">(614) 843-5975</a>
                </div>
              </div>
              <div className="contact-info-item">
                <span>✉️</span>
                <div>
                  <strong>Email</strong>
                  <a href="mailto:emmanuel.ohio1055@gmail.com">emmanuel.ohio1055@gmail.com</a>
                </div>
              </div>
              <div className="contact-info-item">
                <span>🕐</span>
                <div>
                  <strong>Service Hours</strong>
                  <p>Sunday Worship: 1:00 PM – 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
