// Aligned with OpenAPI spec: components/schemas/User
// Supports both OpenAPI format and legacy frontend format

export type UserRole = 'admin' | 'user' | 'Admin' | 'Tecnico'; // Support both formats

export interface User {
  id: number | string; // Support both formats
  email: string;
  name?: string; // Backend uses single 'name' field
  firstName?: string; // Frontend-only
  lastName?: string; // Frontend-only
  role: UserRole;
  password?: string; // Only for local mock mode
  active?: boolean; // Only for local mock mode
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Helper to get display name
export const getUserDisplayName = (user: User): string => {
  if (user.name) return user.name;
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.firstName) return user.firstName;
  return user.email;
};

// Helper to check if user is admin
export const isUserAdmin = (user: User): boolean => {
  return user.role === 'admin' || user.role === 'Admin';
};

// Legacy support for demo mode
export const DEFAULT_USERS: User[] = [
  {
    id: 1,
    email: 'simone.checcoli@neurally.it',
    name: 'Simone Checcoli',
    firstName: 'Simone',
    lastName: 'Checcoli',
    password: 'password123',
    role: 'user',
    active: true,
  },
  {
    id: 2,
    email: 'gestione@bio5.it',
    name: 'Mariastella Mancini',
    firstName: 'Mariastella',
    lastName: 'Mancini',
    password: 'password123',
    role: 'admin',
    active: true,
  },
];
