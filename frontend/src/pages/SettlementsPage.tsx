import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSettlements } from '../api/splitwiseApi';
import { ErrorDialog } from '../components/ErrorDialog';
import { SectionHeader } from '../components/SectionHeader';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDateTime } from '../utils/format';
import type { SettlementDto, SettlementStatus } from '../types';

const statusOrder: SettlementStatus[] = ['PENDING', 'PAID', 'CONFIRMED'];

export function SettlementsPage() {
  const { currentGroupId, groups } = useApp();
  const [settlements, setSettlements] = useState<SettlementDto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const group = useMemo(() => groups.find((entry) => entry.id === currentGroupId) || null, [groups, currentGroupId]);

  useEffect(() => {
    async function load() {
      if (!currentGroupId) {
        setSettlements([]);
        return;
      }

      setBusy(true);
      setError(null);

      try {
        const items = await getSettlements(currentGroupId);
        setSettlements(items || []);
      } catch (exception) {
        setError(exception instanceof Error ? exception.message : 'Unable to load settlements');
      } finally {
        setBusy(false);
      }
    }

    void load();
  }, [currentGroupId]);

  const grouped = useMemo(() => {
    return statusOrder.reduce<Record<SettlementStatus, SettlementDto[]>>((accumulator, status) => {
      accumulator[status] = settlements.filter((entry) => entry.status === status);
      return accumulator;
    }, { PENDING: [], PAID: [], CONFIRMED: [] });
  }, [settlements]);

  const totalOpen = grouped.PENDING.length + grouped.PAID.length;

  return (
    <div className="stack gap-large">
      <section className="panel-card">
        <SectionHeader
          title="Settlements"
          subtitle="A dedicated hub for payment requests, paid settlements, and confirmations."
        />
        <div className="mini-row">
          <span>Active group</span>
          <strong>{group?.name || 'No group selected'}</strong>
        </div>
      </section>

      {!currentGroupId ? (
        <section className="panel-card">
          <p className="notice neutral">Select a group first to view its settlement hub.</p>
        </section>
      ) : null}

      <section className="overview-grid">
        <article className="stat-card tone-warning">
          <p>Open</p>
          <strong>{totalOpen}</strong>
          <span>Pending or awaiting confirmation</span>
        </article>
        <article className="stat-card tone-success">
          <p>Confirmed</p>
          <strong>{grouped.CONFIRMED.length}</strong>
          <span>Completed settlements</span>
        </article>
        <article className="stat-card tone-neutral">
          <p>Total</p>
          <strong>{settlements.length}</strong>
          <span>All settlement records</span>
        </article>
      </section>

      <section className="panel-grid">
        <article className="panel-card wide">
          <SectionHeader title="Settlement queue" subtitle="Tap a settlement to view the payer/receiver actions." />
          <div className="timeline-list">
            {settlements.map((settlement) => (
              <div className="timeline-item" key={settlement.settlementId}>
                <div>
                  <strong>{settlement.from} → {settlement.to}</strong>
                  <p>{settlement.status} • {formatDateTime(settlement.createdAt)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <b>{formatCurrency(settlement.amount)}</b>
                  <Link className="button ghost" to={`/app/settlements/${settlement.settlementId}`}>
                    Open
                  </Link>
                </div>
              </div>
            ))}
            {!busy && settlements.length === 0 ? <p>No settlements yet.</p> : null}
          </div>
        </article>

        <article className="panel-card">
          <SectionHeader title="Status breakdown" subtitle="Grouped by settlement state." />
          <div className="stack small-gap">
            {statusOrder.map((status) => (
              <div className="mini-row" key={status}>
                <span>{status}</span>
                <strong>{grouped[status].length}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <ErrorDialog message={error} onClose={() => setError(null)} title="Settlements error" />
    </div>
  );
}