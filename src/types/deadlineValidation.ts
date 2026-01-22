import { NextValidationInterval } from './deadline';

export interface DeadlineValidationFile {
  id: number;
  validationId: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  previewUrl: string;
}

export interface DeadlineValidation {
  id: number;
  deadline_id: number;
  validation_date: string;
  note?: string;
  next_validation_date?: string;
  next_validation_interval?: NextValidationInterval;
  files?: DeadlineValidationFile[];
  created_at: string;
  updated_at: string;
}

export interface CompleteDeadlineData {
  files?: File[];
  note?: string;
  validation_date?: string;  // Data effettiva della valutazione
  next_validation_interval?: NextValidationInterval;
  next_validation_date?: string;  // Data personalizzata quando intervallo è "custom"
}
