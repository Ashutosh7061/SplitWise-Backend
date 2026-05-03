import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Layout } from './components/Layout';
import { useApp } from './context/AppContext';
import { AddExpensePage } from './pages/AddExpensePage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { GroupDetailPage } from './pages/GroupDetailPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { GroupsPage } from './pages/GroupsPage';
import { LandingPage } from './pages/LandingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PersonalTrackingPage } from './pages/PersonalTrackingPage';
import { SettlementDetailPage } from './pages/SettlementDetailPage';
import { SettlementPage } from './pages/SettlementPage';
import { SummaryPage } from './pages/SummaryPage';

function RequireAuth({ children }: { children: ReactNode }) {
  const { currentUser, isBootstrapping } = useApp();

  if (isBootstrapping) {
    return <div className="loading-screen">Loading workspace...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/auth?next=/app" replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="groups" element={<GroupsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="groups/:groupId" element={<GroupDetailPage />} />
        <Route path="expenses/new" element={<AddExpensePage />} />
        <Route path="personal" element={<PersonalTrackingPage />} />
        <Route path="summary" element={<SummaryPage />} />
        <Route path="settlement" element={<SettlementPage />} />
        <Route path="settlements/:settlementId" element={<SettlementDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}