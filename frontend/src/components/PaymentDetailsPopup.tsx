import { useRef, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import type { PaymentNotification } from '../types';

type PaymentDetailsPopupProps = {
  notification: PaymentNotification | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  busy: boolean;
  lightTheme?: boolean;
};

export function PaymentDetailsPopup({
  notification,
  open,
  onClose,
  onConfirm,
  busy,
  lightTheme = false
}: PaymentDetailsPopupProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (!notification) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className="dialog-shell dialog-centered"
      aria-labelledby="payment-details-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      style={{ maxWidth: 'calc(100% - 40px)' }}
    >
      <div
        className="dialog-card dialog-large dialog-compact"
        role="document"
        style={
          lightTheme
            ? { backgroundColor: '#ffffff', color: '#0b1220', boxShadow: '0 8px 24px rgba(11,18,32,0.12)' }
            : undefined
        }
      >
        <div className="dialog-header dialog-header-compact">
          <span className="dialog-icon dialog-icon-compact" aria-hidden="true">
            <DollarSign size={20} />
          </span>
          <div>
            <p className="eyebrow dialog-eyebrow dialog-eyebrow-compact">
              Payment Details
            </p>
            <h3 id="payment-details-title" className="dialog-title-compact">
              Confirm Payment
            </h3>
          </div>
        </div>

        <div className="dialog-message dialog-message-compact">
          <div className="dialog-fields-compact">
            {/* Payer Info */}
            <div className="dialog-field-card dialog-field-card-compact">
              <p className="dialog-field-label">
                Payer
              </p>
              <p className="dialog-field-value dialog-field-value-large">{notification.payerName}</p>
            </div>

            {/* Amount */}
            <div className="dialog-field-card dialog-field-card-compact">
              <p className="dialog-field-label">
                Amount
              </p>
              <p className="dialog-field-value dialog-field-value-amount">₹{notification.amount.toFixed(2)}</p>
            </div>

            {/* Transaction ID */}
            <div className="dialog-field-card dialog-field-card-compact">
              <p className="dialog-field-label">
                Transaction ID
              </p>
              <p className="dialog-field-value dialog-field-value-code">
                {notification.transactionId}
              </p>
            </div>

            {/* Payment Method */}
            <div className="dialog-field-card dialog-field-card-compact">
              <p className="dialog-field-label">
                Payment Method
              </p>
              <p className="dialog-field-value">{notification.paymentMethod}</p>
            </div>

            {/* Payment Date */}
            <div className="dialog-field-card dialog-field-card-compact">
              <p className="dialog-field-label">
                Payment Date
              </p>
              <p className="dialog-field-value">{formatDate(notification.createdAt)}</p>
            </div>

            {/* Status */}
            <div className="dialog-field-card dialog-field-card-compact">
              <p className="dialog-field-label">
                Status
              </p>
              <p
                className="dialog-field-value"
                style={{ color: notification.status === 'CONFIRMED' ? '#39d98a' : '#fbbf24', textTransform: 'capitalize' }}
              >
                {notification.status.toLowerCase()}
              </p>
            </div>
          </div>
        </div>

        <div className="dialog-actions dialog-actions-compact">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{
              flex: '0 0 25%',
              minWidth: 90,
              padding: '10px 22px',
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
            Close
          </button>
          {notification.status !== 'CONFIRMED' && (
            <button
              type="button"
              onClick={async () => {
                await onConfirm();
                onClose();
              }}
              disabled={busy}
              style={{
                flex: '0 0 25%',
                minWidth: 90,
                padding: '10px 26px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#fbbf24',
                color: '#0b1220',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: busy ? 0.5 : 1
              }}
            >
              {busy ? 'Confirming...' : 'CONFIRM'}
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
