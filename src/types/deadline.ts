export type NextValidationInterval = '12' | '24' | '36' | '48' | 'custom' | 'on_request';

import { DeadlineValidation } from './deadlineValidation';

export interface Deadline {
  id: number;
  title: string;
  description?: string;
  note?: string;
  company_id: number;
  company_branch_id?: number;
  company_name?: string;
  risk_type_id?: string;
  risk_type_name?: string;
  last_validation_date?: string;
  next_validation_date?: string;
  next_validation_interval: NextValidationInterval;
  status: 'pending' | 'completed' | 'overdue';
  validations?: DeadlineValidation[];
  created_at: string;
  updated_at: string;
}

export interface CreateDeadlineData {
  title: string;
  description?: string;
  note?: string;
  company_id: number;
  company_branch_id?: number;
  risk_type_id?: string;
  last_validation_date?: string;
  next_validation_date?: string;
  next_validation_interval: NextValidationInterval;
}

export const INTERVAL_LABELS: Record<NextValidationInterval, string> = {
  '12': '12 mesi',
  '24': '24 mesi',
  '36': '36 mesi',
  '48': '48 mesi',
  'custom': 'Personalizzata',
  'on_request': 'Su richiesta'
};
