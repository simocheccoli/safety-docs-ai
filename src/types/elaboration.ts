// Aligned with OpenAPI spec: components/schemas/Elaboration
// Supports both OpenAPI format and legacy format
export type ElaborationStatus = 
  | 'pending' | 'processing' | 'completed' | 'error'
  | 'bozza' | 'elaborating'; // Legacy formats

// Legacy status mapping
export const ELABORATION_STATUS_MAP: Record<string, string> = {
  'bozza': 'pending',
  'elaborating': 'processing',
  'completed': 'completed',
  'error': 'error',
  'pending': 'bozza',
  'processing': 'elaborating',
};

export const ELABORATION_STATUS_LABELS: Record<string, string> = {
  'pending': 'In Attesa',
  'processing': 'In Elaborazione',
  'completed': 'Completato',
  'error': 'Errore',
  'bozza': 'Bozza',
  'elaborating': 'In Elaborazione',
};

// Aligned with OpenAPI spec: components/schemas/Elaboration
// Supports both camelCase (OpenAPI) and snake_case (legacy)
export interface Elaboration {
  id: number;
  title: string;
  description?: string;
  companyId?: number | null; // OpenAPI uses camelCase
  company_id?: number | null; // Legacy alias
  companyName?: string | null; // OpenAPI uses camelCase
  company_name?: string | null; // Legacy alias
  status: ElaborationStatus;
  uploadCount?: number; // OpenAPI uses camelCase
  uploads_count?: number; // Legacy alias
  fileCount?: number; // OpenAPI uses camelCase
  files_count?: number; // Legacy alias
  createdAt?: string; // OpenAPI uses camelCase
  created_at?: string; // Legacy alias
  updatedAt?: string; // OpenAPI uses camelCase
  updated_at?: string; // Legacy alias
  
  // Legacy fields
  begin_process?: string;
  end_process?: string | null;
  deleted_at?: string | null;
}

// Aligned with OpenAPI spec: components/schemas/ElaborationUpload
// Supports both camelCase and snake_case
export interface ElaborationUpload {
  id: number;
  elaborationId?: number; // OpenAPI uses camelCase
  elaboration_id?: number; // Legacy alias
  mansione: string;
  reparto: string;
  ruolo: string;
  files: ElaborationFile[];
  createdAt?: string; // OpenAPI uses camelCase
  created_at?: string; // Legacy alias
  status?: 'pending' | 'elaborating' | 'completed' | 'error'; // Legacy
}

// Aligned with OpenAPI spec: components/schemas/ElaborationFile
// Supports both camelCase and snake_case
export interface ElaborationFile {
  id: number;
  uploadId?: number; // OpenAPI uses camelCase
  upload_id?: number; // Legacy alias
  filename: string; // OpenAPI uses 'filename'
  originalName?: string;
  mimeType?: string;
  size?: number;
  created_at?: string; // Legacy
}

// Aligned with OpenAPI spec: components/schemas/CreateElaborationRequest
export interface CreateElaborationRequest {
  title: string;
  description?: string;
  companyId?: number;
}

// Aligned with OpenAPI spec: components/schemas/CreateUploadRequest
export interface CreateUploadRequest {
  mansione: string;
  reparto: string;
  ruolo: string;
  files?: File[];
}

// Helper to get company name (supports both formats)
export const getElaborationCompanyName = (elaboration: Elaboration): string | null => {
  return elaboration.companyName || elaboration.company_name || null;
};

// Helper to get company id (supports both formats)
export const getElaborationCompanyId = (elaboration: Elaboration): number | null => {
  return elaboration.companyId || elaboration.company_id || null;
};

// Helper to convert backend response to frontend format
export const mapElaborationFromBackend = (data: any): Elaboration => ({
  id: data.id,
  title: data.title,
  description: data.description,
  companyId: data.companyId || data.company_id,
  company_id: data.companyId || data.company_id,
  companyName: data.companyName || data.company_name,
  company_name: data.companyName || data.company_name,
  status: data.status,
  uploadCount: data.uploadCount || data.uploads_count,
  uploads_count: data.uploadCount || data.uploads_count,
  fileCount: data.fileCount || data.files_count,
  files_count: data.fileCount || data.files_count,
  createdAt: data.createdAt || data.created_at,
  created_at: data.createdAt || data.created_at,
  updatedAt: data.updatedAt || data.updated_at,
  updated_at: data.updatedAt || data.updated_at,
  begin_process: data.begin_process,
  end_process: data.end_process,
  deleted_at: data.deleted_at,
});

// Helper to convert frontend data to backend format
export const mapElaborationToBackend = (data: Partial<Elaboration>): CreateElaborationRequest => ({
  title: data.title || '',
  description: data.description,
  companyId: data.companyId || data.company_id || undefined,
});

// Helper to map upload from backend
export const mapUploadFromBackend = (data: any): ElaborationUpload => ({
  id: data.id,
  elaborationId: data.elaborationId || data.elaboration_id,
  elaboration_id: data.elaborationId || data.elaboration_id,
  mansione: data.mansione,
  reparto: data.reparto,
  ruolo: data.ruolo,
  files: (data.files || []).map(mapFileFromBackend),
  createdAt: data.createdAt || data.created_at,
  created_at: data.createdAt || data.created_at,
  status: data.status,
});

// Helper to map file from backend
export const mapFileFromBackend = (data: any): ElaborationFile => ({
  id: data.id,
  uploadId: data.uploadId || data.upload_id,
  upload_id: data.uploadId || data.upload_id,
  filename: data.filename,
  originalName: data.originalName,
  mimeType: data.mimeType,
  size: data.size,
  created_at: data.created_at,
});
