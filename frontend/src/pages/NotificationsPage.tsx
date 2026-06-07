import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorDialog } from '../components/ErrorDialog';
import { useApp } from '../context/AppContext';
import { getInvitations, acceptInvitation, getPaymentNotifications, confirmSettlement, getGroups, getUsers } from '../api/splitwiseApi';
import { PaymentNotificationItem } from '../components/PaymentNotificationItem';
import { PaymentDetailsPopup } from '../components/PaymentDetailsPopup';
import { GroupInvitationItem } from '../components/GroupInvitationItem';
import { InvitationDetailsPopup } from '../components/InvitationDetailsPopup';
import type { GroupInvitation, PaymentNotification } from '../types';

export function NotificationsPage() {
  const { currentUser, refreshBalance } = useApp();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<(GroupInvitation & { groupName?: string; inviterName?: string })[]>([]);
  const [paymentNotifications, setPaymentNotifications] = useState<PaymentNotification[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<PaymentNotification | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<GroupInvitation & { groupName?: string; inviterName?: string } | null>(null);
  const [invitationDetailsOpen, setInvitationDetailsOpen] = useState(false);

  // Load invitations and payment notifications
  useEffect(() => {
    async function load() {
      if (!currentUser) return;
      setBusy(true);
      setError(null);
      try {
        const [invitesData, paymentsData, groupsData, usersData] = await Promise.all([
          getInvitations(currentUser.id),
          getPaymentNotifications(currentUser.id),
          getGroups(),
          getUsers()
        ]);
        
        // Enrich invitations with group names and user names
        const enrichedInvites = (invitesData || []).map((inv) => {
          const groupName = groupsData?.find((g: any) => g.id === inv.groupId)?.name;
          const inviterName = usersData?.find((u: any) => u.id === inv.invitedByUserId)?.name;
          return {
            ...inv,
            groupName,
            inviterName
          };
        });
        
        setInvitations(enrichedInvites);
        setPaymentNotifications(paymentsData || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to load notifications');
      } finally {
        setBusy(false);
      }
    }

    void load();
  }, [currentUser]);

  async function handleAcceptInvitation(inviteId: number) {
    setBusy(true);
    setError(null);
    try {
      await acceptInvitation(inviteId);
      // refresh invitations list
      if (currentUser) {
        const [items, groupsData, usersData] = await Promise.all([
          getInvitations(currentUser.id),
          getGroups(),
          getUsers()
        ]);
        
        // Enrich with names
        const enrichedInvites = (items || []).map((inv) => {
          const groupName = groupsData?.find((g: any) => g.id === inv.groupId)?.name;
          const inviterName = usersData?.find((u: any) => u.id === inv.invitedByUserId)?.name;
          return {
            ...inv,
            groupName,
            inviterName
          };
        });
        
        setInvitations(enrichedInvites);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to accept invitation');
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmPayment(notification: PaymentNotification) {
    setBusy(true);
    setError(null);
    try {
      await confirmSettlement(notification.settlementId, notification.receiverId);
      // Update local state
      setPaymentNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, status: 'CONFIRMED', read: true }
            : n
        )
      );
      setSelectedNotification((prev) =>
        prev && prev.id === notification.id
          ? { ...prev, status: 'CONFIRMED', read: true }
          : prev
      );
      refreshBalance();
      // Close details popup if open
      if (detailsOpen && selectedNotification?.id === notification.id) {
        setDetailsOpen(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to confirm payment');
    } finally {
      setBusy(false);
    }
  }

  function handleViewDetails(notification: PaymentNotification) {
    setSelectedNotification(notification);
    setDetailsOpen(true);
  }

  return (
    <div className="stack gap-large">
      <section className="panel-card">
        <h2>Notifications</h2>
        <p className="eyebrow">Pending invitations and payment confirmations</p>

        {invitations.length === 0 && paymentNotifications.length === 0 ? (
          <p>No notifications.</p>
        ) : (
          <div className="timeline-list">
            {/* Group Invitations */}
            {invitations.map((inv) => (
              <GroupInvitationItem
                key={`invite-${inv.id}`}
                invitation={inv}
                onDetails={(invitation) => {
                  setSelectedInvitation(invitation);
                  setInvitationDetailsOpen(true);
                }}
                onAccept={handleAcceptInvitation}
                busy={busy}
              />
            ))}

            {/* Payment Notifications */}
            {paymentNotifications.map((notification) => (
              <PaymentNotificationItem
                key={`payment-${notification.id}`}
                notification={notification}
                onDetails={handleViewDetails}
                onConfirm={handleConfirmPayment}
                busy={busy}
              />
            ))}
          </div>
        )}
      </section>

      {/* Payment Details Popup */}
      <PaymentDetailsPopup
        notification={selectedNotification}
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedNotification(null);
        }}
        onConfirm={() => selectedNotification ? handleConfirmPayment(selectedNotification) : Promise.resolve()}
        busy={busy}
      />

      {/* Invitation Details Popup */}
      <InvitationDetailsPopup
        invitation={selectedInvitation}
        open={invitationDetailsOpen}
        onClose={() => {
          setInvitationDetailsOpen(false);
          setSelectedInvitation(null);
        }}
        onAccept={selectedInvitation ? () => handleAcceptInvitation(selectedInvitation.id) : () => Promise.resolve()}
        busy={busy}
      />

      <ErrorDialog message={error} onClose={() => setError(null)} title="Notifications error" />
    </div>
  );
}
