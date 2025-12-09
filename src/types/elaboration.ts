export type ElaborationStatus = 'bozza' | 'elaborating' | 'completed' | 'error';

export interface ElaborationUpload {
  id: number;
  elaboration_id: number;
  mansione: string;
  reparto: string;
  ruolo: string;
  files: ElaborationFile[];
  created_at: string;
  status: 'pending' | 'elaborating' | 'completed' | 'error';
}

export interface ElaborationFile {
  id: number;
  upload_id: number;
  filename: string;
  size: number;
  created_at: string;
}

export interface Elaboration {
  id: number;
  title: string;
  description: string;
  company_id: number | null;
  company_name: string | null;
  status: ElaborationStatus;
  uploads_count: number;
  files_count: number;
  begin_process: string;
  end_process: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
