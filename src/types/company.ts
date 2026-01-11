// Aligned with OpenAPI spec: components/schemas/Company
// Supports both camelCase (OpenAPI) and snake_case (legacy) field names
export interface Company {
  id: number;
  name: string;
  address?: string;
  city?: string;
  province?: string;
  cap?: string; // OpenAPI uses 'cap'
  zip?: string; // Legacy alias
  phone?: string;
  email?: string;
  pec?: string;
  vat?: string; // OpenAPI uses 'vat'
  vat_number?: string; // Legacy alias
  fiscalCode?: string; // OpenAPI uses 'fiscalCode'
  tax_code?: string; // Legacy alias
  legalRepresentative?: string; // OpenAPI uses camelCase
  legal_representative?: string; // Legacy alias
  rspp?: string;
  rls?: string; // New field from OpenAPI
  medico?: string; // OpenAPI uses 'medico'
  doctor?: string; // Legacy alias
  consultant?: string; // Frontend-only field
  country?: string; // Frontend-only field
  mansioni?: string[];
  reparti?: string[];
  ruoli?: string[];
  createdAt?: string; // OpenAPI uses camelCase
  created_at?: string; // Legacy alias
  updatedAt?: string; // OpenAPI uses camelCase
  updated_at?: string; // Legacy alias
}

// CreateCompanyData supports both naming conventions
export interface CreateCompanyData {
  name: string;
  address?: string;
  city?: string;
  province?: string;
  cap?: string;
  zip?: string; // Legacy - maps to cap
  phone?: string;
  email?: string;
  pec?: string;
  vat?: string;
  vat_number?: string; // Legacy - maps to vat
  fiscalCode?: string;
  tax_code?: string; // Legacy - maps to fiscalCode
  legalRepresentative?: string;
  legal_representative?: string; // Legacy - maps to legalRepresentative
  rspp?: string;
  rls?: string;
  medico?: string;
  doctor?: string; // Legacy - maps to medico
  consultant?: string; // Frontend-only
  country?: string; // Frontend-only
  mansioni?: string[];
  reparti?: string[];
  ruoli?: string[];
}

// Helper to convert backend response to frontend format
export const mapCompanyFromBackend = (data: any): Company => ({
  id: data.id,
  name: data.name,
  address: data.address,
  city: data.city,
  province: data.province,
  cap: data.cap,
  zip: data.cap || data.zip,
  phone: data.phone,
  email: data.email,
  pec: data.pec,
  vat: data.vat,
  vat_number: data.vat || data.vat_number,
  fiscalCode: data.fiscalCode,
  tax_code: data.fiscalCode || data.tax_code,
  legalRepresentative: data.legalRepresentative,
  legal_representative: data.legalRepresentative || data.legal_representative,
  rspp: data.rspp,
  rls: data.rls,
  medico: data.medico,
  doctor: data.medico || data.doctor,
  consultant: data.consultant,
  country: data.country,
  mansioni: data.mansioni,
  reparti: data.reparti,
  ruoli: data.ruoli,
  createdAt: data.createdAt,
  created_at: data.createdAt || data.created_at,
  updatedAt: data.updatedAt,
  updated_at: data.updatedAt || data.updated_at,
});

// Helper to convert frontend data to backend format (OpenAPI spec)
export const mapCompanyToBackend = (data: Partial<CreateCompanyData>): any => ({
  name: data.name || '',
  address: data.address,
  city: data.city,
  province: data.province,
  cap: data.cap || data.zip,
  phone: data.phone,
  email: data.email,
  pec: data.pec,
  vat: data.vat || data.vat_number,
  fiscalCode: data.fiscalCode || data.tax_code,
  legalRepresentative: data.legalRepresentative || data.legal_representative,
  rspp: data.rspp,
  rls: data.rls,
  medico: data.medico || data.doctor,
  mansioni: data.mansioni,
  reparti: data.reparti,
  ruoli: data.ruoli,
});
