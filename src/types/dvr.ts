export type ElaborationStatus = 'IN_ELABORAZIONE' | 'POSITIVO' | 'NEGATIVO' | 'DA_ATTENZIONARE';

export interface FileMetadata {
  file_id: string;
  nome_file: string;
  file_size: number;
  file_type: string;
  rischio_associato: string; // FK to RiskType.id
  rischio_nome: string; // Nome del rischio per display
  stato_elaborazione_ai: ElaborationStatus;
  motivazione_stato: string;
  output_json_completo: any;
  inclusione_dvr: boolean;
  note_rspp: string;
  created_at: string;
  updated_at: string;
}

export interface FileWithClassification {
  file: File;
  metadata: Partial<FileMetadata>;
}
