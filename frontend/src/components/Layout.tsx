import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BadgeIndianRupee, Bell, Coins, Handshake, LayoutDashboard, LogOut, MoonStar, ReceiptText, ShieldPlus, SunMedium, Users } from 'lucide-react';
import { getUserSummary, getInvitations, getPaymentNotifications } from '../api/splitwiseApi';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/format';

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/notifications', label: 'Notifications', icon: Bell },
  { to: '/app/groups', label: 'Groups', icon: Users },
  { to: '/app/expenses/new', label: 'Add Expense', icon: ReceiptText },
  { to: '/app/personal', label: 'Personal Tracking', icon: BadgeIndianRupee },
  { to: '/app/summary', label: 'Summary', icon: Coins },
  { to: '/app/settlement', label: 'Settlement', icon: Handshake },
  { to: '/auth', label: 'Account', icon: ShieldPlus }
];

export function Layout() {
  const { currentUser, currentGroupId, groups, logout, balanceRefreshToken, theme, toggleTheme } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const group = groups.find((item) => item.id === currentGroupId) || null;
  const isPersonalWorkspace = location.pathname.startsWith('/app/personal');
  const headerLabel = isPersonalWorkspace ? 'Personal workspace' : 'Group workspace';
  const headerTitle = isPersonalWorkspace ? 'Personal tracking' : group ? group.name : 'Control your shared finances';
  const headerSubtitle = isPersonalWorkspace
    ? 'Keep your budget and expenses separate from group bills.'
    : 'Track shared balances, settlements, and group expenses.';
  const [currentBalance, setCurrentBalance] = useState(0);
  const [pendingNotifications, setPendingNotifications] = useState(0);

  useEffect(() => {
    async function loadCurrentBalance() {
      if (!currentUser?.email || !currentGroupId) {
        setCurrentBalance(0);
        return;
      }

      try {
        const summary = await getUserSummary(currentGroupId, currentUser.email);
        setCurrentBalance(summary.netBalance || 0);
      } catch {
        setCurrentBalance(0);
      }
    }

    void loadCurrentBalance();
    async function loadNotifications() {
      if (!currentUser?.id) {
        setPendingNotifications(0);
        return;
      }

      try {
        const [invites, payments] = await Promise.all([
          getInvitations(currentUser.id),
          getPaymentNotifications(currentUser.id)
        ]);
        const inviteCount = Array.isArray(invites) ? invites.length : 0;
        const unconfirmedPayments = Array.isArray(payments) 
          ? payments.filter((p) => p.status !== 'CONFIRMED').length 
          : 0;
        setPendingNotifications(inviteCount + unconfirmedPayments);
      } catch {
        setPendingNotifications(0);
      }
    }

    void loadNotifications();
  }, [balanceRefreshToken, currentGroupId, currentUser?.id]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <span className="brand-mark">S</span>
          <span>
            <strong>Splitwise Pro</strong>
            <small>Expense intelligence</small>
          </span>
        </Link>

        <nav className="nav-list">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="nav-link">
              <Icon size={18} />
              <span>{label}</span>
              {to === '/app/notifications' && pendingNotifications > 0 ? (
                <span className="nav-badge">{pendingNotifications}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <section className="sidebar-card">
          <p className="eyebrow">Workspace</p>
          <h3>{currentUser?.name || 'Not signed in'}</h3>
          <p>{currentUser?.email || 'Create a profile to start tracking expenses'}</p>
          {group ? (
            <div className="mini-summary">
              <span>Active group</span>
              <strong>{group.name}</strong>
            </div>
          ) : null}
          <button type="button" className="button full sidebar-signout-button" onClick={handleLogout}>
            <LogOut size={16} />
            Sign out
          </button>
        </section>
      </aside>

      <div className="content-shell">
        <header className="topbar">
          <div className="topbar-copy">
            <p className="eyebrow">Splitwise Pro</p>
            <span className="topbar-context">{headerLabel}</span>
            <h1>{headerTitle}</h1>
            <p className="topbar-subtitle">{headerSubtitle}</p>
          </div>

          <div className="topbar-actions">
            <div className="stat-chip">
              <span>{isPersonalWorkspace ? 'Personal tracking' : 'Current balance'}</span>
              <strong>{isPersonalWorkspace ? 'On' : formatCurrency(currentBalance)}</strong>
            </div>
            <button
              type="button"
              className="button ghost theme-toggle-button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            {isPersonalWorkspace ? (
              <button type="button" className="button ghost" onClick={() => navigate('/app')}>
                <LayoutDashboard size={16} />
                Back to dashboard
              </button>
            ) : (
              <button type="button" className="button ghost" onClick={() => navigate('/app/personal')}>
                <BadgeIndianRupee size={16} />
                Start personal tracking
              </button>
            )}
            <button type="button" className="button primary" onClick={() => navigate('/app/expenses/new')}>
              <ReceiptText size={16} />
              New expense
            </button>
          </div>
        </header>

        <main className="page-frame">
          <Outlet />
        </main>
      </div>
    </div>
  );
}