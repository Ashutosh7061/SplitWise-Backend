import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError } from '../api/client';
import {
  createUser,
  getGroups,
  getUsers,
  resetForgotPassword,
  sendForgotPasswordOtp,
  updatePassword,
  updateUpiId,
  type CreateUserPayload
} from '../api/splitwiseApi';
import type { Group, PaymentMethod, User } from '../types';

type AppContextValue = {
  users: User[];
  groups: Group[];
  currentUser: User | null;
  currentGroupId: number | null;
  theme: 'dark' | 'light';
  isBootstrapping: boolean;
  balanceRefreshToken: number;
  login: (email: string, password: string) => Promise<User>;
  signup: (payload: CreateUserPayload) => Promise<User>;
  logout: () => void;
  refreshUsers: () => Promise<void>;
  refreshGroups: () => Promise<void>;
  refreshBalance: () => void;
  selectGroup: (groupId: number | null) => void;
  updateUserPreference: (paymentMethod: PaymentMethod) => Promise<void>;
  updateUserUpiId: (oldUpiId: string, newUpiId: string) => Promise<string>;
  updateUserPassword: (oldPassword: string, newPassword: string) => Promise<string>;
  sendPasswordResetOtp: (email: string) => Promise<string>;
  resetPasswordWithOtp: (email: string, otp: string, newPassword: string) => Promise<string>;
  toggleTheme: () => void;
};

const STORAGE_USER_KEY = 'splitwise.active-user';
const STORAGE_GROUP_KEY = 'splitwise.current-group';
const STORAGE_THEME_KEY = 'splitwise.theme';

const AppContext = createContext<AppContextValue | undefined>(undefined);

function stripPassword(user: User) {
  const { password: _password, ...rest } = user;
  return rest;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    const storedTheme = window.localStorage.getItem(STORAGE_THEME_KEY);
    return storedTheme === 'light' ? 'light' : 'dark';
  });
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [balanceRefreshToken, setBalanceRefreshToken] = useState(0);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  }, [theme]);

  async function refreshUsers() {
    const data = await getUsers();
    setUsers(data);
    setCurrentUser((existing) => {
      if (!existing) {
        return existing;
      }
      return data.find((user) => user.id === existing.id) || existing;
    });
  }

  async function refreshGroups() {
    const data = await getGroups();
    setGroups(data);
  }

  function refreshBalance() {
    setBalanceRefreshToken((value) => value + 1);
  }

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  async function bootstrap() {
    try {
      const [loadedUsers, loadedGroups] = await Promise.all([getUsers(), getGroups()]);
      setUsers(loadedUsers);
      setGroups(loadedGroups);

      const rawUser = localStorage.getItem(STORAGE_USER_KEY);
      if (rawUser) {
        const parsed = JSON.parse(rawUser) as User;
        const matched = loadedUsers.find((user) => user.id === parsed.id) || null;
        setCurrentUser(matched);
      }

      setCurrentGroupId(null);
    } finally {
      setIsBootstrapping(false);
    }
  }

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(stripPassword(currentUser)));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentGroupId === null) {
      localStorage.removeItem(STORAGE_GROUP_KEY);
      return;
    }
    localStorage.setItem(STORAGE_GROUP_KEY, String(currentGroupId));
  }, [currentGroupId]);

  async function login(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    if (!normalized) {
      throw new ApiError('Email is required', 400);
    }

    if (!normalizedPassword) {
      throw new ApiError('Password is required', 400);
    }

    const loadedUsers = users.length > 0 ? users : await getUsers();
    if (users.length === 0) {
      setUsers(loadedUsers);
    }

    const matched = loadedUsers.find(
      (user) => user.email.toLowerCase() === normalized && (user.password ?? '') === normalizedPassword
    );
    if (!matched) {
      throw new ApiError('Invalid email or password', 401);
    }

    setCurrentUser(matched);
    setCurrentGroupId(null);
    return matched;
  }

  async function signup(payload: CreateUserPayload) {
    const created = await createUser(payload);
    setUsers((previous) => [...previous.filter((user) => user.id !== created.id), created]);
    setCurrentUser(created);
    setCurrentGroupId(null);
    return created;
  }

  function logout() {
    setCurrentUser(null);
    setCurrentGroupId(null);
  }

  function selectGroup(groupId: number | null) {
    setCurrentGroupId(groupId);
  }

  async function updateUserPreference(paymentMethod: PaymentMethod) {
    if (!currentUser) {
      throw new ApiError('Sign in first', 401);
    }

    const updated = {
      ...currentUser,
      preferredPaymentMethod: paymentMethod
    };

    setCurrentUser(updated);
    setUsers((previous) =>
      previous.map((user) => (user.id === updated.id ? updated : user))
    );
  }

  async function updateUserUpiId(oldUpiId: string, newUpiId: string) {
    if (!currentUser?.email) {
      throw new ApiError('Sign in first', 401);
    }

    const response = await updateUpiId({
      userEmailId: currentUser.email,
      oldUpiId: oldUpiId.trim(),
      newUpiId: newUpiId.trim()
    });

    await refreshUsers();
    return response;
  }

  async function updateUserPassword(oldPassword: string, newPassword: string) {
    if (!currentUser?.email) {
      throw new ApiError('Sign in first', 401);
    }

    const response = await updatePassword({
      userEmailId: currentUser.email,
      oldPassword: oldPassword.trim(),
      newPassword: newPassword.trim()
    });

    await refreshUsers();
    return response;
  }

  async function sendPasswordResetOtp(email: string) {
    return sendForgotPasswordOtp({ email: email.trim() });
  }

  async function resetPasswordWithOtp(email: string, otp: string, newPassword: string) {
    const response = await resetForgotPassword({
      email: email.trim(),
      otp: otp.trim(),
      newPassword: newPassword.trim()
    });

    await refreshUsers();
    return response;
  }

  const value = useMemo<AppContextValue>(
    () => ({
      users,
      groups,
      currentUser,
      currentGroupId,
      theme,
      isBootstrapping,
      balanceRefreshToken,
      login,
      signup,
      logout,
      refreshUsers,
      refreshGroups,
      refreshBalance,
      selectGroup,
      updateUserPreference,
      updateUserUpiId,
      updateUserPassword,
      sendPasswordResetOtp,
      resetPasswordWithOtp,
      toggleTheme
    }),
    [balanceRefreshToken, groups, currentGroupId, currentUser, isBootstrapping, theme, users]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return value;
}