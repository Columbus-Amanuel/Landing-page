import { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { submitChurchProfileUpdate } from '../services/missingDataService';

export default function ProfileUpdate() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      officialName: 'Ethiopian Emmanuel United Church of Columbus',
      amharicName: 'የኢትዮዽያ አማኑኤል ሕብረት ቤተክርስቲያን በኮለንበስ ኦሃዮ',
      address: '1055 McNaughten Rd, Columbus, OH 43213',
      phone: '(614) 843-5975',
      email: 'emmanuel.ohio1055@gmail.com',
      serviceTimes: 'Sunday 4:00 PM - 7:00 PM',
      foundedYear: '2012 (estimated)',
      socialLinks: 'Facebook: https://facebook.com/p/Ethiopian-Emmanuel-United-Church-of-Columbus-100067210424028/\nYouTube: https://youtube.com/@ethiopianemmanuelunitedchu9591',
      ministryPrograms: '',
      pastorName: '',
      leadershipTeam: '',
      attendanceEstimate: '',
      languagesUsed: 'Amharic, English',
      legalNameOrEntity: '',
      ownershipOrLeaseInfo: 'Location may be shared/leased; please confirm official property arrangement.',
      prayerNeeds: '',
      announcements: '',
      additionalNotes: '',
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError('');

    try {
      await submitChurchProfileUpdate(data, user);
      setShowSuccess(true);
      reset(data);
    } catch {
      setError('Unable to save the form right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-contact">
      <Dialog open={showSuccess} onClose={() => setShowSuccess(false)} className="profile-dialog-overlay">
        <div className="profile-dialog-backdrop" aria-hidden="true" />
        <div className="profile-dialog-container">
          <DialogPanel className="profile-dialog-panel">
            <div className="profile-dialog-icon">&#10003;</div>
            <DialogTitle className="profile-dialog-title">Submission Successful</DialogTitle>
            <p className="profile-dialog-body">
              Thank you. Your update was submitted to Firebase successfully.
            </p>
            <button className="btn btn-primary" onClick={() => setShowSuccess(false)}>
              OK
            </button>
          </DialogPanel>
        </div>
      </Dialog>

      <section className="page-hero">
        <h1>Complete Church Profile</h1>
        <p>
          Help us fill missing information for the website and church records. This page is available to
          logged-in members only.
        </p>
      </section>

      <section className="section">
        <div className="container container-narrow">
          {error && <div className="alert alert-error">{error}</div>}

          <form className="form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label>Official Church Name *</label>
              <input className="form-input" {...register('officialName', { required: 'Required' })} />
              {errors.officialName && <span className="form-error">{errors.officialName.message}</span>}
            </div>

            <div className="form-group">
              <label>Amharic Name</label>
              <input className="form-input" {...register('amharicName')} />
            </div>

            <div className="form-group">
              <label>Address *</label>
              <input className="form-input" {...register('address', { required: 'Required' })} />
              {errors.address && <span className="form-error">{errors.address.message}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input className="form-input" {...register('phone')} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-input" type="email" {...register('email')} />
              </div>
            </div>

            <div className="form-group">
              <label>Main Service Times *</label>
              <input className="form-input" {...register('serviceTimes', { required: 'Required' })} />
              {errors.serviceTimes && <span className="form-error">{errors.serviceTimes.message}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Founding Year</label>
                <input className="form-input" {...register('foundedYear')} />
              </div>
              <div className="form-group">
                <label>Estimated Attendance</label>
                <input className="form-input" {...register('attendanceEstimate')} placeholder="e.g., 120 weekly" />
              </div>
            </div>

            <div className="form-group">
              <label>Pastor / Main Leader Name</label>
              <input className="form-input" {...register('pastorName')} />
            </div>

            <div className="form-group">
              <label>Leadership Team (elders, deacons, board)</label>
              <textarea className="form-input" rows={4} {...register('leadershipTeam')} />
            </div>

            <div className="form-group">
              <label>Languages Used in Worship</label>
              <input className="form-input" {...register('languagesUsed')} />
            </div>

            <div className="form-group">
              <label>Ministries / Programs (youth, children, outreach, etc.)</label>
              <textarea className="form-input" rows={4} {...register('ministryPrograms')} />
            </div>

            <div className="form-group">
              <label>Social Media / Website Links</label>
              <textarea className="form-input" rows={3} {...register('socialLinks')} />
            </div>

            <div className="form-group">
              <label>Legal Registered Name / Nonprofit Entity</label>
              <input className="form-input" {...register('legalNameOrEntity')} />
            </div>

            <div className="form-group">
              <label>Property Ownership / Lease Details</label>
              <textarea className="form-input" rows={3} {...register('ownershipOrLeaseInfo')} />
            </div>

            <div className="form-group">
              <label>Upcoming Announcements for Website Homepage</label>
              <textarea className="form-input" rows={3} {...register('announcements')} />
            </div>

            <div className="form-group">
              <label>Prayer Needs / Special Notes</label>
              <textarea className="form-input" rows={3} {...register('prayerNeeds')} />
            </div>

            <div className="form-group">
              <label>Additional Notes or Corrections</label>
              <textarea className="form-input" rows={4} {...register('additionalNotes')} />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Church Profile Update'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
