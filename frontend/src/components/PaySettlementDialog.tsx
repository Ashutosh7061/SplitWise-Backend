import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import type { PaymentMethod, SettlementDto } from '../types';

type PaySettlementDialogProps = {
  settlement: SettlementDto | null;
  open: boolean;
  onClose: () => void;
  onPay: (paymentMethod: PaymentMethod, transactionId: string, receiverUpi?: string | null) => Promise<void>;
  busy: boolean;
  receiverUpiId?: string | null;
  lightTheme?: boolean;
  groupCreatedAt?: string | null;
};

export function PaySettlementDialog({
  settlement,
  open,
  onClose,
  onPay,
  busy,
  receiverUpiId
  ,
  lightTheme = false,
  groupCreatedAt
}: PaySettlementDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE');
  const [transactionId, setTransactionId] = useState('');
  const [localBusy, setLocalBusy] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      setTransactionId('');
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  async function handlePay() {
    setLocalBusy(true);
    try {
      if (paymentMethod === 'ONLINE') {
        const upiToUse = receiverUpiId;
        if (!upiToUse) {
          alert('Receiver has not provided an UPI ID. Please select Cash instead.');
          return;
        }
        if (!transactionId.trim()) {
          alert('Please enter a transaction ID for online payments');
          return;
        }
        await onPay(paymentMethod, transactionId, upiToUse);
      } else {
        if (!transactionId.trim()) {
          alert('Please enter a transaction ID (enter 0000 for cash)');
          return;
        }
        await onPay(paymentMethod, transactionId, null);
      }

      setTransactionId('');
    } finally {
      setLocalBusy(false);
      onClose();
    }
  }

  if (!settlement) return null;

  return (
    <dialog
      ref={dialogRef}
      className="dialog-shell dialog-centered"
      aria-labelledby="payment-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div
        className="dialog-card dialog-large"
        role="document"
        style={
          lightTheme
            ? { backgroundColor: '#ffffff', color: '#0b1220', boxShadow: '0 8px 24px rgba(11,18,32,0.12)' }
            : undefined
        }
      >
        <div className="dialog-header" style={{ marginBottom: '28px' }}>
          <span className="dialog-icon" aria-hidden="true" style={{ fontSize: '24px' }}>
            <Send size={24} />
          </span>
          <div>
            <p className="eyebrow dialog-eyebrow" style={{ fontSize: '11px', letterSpacing: '1px', marginBottom: '4px' }}>Payment</p>
            <h3 id="payment-dialog-title" style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Pay Settlement</h3>
          </div>
        </div>

        <div className="dialog-message">
          <div className="payment-details">
            <div className="mini-row">
              <span>Receiver</span>
              <strong>{settlement.to}</strong>
            </div>
            <div className="mini-row">
              <span>Amount</span>
              <strong>₹{settlement.amount.toFixed(2)}</strong>
            </div>
            <div className="mini-row">
              <span>Group</span>
              <strong>{(settlement as any).groupName || 'N/A'}</strong>
            </div>
            {groupCreatedAt ? (
              <div className="mini-row">
                <span>Group created</span>
                <strong>{groupCreatedAt}</strong>
              </div>
            ) : null}
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              disabled={busy || localBusy}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '8px',
                border: '1.5px solid var(--color-border)',
                backgroundColor: lightTheme ? '#f9fafb' : 'var(--color-surface)',
                color: lightTheme ? '#0b1220' : 'inherit',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              {receiverUpiId && <option value="ONLINE">Online</option>}
              <option value="CASH">Cash</option>
            </select>
          </div>

          {paymentMethod === 'ONLINE' ? (
            receiverUpiId ? (
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Receiver UPI ID
                </label>
                <div
                  style={{
                    padding: '18px 20px',
                    borderRadius: 10,
                    border: '2px solid var(--color-success)',
                    backgroundColor: lightTheme ? '#f0fdf4' : 'rgba(34, 197, 94, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-success)',
                      flexShrink: 0
                    }}
                  />
                  <span
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      color: lightTheme ? '#0b7d3d' : '#22c55e',
                      wordBreak: 'break-all',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {receiverUpiId}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 24 }}>
                <p style={{ margin: 0, color: 'var(--color-muted)' }}>
                  Receiver has not provided a UPI ID. Please select <strong>Cash</strong> as the payment method.
                </p>
              </div>
            )
          ) : null}

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Transaction ID
              {paymentMethod === 'CASH' && <span style={{ fontSize: '12px', fontWeight: '400' }}> (Enter 0000 for cash)</span>}
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder={paymentMethod === 'CASH' ? '0000' : 'Enter transaction ID'}
              disabled={busy || localBusy}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 8,
                border: '1.5px solid var(--color-border)',
                backgroundColor: lightTheme ? '#f9fafb' : 'var(--color-surface)',
                color: lightTheme ? '#0b1220' : 'inherit',
                fontSize: 15,
                boxSizing: 'border-box',
                fontWeight: '400'
              }}
            />
          </div>
        </div>

        <div className="dialog-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={busy || localBusy}
            style={{
              flex: '0 0 25%',
              minWidth: 90,
              padding: '12px 28px',
              borderRadius: 8,
              border: '1.5px solid var(--color-border)',
              backgroundColor: lightTheme ? '#f3f4f6' : 'var(--color-surface)',
              color: lightTheme ? '#0b1220' : 'inherit',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handlePay()}
            disabled={
              busy ||
              localBusy ||
              (paymentMethod === 'ONLINE'
                ? !transactionId.trim() || !receiverUpiId
                : !transactionId.trim())
            }
            style={{
              flex: '0 0 25%',
              minWidth: 90,
              padding: '12px 32px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#fbbf24',
              color: '#0b1220',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: busy || localBusy || (paymentMethod === 'ONLINE' ? !transactionId.trim() || !receiverUpiId : !transactionId.trim()) ? 0.5 : 1
            }}
          >
            {busy || localBusy ? 'Processing...' : 'PAID'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
