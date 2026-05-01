import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorDialog } from '../components/ErrorDialog';
import { useApp } from '../context/AppContext';
import { getInvitations, acceptInvitation } from '../api/splitwiseApi';
import type { GroupInvitation } from '../types';

export function NotificationsPage() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!currentUser) return;
      setBusy(true);
      setError(null);
      try {
        const items = await getInvitations(currentUser.id);
        setInvitations(items || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to load invitations');
      } finally {
        setBusy(false);
      }
    }

    void load();
  }, [currentUser]);

  async function handleAccept(inviteId: number) {
    setBusy(true);
    setError(null);
    try {
      const message = await acceptInvitation(inviteId);
      // refresh list
      if (currentUser) {
        const items = await getInvitations(currentUser.id);
        setInvitations(items || []);
      }
      // navigate to group detail on success
      // message may contain success text
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to accept invitation');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack gap-large">
      <section className="panel-card">
        <h2>Notifications</h2>
        <p className="eyebrow">Pending invitations and actions</p>

        {invitations.length === 0 ? <p>No notifications.</p> : (
          <div className="timeline-list">
            {invitations.map((inv) => (
              <article className="timeline-item" key={inv.id}>
                <div>
                  <strong>Invitation to join group: {inv.groupId}</strong>
                  <p>Invited by user id: {inv.invitedByUserId}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="button primary" onClick={() => void handleAccept(inv.id)} disabled={busy}>Accept</button>
                  <button className="button ghost" onClick={() => navigate(`/app/groups/${inv.groupId}`)}>Open group</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <ErrorDialog message={error} onClose={() => setError(null)} title="Notifications error" />
    </div>
  );
}
