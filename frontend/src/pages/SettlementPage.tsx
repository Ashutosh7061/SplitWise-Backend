import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, ChevronDown } from 'lucide-react';
import { getGroupMembers, getSettlements, paySettlement } from '../api/splitwiseApi';
import { ErrorDialog } from '../components/ErrorDialog';
import { SectionHeader } from '../components/SectionHeader';
import { PaySettlementDialog } from '../components/PaySettlementDialog';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/format';
import type { SettlementDto } from '../types';

export function SettlementPage() {
  const { currentUser, groups, currentGroupId, selectGroup, users } = useApp();
  const navigate = useNavigate();
  const [groupMembers, setGroupMembers] = useState<Map<number, string[]>>(new Map());
  const [settlements, setSettlements] = useState<SettlementDto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeSettlement, setActiveSettlement] = useState<SettlementDto | null>(null);
  const [receiverUpi, setReceiverUpi] = useState<string | null>(null);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);

  // Get user's groups (groups where they are a member)
  const userGroups = useMemo(() => {
    if (!currentUser) return [];
    return groups;
  }, [groups, currentUser]);

  const hasGroups = userGroups.length > 0;

  const selectedGroup = useMemo(() => userGroups.find((g) => g.id === currentGroupId) || null, [userGroups, currentGroupId]);

  // Load group members and settlements
  useEffect(() => {
    async function load() {
      if (!currentGroupId) {
        setSettlements([]);
        return;
      }

      setBusy(true);
      setError(null);

      try {
        const [settlementsData, membersData] = await Promise.all([
          getSettlements(currentGroupId),
          getGroupMembers(currentGroupId)
        ]);

        setSettlements(settlementsData || []);
        setGroupMembers((prev) => new Map(prev).set(currentGroupId, membersData.map((m) => m.userName)));
      } catch (exception) {
        setError(exception instanceof Error ? exception.message : 'Unable to load settlements');
      } finally {
        setBusy(false);
      }
    }

    void load();
  }, [currentGroupId]);

  // Filter settlements where current user is the payer
  const myPayments = useMemo(() => {
    if (!currentUser) return [];
    return settlements.filter((settlement) => settlement.from === currentUser.name);
  }, [settlements, currentUser]);

  const pendingPayments = myPayments.filter((s) => s.status === 'PENDING');
  const paidPayments = myPayments.filter((s) => s.status === 'PAID');
  const confirmedPayments = myPayments.filter((s) => s.status === 'CONFIRMED');

  const totalPending = pendingPayments.reduce((sum, s) => sum + s.amount, 0);

  function handlePayButtonClick(settlementId: number) {
    const settlement = settlements.find((s) => s.settlementId === settlementId) || null;
    let upi: string | null = null;
    if (settlement && users && users.length > 0) {
      const matched = users.find((u) => u.name === settlement.to || u.email === (settlement as any).toEmail);
      upi = matched?.upiId || null;
    }

    setReceiverUpi(upi);
    setActiveSettlement(settlement);
    setDialogOpen(true);
  }

  async function handleLocalPay(paymentMethod: string, transactionId: string, receiverUpi?: string | null) {
    if (!activeSettlement) return;

    setBusy(true);
    setError(null);
    try {
      await paySettlement(activeSettlement.settlementId, paymentMethod as any, transactionId);
      
      // Update local state after successful backend call
      setSettlements((prev) =>
        prev.map((s) => {
          if (s.settlementId === activeSettlement.settlementId) {
            return {
              ...s,
              status: 'PAID',
              paidAt: new Date().toISOString(),
              ...(receiverUpi ? { receiverUpi } : {})
            } as SettlementDto;
          }
          return s;
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setBusy(false);
      setDialogOpen(false);
      setActiveSettlement(null);
    }
  }

  function handleGroupSelect(groupId: number) {
    selectGroup(groupId);
    setShowGroupDropdown(false);
  }

  return (
    <div className="stack gap-large">
      {/* Header Section */}
      <section className="panel-card">
        <SectionHeader
          title="My Payments"
          subtitle="View and manage the payments you need to make to settle group expenses."
        />

        {/* Group Selector Dropdown */}
        <div className="settlement-group-selector">
          <button
            type="button"
            className="settlement-group-trigger"
            onClick={() => hasGroups && setShowGroupDropdown(!showGroupDropdown)}
            aria-haspopup="listbox"
            aria-expanded={showGroupDropdown}
            disabled={!hasGroups}
          >
            <span className="settlement-group-label">{selectedGroup?.name || 'No groups available'}</span>
            <span className="settlement-group-meta">
              <span>{selectedGroup ? 'Current group' : 'Create or join a group'}</span>
              <ChevronDown
                size={18}
                className={showGroupDropdown ? 'is-open' : ''}
              />
            </span>
          </button>

          {showGroupDropdown && (
            <div className="settlement-group-menu" role="listbox" aria-label="Select a group">
              {hasGroups ? userGroups.map((group) => {
                const isActive = currentGroupId === group.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    className={isActive ? 'settlement-group-option active' : 'settlement-group-option'}
                    onClick={() => handleGroupSelect(group.id)}
                    role="option"
                    aria-selected={isActive}
                  >
                    <span>{group.name}</span>
                    {isActive ? <span className="settlement-group-option-badge">Active</span> : null}
                  </button>
                );
              }) : (
                <div className="settlement-group-empty">No groups available</div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      {currentGroupId ? (
        <section className="overview-grid">
          <article className="stat-card tone-warning">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} />
              <div>
                <p>Pending</p>
                <strong>{pendingPayments.length}</strong>
                <span>{formatCurrency(totalPending)}</span>
              </div>
            </div>
          </article>
          <article className="stat-card tone-neutral">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} />
              <div>
                <p>Paid</p>
                <strong>{paidPayments.length}</strong>
              </div>
            </div>
          </article>
          <article className="stat-card tone-success">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} />
              <div>
                <p>Confirmed</p>
                <strong>{confirmedPayments.length}</strong>
              </div>
            </div>
          </article>
        </section>
      ) : null}

      {/* No Group Selected */}
      {!currentGroupId ? (
        <section className="panel-card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ fontSize: '16px', fontWeight: '500' }}>Select a group to view your payments</p>
            <p style={{ fontSize: '14px', opacity: 0.7, marginTop: '0.5rem' }}>Choose a group from the dropdown above to see payments you need to make.</p>
          </div>
        </section>
      ) : null}

      {/* Payments Table */}
      {currentGroupId && myPayments.length === 0 ? (
        <section className="panel-card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <CheckCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5, color: 'var(--color-success)' }} />
            <p style={{ fontSize: '16px', fontWeight: '500' }}>All settled up!</p>
            <p style={{ fontSize: '14px', opacity: 0.7, marginTop: '0.5rem' }}>You don't have any pending payments in this group.</p>
          </div>
        </section>
      ) : null}

      {pendingPayments.length > 0 ? (
        <section className="panel-card">
          <SectionHeader title="Pending Payments" subtitle="Payments waiting to be made" />
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)', textTransform: 'uppercase' }}>To</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map((settlement) => (
                  <tr key={settlement.settlementId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                      <div>
                        <p style={{ fontWeight: '500', margin: 0 }}>{settlement.to}</p>
                        <p style={{ fontSize: '12px', color: 'var(--color-muted)', margin: '4px 0 0 0' }}>Payment receiver</p>
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'right', verticalAlign: 'middle' }}>
                      <p style={{ fontWeight: '600', fontSize: '16px', margin: 0 }}>{formatCurrency(settlement.amount)}</p>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <button
                        className="button primary"
                        onClick={() => handlePayButtonClick(settlement.settlementId)}
                        disabled={busy}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                      >
                        Pay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Pay dialog (light theme) */}
      <PaySettlementDialog
        settlement={activeSettlement}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setActiveSettlement(null);
          setReceiverUpi(null);
        }}
        onPay={async (method, txId, rUpi) => await handleLocalPay(method, txId, rUpi)}
        busy={busy}
        receiverUpiId={receiverUpi}
        lightTheme
        groupCreatedAt={(groups.find((g) => g.id === currentGroupId) as any)?.createdAt || null}
      />

      {/* Paid Payments */}
      {paidPayments.length > 0 ? (
        <section className="panel-card">
          <SectionHeader title="Paid (Awaiting Confirmation)" subtitle="Payments marked as paid, pending receiver confirmation" />
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)', textTransform: 'uppercase' }}>To</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {paidPayments.map((settlement) => (
                  <tr key={settlement.settlementId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '16px 12px' }}>
                      <p style={{ fontWeight: '500', margin: 0 }}>{settlement.to}</p>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                      <p style={{ fontWeight: '600', fontSize: '16px', margin: 0 }}>{formatCurrency(settlement.amount)}</p>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '4px', backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)', fontSize: '12px', fontWeight: '600' }}>
                        <Clock size={14} />
                        Awaiting confirmation
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Confirmed Payments */}
      {confirmedPayments.length > 0 ? (
        <section className="panel-card">
          <SectionHeader title="Confirmed Payments" subtitle="Completed and confirmed settlements" />
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)', textTransform: 'uppercase' }}>To</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {confirmedPayments.map((settlement) => (
                  <tr key={settlement.settlementId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '16px 12px' }}>
                      <p style={{ fontWeight: '500', margin: 0 }}>{settlement.to}</p>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                      <p style={{ fontWeight: '600', fontSize: '16px', margin: 0 }}>{formatCurrency(settlement.amount)}</p>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '4px', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: '12px', fontWeight: '600' }}>
                        <CheckCircle size={14} />
                        Confirmed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <ErrorDialog message={error} onClose={() => setError(null)} title="Settlement error" />
    </div>
  );
}
