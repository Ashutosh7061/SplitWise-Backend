import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getBalances, getGroupAnalysis, getGroupMembers, getGroupSummary, getUserSummary } from '../api/splitwiseApi';
import { SectionHeader } from '../components/SectionHeader';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/format';
import type { GroupSummary, SettlementData, TimeBasedGroupSummary, UserGroupSummary } from '../types';

export function SummaryPage() {
  const { currentUser, groups, currentGroupId } = useApp();
  const [params] = useSearchParams();
  const paramGroupId = Number(params.get('group'));
  const resolvedGroupId = Number.isFinite(paramGroupId) && paramGroupId > 0 ? paramGroupId : currentGroupId;
  const [summary, setSummary] = useState<GroupSummary | null>(null);
  const [analysis, setAnalysis] = useState<TimeBasedGroupSummary | null>(null);
  const [userSummary, setUserSummary] = useState<UserGroupSummary | null>(null);
  const [balances, setBalances] = useState<SettlementData[]>([]);
  const [mode, setMode] = useState<'weekly' | 'monthly'>('weekly');
  const group = useMemo(() => groups.find((item) => item.id === resolvedGroupId) || null, [groups, resolvedGroupId]);

  const outgoingSettlements = useMemo(() => {
    if (!currentUser) {
      return [];
    }
    return balances.filter((entry) => entry.from === currentUser.name);
  }, [balances, currentUser]);

  const outgoingTotal = useMemo(
    () => outgoingSettlements.reduce((sum, entry) => sum + entry.amount, 0),
    [outgoingSettlements]
  );

  const incomingTotal = useMemo(() => {
    if (!currentUser) {
      return 0;
    }
    return balances
      .filter((entry) => entry.to === currentUser.name)
      .reduce((sum, entry) => sum + entry.amount, 0);
  }, [balances, currentUser]);

  const outgoingByReceiver = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const entry of outgoingSettlements) {
      grouped.set(entry.to, (grouped.get(entry.to) || 0) + entry.amount);
    }
    return Array.from(grouped.entries()).map(([receiver, amount]) => ({ receiver, amount }));
  }, [outgoingSettlements]);

  useEffect(() => {
    async function load() {
      if (!resolvedGroupId) {
        setSummary(null);
        setAnalysis(null);
        setUserSummary(null);
        setBalances([]);
        return;
      }

      const [loadedSummary, loadedAnalysis, loadedMembers] = await Promise.all([
        getGroupSummary(resolvedGroupId),
        getGroupAnalysis(resolvedGroupId, mode),
        getGroupMembers(resolvedGroupId)
      ]);

      setSummary(loadedSummary);
      setAnalysis(loadedAnalysis);

      try {
        const loadedBalances = loadedMembers.length
          ? await getBalances(resolvedGroupId, loadedMembers.map((member) => member.userId))
          : [];
        setBalances(loadedBalances);
      } catch {
        setBalances([]);
      }

      if (currentUser?.email) {
        const loadedUser = await getUserSummary(resolvedGroupId, currentUser.email);
        setUserSummary(loadedUser);
      }
    }

    void load();
  }, [currentUser?.email, mode, resolvedGroupId]);

  return (
    <div className="stack gap-large">
      <section className="panel-card">
        <SectionHeader title="Summary report" subtitle="Understand the health of the selected group at a glance." />
        <div className="mini-tabs">
          <button type="button" className={mode === 'weekly' ? 'tab active' : 'tab'} onClick={() => setMode('weekly')}>Weekly</button>
          <button type="button" className={mode === 'monthly' ? 'tab active' : 'tab'} onClick={() => setMode('monthly')}>Monthly</button>
        </div>
      </section>

      {!resolvedGroupId ? (
        <section className="panel-card">
          <SectionHeader title="No group selected" subtitle="Join or create a group first, then return here to view its summary." />
        </section>
      ) : null}

      <section className="overview-grid">
        <article className="stat-card tone-accent">
          <p>Group</p>
          <strong>{group?.name || summary?.groupName || 'No group exist'}</strong>
          <span>Total expense and settlement data</span>
        </article>
        <article className="stat-card tone-success">
          <p>Total expense</p>
          <strong>{formatCurrency(summary?.totalExpense || analysis?.totalExpense || 0)}</strong>
          <span>{mode} analysis</span>
        </article>
        <article className="stat-card tone-warning">
          <p>You need to pay</p>
          <strong>{formatCurrency(outgoingTotal)}</strong>
          <span>{outgoingSettlements.length} unpaid payment{outgoingSettlements.length === 1 ? '' : 's'}</span>
        </article>
        <article className="stat-card tone-neutral">
          <p>Your balance</p>
          <strong>{formatCurrency(userSummary?.netBalance || 0)}</strong>
          <span>{userSummary?.userName || 'Current user'}</span>
        </article>
      </section>

      <section className="panel-grid">
        <article className="panel-card wide">
          <SectionHeader title="Member breakdown" subtitle="Paid, owed, and net positions across the group." />
          <div className="table-card">
            <div className="table-head">
              <span>Name</span>
              <span>Paid</span>
              <span>Owes</span>
              <span>Net balance</span>
            </div>
            {(summary?.userSummaries || analysis?.userSummaries || []).map((entry) => (
              <div className="table-row" key={entry.userName}>
                <strong>{entry.userName}</strong>
                <span>{formatCurrency(entry.totalPaid)}</span>
                <span>{formatCurrency(entry.totalOwes)}</span>
                <span className={entry.netBalance >= 0 ? 'positive' : 'negative'}>{formatCurrency(entry.netBalance)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <SectionHeader title="Your payment plan" subtitle="Who you should pay next and what you are expected to receive." />
          <div className="stack small-gap">
            <div className="mini-row"><span>Total to pay</span><strong>{formatCurrency(outgoingTotal)}</strong></div>
            <div className="mini-row"><span>Total to receive</span><strong>{formatCurrency(incomingTotal)}</strong></div>
            <div className="mini-row"><span>Pending outgoing</span><strong>{outgoingSettlements.length}</strong></div>
          </div>
          {outgoingByReceiver.length > 0 ? (
            <div className="stack small-gap" style={{ marginTop: 12 }}>
              {outgoingByReceiver.map((entry) => (
                <div className="mini-row" key={entry.receiver}>
                  <span>Pay to {entry.receiver}</span>
                  <strong>{formatCurrency(entry.amount)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="notice neutral" style={{ marginTop: 12 }}>No pending payments from your side.</p>
          )}
        </article>
      </section>
    </div>
  );
}