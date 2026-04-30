import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, KeyRound, UserRoundPen } from 'lucide-react';
import { ApiError } from '../api/client';
import { ErrorDialog } from '../components/ErrorDialog';
import { useApp } from '../context/AppContext';
import type { PaymentMethod } from '../types';

type Mode = 'login' | 'signup' | 'forgot';
type AccountTab = 'upi' | 'password';
type ForgotStep = 'request' | 'reset';

function readNextPath(search: string) {
  const params = new URLSearchParams(search);
  return params.get('next') || '/app';
}

export function AuthPage() {
  const {
    login,
    signup,
    currentUser,
    logout,
    sendPasswordResetOtp,
    resetPasswordWithOtp,
    updateUserUpiId,
    updateUserPassword
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = useMemo(() => readNextPath(location.search), [location.search]);
  const [mode, setMode] = useState<Mode>('login');
  const [accountTab, setAccountTab] = useState<AccountTab>('upi');
  const [forgotStep, setForgotStep] = useState<ForgotStep>('request');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [upiId, setUpiId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [oldUpiId, setOldUpiId] = useState('');
  const [newUpiId, setNewUpiId] = useState('');
  const [confirmNewUpiId, setConfirmNewUpiId] = useState('');
  const [oldAccountPassword, setOldAccountPassword] = useState('');
  const [newAccountPassword, setNewAccountPassword] = useState('');
  const [confirmAccountPassword, setConfirmAccountPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const hasNextTarget = location.search.includes('next=');

  useEffect(() => {
    if (currentUser) {
      setOldUpiId(currentUser.upiId || '');
    }
  }, [currentUser]);

  useEffect(() => {
    if (mode === 'forgot') {
      setForgotStep('request');
      setForgotOtp('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setForgotEmail((previous) => previous || email);
    }
  }, [email, mode]);

  useEffect(() => {
    if (currentUser && hasNextTarget) {
      navigate(nextPath, { replace: true });
    }
  }, [currentUser, hasNextTarget, navigate, nextPath]);

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

        await signup({ name, email, upiId, password, preferredPaymentMethod: paymentMethod });
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

  async function handleForgotSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      if (forgotStep === 'request') {
        const response = await sendPasswordResetOtp(forgotEmail);
        setMessage(response);
        setForgotStep('reset');
      } else {
        if (forgotNewPassword !== forgotConfirmPassword) {
          throw new ApiError('Passwords do not match', 400);
        }

        const response = await resetPasswordWithOtp(forgotEmail, forgotOtp, forgotNewPassword);
        setMessage(response);
        setMode('login');
        setEmail(forgotEmail.trim());
        setPassword('');
        setConfirmPassword('');
        setUpiId('');
        setForgotStep('request');
        setForgotOtp('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
      }
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : 'Unable to reset password');
    } finally {
      setBusy(false);
    }
  }

  async function handleUpiUpdateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      if (newUpiId !== confirmNewUpiId) {
        throw new ApiError('UPI IDs do not match', 400);
      }

      const response = await updateUserUpiId(oldUpiId, newUpiId);
      setMessage(response);
      setOldUpiId(newUpiId.trim());
      setNewUpiId('');
      setConfirmNewUpiId('');
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : 'Unable to update UPI ID');
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordUpdateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      if (newAccountPassword !== confirmAccountPassword) {
        throw new ApiError('Passwords do not match', 400);
      }

      const response = await updateUserPassword(oldAccountPassword, newAccountPassword);
      setMessage(response);
      setOldAccountPassword('');
      setNewAccountPassword('');
      setConfirmAccountPassword('');
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : 'Unable to update password');
    } finally {
      setBusy(false);
    }
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError(null);
    setMessage(null);
    if (nextMode === 'forgot') {
      setForgotEmail(email.trim());
      setForgotStep('request');
      setForgotOtp('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
    }
  }

  function renderPrimaryAuthForm() {
    if (mode === 'forgot') {
      return (
        <form className="auth-form" onSubmit={handleForgotSubmit}>
          <div className="form-grid">
            <label className="wide">
              Email address
              <input
                value={forgotEmail}
                onChange={(event) => setForgotEmail(event.target.value)}
                type="email"
                placeholder="ashutosh@example.com"
                required
              />
            </label>

            {forgotStep === 'reset' ? (
              <>
                <label>
                  One-time code
                  <input
                    value={forgotOtp}
                    onChange={(event) => setForgotOtp(event.target.value)}
                    placeholder="Enter the OTP"
                    required
                  />
                </label>

                <label>
                  New password
                  <input
                    value={forgotNewPassword}
                    onChange={(event) => setForgotNewPassword(event.target.value)}
                    type="password"
                    placeholder="Create a new password"
                    required
                  />
                </label>

                <label className="wide">
                  Confirm new password
                  <input
                    value={forgotConfirmPassword}
                    onChange={(event) => setForgotConfirmPassword(event.target.value)}
                    type="password"
                    placeholder="Repeat the new password"
                    required
                  />
                </label>
              </>
            ) : null}
          </div>

          <div className="form-actions auth-actions">
            <button type="submit" className="button primary full" disabled={busy}>
              {busy ? 'Working...' : forgotStep === 'request' ? 'Send OTP' : 'Reset password'}
            </button>
            {forgotStep === 'reset' ? (
              <button
                type="button"
                className="button ghost"
                onClick={() => {
                  setForgotStep('request');
                  setForgotOtp('');
                  setForgotNewPassword('');
                  setForgotConfirmPassword('');
                }}
              >
                Use another email
              </button>
            ) : null}
          </div>
          <p className="field-hint">We send the code to your registered email and it expires in five minutes.</p>
        </form>
      );
    }

    return (
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          {mode === 'signup' ? (
            <label className="wide">
              Full name
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ashutosh Raj" required />
            </label>
          ) : null}

          <label className="wide">
            Email address
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="ashutosh@example.com"
              required
            />
          </label>

          <label className="wide">
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
              <label className="wide">
                Confirm password
                <input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type="password"
                  placeholder="Repeat the password"
                  required
                />
              </label>

              <label className="wide">
                UPI ID
                <input
                  value={upiId}
                  onChange={(event) => setUpiId(event.target.value)}
                  placeholder="name@bank"
                  required
                />
              </label>

              <label className="wide">
                Preferred payment method
                <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
                  <option value="ONLINE">ONLINE</option>
                  <option value="CASH">CASH</option>
                </select>
              </label>
            </>
          ) : null}
        </div>

        <div className="form-actions auth-actions">
          <button type="submit" className="button primary full" disabled={busy}>
            {busy ? 'Working...' : mode === 'signup' ? 'Create profile' : 'Sign in'}
          </button>
          {mode === 'login' ? (
            <button type="button" className="button ghost" onClick={() => switchMode('forgot')}>
              Forgot password?
            </button>
          ) : null}
        </div>
        <p className="field-hint">Use your email and password to sign in, or your email, password, and UPI ID to create a profile.</p>
      </form>
    );
  }

  function renderAccountForms() {
    return (
      <div className="panel-grid account-grid">
        <section className="panel-card account-summary-card">
          <p className="eyebrow">Account</p>
          <h2>Manage your profile</h2>
          <p>Update your UPI ID or password without leaving the account area.</p>

          <div className="account-summary">
            <div className="account-summary-row">
              <span>Email</span>
              <strong>{currentUser?.email}</strong>
            </div>
            <div className="account-summary-row">
              <span>UPI ID</span>
              <strong>{currentUser?.upiId || 'Not set'}</strong>
            </div>
            <div className="account-summary-row">
              <span>Preferred payment</span>
              <strong>{currentUser?.preferredPaymentMethod || 'UNSET'}</strong>
            </div>
          </div>

          <button
            type="button"
            className="button ghost full"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            Sign out
          </button>
        </section>

        <section className="panel-card account-editor-card">
          <div className="account-tabs">
            <button type="button" className={accountTab === 'upi' ? 'tab active' : 'tab'} onClick={() => setAccountTab('upi')}>
              <UserRoundPen size={16} />
              Update UPI ID
            </button>
            <button
              type="button"
              className={accountTab === 'password' ? 'tab active' : 'tab'}
              onClick={() => setAccountTab('password')}
            >
              <KeyRound size={16} />
              Update password
            </button>
          </div>

          {accountTab === 'upi' ? (
            <form className="auth-form compact-form" onSubmit={handleUpiUpdateSubmit}>
              <div className="form-grid">
                <label className="wide">
                  Current UPI ID
                  <input value={oldUpiId} onChange={(event) => setOldUpiId(event.target.value)} placeholder="name@bank" required />
                </label>

                <label>
                  New UPI ID
                  <input value={newUpiId} onChange={(event) => setNewUpiId(event.target.value)} placeholder="newname@bank" required />
                </label>

                <label>
                  Confirm new UPI ID
                  <input
                    value={confirmNewUpiId}
                    onChange={(event) => setConfirmNewUpiId(event.target.value)}
                    placeholder="Repeat the new UPI ID"
                    required
                  />
                </label>
              </div>

              <button type="submit" className="button primary full" disabled={busy}>
                {busy ? 'Working...' : 'Update UPI ID'}
              </button>
            </form>
          ) : (
            <form className="auth-form compact-form" onSubmit={handlePasswordUpdateSubmit}>
              <div className="form-grid">
                <label className="wide">
                  Current password
                  <input
                    value={oldAccountPassword}
                    onChange={(event) => setOldAccountPassword(event.target.value)}
                    type="password"
                    placeholder="Enter your current password"
                    required
                  />
                </label>

                <label>
                  New password
                  <input
                    value={newAccountPassword}
                    onChange={(event) => setNewAccountPassword(event.target.value)}
                    type="password"
                    placeholder="Create a new password"
                    required
                  />
                </label>

                <label>
                  Confirm new password
                  <input
                    value={confirmAccountPassword}
                    onChange={(event) => setConfirmAccountPassword(event.target.value)}
                    type="password"
                    placeholder="Repeat the new password"
                    required
                  />
                </label>
              </div>

              <button type="submit" className="button primary full" disabled={busy}>
                {busy ? 'Working...' : 'Update password'}
              </button>
            </form>
          )}
        </section>
      </div>
    );
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
        <h1>
          {currentUser
            ? `Welcome back, ${currentUser.name}`
            : mode === 'signup'
              ? 'Create a profile'
              : mode === 'forgot'
                ? 'Reset your password'
                : 'Sign in to continue'}
        </h1>
        <p>
          {currentUser
            ? 'Manage your account settings from the account area and keep your profile details current.'
            : mode === 'forgot'
              ? 'Use your registered email to receive an OTP and reset access securely.'
              : 'This release now supports password-protected accounts, personal expense tracking, and monthly budget setup.'}
        </p>

        {currentUser ? null : (
          <>
            <div className="auth-switcher">
              <button type="button" className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => switchMode('login')}>
                Login
              </button>
              <button type="button" className={mode === 'signup' ? 'tab active' : 'tab'} onClick={() => switchMode('signup')}>
                Sign up
              </button>
            </div>

            {renderPrimaryAuthForm()}
          </>
        )}

        {currentUser ? renderAccountForms() : null}

        {message ? <p className="notice success">{message}</p> : null}
        <ErrorDialog message={error} onClose={() => setError(null)} title="Authentication error" />

        {currentUser ? <p className="notice neutral">Signed in as {currentUser.name}. Use the account tab for profile updates.</p> : null}
      </section>

      <aside className="auth-side">
        <div className="auth-side-card">
          <p className="eyebrow">{currentUser ? 'Account snapshot' : 'What you get'}</p>
          {currentUser ? (
            <>
              <h2>{currentUser.name}</h2>
              <ul>
                <li>Email: {currentUser.email}</li>
                <li>UPI ID: {currentUser.upiId || 'Not set'}</li>
                <li>Preferred payment: {currentUser.preferredPaymentMethod || 'UNSET'}</li>
              </ul>
            </>
          ) : (
            <>
              <h2>Landing page, dashboard, group management, expense entry, and settlement flow.</h2>
              <ul>
                <li>Professional split-expense UI</li>
                <li>Group summaries and member management</li>
                <li>Settlement history with payment actions</li>
              </ul>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}