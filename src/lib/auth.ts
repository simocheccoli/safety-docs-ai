import { User, UserRole } from '@/types/user';
import { apiClient, simulateDelay } from './apiClient';
import { isDemoMode } from './config';

const USERS_KEY = 'hseb5_users';
const CURRENT_USER_KEY = 'hseb5_current_user';

// Default users for demo mode
const DEFAULT_USERS: User[] = [
  {
    id: 1,
    email: 'admin@hseb5.it',
    name: 'Admin',
    role: 'admin',
    password: 'admin123'
  },
  {
    id: 2,
    email: 'user@hseb5.it',
    name: 'Utente',
    role: 'user',
    password: 'user123'
  }
];

export function initializeUsers() {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  }
}

export function getUsers(): User[] {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_USERS;
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function login(email: string, password: string): Promise<User | null> {
  if (isDemoMode()) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password && u.active !== false);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      return user;
    }
    
    return null;
  }

  try {
    const response = await apiClient.post<{ token: string; user: User }>('/auth/login', { email, password });
    const userWithToken = { ...response.user, token: response.token };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithToken));
    return response.user;
  } catch (error) {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser(): Omit<User, 'password'> | null {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

export async function fetchCurrentUser(): Promise<User | null> {
  if (isDemoMode()) {
    return getCurrentUser() as User | null;
  }

  try {
    const user = await apiClient.get<User>('/auth/me');
    return user;
  } catch (error) {
    return null;
  }
}

// User management API
export const userApi = {
  async getAll(): Promise<User[]> {
    if (isDemoMode()) {
      await simulateDelay(300);
      return getUsers();
    }

    return apiClient.get<User[]>('/users');
  },

  async getById(id: number): Promise<User> {
    if (isDemoMode()) {
      await simulateDelay(200);
      const user = getUsers().find(u => u.id === id);
      if (!user) throw new Error('User not found');
      return user;
    }

    return apiClient.get<User>(`/users/${id}`);
  },

  async create(data: { name: string; email: string; password: string; role: UserRole }): Promise<User> {
    if (isDemoMode()) {
      await simulateDelay(400);
      const users = getUsers();
      const newUser: User = {
        id: Math.max(...users.map(u => typeof u.id === 'number' ? u.id : parseInt(u.id as string) || 0)) + 1,
        ...data,
        active: true
      };
      users.push(newUser);
      saveUsers(users);
      return newUser;
    }

    return apiClient.post<User>('/users', data);
  },

  async update(id: number, data: { name?: string; email?: string; password?: string; role?: UserRole }): Promise<User> {
    if (isDemoMode()) {
      await simulateDelay(300);
      const users = getUsers();
      const index = users.findIndex(u => u.id === id);
      if (index === -1) throw new Error('User not found');
      
      users[index] = { ...users[index], ...data };
      saveUsers(users);
      return users[index];
    }

    return apiClient.put<User>(`/users/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    if (isDemoMode()) {
      await simulateDelay(300);
      const users = getUsers().filter(u => u.id !== id);
      saveUsers(users);
      return;
    }

    return apiClient.delete(`/users/${id}`);
  }
};
