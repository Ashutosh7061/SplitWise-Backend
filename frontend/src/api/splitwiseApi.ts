import { apiRequest } from './client';
import type {
  Expense,
  Group,
  GroupMember,
  GroupSummary,
  MonthlyBudgetPayload,
  MonthlyBudgetTrack,
  PersonalExpense,
  PersonalExpensePayload,
  PersonalExpenseSummary,
  PaymentMethod,
  SettlementData,
  SettlementDto,
  TimeBasedGroupSummary,
  User,
  UserGroupSummary
} from '../types';

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  upiId: string;
  preferredPaymentMethod?: PaymentMethod;
};

export type UpdateUpiIdPayload = {
  userEmailId: string;
  oldUpiId: string;
  newUpiId: string;
};

export type UpdatePasswordPayload = {
  userEmailId: string;
  oldPassword: string;
  newPassword: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  email: string;
  otp: string;
  newPassword: string;
};

export type CreateGroupPayload = {
  name: string;
  userId: number;
};

export type AddUserToGroupPayload = {
  groupId: number;
  email: string;
  userId: number;
};

export type RemoveUserFromGroupPayload = {
  groupId: number;
  removeUserId: number;
  userId: number;
};

export type CreateExpensePayload = {
  description: string;
  amount: number;
  paidByUserId: number;
  groupId: number;
  splitType: string;
  splitDetails: string | null;
};

export async function getUsers() {
  return apiRequest<User[]>('/users');
}

export async function createUser(payload: CreateUserPayload) {
  return apiRequest<User>('/users', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

function ensureExactMessage(message: string, expected: string) {
  if (message !== expected) {
    throw new ApiError(message, 400);
  }

  return message;
}

export async function updateUpiId(payload: UpdateUpiIdPayload) {
  const message = await apiRequest<string>('/users/update-upi', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return ensureExactMessage(message, 'UPI ID updated successfully');
}

export async function updatePassword(payload: UpdatePasswordPayload) {
  const message = await apiRequest<string>('/users/update-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return ensureExactMessage(message, 'Password updated successfully');
}

export async function sendForgotPasswordOtp(payload: ForgotPasswordPayload) {
  const message = await apiRequest<string>('/users/forgot-password/send-otp', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return ensureExactMessage(message, 'OTP sent to registered email');
}

export async function resetForgotPassword(payload: ResetPasswordPayload) {
  const message = await apiRequest<string>('/users/forgot-password/reset', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return ensureExactMessage(message, 'Password reset successfully');
}

export async function addPersonalExpense(payload: PersonalExpensePayload) {
  return apiRequest<string>('/personal/add', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getPersonalExpenses(userId: number) {
  return apiRequest<PersonalExpense[]>(`/personal/history?userId=${userId}`);
}

export async function getPersonalMonthlySummary(userId: number, year: number, month: number) {
  return apiRequest<PersonalExpenseSummary>(`/personal/monthly?userId=${userId}&year=${year}&month=${month}`);
}

export async function setMonthlyBudget(payload: MonthlyBudgetPayload) {
  return apiRequest<string>('/personal/set-budget', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getMonthlyBudgetTrack(userId: number, year: number, month: number) {
  return apiRequest<MonthlyBudgetTrack>(`/personal/budget-track?userId=${userId}&year=${year}&month=${month}`);
}

export async function getGroups() {
  return apiRequest<Group[]>('/groups');
}

export async function createGroup(payload: CreateGroupPayload) {
  return apiRequest<Group>('/groups/create', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function addUserToGroup(payload: AddUserToGroupPayload) {
  return apiRequest<string>('/groups/add-user', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function removeUserFromGroup(payload: RemoveUserFromGroupPayload) {
  return apiRequest<string>('/groups/remove-user', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getGroupMembers(groupId: number) {
  return apiRequest<GroupMember[]>(`/groups/${groupId}/members`);
}

export async function getGroupSummary(groupId: number) {
  return apiRequest<GroupSummary>(`/groups/${groupId}/summary`);
}

export async function getGroupAnalysis(groupId: number, type: 'weekly' | 'monthly') {
  return apiRequest<TimeBasedGroupSummary>(`/groups/${groupId}/analysis?type=${type}`);
}

export async function getUserSummary(groupId: number, email: string) {
  return apiRequest<UserGroupSummary>(`/groups/${groupId}/summary/user?groupId=${groupId}&email=${encodeURIComponent(email)}`);
}

export async function getExpenses(groupId: number) {
  return apiRequest<Expense[]>(`/expenses/group/${groupId}`);
}

export async function createExpense(payload: CreateExpensePayload) {
  return apiRequest<Expense>('/expenses', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getBalances(groupId: number, userIds: number[]) {
  return apiRequest<SettlementData[]>(`/expenses/balances/${groupId}`, {
    method: 'POST',
    body: JSON.stringify(userIds)
  });
}

export async function getSettlements(groupId: number) {
  return apiRequest<SettlementDto[]>(`/settlements/group/${groupId}`);
}

export async function getSettlement(settlementId: number) {
  return apiRequest<SettlementDto>(`/settlements/${settlementId}`);
}

export async function paySettlement(settlementId: number, paymentMethod: PaymentMethod) {
  return apiRequest<string>(`/settlements/${settlementId}/pay`, {
    method: 'POST',
    body: JSON.stringify({ paymentMethod })
  });
}

export async function sendSettlementEmails(groupId: number) {
  return apiRequest<string>(`/notifications/settlements/${groupId}/email`, {
    method: 'POST'
  });
}