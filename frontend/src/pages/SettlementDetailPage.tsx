import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { getSettlement, paySettlement } from '../api/splitwiseApi';
import { ErrorDialog } from '../components/ErrorDialog';
import { SectionHeader } from '../components/SectionHeader';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDateTime } from '../utils/format';
import type { PaymentMethod, SettlementDto } from '../types';

export function SettlementDetailPage() {
  const { settlementId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const numericId = Number(settlementId);
  const [settlement, setSettlement] = useState<SettlementDto | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      if (!numericId) return;
      const data = await getSettlement(numericId);
      setSettlement(data);
      if (data.receiverPreferredMathod) {
        setPaymentMethod(data.receiverPreferredMathod);
      }
    }

    void load();
  }, [numericId]);

  async function handlePay() {
    setBusy(true);
    setStatus(null);
    setError(null);

    try {
      const response = await paySettlement(numericId, paymentMethod);
      setStatus(response);
      const refreshed = await getSettlement(numericId);
      setSettlement(refreshed);
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : 'Unable to update payment');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel-card form-panel">
      <SectionHeader title="Settlement detail" subtitle="Review the payment request and complete it when ready." />

      {settlement ? (
        <div className="settlement-detail">
          <div className="summary-banner">
            <div>
              <p className="eyebrow">Settlement #{settlement.settlementId}</p>
              <h3>{settlement.from} - {settlement.to}</h3>
              <span>Created {formatDateTime(settlement.createdAt)}</span>
            </div>
            <strong>{formatCurrency(settlement.amount)}</strong>
          </div>

          <div className="mini-row"><span>Status</span><strong>{settlement.status}</strong></div>
          <div className="mini-row"><span>Receiver payment method</span><strong>{settlement.receiverPreferredMathod || 'Unset'}</strong></div>
          <div className="mini-row"><span>Paid at</span><strong>{formatDateTime(settlement.paidAt)}</strong></div>

          <label>
            Payment method
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
              <option value="ONLINE">ONLINE</option>
              <option value="CASH">CASH</option>
            </select>
          </label>

          <div className="inline-actions">
            <button type="button" className="button primary" onClick={() => void handlePay()} disabled={busy || settlement.status === 'PAID'}>
              {busy ? 'Updating...' : 'Mark as paid'}
            </button>
            <button type="button" className="button ghost" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>

          {status ? <p className="notice success">{status}</p> : null}
          <ErrorDialog message={error} onClose={() => setError(null)} title="Settlement error" />
        </div>
      ) : (
        <p>Loading settlement...</p>
      )}

      {currentUser ? <p className="notice neutral">Signed in as {currentUser.name}</p> : null}
    </section>
  );
}