/**
 * DataHubLogin.jsx
 * src/modules/data-hub/screens/DataHubLogin.jsx
 *
 * Standalone login screen for the Data Hub.
 * Completely separate from the existing WP/Supabase login flow.
 * Route: /data-hub/login
 *
 * Design matches the existing app aesthetic (F4F4F4 bg, FCFCFC cards)
 * but uses a dark branded header to distinguish it from the Event Hub.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataHubAuth } from '../auth/DataHubAuthContext';

export function DataHubLogin() {
  const navigate            = useNavigate();
  const { signIn, loading } = useDataHubAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    setError(null);

    const result = await signIn(email, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/data-hub');
    } else {
      setError(result.error || 'Sign in failed.');
    }
  }

  return (
    <div className="dh-login">
      {/* Dark branded header — visually distinct from Event Hub */}
      <div className="dh-login__header">
        <div className="dh-login__wordmark">
          <span className="dh-login__wordmark-bkstg">BKSTG</span>
          <span className="dh-login__wordmark-hub">DATA HUB</span>
        </div>
        <p className="dh-login__tagline">Analytics &amp; Reports</p>
      </div>

      <div className="dh-login__card">
        <h1 className="dh-login__title">Sign In</h1>
        <p className="dh-login__sub">
          Separate credentials from the Event Hub.
          Contact your admin if you need access.
        </p>

        <form onSubmit={handleSubmit} className="dh-login__form">
          <div className="dh-login__field">
            <label htmlFor="dh-email" className="dh-login__label">Email</label>
            <input
              id="dh-email"
              type="email"
              className="dh-login__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@crssd.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="dh-login__field">
            <label htmlFor="dh-password" className="dh-login__label">Password</label>
            <input
              id="dh-password"
              type="password"
              className="dh-login__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="dh-login__error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="dh-login__submit"
            disabled={submitting || loading}
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="dh-login__access-note">
          <p>Access levels:</p>
          <ul>
            <li><strong>Public analytics</strong> — GA4, Instagram, Mailchimp</li>
            <li><strong>Financial data</strong> — ShowClix, Queue-it (restricted)</li>
            <li><strong>Admin</strong> — All brands, all APIs</li>
          </ul>
        </div>
      </div>

      <button
        className="dh-login__back"
        onClick={() => navigate('/')}
        type="button"
      >
        ← Back to Event Hub
      </button>
    </div>
  );
}
