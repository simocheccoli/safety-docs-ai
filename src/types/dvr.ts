export type ElaborationStatus = 'IN_ELABORAZIONE' | 'POSITIVO' | 'NEGATIVO' | 'DA_ATTENZIONARE';
export type DVRStatus = 'BOZZA' | 'IN_REVISIONE' | 'IN_APPROVAZIONE' | 'APPROVATO' | 'FINALIZZATO' | 'ARCHIVIATO';

export interface DVR {
  id: string;
  nome: string;
  descrizione?: string;
  numero_revisione: number;
  revision_note?: string; // Nota della revisione corrente
  data_creazione: string;
  data_ultima_modifica: string;
  stato: DVRStatus;
  company_id?: number; // FK to Company
  company?: {
    id: number;
    name: string;
  };
  created_by: string; // user_id
  updated_by: string; // user_id
  files_count?: number; // Numero di file associati
  files?: FileMetadata[]; // File associati (opzionale, restituito in alcune operazioni)
  final_document_path?: string; // Path del documento finale generato
}

export interface DVRVersion {
  id: number;
  dvr_id: string;
  version: number;
  nome: string;
  descrizione: string | null;
  stato: DVRStatus;
  revision_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface FileMetadata {
  id: number;
  dvr_id: number;
  file_name: string;
  include: boolean;
  risk_id: number;
  notes?: string;
  classification_result?: 'POSITIVO' | 'NEGATIVO';
  extraction_data?: any;
  risk: {
    id: number;
    code: string;
    name: string;
    status: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface FileWithClassification {
  file: File;
  metadata: Partial<FileMetadata>;
}
