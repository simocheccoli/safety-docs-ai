// Aligned with OpenAPI spec: components/schemas/DVRStatus
// Supports both OpenAPI format and legacy UPPERCASE format
export type DVRStatus = 
  | 'draft' | 'in_progress' | 'review' | 'approved' | 'archived'
  | 'BOZZA' | 'IN_REVISIONE' | 'IN_APPROVAZIONE' | 'APPROVATO' | 'FINALIZZATO' | 'ARCHIVIATO';

// Legacy status mapping for backward compatibility
export const DVR_STATUS_MAP: Record<string, string> = {
  'BOZZA': 'draft',
  'IN_REVISIONE': 'review',
  'IN_APPROVAZIONE': 'review',
  'APPROVATO': 'approved',
  'FINALIZZATO': 'approved',
  'ARCHIVIATO': 'archived',
  'draft': 'BOZZA',
  'in_progress': 'IN_ELABORAZIONE',
  'review': 'IN_REVISIONE',
  'approved': 'APPROVATO',
  'archived': 'ARCHIVIATO',
};

export const DVR_STATUS_LABELS: Record<string, string> = {
  'draft': 'Bozza',
  'in_progress': 'In Elaborazione',
  'review': 'In Revisione',
  'approved': 'Approvato',
  'archived': 'Archiviato',
  'BOZZA': 'Bozza',
  'IN_REVISIONE': 'In Revisione',
  'IN_APPROVAZIONE': 'In Approvazione',
  'APPROVATO': 'Approvato',
  'FINALIZZATO': 'Finalizzato',
  'ARCHIVIATO': 'Archiviato',
};

// Aligned with OpenAPI spec: components/schemas/DVR
// Supports both camelCase (OpenAPI) and snake_case/legacy formats
export interface DVR {
  id: number | string; // Support both formats
  title?: string; // OpenAPI uses 'title'
  nome?: string; // Legacy alias
  description?: string; // OpenAPI uses 'description'
  descrizione?: string; // Legacy alias
  status?: DVRStatus;
  stato?: DVRStatus | string; // Legacy alias
  companyId?: number; // OpenAPI uses camelCase
  company_id?: number; // Legacy alias
  companyName?: string; // OpenAPI uses camelCase
  createdAt?: string; // OpenAPI uses camelCase
  updatedAt?: string; // OpenAPI uses camelCase
  documentHtml?: string; // HTML content of the document
  
  // Legacy fields
  numero_revisione?: number;
  revision_note?: string;
  data_creazione?: string;
  data_ultima_modifica?: string;
  created_by?: string;
  updated_by?: string;
  files_count?: number;
  files?: FileMetadata[];
  final_document_path?: string;
  company?: { id: number; name: string };
}

export interface DVRVersion {
  id: number;
  dvr_id: string;
  version: number;
  nome: string;
  descrizione: string | null;
  stato: DVRStatus | string;
  revision_note: string | null;
  created_at: string;
  updated_at: string;
}

// Aligned with OpenAPI spec: components/schemas/DVRFile
// Supports both camelCase and snake_case
export interface FileMetadata {
  id: number;
  dvrId?: number; // OpenAPI uses camelCase
  dvr_id?: number; // Legacy alias
  filename?: string; // OpenAPI uses 'filename'
  file_name?: string; // Legacy alias
  originalName?: string;
  mimeType?: string;
  size?: number;
  classification?: string;
  extractedData?: any;
  extraction_data?: any; // Legacy alias
  createdAt?: string; // OpenAPI uses camelCase
  created_at?: string; // Legacy alias
  updated_at?: string;
  
  // Legacy fields
  include?: boolean;
  risk_id?: number;
  notes?: string;
  classification_result?: 'POSITIVO' | 'NEGATIVO';
  risk?: {
    id: number;
    code: string;
    name: string;
    status: string;
  };
}

export interface FileWithClassification {
  file: File;
  metadata: Partial<FileMetadata>;
}

// Aligned with OpenAPI spec: components/schemas/CreateDVRRequest
export interface CreateDVRRequest {
  title: string;
  description?: string;
  companyId?: number;
}

// Helper to get title (supports both formats)
export const getDVRTitle = (dvr: DVR): string => {
  return dvr.title || dvr.nome || 'Senza titolo';
};

// Helper to get description (supports both formats)
export const getDVRDescription = (dvr: DVR): string => {
  return dvr.description || dvr.descrizione || '';
};

// Helper to get status (supports both formats)
export const getDVRStatus = (dvr: DVR): string => {
  return (dvr.status || dvr.stato || 'draft') as string;
};

// Helper to convert backend response to frontend format
export const mapDVRFromBackend = (data: any): DVR => ({
  id: data.id,
  title: data.title,
  nome: data.title || data.nome,
  description: data.description,
  descrizione: data.description || data.descrizione,
  status: data.status,
  stato: data.status || data.stato,
  companyId: data.companyId,
  company_id: data.companyId || data.company_id,
  companyName: data.companyName,
  createdAt: data.createdAt,
  data_creazione: data.createdAt || data.data_creazione,
  updatedAt: data.updatedAt,
  data_ultima_modifica: data.updatedAt || data.data_ultima_modifica,
  documentHtml: data.documentHtml,
  numero_revisione: data.numero_revisione,
  revision_note: data.revision_note,
  created_by: data.created_by,
  updated_by: data.updated_by,
  files_count: data.files_count,
  files: data.files,
});

// Helper to convert frontend data to backend format
export const mapDVRToBackend = (data: Partial<DVR>): CreateDVRRequest => ({
  title: data.title || data.nome || '',
  description: data.description || data.descrizione,
  companyId: data.companyId || data.company_id,
});

// Helper to map file from backend
export const mapFileFromBackend = (data: any): FileMetadata => ({
  id: data.id,
  dvrId: data.dvrId || data.dvr_id,
  dvr_id: data.dvrId || data.dvr_id,
  filename: data.filename || data.file_name,
  file_name: data.filename || data.file_name,
  originalName: data.originalName,
  mimeType: data.mimeType,
  size: data.size,
  classification: data.classification,
  extractedData: data.extractedData || data.extraction_data,
  extraction_data: data.extractedData || data.extraction_data,
  createdAt: data.createdAt || data.created_at,
  created_at: data.createdAt || data.created_at,
  include: data.include,
  risk_id: data.risk_id,
  notes: data.notes,
  classification_result: data.classification_result,
  risk: data.risk,
});
