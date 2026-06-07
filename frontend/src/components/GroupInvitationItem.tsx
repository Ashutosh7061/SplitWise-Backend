import { Users, Check } from 'lucide-react';
import type { GroupInvitation } from '../types';

type GroupInvitationItemProps = {
  invitation: GroupInvitation & { groupName?: string; inviterName?: string };
  onDetails: (invitation: GroupInvitation & { groupName?: string; inviterName?: string }) => void;
  onAccept: (invitationId: number) => Promise<void>;
  busy: boolean;
};

export function GroupInvitationItem({
  invitation,
  onDetails,
  onAccept,
  busy
}: GroupInvitationItemProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Recently';
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
        backgroundColor: 'rgba(54, 194, 180, 0.08)',
        borderColor: 'rgba(54, 194, 180, 0.32)',
        borderLeft: `3px solid #36c2b4`
      }}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ flex: '0 0 auto', marginTop: '2px' }}>
          <Users size={20} style={{ color: '#36c2b4' }} />
        </div>
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ fontSize: '15px', fontWeight: '700' }}>
              Group Invitation: {invitation.groupName || `Group #${invitation.groupId}`}
            </strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--muted)', fontWeight: '400' }}>
              Invited by: <strong>{invitation.inviterName || `User #${invitation.invitedByUserId}`}</strong>
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--muted)', fontWeight: '400' }}>
              {formatDate(invitation.createdAt)}
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
                backgroundColor: 'rgba(54, 194, 180, 0.12)',
                color: '#36c2b4'
              }}
            >
              Pending
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '36px', justifyContent: 'center' }}>
        <button
          type="button"
          className="button ghost"
          onClick={() => onDetails(invitation)}
          disabled={busy}
          style={{ padding: '8px 20px', fontSize: '12px', minHeight: 'auto', height: '36px' }}
        >
          Details
        </button>

        <button
          type="button"
          className="button primary"
          onClick={() => void onAccept(invitation.id)}
          disabled={busy}
          style={{ padding: '8px 20px', fontSize: '12px', minHeight: 'auto', height: '36px' }}
        >
          {busy ? 'Accepting...' : 'ACCEPT'}
        </button>
      </div>
    </article>
  );
}
