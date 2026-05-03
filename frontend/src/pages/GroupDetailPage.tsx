import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { getBalances, getExpenses, getGroupAnalysis, getGroupMembers, getGroupSummary, getSettlements, sendSettlementEmails } from '../api/splitwiseApi';
import { ErrorDialog } from '../components/ErrorDialog';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { SuccessToast } from '../components/SuccessToast';
import { useApp } from '../context/AppContext';
import { clampText, formatCurrency, formatDateTime } from '../utils/format';
import type { Expense, GroupMember, SettlementData, SettlementDto, GroupSummary, TimeBasedGroupSummary } from '../types';

type AnalysisMode = 'weekly' | 'monthly';

export function GroupDetailPage() {
  const { groupId } = useParams();
  const groupNumericId = Number(groupId);
  const { groups, currentUser, selectGroup } = useApp();
  const navigate = useNavigate();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<SettlementDto[]>([]);
  const [balances, setBalances] = useState<SettlementData[]>([]);
  const [summary, setSummary] = useState<GroupSummary | null>(null);
  const [analysis, setAnalysis] = useState<TimeBasedGroupSummary | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('weekly');
  const [inviteEmail, setInviteEmail] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const group = groups.find((entry) => entry.id === groupNumericId) || null;

  const userIds = useMemo(() => members.map((member) => member.userId), [members]);

  useEffect(() => {
    if (Number.isNaN(groupNumericId)) {
      navigate('/app/groups');
      return;
    }

    selectGroup(groupNumericId);
  }, [groupNumericId, navigate, selectGroup]);

  useEffect(() => {
    async function load() {
      if (!groupNumericId) return;

      setBusy(true);
      setError(null);

      try {
        const [loadedSummary, loadedMembers, loadedExpenses, loadedSettlements] = await Promise.all([
          getGroupSummary(groupNumericId),
          getGroupMembers(groupNumericId),
          getExpenses(groupNumericId),
          getSettlements(groupNumericId)
        ]);

        setSummary(loadedSummary);
        setMembers(loadedMembers);
        setExpenses(loadedExpenses);
        setSettlements(loadedSettlements);

        if (loadedMembers.length > 0) {
          const ids = loadedMembers.map((member) => member.userId);
          const balancesResponse = await getBalances(groupNumericId, ids);
          setBalances(balancesResponse);
        }

        const summaryAnalysis = await getGroupAnalysis(groupNumericId, analysisMode);
        setAnalysis(summaryAnalysis);
      } catch (exception) {
        setError(exception instanceof ApiError ? exception.message : 'Unable to load group details');
      } finally {
        setBusy(false);
      }
    }

    void load();
  }, [analysisMode, groupNumericId]);

  async function handleRefresh() {
    if (!groupNumericId) return;
    setBusy(true);
    setError(null);
    try {
      const [loadedSummary, loadedMembers, loadedExpenses, loadedSettlements, loadedBalances, loadedAnalysis] = await Promise.all([
        getGroupSummary(groupNumericId),
        getGroupMembers(groupNumericId),
        getExpenses(groupNumericId),
        getSettlements(groupNumericId),
        getBalances(groupNumericId, userIds),
        getGroupAnalysis(groupNumericId, analysisMode)
      ]);

      setSummary(loadedSummary);
      setMembers(loadedMembers);
      setExpenses(loadedExpenses);
      setSettlements(loadedSettlements);
      setBalances(loadedBalances);
      setAnalysis(loadedAnalysis);
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : 'Unable to refresh data');
    } finally {
      setBusy(false);
    }
  }

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!groupNumericId || !currentUser) return;

    setBusy(true);
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch('/api/v1/groups/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: groupNumericId, email: inviteEmail, userId: currentUser.id })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setInviteEmail('');
      setFeedback(await response.text());
      await handleRefresh();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Unable to invite member');
    } finally {
      setBusy(false);
    }
  }

  async function handleSendEmails() {
    if (!groupNumericId) return;
    setBusy(true);
    setFeedback(null);
    setError(null);

    try {
      const result = await sendSettlementEmails(groupNumericId);
      setFeedback(result);
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : 'Unable to send emails');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack gap-large">
      <section className="overview-grid">
        <StatCard label="Total expense" value={summary?.totalExpense || 0} valueType="currency" tone="accent" hint="All recorded expenses" />
        <StatCard label="Members" value={members.length} tone="success" hint="Active group participants" />
        <StatCard label="Open settlements" value={summary?.settlementSummary.unpaidSettlements || 0} tone="warning" hint="Payments still pending" />
        <StatCard label="Group status" value={group?.status || 'ACTIVE'} tone="neutral" hint="Workspace lifecycle" />
      </section>

      <section className="panel-grid">
        <article className="panel-card wide">
          <SectionHeader
            title={group?.name || 'Group'}
            subtitle="Member balances, expense history, and settlement queue in one place."
            actions={
              <div className="inline-actions">
                <button className="button ghost" type="button" onClick={() => void handleRefresh()} disabled={busy}>Refresh</button>
                <Link className="button primary" to="/app/expenses/new">Add expense</Link>
              </div>
            }
          />

          <div className="mini-tabs">
            <button className={analysisMode === 'weekly' ? 'tab active' : 'tab'} onClick={() => setAnalysisMode('weekly')} type="button">Weekly</button>
            <button className={analysisMode === 'monthly' ? 'tab active' : 'tab'} onClick={() => setAnalysisMode('monthly')} type="button">Monthly</button>
          </div>

          {analysis ? (
            <div className="summary-banner">
              <div>
                <p className="eyebrow">{analysis.analysisType} analysis</p>
                <h3>{analysis.groupName}</h3>
                <span>
                  {formatDateTime(analysis.fromDate)} to {formatDateTime(analysis.toDate)}
                </span>
              </div>
              <strong>{formatCurrency(analysis.totalExpense)}</strong>
            </div>
          ) : null}

          {analysis?.userSummaries?.length ? (
            <div className="member-grid compact">
              {analysis.userSummaries.map((user) => (
                <article key={user.userName} className="member-card">
                  <div>
                    <strong>{user.userName}</strong>
                    <p>Paid {formatCurrency(user.totalPaid)}</p>
                  </div>
                  <div className="member-meta">
                    <span>{user.netBalance >= 0 ? 'Credit' : 'Debit'}</span>
                    <small>{formatCurrency(Math.abs(user.netBalance))}</small>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </article>

        <article className="panel-card">
          <SectionHeader title="Invite member" subtitle="Send an invitation — user must accept from Notifications." />
          <form className="stack" onSubmit={handleInvite}>
            <label>
              Email
              <input value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="friend@example.com" required />
            </label>
            <button type="submit" className="button primary" disabled={busy || !currentUser}>Invite</button>
          </form>

          <div className="stack small-gap">
            <button type="button" className="button ghost" onClick={() => void handleSendEmails()} disabled={busy || !groupNumericId}>
              Send settlement emails
            </button>
            <Link className="button ghost" to={`/app/summary?group=${groupNumericId}`}>Open summary report</Link>
          </div>
        </article>
      </section>

      <section className="panel-grid">
        <article className="panel-card">
          <SectionHeader title="Members" subtitle="Who is active in the group." />
          <div className="member-grid">
            {members.map((member) => (
              <article className="member-card" key={member.id}>
                <div>
                  <strong>{member.userName}</strong>
                  <p>{member.email}</p>
                </div>
                <div className="member-meta">
                  <span>{member.active ? 'Active' : 'Left'}</span>
                  <small>{member.preferredPaymentMethod || 'No payment pref'}</small>
                </div>
              </article>
            ))}
            {members.length === 0 ? <p>No members found.</p> : null}
          </div>
        </article>

        <article className="panel-card">
          <SectionHeader title="Balances" subtitle="Simplified debtor-creditor suggestions." />
          <div className="balance-list">
            {balances.map((item, index) => (
              <div className="balance-row" key={`${item.from}-${item.to}-${index}`}>
                <span>{clampText(item.from)}</span>
                <strong>{formatCurrency(item.amount)}</strong>
                <span>{clampText(item.to)}</span>
              </div>
            ))}
            {balances.length === 0 ? <p>No balance recommendations yet.</p> : null}
          </div>
        </article>
      </section>

      <section className="panel-grid">
        <article className="panel-card">
          <SectionHeader title="Expenses" subtitle="Latest recorded entries in the group." />
          <div className="timeline-list">
            {expenses.map((expense) => (
              <article className="timeline-item" key={expense.id}>
                <div>
                  <strong>{expense.description}</strong>
                  <p>{expense.splitType} split</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <b>{formatCurrency(expense.amount)}</b>
                  <small>{formatDateTime(expense.createdAt)}</small>
                </div>
              </article>
            ))}
            {expenses.length === 0 ? <p>No expenses yet.</p> : null}
          </div>
        </article>

        <article className="panel-card">
          <SectionHeader title="Settlements" subtitle="Open and completed payment records." />
          <div className="timeline-list">
            {settlements.map((settlement) => (
              <Link className="timeline-item linkable" to={`/app/settlements/${settlement.settlementId}`} key={settlement.settlementId}>
                <div>
                  <strong>{settlement.from} - {settlement.to}</strong>
                  <p>{settlement.status}</p>
                </div>
                <div>
                  <b>{formatCurrency(settlement.amount)}</b>
                  <small>{formatDateTime(settlement.createdAt)}</small>
                </div>
              </Link>
            ))}
            {settlements.length === 0 ? <p>No settlements yet.</p> : null}
          </div>
        </article>
      </section>

      <SuccessToast message={feedback} onClose={() => setFeedback(null)} />
      <ErrorDialog message={error} onClose={() => setError(null)} title="Group detail error" />
    </div>
  );
}