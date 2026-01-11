import { Company, CreateCompanyData } from '@/types/company';
import { apiClient, simulateDelay } from './apiClient';
import { isDemoMode } from './config';

// Mock data
let mockCompanies: Company[] = [
  {
    id: 1,
    name: "Bio5 S.r.l.",
    vat: "IT12345678901",
    address: "Via Roma 123, Milano",
    city: "Milano",
    province: "MI",
    cap: "20100",
    phone: "02 1234567",
    email: "info@bio5.it",
    pec: "bio5@pec.it",
    mansioni: ["Operatore Macchine CNC", "Addetto Magazzino", "Responsabile Qualità"],
    reparti: ["Produzione", "Magazzino", "Qualità", "Amministrazione"],
    ruoli: ["Operaio Specializzato", "Impiegato", "Responsabile", "Dirigente"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Tech Solutions S.p.A.",
    vat: "IT98765432109",
    address: "Via Torino 456, Roma",
    city: "Roma",
    province: "RM",
    cap: "00100",
    phone: "06 9876543",
    email: "info@techsolutions.it",
    pec: "techsolutions@pec.it",
    mansioni: ["Sviluppatore Software", "Sistemista", "Project Manager"],
    reparti: ["Sviluppo", "IT", "Gestione Progetti"],
    ruoli: ["Developer", "Senior Developer", "Team Lead", "Manager"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let mockCompanyIdCounter = 3;

export const companyApi = {
  async getAll(): Promise<Company[]> {
    if (isDemoMode()) {
      await simulateDelay(300);
      return [...mockCompanies];
    }

    return apiClient.get<Company[]>('/companies');
  },

  async getById(id: number): Promise<Company> {
    if (isDemoMode()) {
      await simulateDelay(200);
      const company = mockCompanies.find(c => c.id === id);
      if (!company) throw new Error('Company not found');
      return company;
    }

    return apiClient.get<Company>(`/companies/${id}`);
  },

  async create(data: CreateCompanyData): Promise<Company> {
    if (isDemoMode()) {
      await simulateDelay(400);
      const newCompany: Company = {
        ...data,
        id: mockCompanyIdCounter++,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockCompanies.push(newCompany);
      return newCompany;
    }

    return apiClient.post<Company>('/companies', data);
  },

  async update(id: number, data: Partial<CreateCompanyData>): Promise<Company> {
    if (isDemoMode()) {
      await simulateDelay(300);
      const index = mockCompanies.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Company not found');
      
      mockCompanies[index] = {
        ...mockCompanies[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockCompanies[index];
    }

    return apiClient.patch<Company>(`/companies/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    if (isDemoMode()) {
      await simulateDelay(300);
      mockCompanies = mockCompanies.filter(c => c.id !== id);
      return;
    }

    return apiClient.delete(`/companies/${id}`);
  },
};
