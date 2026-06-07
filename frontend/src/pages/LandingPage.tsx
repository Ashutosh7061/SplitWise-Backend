import { ArrowRight, BadgeIndianRupee, Mail, MoonStar, ShieldCheck, Sparkles, SunMedium, Users2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const features = [
  {
    icon: BadgeIndianRupee,
    title: 'Fast expense entry',
    copy: 'Capture shared expenses in seconds with equal, exact, or percentage splits.'
  },
  {
    icon: Users2,
    title: 'Group-aware workflow',
    copy: 'Manage members, balances, and settlement cycles from one polished workspace.'
  },
  {
    icon: ShieldCheck,
    title: 'Clear settlement trail',
    copy: 'Track who owes whom, what was paid, and which payments are pending.'
  },
  {
    icon: Sparkles,
    title: 'Personal budget tracking',
    copy: 'Set a monthly limit, log personal spend, and see the remaining budget instantly.'
  }
];

export function LandingPage() {
  const { theme, toggleTheme } = useApp();

  return (
    <div className="landing-page">
      <section className="hero-card">
        <div className="hero-card-topbar">
          <div className="landing-brand" aria-label="FinNest">
            <span className="landing-brand-mark" aria-hidden="true">
              <Sparkles size={12} />
            </span>
            <span className="landing-brand-copy">
              <strong>FinNest</strong>
              <span>Shared expenses</span>
            </span>
          </div>
          <button
            type="button"
            className="button theme-toggle-button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>

        <div className="hero-copy">
          <p className="eyebrow">Modern shared-expense platform</p>
          <h1>Split every bill with clarity, speed, and a premium experience.</h1>
          <p className="hero-text">
            Splitwise Pro turns backend calculations into a clean, production-style finance dashboard for
            friends, trips, and shared living.
          </p>

          <div className="hero-actions">
            <Link className="button primary" to="/auth?next=/app">
              Start now
              <ArrowRight size={16} />
            </Link>
            <Link className="button ghost" to="/auth?next=/app/personal">
              Start personal tracking
            </Link>
            <Link className="button ghost" to="/app">
              Open dashboard
            </Link>
          </div>

          <div className="hero-metrics">
            <div>
              <strong>Equal</strong>
              <span>Split styles</span>
            </div>
            <div>
              <strong>1-click</strong>
              <span>Settlement updates</span>
            </div>
            <div>
              <strong>Weekly</strong>
              <span>Summary reporting</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-panel accent">
            <p>Trip to Goa</p>
            <strong>INR 18,420</strong>
            <span>12 expenses - 5 members</span>
          </div>
          <div className="floating-panel secondary">
            <p>Open settlements</p>
            <strong>3</strong>
            <span>2 pending payments</span>
          </div>
          <div className="floating-panel tertiary">
            <p>Net balance</p>
            <strong>INR 4,120</strong>
            <span>You are owed back</span>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <article key={feature.title} className="feature-card">
              <Icon size={22} />
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </article>
          );
        })}
      </section>

      <section className="story-card">
        <div>
          <p className="eyebrow">Built for real usage</p>
          <h2>From login to settlement, the workflow stays focused and understandable.</h2>
        </div>
        <div className="story-steps">
          <span>1. Create your profile</span>
          <span>2. Create or join a group</span>
          <span>3. Add monthly budget and track personal spend</span>
        </div>
      </section>

      <footer className="landing-footer" aria-label="FinNest footer">
        <div className="footer-brand-block">
          <div className="footer-brand">
            <strong>FinNest</strong>
            <p>Split bills, settle faster, and keep every group balance clear.</p>
          </div>
          <p className="footer-copy">FinNest helps friends, roommates, and teams manage shared expenses without the spreadsheet mess.</p>
        </div>

        <div className="footer-links-block">
          <div>
            <span className="footer-title">Support</span>
            <a href="mailto:support@finnest.app">
              <Mail size={14} />
              support@finnest.app
            </a>
            <span>Available for shared living, trips, and teams</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 FinNest. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}