import { Company, CreateCompanyData } from '@/types/company';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const companyApi = {
  async getAll(): Promise<Company[]> {
    const response = await fetch(`${API_BASE_URL}/api/companies`);
    if (!response.ok) {
      throw new Error('Failed to fetch companies');
    }
    return response.json();
  },

  async getById(id: number): Promise<Company> {
    const response = await fetch(`${API_BASE_URL}/api/companies/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch company');
    }
    return response.json();
  },

  async create(data: CreateCompanyData): Promise<Company> {
    const response = await fetch(`${API_BASE_URL}/api/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create company');
    }
    return response.json();
  },

  async update(id: number, data: Partial<CreateCompanyData>): Promise<Company> {
    const response = await fetch(`${API_BASE_URL}/api/companies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update company');
    }
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/companies/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete company');
    }
  },
};
