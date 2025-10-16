export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'Admin' | 'Tecnico';
  active: boolean;
}

export const DEFAULT_USERS: User[] = [
  {
    id: '1',
    firstName: 'Simone',
    lastName: 'Checcoli',
    email: 'simone.checcoli@neurally.it',
    password: 'password123',
    role: 'Tecnico',
    active: true,
  },
  {
    id: '2',
    firstName: 'Mariastella',
    lastName: 'Mancini',
    email: 'gestione@bio5.it',
    password: 'password123',
    role: 'Admin',
    active: true,
  },
];
