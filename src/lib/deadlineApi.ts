import { Deadline, CreateDeadlineData } from '@/types/deadline';
import { DeadlineValidation, CompleteDeadlineData } from '@/types/deadlineValidation';
import { apiClient, simulateDelay } from './apiClient';
import { isDemoMode } from './config';
import { addMonths, isBefore, startOfDay } from 'date-fns';

const today = startOfDay(new Date());

let mockDeadlines: Deadline[] = [
  {
    id: 1,
    title: "Revisione DVR annuale",
    description: "Revisione completa del Documento di Valutazione dei Rischi",
    note: "Contattare RSPP prima della validazione",
    company_id: 1,
    company_name: "Bio5 S.r.l.",
    risk_type_id: "1",
    risk_type_name: "Rischio Chimico",
    last_validation_date: "2024-06-15",
    next_validation_date: "2025-06-15",
    next_validation_interval: '12',
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
    risk_type_id: "2",
    risk_type_name: "Rischio Elettrico",
    last_validation_date: "2024-12-01",
    next_validation_date: "2025-03-01",
    next_validation_interval: '12',
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
    last_validation_date: "2024-01-20",
    next_validation_date: "2026-01-20",
    next_validation_interval: '24',
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
    next_validation_interval: 'on_request',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let mockDeadlineIdCounter = 5;

const calculateStatus = (nextValidationDate?: string): 'pending' | 'completed' | 'overdue' => {
  if (!nextValidationDate) return 'pending';
  const validationDate = startOfDay(new Date(nextValidationDate));
  return isBefore(validationDate, today) ? 'overdue' : 'pending';
};

const calculateNextValidationDate = (lastValidationDate: string, interval: string): string | undefined => {
  if (interval === 'on_request' || interval === 'custom') return undefined;
  const months = parseInt(interval);
  if (isNaN(months)) return undefined;
  return addMonths(new Date(lastValidationDate), months).toISOString().split('T')[0];
};

export const deadlineApi = {
  async getAll(): Promise<Deadline[]> {
    if (isDemoMode()) {
      await simulateDelay(300);
      return mockDeadlines.map(d => ({
        ...d,
        status: calculateStatus(d.next_validation_date)
      }));
    }

    const deadlines = await apiClient.get<Deadline[]>('/deadlines');
    // Calcola lo stato dinamicamente per ogni deadline
    return deadlines.map(d => ({
      ...d,
      status: calculateStatus(d.next_validation_date)
    }));
  },

  async getById(id: number): Promise<Deadline> {
    if (isDemoMode()) {
      await simulateDelay(200);
      const deadline = mockDeadlines.find(d => d.id === id);
      if (!deadline) throw new Error('Deadline not found');
      return {
        ...deadline,
        status: calculateStatus(deadline.next_validation_date)
      };
    }

    const deadline = await apiClient.get<Deadline>(`/deadlines/${id}`);
    // Calcola lo stato dinamicamente
    return {
      ...deadline,
      status: calculateStatus(deadline.next_validation_date)
    };
  },

  async create(data: CreateDeadlineData, companyName?: string, riskTypeName?: string): Promise<Deadline> {
    if (isDemoMode()) {
      await simulateDelay(400);
      
      let nextValidationDate = data.next_validation_date;
      if (data.last_validation_date && data.next_validation_interval !== 'custom' && data.next_validation_interval !== 'on_request') {
        nextValidationDate = calculateNextValidationDate(data.last_validation_date, data.next_validation_interval);
      }

      const newDeadline: Deadline = {
        ...data,
        id: mockDeadlineIdCounter++,
        company_name: companyName,
        risk_type_name: riskTypeName,
        next_validation_date: nextValidationDate,
        status: calculateStatus(nextValidationDate),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockDeadlines.push(newDeadline);
      return newDeadline;
    }

    const deadline = await apiClient.post<Deadline>('/deadlines', data);
    // Calcola lo stato dinamicamente
    return {
      ...deadline,
      status: calculateStatus(deadline.next_validation_date)
    };
  },

  async update(id: number, data: Partial<CreateDeadlineData>, companyName?: string, riskTypeName?: string): Promise<Deadline> {
    if (isDemoMode()) {
      await simulateDelay(300);
      const index = mockDeadlines.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Deadline not found');
      
      let nextValidationDate = data.next_validation_date ?? mockDeadlines[index].next_validation_date;
      const lastValidationDate = data.last_validation_date ?? mockDeadlines[index].last_validation_date;
      const interval = data.next_validation_interval ?? mockDeadlines[index].next_validation_interval;
      
      if (lastValidationDate && interval !== 'custom' && interval !== 'on_request') {
        nextValidationDate = calculateNextValidationDate(lastValidationDate, interval);
      }

      mockDeadlines[index] = {
        ...mockDeadlines[index],
        ...data,
        company_name: companyName ?? mockDeadlines[index].company_name,
        risk_type_name: riskTypeName !== undefined ? riskTypeName : mockDeadlines[index].risk_type_name,
        next_validation_date: nextValidationDate,
        status: calculateStatus(nextValidationDate),
        updated_at: new Date().toISOString()
      };
      return mockDeadlines[index];
    }

    const deadline = await apiClient.put<Deadline>(`/deadlines/${id}`, data);
    // Calcola lo stato dinamicamente
    return {
      ...deadline,
      status: calculateStatus(deadline.next_validation_date)
    };
  },

  async delete(id: number): Promise<void> {
    if (isDemoMode()) {
      await simulateDelay(300);
      mockDeadlines = mockDeadlines.filter(d => d.id !== id);
      return;
    }

    return apiClient.delete(`/deadlines/${id}`);
  },

  async markCompleted(id: number, data?: CompleteDeadlineData): Promise<Deadline> {
    if (isDemoMode()) {
      await simulateDelay(300);
      const index = mockDeadlines.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Deadline not found');
      
      const validationDate = data?.validation_date || new Date().toISOString().split('T')[0];
      const interval = data?.next_validation_interval ?? mockDeadlines[index].next_validation_interval;
      let nextValidationDate: string | undefined;
      
      if (interval && interval !== 'custom' && interval !== 'on_request') {
        nextValidationDate = calculateNextValidationDate(validationDate, interval);
      }

      mockDeadlines[index] = {
        ...mockDeadlines[index],
        last_validation_date: validationDate,
        next_validation_date: nextValidationDate,
        status: 'pending',
        updated_at: new Date().toISOString()
      };
      return mockDeadlines[index];
    }

    // Usa FormData se ci sono file, altrimenti JSON normale
    if (data?.files && data.files.length > 0) {
      const formData = new FormData();
      data.files.forEach(file => {
        formData.append('files[]', file);
      });
      if (data.note) formData.append('note', data.note);
      if (data.validation_date) formData.append('validation_date', data.validation_date);
      if (data.next_validation_interval) formData.append('next_validation_interval', data.next_validation_interval);
      if (data.next_validation_date) formData.append('next_validation_date', data.next_validation_date);
      
      // Usa apiClient.upload invece di apiClient.post per FormData
      const deadline = await apiClient.upload<Deadline>(`/deadlines/${id}/complete`, formData);
      // Calcola lo stato dinamicamente
      return {
        ...deadline,
        status: calculateStatus(deadline.next_validation_date)
      };
    }

    const deadline = await apiClient.post<Deadline>(`/deadlines/${id}/complete`, data || {});
    // Calcola lo stato dinamicamente
    return {
      ...deadline,
      status: calculateStatus(deadline.next_validation_date)
    };
  },

  async getValidations(deadlineId: number): Promise<DeadlineValidation[]> {
    if (isDemoMode()) {
      await simulateDelay(200);
      return [];
    }

    return apiClient.get<DeadlineValidation[]>(`/deadlines/${deadlineId}/validations`);
  },

  async getValidation(deadlineId: number, validationId: number): Promise<DeadlineValidation> {
    if (isDemoMode()) {
      await simulateDelay(200);
      throw new Error('Validation not found in demo mode');
    }

    return apiClient.get<DeadlineValidation>(`/deadlines/${deadlineId}/validations/${validationId}`);
  },

  async deleteValidation(deadlineId: number, validationId: number): Promise<void> {
    if (isDemoMode()) {
      await simulateDelay(200);
      return;
    }

    return apiClient.delete(`/deadlines/${deadlineId}/validations/${validationId}`);
  },

  getValidationPdfUrl(deadlineId: number, validationId: number, mediaId: number): string {
    return `/api/v1/deadlines/${deadlineId}/validations/${validationId}/media/${mediaId}/preview`;
  }
};
