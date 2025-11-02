export type ElaborationStatus = 'IN_ELABORAZIONE' | 'POSITIVO' | 'NEGATIVO' | 'DA_ATTENZIONARE';
export type DVRStatus = 'BOZZA' | 'IN_REVISIONE' | 'IN_APPROVAZIONE' | 'APPROVATO' | 'FINALIZZATO' | 'ARCHIVIATO';

export interface DVR {
  id: string;
  nome: string;
  descrizione?: string;
  numero_revisione: number;
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
  file_id: string;
  dvr_id: string; // FK to DVR
  nome_file: string;
  file_size: number;
  file_type: string;
  file_content?: string; // Contenuto del file per anteprima
  rischio_associato: string; // FK to RiskType.id
  rischio_nome: string; // Nome del rischio per display
  stato_elaborazione_ai: ElaborationStatus;
  motivazione_stato: string;
  output_json_completo: any;
  output_json_modificato?: any; // Output modificato manualmente dall'utente
  modificato_manualmente: boolean;
  inclusione_dvr: boolean;
  note_rspp: string;
  created_at: string;
  updated_at: string;
}

export interface FileWithClassification {
  file: File;
  metadata: Partial<FileMetadata>;
}
