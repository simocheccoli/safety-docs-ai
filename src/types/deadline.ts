export type NextVisitInterval = '3' | '6' | '12' | '24' | 'custom' | 'on_request';

export interface Deadline {
  id: number;
  title: string;
  description?: string;
  note?: string;
  company_id: number;
  company_name?: string;
  last_visit_date?: string;
  next_visit_date?: string;
  next_visit_interval: NextVisitInterval;
  status: 'pending' | 'completed' | 'overdue';
  created_at: string;
  updated_at: string;
}

export interface CreateDeadlineData {
  title: string;
  description?: string;
  note?: string;
  company_id: number;
  last_visit_date?: string;
  next_visit_date?: string;
  next_visit_interval: NextVisitInterval;
}

export const INTERVAL_LABELS: Record<NextVisitInterval, string> = {
  '3': '3 mesi',
  '6': '6 mesi',
  '12': '12 mesi',
  '24': '24 mesi',
  'custom': 'Personalizzata',
  'on_request': 'Su richiesta'
};
