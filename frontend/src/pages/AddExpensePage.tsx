import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { createExpense, getGroupMembers } from '../api/splitwiseApi';
import { ErrorDialog } from '../components/ErrorDialog';
import { SectionHeader } from '../components/SectionHeader';
import { useApp } from '../context/AppContext';
import type { GroupMember } from '../types';

type SplitType = 'EQUAL' | 'EXACT' | 'PERCENTAGE';

type SplitDraft = {
  userId: number;
  value: string;
};

export function AddExpensePage() {
  const { currentUser, groups, currentGroupId, selectGroup } = useApp();
  const navigate = useNavigate();
  const defaultGroupId = currentGroupId || null;
  const [groupId, setGroupId] = useState<number | null>(defaultGroupId);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidByUserId, setPaidByUserId] = useState<number | null>(currentUser?.id || null);
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [drafts, setDrafts] = useState<SplitDraft[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedGroup = useMemo(() => groups.find((group) => group.id === groupId) || null, [groupId, groups]);

  useEffect(() => {
    async function loadMembers() {
      if (!groupId) {
        setMembers([]);
        setDrafts([]);
        return;
      }

      try {
        const data = await getGroupMembers(groupId);
        setMembers(data);
        setDrafts(data.map((member) => ({ userId: member.userId, value: splitType === 'PERCENTAGE' ? '0' : '' })));
        if (!paidByUserId && data.length > 0) {
          setPaidByUserId(data[0].userId);
        }
      } catch {
        setMembers([]);
      }
    }

    void loadMembers();
  }, [groupId, splitType]);

  useEffect(() => {
    if (groupId) {
      selectGroup(groupId);
    }
  }, [groupId, selectGroup]);

  function updateDraft(userId: number, value: string) {
    setDrafts((previous) => previous.map((draft) => (draft.userId === userId ? { ...draft, value } : draft)));
  }

  function buildSplitDetails() {
    if (splitType === 'EQUAL') {
      return null;
    }

    const payload: Record<string, number> = {};
    for (const draft of drafts) {
      if (draft.value.trim() === '') {
        throw new ApiError('Fill every split value before saving the expense', 400);
      }

      const numericValue = Number(draft.value);
      if (Number.isNaN(numericValue) || numericValue < 0) {
        throw new ApiError('Split values must be valid numbers greater than or equal to 0', 400);
      }

      payload[String(draft.userId)] = numericValue;
    }

    if (splitType === 'PERCENTAGE') {
      const totalPercentage = Object.values(payload).reduce((sum, value) => sum + value, 0);
      if (Math.round(totalPercentage) !== 100) {
        throw new ApiError('Percentage split must add up to 100', 400);
      }
    }

    return JSON.stringify(payload);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!groupId || !paidByUserId || !currentUser) {
      setError('Choose a group and payer first');
      return;
    }

    setBusy(true);
    setStatus(null);
    setError(null);

    try {
      await createExpense({
        description,
        amount: Number(amount),
        paidByUserId,
        groupId,
        splitType,
        splitDetails: buildSplitDetails()
      });

      setDescription('');
      setAmount('');
      setStatus('Expense saved successfully.');
      navigate(`/app/groups/${groupId}`);
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : 'Unable to save expense');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel-card form-panel">
      <SectionHeader title="Add expense" subtitle="Track a new shared payment with a polished split form." />

      {!groupId ? (
        <p className="notice neutral">No group selected yet. Join or create a group before adding an expense.</p>
      ) : null}

      <form className="stack" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Group
            <select value={groupId || ''} onChange={(event) => setGroupId(Number(event.target.value))}>
              <option value="" disabled>Select a group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </label>

          <label>
            Paid by
            <select value={paidByUserId || ''} onChange={(event) => setPaidByUserId(Number(event.target.value))}>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>{member.userName}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-grid">
          <label>
            Description
            <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Hotel stay" required />
          </label>

          <label>
            Amount
            <input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="0" step="0.01" placeholder="8420" required />
          </label>
        </div>

        <div className="mini-tabs">
          {(['EQUAL', 'EXACT', 'PERCENTAGE'] as SplitType[]).map((type) => (
            <button key={type} type="button" className={splitType === type ? 'tab active' : 'tab'} onClick={() => setSplitType(type)}>
              {type}
            </button>
          ))}
        </div>

        {splitType !== 'EQUAL' ? (
          <div className="split-editor">
            {members.map((member) => (
              <label key={member.userId} className="split-row">
                <span>{member.userName}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={drafts.find((draft) => draft.userId === member.userId)?.value || ''}
                  onChange={(event) => updateDraft(member.userId, event.target.value)}
                  placeholder={splitType === 'PERCENTAGE' ? '25' : '1200'}
                />
              </label>
            ))}
          </div>
        ) : (
          <p className="notice neutral">Equal split will divide the total amount across the selected group members automatically.</p>
        )}

        <button type="submit" className="button primary" disabled={busy || !selectedGroup}>
          {busy ? 'Saving...' : 'Save expense'}
        </button>
      </form>

      {status ? <p className="notice success">{status}</p> : null}
      <ErrorDialog message={error} onClose={() => setError(null)} title="Expense error" />
    </section>
  );
}