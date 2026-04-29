import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeIndianRupee, CreditCard, Group, ShieldCheck, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getGroupMembers, getGroupSummary } from '../api/splitwiseApi';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { formatCurrency } from '../utils/format';

export function DashboardPage() {
  const { currentUser, groups, currentGroupId, selectGroup } = useApp();
  const [visibleGroupIds, setVisibleGroupIds] = useState<Set<number>>(new Set());
  const [connectedUserCount, setConnectedUserCount] = useState(0);
  const [activeGroupBudget, setActiveGroupBudget] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function resolveVisibility() {
      if (!currentUser) {
        if (!cancelled) {
          setVisibleGroupIds(new Set());
          setConnectedUserCount(0);
        }
        return;
      }

      if (groups.length === 0) {
        if (!cancelled) {
          setVisibleGroupIds(new Set());
          setConnectedUserCount(1);
        }
        return;
      }

      const membershipResults = await Promise.allSettled(
        groups.map(async (group) => ({
          groupId: group.id,
          members: await getGroupMembers(group.id)
        }))
      );

      if (cancelled) {
        return;
      }

      const userIds = new Set<number>([currentUser.id]);
      const groupIds = new Set<number>();

      for (const result of membershipResults) {
        if (result.status !== 'fulfilled') {
          continue;
        }

        const { groupId, members } = result.value;
        const isCurrentUserMember = members.some((member) => member.userId === currentUser.id && member.active);
        if (!isCurrentUserMember) {
          continue;
        }

        groupIds.add(groupId);
        for (const member of members) {
          if (member.active) {
            userIds.add(member.userId);
          }
        }
      }

      setVisibleGroupIds(groupIds);
      setConnectedUserCount(userIds.size);
    }

    void resolveVisibility();

    return () => {
      cancelled = true;
    };
  }, [currentUser, groups]);

  const visibleGroups = useMemo(
    () => groups.filter((group) => visibleGroupIds.has(group.id)),
    [groups, visibleGroupIds]
  );

  const activeGroup = visibleGroups.find((group) => group.id === currentGroupId) || visibleGroups[0] || null;

  useEffect(() => {
    let cancelled = false;

    async function loadActiveGroupBudget() {
      if (!activeGroup) {
        if (!cancelled) {
          setActiveGroupBudget(0);
        }
        return;
      }

      try {
        const summary = await getGroupSummary(activeGroup.id);
        if (!cancelled) {
          setActiveGroupBudget(summary.totalExpense || 0);
        }
      } catch {
        if (!cancelled) {
          setActiveGroupBudget(0);
        }
      }
    }

    void loadActiveGroupBudget();

    return () => {
      cancelled = true;
    };
  }, [activeGroup]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    if (visibleGroups.length === 0) {
      if (currentGroupId !== null) {
        selectGroup(null);
      }
      return;
    }

    if (currentGroupId === null || !visibleGroups.some((group) => group.id === currentGroupId)) {
      selectGroup(visibleGroups[0].id);
    }
  }, [currentGroupId, currentUser, selectGroup, visibleGroups]);

  return (
    <div className="stack gap-large">
      <section className="overview-grid">
        <StatCard label="Registered users" value={connectedUserCount} hint="Connected through your groups" tone="accent" />
        <StatCard label="Groups" value={visibleGroups.length} hint="Groups you are a member of" tone="success" />
        <StatCard label="Preferred mode" value={currentUser?.preferredPaymentMethod || 'UNSET'} hint="Account preference" tone="warning" />
        <StatCard label="Quick budget view" value={activeGroupBudget} valueType="currency" hint={activeGroup ? `Active group: ${activeGroup.name}` : 'No group selected'} tone="neutral" />
      </section>

      <section className="panel-grid">
        <article className="panel-card wide">
          <SectionHeader
            title={`Welcome back${currentUser ? `, ${currentUser.name}` : ''}`}
            subtitle="Use the shortcuts below to move from capture to settlement quickly."
          />

          <div className="quick-actions">
            <Link className="action-card" to="/app/expenses/new">
              <CreditCard size={20} />
              <strong>Add expense</strong>
              <span>Record equal, exact, or percentage splits.</span>
            </Link>
            <Link className="action-card" to="/app/summary">
              <TrendingUp size={20} />
              <strong>View summary</strong>
              <span>Analyze current balance and group health.</span>
            </Link>
            <Link className="action-card" to="/app/personal">
              <BadgeIndianRupee size={20} />
              <strong>Start personal tracking</strong>
              <span>Add a monthly budget and track personal expenses.</span>
            </Link>
            <Link className="action-card" to="/app/groups">
              <Group size={20} />
              <strong>Manage groups</strong>
              <span>Create groups and invite members.</span>
            </Link>
            <Link className="action-card" to={activeGroup ? `/app/groups/${activeGroup.id}` : '/app/groups'}>
              <ShieldCheck size={20} />
              <strong>Settlement hub</strong>
              <span>Track dues and payment status.</span>
            </Link>
          </div>
        </article>

        <article className="panel-card">
          <SectionHeader title="Active group" subtitle="Choose the group you want to work in." />
          <div className="group-selector">
            {visibleGroups.length === 0 ? <p>No groups connected to this account yet.</p> : null}
            {visibleGroups.map((group) => (
              <button
                key={group.id}
                type="button"
                className={group.id === currentGroupId ? 'group-pill active' : 'group-pill'}
                onClick={() => selectGroup(group.id)}
              >
                <span>{group.name}</span>
                <small>{group.status}</small>
              </button>
            ))}
          </div>

          {activeGroup ? (
            <div className="mini-dashboard">
              <p className="eyebrow">Selected group</p>
              <h3>{activeGroup.name}</h3>
              <div className="mini-row">
                <span>Group id</span>
                <strong>#{activeGroup.id}</strong>
              </div>
              <div className="mini-row">
                <span>Status</span>
                <strong>{activeGroup.status}</strong>
              </div>
              <div className="mini-row">
                <span>Quick total</span>
                <strong>{formatCurrency(activeGroupBudget)}</strong>
              </div>
            </div>
          ) : null}
        </article>
      </section>
    </div>
  );
}