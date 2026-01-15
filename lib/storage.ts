// Sistema de armazenamento usando localStorage
import { User, Group, MetaGrande } from "./types";

const STORAGE_KEYS = {
  USERS: "metas_users",
  GROUPS: "metas_groups",
  METAS: "metas_metas",
  CURRENT_USER: "metas_current_user",
  CURRENT_GROUP: "metas_current_group",
} as const;

// Funções auxiliares
function getFromStorage<T>(key: string, defaultValue: T[]): T[] {
  if (typeof window === "undefined") return defaultValue;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

function getItemFromStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

function saveItemToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// Users
export function getUsers(): User[] {
  return getFromStorage(STORAGE_KEYS.USERS, []);
}

export function saveUser(user: User): void {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  saveToStorage(STORAGE_KEYS.USERS, users);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email === email);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

// Current User
export function getCurrentUser(): User | null {
  return getItemFromStorage(STORAGE_KEYS.CURRENT_USER);
}

export function setCurrentUser(user: User | null): void {
  saveItemToStorage(STORAGE_KEYS.CURRENT_USER, user);
}

// Groups
export function getGroups(): Group[] {
  console.log(STORAGE_KEYS.GROUPS);
  return getFromStorage(STORAGE_KEYS.GROUPS, []);
}

export function saveGroup(group: Group): void {
  const groups = getGroups();
  const index = groups.findIndex((g) => g.id === group.id);
  if (index >= 0) {
    groups[index] = group;
  } else {
    groups.push(group);
  }
  saveToStorage(STORAGE_KEYS.GROUPS, groups);
}

export function getGroupById(id: string): Group | undefined {
  
  return getGroups().find((g) => g.id === id);
}

export function getGroupByCodigoConvite(codigo: string): Group | undefined {
  console.log(getGroups(),codigo);
  return getGroups().find((g) => g.codigoConvite === codigo);
}

export function getUserGroups(userId: string): Group[] {
  return getGroups().filter((g) => g.membrosIds.includes(userId));
}

// Current Group
export function getCurrentGroup(): Group | null {
  return getItemFromStorage(STORAGE_KEYS.CURRENT_GROUP);
}

export function setCurrentGroup(group: Group | null): void {
  saveItemToStorage(STORAGE_KEYS.CURRENT_GROUP, group);
}

// Metas
export function getMetas(): MetaGrande[] {
  return getFromStorage(STORAGE_KEYS.METAS, []);
}

export function getMetasByGroup(groupId: string): MetaGrande[] {
  const group = getGroupById(groupId);
  if (!group) return [];
  return getMetas().filter((m) => group.membrosIds.includes(m.userId));
}

export function getMetasByUser(userId: string): MetaGrande[] {
  return getMetas().filter((m) => m.userId === userId);
}

export function saveMeta(meta: MetaGrande): void {
  const metas = getMetas();
  const index = metas.findIndex((m) => m.id === meta.id);
  if (index >= 0) {
    metas[index] = meta;
  } else {
    metas.push(meta);
  }
  saveToStorage(STORAGE_KEYS.METAS, metas);
}

export function deleteMeta(metaId: string): void {
  const metas = getMetas();
  const filtered = metas.filter((m) => m.id !== metaId);
  saveToStorage(STORAGE_KEYS.METAS, filtered);
}

// Funções auxiliares
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateCodigoConvite(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
