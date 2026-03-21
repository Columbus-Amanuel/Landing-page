import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { registerUser } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import BrandCrossIcon from '../components/ui/BrandCrossIcon';
import { useLanguage } from '../contexts/LanguageContext';

export default function Register() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  if (user) {
    navigate('/');
    return null;
  }

  const onSubmit = async ({ firstName, lastName, email, password: userPassword }) => {
    setError('');
    setLoading(true);
    try {
      await registerUser(email, userPassword, `${firstName} ${lastName}`);
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError(language === 'am' ? 'ይህ ኢሜይል ቀድሞ ተመዝግቧል።' : 'An account with this email already exists.');
      } else {
        setError(language === 'am' ? 'ምዝገባ አልተሳካም።' : 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-auth">
      <div className="auth-card">
        <div className="auth-header">
          <BrandCrossIcon className="brand-icon large" />
          <h1>{language === 'am' ? 'አካውንት ይፍጠሩ' : 'Create Account'}</h1>
          <p>{language === 'am' ? 'የመስመር ላይ ማህበረሰባችንን ይቀላቀሉ' : 'Join our online community'}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="form-row">
            <div className="form-group">
              <label>{language === 'am' ? 'የመጀመሪያ ስም *' : 'First Name *'}</label>
              <input {...register('firstName', { required: 'Required' })} className="form-input" />
              {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
            </div>
            <div className="form-group">
              <label>{language === 'am' ? 'የአባት ስም *' : 'Last Name *'}</label>
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
            <label>{language === 'am' ? 'የይለፍ ቃል *' : 'Password *'}</label>
            <input
              type="password"
              {...register('password', {
                required: 'Required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
              })}
              className="form-input"
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>
          <div className="form-group">
            <label>{language === 'am' ? 'የይለፍ ቃልን ያረጋግጡ *' : 'Confirm Password *'}</label>
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Required',
                validate: (v) => v === password || 'Passwords do not match',
              })}
              className="form-input"
            />
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-full">
            {loading ? (language === 'am' ? 'በመፍጠር ላይ...' : 'Creating Account...') : (language === 'am' ? 'አካውንት ፍጠር' : 'Create Account')}
          </button>
        </form>

        <div className="auth-footer">
          {language === 'am' ? 'አካውንት አለዎት?' : 'Already have an account?'} <Link to="/login">{language === 'am' ? 'ግባ' : 'Sign In'}</Link>
        </div>
      </div>
    </div>
  );
}
