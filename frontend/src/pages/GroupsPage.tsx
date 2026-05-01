import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { addUserToGroup, createGroup, getGroupMembers, removeUserFromGroup } from '../api/splitwiseApi';
import { ErrorDialog } from '../components/ErrorDialog';
import { SectionHeader } from '../components/SectionHeader';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/format';
import type { GroupMember } from '../types';

export function GroupsPage() {
  const { currentUser, groups, refreshGroups, refreshUsers, selectGroup, currentGroupId } = useApp();
  const [visibleGroupIds, setVisibleGroupIds] = useState<Set<number>>(new Set());
  const [name, setName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(currentGroupId || groups[0]?.id || null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadVisibleGroups() {
      if (!currentUser || groups.length === 0) {
        if (!cancelled) {
          setVisibleGroupIds(new Set());
        }
        return;
      }

      const membershipResults = await Promise.allSettled(
        groups.map(async (group) => ({
          groupId: group.id,
          members: await getGroupMembers(group.id)
        }))
      );

      if (cancelled) return;

      const groupIds = new Set<number>();
      for (const result of membershipResults) {
        if (result.status !== 'fulfilled') continue;
        const { groupId, members } = result.value;
        if (members.some((m) => m.userId === currentUser.id && m.active)) {
          groupIds.add(groupId);
        }
      }

      setVisibleGroupIds(groupIds);
    }

    void loadVisibleGroups();
    return () => {
      cancelled = true;
    };
  }, [currentUser, groups]);

  const visibleGroups = useMemo(
    () => groups.filter((group) => visibleGroupIds.has(group.id)),
    [groups, visibleGroupIds]
  );

  useEffect(() => {
    setSelectedGroupId(currentGroupId || visibleGroups[0]?.id || null);
  }, [currentGroupId, visibleGroups]);

  useEffect(() => {
    async function loadMembers() {
      if (!selectedGroupId) {
        setMembers([]);
        return;
      }

      try {
        const response = await fetch(`/api/v1/groups/${selectedGroupId}/members`);
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const data = (await response.json()) as GroupMember[];
        setMembers(data);
      } catch {
        setMembers([]);
      }
    }

    void loadMembers();
  }, [selectedGroupId]);

  async function handleCreateGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentUser) {
      setError('Sign in first');
      return;
    }

    setBusy(true);
    setError(null);
    setStatus(null);

    try {
      const group = await createGroup({ name, userId: currentUser.id });
      await refreshGroups();
      
      setVisibleGroupIds((prev) => new Set([...prev, group.id]));
      
      setName('');
      setSelectedGroupId(group.id);
      selectGroup(group.id);
      setStatus(`Created ${group.name}`);
      navigate(`/app/groups/${group.id}`);
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : 'Unable to create group');
    } finally {
      setBusy(false);
    }
  }

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentUser || !selectedGroupId) {
      setError('Pick a group and sign in first');
      return;
    }

    if (!inviteEmail.trim()) {
      setError('Enter a valid email');
      return;
    }

    setBusy(true);
    setError(null);
    setStatus(null);

    try {
      const result = await addUserToGroup({ groupId: selectedGroupId, email: inviteEmail.trim(), userId: currentUser.id });
      setInviteEmail('');
      
      try {
        const response = await fetch(`/api/v1/groups/${selectedGroupId}/members`);
        if (response.ok) {
          const data = (await response.json()) as GroupMember[];
          setMembers(data);
        }
      } catch {
        // Silently fail, refresh on next load
      }
      
      setStatus(result || 'Member added successfully');
      await refreshUsers();
    } catch (exception) {
      const errorMsg = exception instanceof ApiError ? exception.message : 'Unable to add member';
      setError(errorMsg);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(member: GroupMember) {
    if (!currentUser || !selectedGroupId) {
      return;
    }

    setBusy(true);
    setError(null);
    setStatus(null);

    try {
      const response = await removeUserFromGroup({
        groupId: selectedGroupId,
        removeUserId: member.userId,
        userId: currentUser.id
      });
      setStatus(response);
      const refreshed = await fetch(`/api/v1/groups/${selectedGroupId}/members`);
      setMembers((await refreshed.json()) as GroupMember[]);
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : 'Unable to remove member');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack gap-large">
      <section className="panel-card">
        <SectionHeader title="Create group" subtitle="Start a trip, house, or project workspace." />
        <form className="inline-form" onSubmit={handleCreateGroup}>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Goa Trip 2026" required />
          <button type="submit" className="button primary" disabled={busy}>Create</button>
        </form>
      </section>

      <section className="panel-grid">
        <article className="panel-card">
          <SectionHeader title="Your groups" subtitle="Select a workspace to manage." />
          <div className="group-list">
            {visibleGroups.length === 0 && <p>You are not a member of any groups yet.</p>}
            {visibleGroups.map((group) => (
              <button
                type="button"
                key={group.id}
                className={group.id === selectedGroupId ? 'group-row active' : 'group-row'}
                onClick={() => {
                  setSelectedGroupId(group.id);
                  selectGroup(group.id);
                }}
              >
                <span>
                  <strong>{group.name}</strong>
                  <small>Created by user #{group.createdBy}</small>
                </span>
                <b>{group.status}</b>
              </button>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <SectionHeader title="Invite member" subtitle="Send an invitation — user must accept from Notifications." />
          <form className="stack" onSubmit={handleInvite}>
            <label>
              Group
              <select value={selectedGroupId || ''} onChange={(event) => setSelectedGroupId(Number(event.target.value))}>
                {visibleGroups.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </label>
            <label>
              Member email
              <input value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="friend@example.com" required />
            </label>
            <button type="submit" className="button primary" disabled={busy}>Invite</button>
          </form>
        </article>
      </section>

      <section className="panel-card">
        <SectionHeader title="Group members" subtitle="People currently in the selected group." />
        {selectedGroupId ? (
          <div className="member-grid">
            {members.map((member) => (
              <article className="member-card" key={member.id}>
                <div>
                  <strong>{member.userName}</strong>
                  <p>{member.email}</p>
                </div>
                <div className="member-meta">
                  <span>{member.active ? 'Active' : 'Left'}</span>
                  <small>Joined {formatDateTime(member.joinedAt)}</small>
                </div>
                {currentUser?.id !== member.userId ? (
                  <button type="button" className="button ghost" onClick={() => void handleRemove(member)} disabled={busy}>
                    Remove
                  </button>
                ) : null}
              </article>
            ))}
            {members.length === 0 ? <p>No members loaded yet. Create a group or refresh after inviting someone.</p> : null}
          </div>
        ) : (
          <p>Select a group to inspect members.</p>
        )}
      </section>

      {status ? <p className="notice success">{status}</p> : null}
      <ErrorDialog message={error} onClose={() => setError(null)} title="Group error" />
    </div>
  );
}