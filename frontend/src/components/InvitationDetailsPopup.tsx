import { useRef, useEffect } from 'react';
import { Users, Calendar } from 'lucide-react';
import type { GroupInvitation } from '../types';

type InvitationDetailsPopupProps = {
  invitation: (GroupInvitation & { groupName?: string; inviterName?: string }) | null;
  open: boolean;
  onClose: () => void;
  onAccept: () => Promise<void>;
  busy: boolean;
};

export function InvitationDetailsPopup({
  invitation,
  open,
  onClose,
  onAccept,
  busy
}: InvitationDetailsPopupProps) {
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

  if (!invitation) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Recently';
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
      aria-labelledby="invitation-details-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      style={{ maxWidth: 'calc(100% - 40px)' }}
    >
      <div
        className="dialog-card dialog-large dialog-compact"
        role="document"
      >
        <div className="dialog-header dialog-header-compact">
          <span className="dialog-icon dialog-icon-compact" aria-hidden="true">
            <Users size={20} />
          </span>
          <div>
            <p className="eyebrow dialog-eyebrow dialog-eyebrow-compact">
              Group Invitation
            </p>
            <h3 id="invitation-details-title" className="dialog-title-compact">
              Join Group
            </h3>
          </div>
        </div>

        <div className="dialog-message dialog-message-compact">
          <div className="dialog-fields-compact">
            {/* Group Name */}
            <div className="dialog-field-card dialog-field-card-compact">
              <p className="dialog-field-label">
                Group Name
              </p>
              <p className="dialog-field-value dialog-field-value-large">
                {invitation.groupName || `Group #${invitation.groupId}`}
              </p>
            </div>

            {/* Inviter Name */}
            <div className="dialog-field-card dialog-field-card-compact">
              <p className="dialog-field-label">
                Invited By
              </p>
              <p className="dialog-field-value dialog-field-value-large">
                {invitation.inviterName || `User #${invitation.invitedByUserId}`}
              </p>
            </div>

            {/* Invitation Date */}
            <div className="dialog-field-card dialog-field-card-compact">
              <p className="dialog-field-label">
                Invitation Date
              </p>
              <p className="dialog-field-value">{formatDate(invitation.createdAt)}</p>
            </div>

            {/* Status */}
            <div className="dialog-field-card dialog-field-card-compact">
              <p className="dialog-field-label">
                Status
              </p>
              <p
                className="dialog-field-value"
                style={{ color: '#36c2b4', textTransform: 'capitalize' }}
              >
                {invitation.status.toLowerCase()}
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
              backgroundColor: 'var(--color-surface)',
              color: 'inherit',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={async () => {
              await onAccept();
              onClose();
            }}
            disabled={busy}
            style={{
              flex: '0 0 25%',
              minWidth: 90,
              padding: '10px 26px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#36c2b4',
              color: '#0b1220',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: busy ? 0.5 : 1
            }}
          >
            {busy ? 'Accepting...' : 'ACCEPT'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
