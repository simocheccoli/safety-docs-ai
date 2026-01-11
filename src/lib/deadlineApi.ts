import { Deadline, CreateDeadlineData } from '@/types/deadline';
import { addMonths, isBefore, startOfDay } from 'date-fns';

const DEMO_MODE = true;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const today = startOfDay(new Date());

let mockDeadlines: Deadline[] = [
  {
    id: 1,
    title: "Revisione DVR annuale",
    description: "Revisione completa del Documento di Valutazione dei Rischi",
    note: "Contattare RSPP prima della visita",
    company_id: 1,
    company_name: "Bio5 S.r.l.",
    last_visit_date: "2024-06-15",
    next_visit_date: "2025-06-15",
    next_visit_interval: '12',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "Sopralluogo trimestrale",
    description: "Verifica delle condizioni di sicurezza",
    company_id: 2,
    company_name: "Tech Solutions S.p.A.",
    last_visit_date: "2024-12-01",
    next_visit_date: "2025-03-01",
    next_visit_interval: '3',
    status: 'overdue',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    title: "Formazione sicurezza",
    description: "Corso di aggiornamento per i dipendenti",
    note: "Preparare materiale didattico",
    company_id: 1,
    company_name: "Bio5 S.r.l.",
    last_visit_date: "2024-01-20",
    next_visit_date: "2026-01-20",
    next_visit_interval: '24',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    title: "Audit interno",
    description: "Verifica conformità normativa",
    company_id: 2,
    company_name: "Tech Solutions S.p.A.",
    next_visit_interval: 'on_request',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let mockDeadlineIdCounter = 5;

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const calculateStatus = (nextVisitDate?: string): 'pending' | 'completed' | 'overdue' => {
  if (!nextVisitDate) return 'pending';
  const visitDate = startOfDay(new Date(nextVisitDate));
  return isBefore(visitDate, today) ? 'overdue' : 'pending';
};

const calculateNextVisitDate = (lastVisitDate: string, interval: string): string | undefined => {
  if (interval === 'on_request' || interval === 'custom') return undefined;
  const months = parseInt(interval);
  if (isNaN(months)) return undefined;
  return addMonths(new Date(lastVisitDate), months).toISOString().split('T')[0];
};

export const deadlineApi = {
  async getAll(): Promise<Deadline[]> {
    if (DEMO_MODE) {
      await simulateDelay(300);
      return mockDeadlines.map(d => ({
        ...d,
        status: calculateStatus(d.next_visit_date)
      }));
    }

    const response = await fetch(`${API_BASE_URL}/api/deadlines`);
    if (!response.ok) {
      throw new Error('Failed to fetch deadlines');
    }
    return response.json();
  },

  async getById(id: number): Promise<Deadline> {
    if (DEMO_MODE) {
      await simulateDelay(200);
      const deadline = mockDeadlines.find(d => d.id === id);
      if (!deadline) throw new Error('Deadline not found');
      return {
        ...deadline,
        status: calculateStatus(deadline.next_visit_date)
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/deadlines/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch deadline');
    }
    return response.json();
  },

  async create(data: CreateDeadlineData, companyName?: string): Promise<Deadline> {
    if (DEMO_MODE) {
      await simulateDelay(400);
      
      let nextVisitDate = data.next_visit_date;
      if (data.last_visit_date && data.next_visit_interval !== 'custom' && data.next_visit_interval !== 'on_request') {
        nextVisitDate = calculateNextVisitDate(data.last_visit_date, data.next_visit_interval);
      }

      const newDeadline: Deadline = {
        ...data,
        id: mockDeadlineIdCounter++,
        company_name: companyName,
        next_visit_date: nextVisitDate,
        status: calculateStatus(nextVisitDate),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockDeadlines.push(newDeadline);
      return newDeadline;
    }

    const response = await fetch(`${API_BASE_URL}/api/deadlines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create deadline');
    }
    return response.json();
  },

  async update(id: number, data: Partial<CreateDeadlineData>, companyName?: string): Promise<Deadline> {
    if (DEMO_MODE) {
      await simulateDelay(300);
      const index = mockDeadlines.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Deadline not found');
      
      let nextVisitDate = data.next_visit_date ?? mockDeadlines[index].next_visit_date;
      const lastVisitDate = data.last_visit_date ?? mockDeadlines[index].last_visit_date;
      const interval = data.next_visit_interval ?? mockDeadlines[index].next_visit_interval;
      
      if (lastVisitDate && interval !== 'custom' && interval !== 'on_request') {
        nextVisitDate = calculateNextVisitDate(lastVisitDate, interval);
      }

      mockDeadlines[index] = {
        ...mockDeadlines[index],
        ...data,
        company_name: companyName ?? mockDeadlines[index].company_name,
        next_visit_date: nextVisitDate,
        status: calculateStatus(nextVisitDate),
        updated_at: new Date().toISOString()
      };
      return mockDeadlines[index];
    }

    const response = await fetch(`${API_BASE_URL}/api/deadlines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update deadline');
    }
    return response.json();
  },

  async delete(id: number): Promise<void> {
    if (DEMO_MODE) {
      await simulateDelay(300);
      mockDeadlines = mockDeadlines.filter(d => d.id !== id);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/deadlines/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete deadline');
    }
  },

  async markCompleted(id: number): Promise<Deadline> {
    if (DEMO_MODE) {
      await simulateDelay(300);
      const index = mockDeadlines.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Deadline not found');
      
      const today = new Date().toISOString().split('T')[0];
      const interval = mockDeadlines[index].next_visit_interval;
      let nextVisitDate: string | undefined;
      
      if (interval !== 'custom' && interval !== 'on_request') {
        nextVisitDate = calculateNextVisitDate(today, interval);
      }

      mockDeadlines[index] = {
        ...mockDeadlines[index],
        last_visit_date: today,
        next_visit_date: nextVisitDate,
        status: 'pending',
        updated_at: new Date().toISOString()
      };
      return mockDeadlines[index];
    }

    const response = await fetch(`${API_BASE_URL}/api/deadlines/${id}/complete`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to mark deadline as completed');
    }
    return response.json();
  }
};
