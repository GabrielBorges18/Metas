// Sistema de autenticação usando token
import { User } from './types';

const AUTH_TOKEN_KEY = 'auth_token';
const CURRENT_USER_KEY = 'current_user';
const CURRENT_GROUP_KEY = 'current_group';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getCurrentGroup(): { id: string } | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(CURRENT_GROUP_KEY);
  return data ? JSON.parse(data) : null;
}

export function setCurrentGroup(group: { id: string } | null): void {
  if (typeof window === 'undefined') return;
  if (group) {
    localStorage.setItem(CURRENT_GROUP_KEY, JSON.stringify(group));
  } else {
    localStorage.removeItem(CURRENT_GROUP_KEY);
  }
}

export function clearAuth(): void {
  setAuthToken(null);
  setCurrentUser(null);
  setCurrentGroup(null);
}
