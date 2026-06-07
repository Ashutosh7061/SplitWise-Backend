export type PaymentMethod = 'CASH' | 'ONLINE';

export interface User {
  id: number;
  name: string;
  preferredPaymentMethod: PaymentMethod | null;
  email: string;
  password?: string | null;
  upiId?: string | null;
}

export interface Group {
  id: number;
  name: string;
  createdBy: number;
  status: string;
}

export interface GroupMember {
  id: number;
  groupId: number;
  userId: number;
  userName: string;
  email: string;
  preferredPaymentMethod: PaymentMethod | null;
  joinedAt: string | null;
  leftAt: string | null;
  active: boolean;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  paidByUserId: number;
  groupId: number;
  splitType: string;
  splitDetails: string | null;
  createdAt: string | null;
}

export interface PersonalExpense {
  description: string;
  amount: number;
  category: string;
  createdAt: string | null;
}

export interface PersonalExpenseSummary {
  userId: number;
  userName: string;
  totalExpense: number;
  month: string;
  categoryBreakdown: Record<string, number>;
  highestExpenseByCategory: Record<string, PersonalExpense>;
}

export interface MonthlyBudgetTrack {
  limit: number;
  spent: number;
  remaining: number;
  status: string;
}

export interface PersonalExpensePayload {
  userId: number;
  description: string;
  amount: number;
  category: string;
}

export interface MonthlyBudgetPayload {
  userId: number;
  limit: number;
  year: number;
  month: number;
}

export interface SettlementData {
  from: string;
  to: string;
  amount: number;
}

export interface SettlementDto {
  settlementId: number;
  from: string;
  to: string;
  amount: number;
  status: string;
  receiverPreferredMathod: PaymentMethod | null;
  createdAt: string | null;
  paidAt: string | null;
}

export interface PaymentNotification {
  id: number;
  settlementId: number;
  receiverId: number;
  payerId: number;
  payerName: string;
  amount: number;
  transactionId: string;
  paymentMethod: PaymentMethod;
  status: string;
  isRead: boolean;
  createdAt: string;
  confirmedAt: string | null;
}

export interface SettlementSummary {
  totalSettlements: number;
  paidSettlements: number;
  unpaidSettlements: number;
}

export interface UserExpenseSummary {
  userName: string;
  totalPaid: number;
  netBalance: number;
  totalOwes: number;
}

export interface GroupSummary {
  groupId: number;
  groupName: string;
  totalExpense: number;
  userSummaries: UserExpenseSummary[];
  settlementSummary: SettlementSummary;
}

export interface TimeBasedGroupSummary {
  groupId: number;
  groupName: string;
  analysisType: string;
  fromDate: string;
  toDate: string;
  totalExpense: number;
  userSummaries: UserExpenseSummary[];
}

export interface UserGroupSummary {
  groupId: number;
  groupName: string;
  userName: string;
  totalPaid: number;
  totalOwes: number;
  netBalance: number;
}

export interface ApiErrorPayload {
  message?: string;
  statusCode?: number;
  currTimeStamp?: string;
}

export interface GroupInvitation {
  id: number;
  groupId: number;
  invitedUserId: number;
  invitedByUserId: number;
  status: string;
  createdAt: string | null;
}