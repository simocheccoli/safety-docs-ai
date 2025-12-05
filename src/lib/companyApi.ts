import { Company, CreateCompanyData } from '@/types/company';

// DEMO MODE
const DEMO_MODE = true;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Mock data
let mockCompanies: Company[] = [
  {
    id: 1,
    name: "Bio5 S.r.l.",
    vat_number: "IT12345678901",
    address: "Via Roma 123, Milano",
    city: "Milano",
    province: "MI",
    zip: "20100",
    phone: "02 1234567",
    email: "info@bio5.it",
    pec: "bio5@pec.it",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Tech Solutions S.p.A.",
    vat_number: "IT98765432109",
    address: "Via Torino 456, Roma",
    city: "Roma",
    province: "RM",
    zip: "00100",
    phone: "06 9876543",
    email: "info@techsolutions.it",
    pec: "techsolutions@pec.it",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let mockCompanyIdCounter = 3;

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const companyApi = {
  async getAll(): Promise<Company[]> {
    if (DEMO_MODE) {
      await simulateDelay(300);
      return [...mockCompanies];
    }

    const response = await fetch(`${API_BASE_URL}/api/companies`);
    if (!response.ok) {
      throw new Error('Failed to fetch companies');
    }
    return response.json();
  },

  async getById(id: number): Promise<Company> {
    if (DEMO_MODE) {
      await simulateDelay(200);
      const company = mockCompanies.find(c => c.id === id);
      if (!company) throw new Error('Company not found');
      return company;
    }

    const response = await fetch(`${API_BASE_URL}/api/companies/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch company');
    }
    return response.json();
  },

  async create(data: CreateCompanyData): Promise<Company> {
    if (DEMO_MODE) {
      await simulateDelay(400);
      const newCompany: Company = {
        ...data,
        id: mockCompanyIdCounter++,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockCompanies.push(newCompany);
      return newCompany;
    }

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
    if (DEMO_MODE) {
      await simulateDelay(300);
      const index = mockCompanies.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Company not found');
      
      mockCompanies[index] = {
        ...mockCompanies[index],
        ...data,
        updated_at: new Date().toISOString()
      };
      return mockCompanies[index];
    }

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
    if (DEMO_MODE) {
      await simulateDelay(300);
      mockCompanies = mockCompanies.filter(c => c.id !== id);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/companies/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete company');
    }
  },
};
