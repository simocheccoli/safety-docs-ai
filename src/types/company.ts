// Aligned with OpenAPI spec: components/schemas/Company
// Supports both camelCase (OpenAPI) and snake_case (legacy) field names
export interface CompanyBranch {
  id?: number;
  name: string;
  address?: string;
  is_main?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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
  country?: string; // Frontend-only field
  mansioni?: string[];
  reparti?: string[];
  aree?: string[];
  branches?: CompanyBranch[];
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
  country?: string; // Frontend-only
  mansioni?: string[];
  reparti?: string[];
  aree?: string[];
  branches?: CompanyBranch[];
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
  country: data.country,
  mansioni: data.mansioni,
  reparti: data.reparti,
  aree: data.aree,
  branches: data.branches,
  createdAt: data.createdAt,
  created_at: data.createdAt || data.created_at,
  updatedAt: data.updatedAt,
  updated_at: data.updatedAt || data.updated_at,
});

// Helper to convert frontend data to backend format (OpenAPI spec)
export const mapCompanyToBackend = (data: Partial<CreateCompanyData>): any => {
  const mapped: any = {};
  
  // Required field
  if (data.name !== undefined) mapped.name = data.name;
  
  // Optional fields - always include if present (even if empty string)
  // Backend will convert empty strings to null
  if (data.address !== undefined) mapped.address = data.address === '' ? null : data.address;
  if (data.city !== undefined) mapped.city = data.city === '' ? null : data.city;
  if (data.province !== undefined) mapped.province = data.province === '' ? null : data.province;
  if (data.cap !== undefined) {
    mapped.cap = data.cap === '' ? null : data.cap;
  } else if (data.zip !== undefined) {
    mapped.cap = data.zip === '' ? null : data.zip;
  }
  if (data.phone !== undefined) mapped.phone = data.phone === '' ? null : data.phone;
  if (data.email !== undefined) mapped.email = data.email === '' ? null : data.email;
  if (data.pec !== undefined) mapped.pec = data.pec === '' ? null : data.pec;
  if (data.vat !== undefined) {
    mapped.vat = data.vat === '' ? null : data.vat;
  } else if (data.vat_number !== undefined) {
    mapped.vat = data.vat_number === '' ? null : data.vat_number;
  }
  if (data.fiscalCode !== undefined) {
    mapped.fiscalCode = data.fiscalCode === '' ? null : data.fiscalCode;
  } else if (data.tax_code !== undefined) {
    mapped.fiscalCode = data.tax_code === '' ? null : data.tax_code;
  }
  if (data.legalRepresentative !== undefined) {
    mapped.legalRepresentative = data.legalRepresentative === '' ? null : data.legalRepresentative;
  } else if (data.legal_representative !== undefined) {
    mapped.legalRepresentative = data.legal_representative === '' ? null : data.legal_representative;
  }
  if (data.rspp !== undefined) mapped.rspp = data.rspp === '' ? null : data.rspp;
  if (data.rls !== undefined) mapped.rls = data.rls === '' ? null : data.rls;
  if (data.medico !== undefined) {
    mapped.medico = data.medico === '' ? null : data.medico;
  } else if (data.doctor !== undefined) {
    mapped.medico = data.doctor === '' ? null : data.doctor;
  }
  if (data.mansioni !== undefined) mapped.mansioni = data.mansioni;
  if (data.reparti !== undefined) mapped.reparti = data.reparti;
  if (data.aree !== undefined) mapped.aree = data.aree;
  if (data.branches !== undefined) mapped.branches = data.branches;
  
  // Note: 'country' is frontend-only and not sent to backend
  
  return mapped;
};

// Helper to get main branch
export const getMainBranch = (company: Company): CompanyBranch | undefined => {
  return company.branches?.find(b => b.is_main);
};
