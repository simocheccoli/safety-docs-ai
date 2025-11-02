export interface Company {
  id: number;
  name: string;
  vat_number?: string;
  tax_code?: string;
  address?: string;
  zip?: string;
  city?: string;
  province?: string;
  country?: string;
  email?: string;
  phone?: string;
  pec?: string;
  legal_representative?: string;
  rspp?: string;
  doctor?: string;
  consultant?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCompanyData {
  name: string;
  vat_number?: string;
  tax_code?: string;
  address?: string;
  zip?: string;
  city?: string;
  province?: string;
  country?: string;
  email?: string;
  phone?: string;
  pec?: string;
  legal_representative?: string;
  rspp?: string;
  doctor?: string;
  consultant?: string;
}
