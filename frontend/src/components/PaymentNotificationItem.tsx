import { AlertCircle, Check } from 'lucide-react';
import type { PaymentNotification } from '../types';

type PaymentNotificationItemProps = {
  notification: PaymentNotification;
  onDetails: (notification: PaymentNotification) => void;
  onConfirm: (notification: PaymentNotification) => Promise<void>;
  busy: boolean;
};

export function PaymentNotificationItem({
  notification,
  onDetails,
  onConfirm,
  busy
}: PaymentNotificationItemProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <article
      className="timeline-item"
      style={{
        backgroundColor: notification.isRead ? 'rgba(255, 255, 255, 0.03)' : 'rgba(245, 165, 36, 0.08)',
        borderColor: notification.isRead ? 'rgba(255, 255, 255, 0.08)' : 'rgba(245, 165, 36, 0.32)',
        borderLeft: `3px solid ${notification.status === 'CONFIRMED' ? '#39d98a' : '#fbbf24'}`
      }}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ flex: '0 0 auto', marginTop: '2px' }}>
          {notification.status === 'CONFIRMED' ? (
            <Check size={20} style={{ color: '#39d98a' }} />
          ) : (
            <AlertCircle size={20} style={{ color: '#fbbf24' }} />
          )}
        </div>
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ fontSize: '15px', fontWeight: '700' }}>Payment from {notification.payerName}</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--muted)', fontWeight: '400' }}>
              Amount: <strong>₹{notification.amount.toFixed(2)}</strong> • {formatDate(notification.createdAt)}
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--muted)', fontWeight: '400' }}>
              Transaction ID: <code style={{ fontFamily: 'monospace', fontSize: '11px' }}>{notification.transactionId}</code>
            </p>
          </div>

          {/* Status Badge */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                backgroundColor:
                  notification.status === 'CONFIRMED'
                    ? 'rgba(57, 217, 138, 0.12)'
                    : notification.status === 'PAID'
                    ? 'rgba(245, 165, 36, 0.12)'
                    : 'rgba(255, 255, 255, 0.08)',
                color:
                  notification.status === 'CONFIRMED'
                    ? '#39d98a'
                    : notification.status === 'PAID'
                    ? '#fbbf24'
                    : 'inherit'
              }}
            >
              {notification.status.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '36px', justifyContent: 'center' }}>
        <button
          type="button"
          className="button ghost"
          onClick={() => onDetails(notification)}
          disabled={busy}
          style={{ padding: '8px 20px', fontSize: '12px', minHeight: 'auto', height: '36px' }}
        >
          Details
        </button>

        {notification.status !== 'CONFIRMED' && (
          <button
            type="button"
            className="button primary"
            onClick={() => void onConfirm(notification)}
            disabled={busy}
            style={{ padding: '8px 20px', fontSize: '12px', minHeight: 'auto', height: '36px' }}
          >
            {busy ? 'Confirming...' : 'CONFIRM'}
          </button>
        )}
      </div>
    </article>
  );
}
