import { useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { ApiError } from '../api/client';
import { ErrorDialog } from '../components/ErrorDialog';
import { useApp } from '../context/AppContext';
import type { PaymentMethod } from '../types';

type Mode = 'login' | 'signup';

function readNextPath(search: string) {
  const params = new URLSearchParams(search);
  return params.get('next') || '/app';
}

export function AuthPage() {
  const { login, signup, currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = useMemo(() => readNextPath(location.search), [location.search]);
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new ApiError('Passwords do not match', 400);
        }

        await signup({ name, email, password, preferredPaymentMethod: paymentMethod });
        setMessage('Profile created successfully.');
      } else {
        await login(email, password);
        setMessage('Signed in successfully.');
      }
      navigate(nextPath);
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : 'Unable to complete authentication');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-panel">
        <div className="auth-top-actions">
          <Link className="button ghost auth-nav-button" to="/">
            <Home size={16} />
            Home
          </Link>
          <button type="button" className="button ghost auth-nav-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        <p className="eyebrow">Workspace access</p>
        <h1>{mode === 'signup' ? 'Create a profile' : 'Sign in to continue'}</h1>
        <p>
          This release now supports password-protected accounts, personal expense tracking, and monthly budget setup.
        </p>

        <div className="auth-switcher">
          <button type="button" className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => setMode('login')}>
            Login
          </button>
          <button type="button" className={mode === 'signup' ? 'tab active' : 'tab'} onClick={() => setMode('signup')}>
            Sign up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' ? (
            <label>
              Full name
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ashutosh Raj" required />
            </label>
          ) : null}

          <label>
            Email address
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="ashutosh@example.com" required />
          </label>

          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Password"
              required
            />
          </label>

          {mode === 'signup' ? (
            <>
              <label>
                Confirm password
                <input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type="password"
                  placeholder="Repeat the password"
                  required
                />
              </label>

              <label>
                Preferred payment method
                <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
                  <option value="ONLINE">ONLINE</option>
                  <option value="CASH">CASH</option>
                </select>
              </label>
            </>
          ) : null}

          <button type="submit" className="button primary full" disabled={busy}>
            {busy ? 'Working...' : mode === 'signup' ? 'Create profile' : 'Sign in'}
          </button>
        </form>

        {message ? <p className="notice success">{message}</p> : null}
        <ErrorDialog message={error} onClose={() => setError(null)} title="Authentication error" />

        {currentUser ? (
          <p className="notice neutral">Signed in as {currentUser.name}. You can switch accounts by logging in again.</p>
        ) : null}
      </section>

      <aside className="auth-side">
        <div className="auth-side-card">
          <p className="eyebrow">What you get</p>
          <h2>Landing page, dashboard, group management, expense entry, and settlement flow.</h2>
          <ul>
            <li>Professional split-expense UI</li>
            <li>Group summaries and member management</li>
            <li>Settlement history with payment actions</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}