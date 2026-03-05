import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { loginUser, resetPassword } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Login() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  if (user) {
    navigate('/');
    return null;
  }

  const onLogin = async ({ email, password }) => {
    setError('');
    setLoading(true);
    try {
      await loginUser(email, password);
      navigate('/');
    } catch {
      setError(language === 'am' ? 'የኢሜይል ወይም የይለፍ ቃል ስህተት አለ።' : 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onReset = async ({ email }) => {
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch {
      setError(language === 'am' ? 'የመመለሻ ኢሜይል መላክ አልተቻለም።' : 'Could not send reset email. Check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-auth">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-icon large">✝</span>
          <h1>{mode === 'login' ? (language === 'am' ? 'እንኳን ደህና መጡ' : 'Welcome Back') : (language === 'am' ? 'የይለፍ ቃል ዳግም ማቀናበር' : 'Reset Password')}</h1>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {resetSent && <div className="alert alert-success">{language === 'am' ? 'የመመለሻ ኢሜይል ተልኳል!' : 'Reset email sent! Check your inbox.'}</div>}

        {mode === 'login' ? (
          <form onSubmit={handleSubmit(onLogin)} className="form">
            <div className="form-group">
              <label>Email</label>
              <input type="email" {...register('email', { required: 'Email is required' })} className="form-input" placeholder="you@example.com" />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>
            <div className="form-group">
              <label>{language === 'am' ? 'የይለፍ ቃል' : 'Password'}</label>
              <input type="password" {...register('password', { required: 'Password is required' })} className="form-input" placeholder="••••••••" />
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-full">{loading ? (language === 'am' ? 'በመግባት ላይ...' : 'Signing in...') : t('common.signIn')}</button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onReset)} className="form">
            <div className="form-group">
              <label>Email</label>
              <input type="email" {...register('email', { required: 'Email is required' })} className="form-input" placeholder="you@example.com" />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-full">{loading ? (language === 'am' ? 'በመላክ ላይ...' : 'Sending...') : (language === 'am' ? 'የመመለሻ ኢሜይል ላክ' : 'Send Reset Email')}</button>
          </form>
        )}

        <div className="auth-footer">
          {mode === 'login' ? (
            <>
              <button className="link-btn" onClick={() => setMode('reset')}>{language === 'am' ? 'የይለፍ ቃል ረሱ?' : 'Forgot password?'}</button>
              <span> · </span>
              <Link to="/register">{language === 'am' ? 'አካውንት ይፍጠሩ' : 'Create an account'}</Link>
            </>
          ) : (
            <button className="link-btn" onClick={() => setMode('login')}>← {language === 'am' ? 'ወደ መግቢያ ተመለስ' : 'Back to Sign In'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
