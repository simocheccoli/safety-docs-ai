import { User, UserRole } from '@/types/user';
import { apiClient } from './apiClient';

const CURRENT_USER_KEY = 'hseb5_current_user';

export async function login(email: string, password: string): Promise<User | null> {
  try {
    const response = await apiClient.post<{ token: string; user: User }>('/auth/login', { email, password });
    // Mappa name a firstName e lastName per compatibilità con il frontend
    const user = response.user;
    const nameParts = (user.name || '').split(' ');
    const mappedUser: User = {
      ...user,
      firstName: user.firstName || nameParts[0] || '',
      lastName: user.lastName || nameParts.slice(1).join(' ') || '',
      active: user.active !== false,
    };
    const userWithToken = { ...mappedUser, token: response.token };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithToken));
    return mappedUser;
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
  try {
    const user = await apiClient.get<User>('/auth/me');
    // Mappa name a firstName e lastName per compatibilità con il frontend
    const nameParts = (user.name || '').split(' ');
    return {
      ...user,
      firstName: user.firstName || nameParts[0] || '',
      lastName: user.lastName || nameParts.slice(1).join(' ') || '',
      active: user.active !== false,
    };
  } catch (error) {
    return null;
  }
}

// User management API
export const userApi = {
  async getAll(): Promise<User[]> {
    const response = await apiClient.get<{ data: User[] } | User[]>('/users');
    // Backend restituisce { data: [...] } per le collection (UserResource::collection)
    if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
      return response.data;
    }
    // Fallback: se la risposta è direttamente un array
    return Array.isArray(response) ? response : [];
  },

  async getById(id: number): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  },

  async create(data: { name: string; email: string; password: string; role: UserRole }): Promise<User> {
    const response = await apiClient.post<{ data: User } | User>('/users', data);
    // Backend può restituire { data: {...} } o direttamente l'oggetto
    return (response as { data: User }).data || (response as User);
  },

  async update(id: number, data: { name?: string; email?: string; password?: string; role?: UserRole }): Promise<User> {
    const response = await apiClient.put<{ data: User } | User>(`/users/${id}`, data);
    // Backend può restituire { data: {...} } o direttamente l'oggetto
    return (response as { data: User }).data || (response as User);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/users/${id}`);
  }
};
