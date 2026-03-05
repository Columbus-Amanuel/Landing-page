import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { loginUser, resetPassword } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'reset'
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
    } catch (err) {
      setError('Invalid email or password. Please try again.');
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
    } catch (err) {
      setError('Could not send reset email. Check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-auth">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-icon large">✝</span>
          <h1>{mode === 'login' ? 'Welcome Back' : 'Reset Password'}</h1>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {resetSent && (
          <div className="alert alert-success">
            Reset email sent! Check your inbox.
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleSubmit(onLogin)} className="form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="form-input"
                placeholder="you@example.com"
              />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="form-input"
                placeholder="••••••••"
              />
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onReset)} className="form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="form-input"
                placeholder="you@example.com"
              />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-full">
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          {mode === 'login' ? (
            <>
              <button className="link-btn" onClick={() => setMode('reset')}>Forgot password?</button>
              <span> · </span>
              <Link to="/register">Create an account</Link>
            </>
          ) : (
            <button className="link-btn" onClick={() => setMode('login')}>← Back to Sign In</button>
          )}
        </div>
      </div>
    </div>
  );
}
