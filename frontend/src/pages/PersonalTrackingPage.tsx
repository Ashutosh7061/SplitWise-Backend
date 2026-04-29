import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeIndianRupee, Sparkles } from 'lucide-react';
import { ApiError } from '../api/client';
import {
  addPersonalExpense,
  getMonthlyBudgetTrack,
  getPersonalExpenses,
  getPersonalMonthlySummary,
  setMonthlyBudget
} from '../api/splitwiseApi';
import { ErrorDialog } from '../components/ErrorDialog';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDateTime } from '../utils/format';
import type { MonthlyBudgetTrack, PersonalExpense, PersonalExpenseSummary } from '../types';

const expenseCategories = ['FOOD', 'TRANSPORT', 'BILLS', 'SHOPPING', 'HEALTH', 'EDUCATION', 'OTHER'];

function getMonthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
}

function parseServerDate(value: string | null) {
  if (!value) {
    return null;
  }

  const timestampMatch = value.match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2})-(\d{2})-(\d{2})$/);
  const parsedValue = timestampMatch
    ? `${timestampMatch[3]}-${timestampMatch[2]}-${timestampMatch[1]}T${timestampMatch[4]}:${timestampMatch[5]}:${timestampMatch[6]}`
    : value;

  const parsedDate = new Date(parsedValue);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function PersonalTrackingPage() {
  const { currentUser } = useApp();
  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const monthLabel = useMemo(() => getMonthLabel(year, month), [month, year]);
  const [budgetTrack, setBudgetTrack] = useState<MonthlyBudgetTrack | null>(null);
  const [summary, setSummary] = useState<PersonalExpenseSummary | null>(null);
  const [history, setHistory] = useState<PersonalExpense[]>([]);
  const [budgetLimit, setBudgetLimit] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTracking() {
      if (!currentUser) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const track = await getMonthlyBudgetTrack(currentUser.id, year, month);
        if (cancelled) {
          return;
        }

        setBudgetTrack(track);
        const [monthlySummary, expenses] = await Promise.all([
          getPersonalMonthlySummary(currentUser.id, year, month),
          getPersonalExpenses(currentUser.id)
        ]);
        const monthHistory = expenses.filter((expense) => {
          const parsedDate = parseServerDate(expense.createdAt);
          return parsedDate ? parsedDate.getFullYear() === year && parsedDate.getMonth() + 1 === month : true;
        });

        if (cancelled) {
          return;
        }

        setSummary(monthlySummary);
        setHistory(monthHistory);
      } catch (exception) {
        if (cancelled) {
          return;
        }

        if (exception instanceof ApiError && exception.status === 404) {
          setBudgetTrack(null);
          setSummary(null);
          setHistory([]);
          return;
        }

        setError(exception instanceof ApiError ? exception.message : 'Unable to load personal tracking');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadTracking();

    return () => {
      cancelled = true;
    };
  }, [currentUser, month, year]);

  async function refreshTracking() {
    if (!currentUser) {
      return;
    }

    const [track, monthlySummary, expenses] = await Promise.all([
      getMonthlyBudgetTrack(currentUser.id, year, month),
      getPersonalMonthlySummary(currentUser.id, year, month),
      getPersonalExpenses(currentUser.id)
    ]);

    const monthHistory = expenses.filter((expense) => {
      const parsedDate = parseServerDate(expense.createdAt);
      return parsedDate ? parsedDate.getFullYear() === year && parsedDate.getMonth() + 1 === month : true;
    });

    setBudgetTrack(track);
    setSummary(monthlySummary);
    setHistory(monthHistory);
  }

  async function handleBudgetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentUser) {
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      await setMonthlyBudget({
        userId: currentUser.id,
        limit: Number(budgetLimit),
        year,
        month
      });
      await refreshTracking();
      setSuccess(`Monthly budget set for ${monthLabel}.`);
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : 'Unable to save budget');
    } finally {
      setBusy(false);
    }
  }

  async function handleExpenseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentUser) {
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      await addPersonalExpense({
        userId: currentUser.id,
        description,
        amount: Number(amount),
        category
      });
      await refreshTracking();
      setDescription('');
      setAmount('');
      setCategory('');
      setSuccess('Personal expense added.');
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : 'Unable to save personal expense');
    } finally {
      setBusy(false);
    }
  }

  const topCategory = summary
    ? Object.entries(summary.categoryBreakdown).sort(([, left], [, right]) => right - left)[0]
    : null;

  const highestCategory = summary ? Object.entries(summary.highestExpenseByCategory)[0] : null;

  if (loading) {
    return <div className="loading-screen">Loading personal tracking...</div>;
  }

  return (
    <div className="stack gap-large personal-tracking-page">
      <section className="panel-card personal-intro">
        <div className="personal-intro-copy">
          <p className="eyebrow">Personal tracking</p>
          <h2>Start personal tracking</h2>
          <p>To begin, add your monthly budget for {monthLabel}.</p>
          <div className="personal-intro-actions">
            <Link className="button ghost" to="/app">
              Back to dashboard
            </Link>
            <a className="button primary" href="#budget-form">
              <ArrowRight size={16} />
              Add monthly budget
            </a>
          </div>
        </div>

        <div className="budget-highlight">
          <BadgeIndianRupee size={26} />
          <strong>{monthLabel}</strong>
          <span>Tracking unlocks after you set a monthly limit.</span>
        </div>
      </section>

      {!budgetTrack ? (
        <section className="panel-card form-panel" id="budget-form">
          <SectionHeader
            title="Add monthly budget"
            subtitle="Set the limit first, then you can record personal expenses against it."
          />

          <form className="stack" onSubmit={handleBudgetSubmit}>
            <div className="form-grid">
              <label>
                Month
                <input value={monthLabel} readOnly />
              </label>
              <label>
                Monthly limit
                <input
                  value={budgetLimit}
                  onChange={(event) => setBudgetLimit(event.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="25000"
                  required
                />
              </label>
            </div>

            <button type="submit" className="button primary" disabled={busy}>
              {busy ? 'Saving...' : 'Save budget'}
            </button>
          </form>
        </section>
      ) : (
        <>
          <section className="overview-grid">
            <StatCard label="Budget limit" value={budgetTrack.limit} valueType="currency" tone="accent" hint={monthLabel} />
            <StatCard label="Spent so far" value={budgetTrack.spent} valueType="currency" tone="warning" hint="Current month" />
            <StatCard label="Remaining Budget" value={budgetTrack.remaining} valueType="currency" tone="success" hint={budgetTrack.status} />
            <StatCard label="Top category" value={topCategory ? formatCurrency(topCategory[1]) : 'No activity'} tone="neutral" hint={topCategory ? topCategory[0] : 'Add an expense to start'} />
          </section>

          <section className="panel-grid">
            <article className="panel-card wide">
              <SectionHeader
                title="Record personal expense"
                subtitle="Capture your own spending separately from group expenses."
              />

              <form className="stack" onSubmit={handleExpenseSubmit}>
                <div className="form-grid">
                  <label>
                    Description
                    <input
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Dinner at restaurant"
                      required
                    />
                  </label>

                  <label>
                    Amount
                    <input
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="999"
                      required
                    />
                  </label>
                </div>

                <div className="form-grid">
                  <label>
                    Category
                    <select value={category} onChange={(event) => setCategory(event.target.value)} required>
                      <option value="" disabled>
                        Select
                      </option>
                      {expenseCategories.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="budget-progress-card">
                    <span>Budget usage</span>
                    <strong>
                      {budgetTrack.limit > 0 ? Math.round((budgetTrack.spent / budgetTrack.limit) * 100) : 0}%
                    </strong>
                    <div className="budget-progress">
                      <div
                        className={`budget-progress-fill ${budgetTrack.limit > 0 && (budgetTrack.spent / budgetTrack.limit) * 100 >= 90 ? 'budget-warning' : ''}`}
                        style={{ width: `${Math.min(100, budgetTrack.limit > 0 ? (budgetTrack.spent / budgetTrack.limit) * 100 : 0)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="button primary" disabled={busy}>
                  {busy ? 'Saving...' : 'Save personal expense'}
                </button>
              </form>
            </article>

            <article className="panel-card">
              <SectionHeader title="Month snapshot" subtitle="What the tracker is seeing right now." />
              <div className="personal-snapshot">
                <div className="mini-row">
                  <span>Period</span>
                  <strong>{summary?.month || monthLabel}</strong>
                </div>
                <div className="mini-row">
                  <span>Total expense</span>
                  <strong>{formatCurrency(summary?.totalExpense || 0)}</strong>
                </div>
                <div className="mini-row">
                  <span>Highest category spend</span>
                  <strong>{highestCategory ? highestCategory[0] : 'No data'}</strong>
                </div>
              </div>

              <div className="personal-highlights">
                {summary?.highestExpenseByCategory && Object.entries(summary.highestExpenseByCategory).map(([itemCategory, expense]) => (
                  <div key={itemCategory} className="highlight-row">
                    <span>{itemCategory}</span>
                    <strong>{formatCurrency(expense.amount)}</strong>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="panel-card">
            <SectionHeader title="Personal history" subtitle="Latest expenses recorded for the selected month." />
            <div className="timeline-list">
              {history.map((expense) => (
                <article className="timeline-item" key={`${expense.description}-${expense.createdAt}`}>
                  <div>
                    <strong>{expense.description}</strong>
                    <p>{expense.category}</p>
                  </div>
                  <div className="align-right">
                    <b>{formatCurrency(expense.amount)}</b>
                    <small>{formatDateTime(expense.createdAt)}</small>
                  </div>
                </article>
              ))}
              {history.length === 0 ? <p className="notice neutral">No personal expenses recorded yet.</p> : null}
            </div>
          </section>
        </>
      )}

      <ErrorDialog message={error} onClose={() => setError(null)} title="Personal tracking error" />
      {success ? <p className="notice success">{success}</p> : null}
    </div>
  );
}
