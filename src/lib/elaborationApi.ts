import { Elaboration, ElaborationUpload, ElaborationFile } from "@/types/elaboration";
import { apiClient, simulateDelay } from './apiClient';
import { isDemoMode, getApiBaseUrl } from './config';

// Mock data
let mockElaborationIdCounter = 4;
let mockUploadIdCounter = 10;
let mockFileIdCounter = 30;

const mockElaborations: Elaboration[] = [
  {
    id: 1,
    title: "Scheda Sicurezza Stabilimento Nord",
    description: "Analisi rischi per stabilimento zona nord",
    company_id: 1,
    company_name: "Acme Industries S.r.l.",
    status: 'completed',
    uploads_count: 3,
    files_count: 8,
    begin_process: new Date(2024, 10, 15, 10, 30).toISOString(),
    end_process: new Date(2024, 10, 15, 11, 45).toISOString(),
    created_at: new Date(2024, 10, 15, 10, 0).toISOString(),
    updated_at: new Date(2024, 10, 15, 11, 45).toISOString(),
    deleted_at: null,
  },
  {
    id: 2,
    title: "Scheda Sicurezza Magazzino",
    description: "Valutazione rischi magazzino centrale",
    company_id: 2,
    company_name: "TechCorp S.p.A.",
    status: 'elaborating',
    uploads_count: 2,
    files_count: 5,
    begin_process: new Date(2024, 11, 1, 14, 0).toISOString(),
    end_process: null,
    created_at: new Date(2024, 11, 1, 13, 30).toISOString(),
    updated_at: new Date(2024, 11, 1, 14, 0).toISOString(),
    deleted_at: null,
  },
  {
    id: 3,
    title: "Scheda Sicurezza Uffici",
    description: "Valutazione rischi uffici amministrativi",
    company_id: 1,
    company_name: "Acme Industries S.r.l.",
    status: 'bozza',
    uploads_count: 1,
    files_count: 2,
    begin_process: new Date(2024, 11, 5, 9, 0).toISOString(),
    end_process: null,
    created_at: new Date(2024, 11, 5, 9, 0).toISOString(),
    updated_at: new Date(2024, 11, 5, 9, 0).toISOString(),
    deleted_at: null,
  },
];

const mockUploads: ElaborationUpload[] = [
  {
    id: 1,
    elaboration_id: 1,
    mansione: "Operatore Macchine CNC",
    reparto: "Produzione",
    ruolo: "Operaio Specializzato",
    files: [
      { id: 1, upload_id: 1, filename: "scheda_rumore_cnc.pdf", size: 1024000, created_at: new Date(2024, 10, 15).toISOString() },
      { id: 2, upload_id: 1, filename: "scheda_vibrazioni.pdf", size: 856000, created_at: new Date(2024, 10, 15).toISOString() },
      { id: 3, upload_id: 1, filename: "scheda_oli_lubrificanti.pdf", size: 720000, created_at: new Date(2024, 10, 15).toISOString() },
    ],
    created_at: new Date(2024, 10, 15).toISOString(),
    status: 'completed',
  },
  {
    id: 2,
    elaboration_id: 1,
    mansione: "Addetto Saldatura",
    reparto: "Assemblaggio",
    ruolo: "Operaio",
    files: [
      { id: 4, upload_id: 2, filename: "scheda_fumi_saldatura.pdf", size: 1200000, created_at: new Date(2024, 10, 15).toISOString() },
      { id: 5, upload_id: 2, filename: "scheda_radiazioni.pdf", size: 980000, created_at: new Date(2024, 10, 15).toISOString() },
    ],
    created_at: new Date(2024, 10, 15).toISOString(),
    status: 'completed',
  },
  {
    id: 3,
    elaboration_id: 1,
    mansione: "Responsabile Qualità",
    reparto: "Controllo Qualità",
    ruolo: "Impiegato Tecnico",
    files: [
      { id: 6, upload_id: 3, filename: "scheda_sostanze_chimiche.pdf", size: 1500000, created_at: new Date(2024, 10, 15).toISOString() },
      { id: 7, upload_id: 3, filename: "scheda_laboratorio.pdf", size: 890000, created_at: new Date(2024, 10, 15).toISOString() },
      { id: 8, upload_id: 3, filename: "scheda_attrezzature.pdf", size: 670000, created_at: new Date(2024, 10, 15).toISOString() },
    ],
    created_at: new Date(2024, 10, 15).toISOString(),
    status: 'completed',
  },
  {
    id: 4,
    elaboration_id: 2,
    mansione: "Carrellista",
    reparto: "Logistica",
    ruolo: "Operaio",
    files: [
      { id: 9, upload_id: 4, filename: "scheda_movimentazione.pdf", size: 780000, created_at: new Date(2024, 11, 1).toISOString() },
      { id: 10, upload_id: 4, filename: "scheda_carrelli.pdf", size: 650000, created_at: new Date(2024, 11, 1).toISOString() },
    ],
    created_at: new Date(2024, 11, 1).toISOString(),
    status: 'elaborating',
  },
  {
    id: 5,
    elaboration_id: 2,
    mansione: "Addetto Imballaggio",
    reparto: "Spedizioni",
    ruolo: "Operaio",
    files: [
      { id: 11, upload_id: 5, filename: "scheda_imballaggio.pdf", size: 520000, created_at: new Date(2024, 11, 1).toISOString() },
      { id: 12, upload_id: 5, filename: "scheda_nastri.pdf", size: 430000, created_at: new Date(2024, 11, 1).toISOString() },
      { id: 13, upload_id: 5, filename: "scheda_adesivi.pdf", size: 380000, created_at: new Date(2024, 11, 1).toISOString() },
    ],
    created_at: new Date(2024, 11, 1).toISOString(),
    status: 'pending',
  },
  {
    id: 6,
    elaboration_id: 3,
    mansione: "Impiegato Amministrativo",
    reparto: "Amministrazione",
    ruolo: "Impiegato",
    files: [
      { id: 14, upload_id: 6, filename: "scheda_vdt.pdf", size: 320000, created_at: new Date(2024, 11, 5).toISOString() },
      { id: 15, upload_id: 6, filename: "scheda_ergonomia.pdf", size: 280000, created_at: new Date(2024, 11, 5).toISOString() },
    ],
    created_at: new Date(2024, 11, 5).toISOString(),
    status: 'pending',
  },
];

// Map backend response to frontend type
const mapBackendElaboration = (data: any): Elaboration => ({
  id: data.id,
  title: data.title,
  description: data.description || '',
  company_id: data.companyId,
  company_name: data.companyName,
  status: data.status || 'pending',
  uploads_count: data.uploadCount || 0,
  files_count: data.fileCount || 0,
  begin_process: data.beginProcess || null,
  end_process: data.endProcess || null,
  created_at: data.createdAt,
  updated_at: data.updatedAt,
  deleted_at: data.deletedAt || null,
});

// API Functions
export async function fetchElaborations(): Promise<Elaboration[]> {
  if (isDemoMode()) {
    await simulateDelay(300);
    return mockElaborations.filter(e => e.deleted_at === null);
  }

  const data = await apiClient.get<any[]>('/elaborations');
  return data.map(mapBackendElaboration);
}

export async function fetchElaborationById(id: number): Promise<Elaboration | null> {
  if (isDemoMode()) {
    await simulateDelay(200);
    return mockElaborations.find(e => e.id === id && e.deleted_at === null) || null;
  }

  try {
    const data = await apiClient.get<any>(`/elaborations/${id}`);
    return mapBackendElaboration(data);
  } catch (error: any) {
    if (error.message?.includes('404')) {
      return null;
    }
    throw error;
  }
}

export async function createElaboration(
  title: string,
  description: string,
  companyId: number | null,
  companyName: string | null
): Promise<Elaboration> {
  if (isDemoMode()) {
    await simulateDelay(300);
    const newElaboration: Elaboration = {
      id: ++mockElaborationIdCounter,
      title,
      description,
      company_id: companyId,
      company_name: companyName,
      status: 'bozza',
      uploads_count: 0,
      files_count: 0,
      begin_process: new Date().toISOString(),
      end_process: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };
    mockElaborations.push(newElaboration);
    return newElaboration;
  }

  const data = await apiClient.post<any>('/elaborations', {
    title,
    description,
    companyId,
  });
  return mapBackendElaboration(data);
}

export async function updateElaboration(
  id: number,
  updates: Partial<Pick<Elaboration, 'title' | 'description' | 'company_id' | 'company_name'>>
): Promise<Elaboration> {
  if (isDemoMode()) {
    await simulateDelay(200);
    const elaboration = mockElaborations.find(e => e.id === id);
    if (!elaboration) throw new Error('Elaboration not found');
    Object.assign(elaboration, updates, { updated_at: new Date().toISOString() });
    return elaboration;
  }

  const data = await apiClient.patch<any>(`/elaborations/${id}`, {
    title: updates.title,
    description: updates.description,
    companyId: updates.company_id,
  });
  return mapBackendElaboration(data);
}

export async function deleteElaboration(id: number): Promise<void> {
  if (isDemoMode()) {
    await simulateDelay(200);
    const elaboration = mockElaborations.find(e => e.id === id);
    if (elaboration) {
      elaboration.deleted_at = new Date().toISOString();
    }
    return;
  }

  return apiClient.delete(`/elaborations/${id}`);
}

export async function fetchElaborationUploads(elaborationId: number): Promise<ElaborationUpload[]> {
  if (isDemoMode()) {
    await simulateDelay(300);
    return mockUploads.filter(u => u.elaboration_id === elaborationId);
  }

  return apiClient.get<ElaborationUpload[]>(`/elaborations/${elaborationId}/uploads`);
}

export async function createUpload(
  elaborationId: number,
  mansione: string,
  reparto: string,
  ruolo: string,
  files: File[]
): Promise<ElaborationUpload> {
  if (isDemoMode()) {
    await simulateDelay(500);
    
    const uploadId = ++mockUploadIdCounter;
    const newFiles: ElaborationFile[] = files.map(file => ({
      id: ++mockFileIdCounter,
      upload_id: uploadId,
      filename: file.name,
      size: file.size,
      created_at: new Date().toISOString(),
    }));

    const newUpload: ElaborationUpload = {
      id: uploadId,
      elaboration_id: elaborationId,
      mansione,
      reparto,
      ruolo,
      files: newFiles,
      created_at: new Date().toISOString(),
      status: 'pending',
    };
    mockUploads.push(newUpload);

    // Update elaboration counts
    const elaboration = mockElaborations.find(e => e.id === elaborationId);
    if (elaboration) {
      elaboration.uploads_count++;
      elaboration.files_count += files.length;
      elaboration.updated_at = new Date().toISOString();
    }

    return newUpload;
  }

  const formData = new FormData();
  formData.append('mansione', mansione);
  formData.append('reparto', reparto);
  formData.append('ruolo', ruolo);
  files.forEach(file => formData.append('files', file));

  return apiClient.upload<ElaborationUpload>(`/elaborations/${elaborationId}/uploads`, formData);
}

export async function deleteUpload(elaborationId: number, uploadId: number): Promise<void> {
  if (isDemoMode()) {
    await simulateDelay(200);
    const uploadIndex = mockUploads.findIndex(u => u.id === uploadId);
    if (uploadIndex !== -1) {
      const upload = mockUploads[uploadIndex];
      const elaboration = mockElaborations.find(e => e.id === upload.elaboration_id);
      if (elaboration) {
        elaboration.uploads_count--;
        elaboration.files_count -= upload.files.length;
        elaboration.updated_at = new Date().toISOString();
      }
      mockUploads.splice(uploadIndex, 1);
    }
    return;
  }

  return apiClient.delete(`/elaborations/${elaborationId}/uploads/${uploadId}`);
}

// Payload type for external service
export interface FilePayload {
  file_id: number;
  filename: string;
  file_path: string;
  size: number;
  mansione: string;
  reparto: string;
  ruolo: string;
}

export interface GenerateExcelPayload {
  elaboration_id: number;
  elaboration_title: string;
  company_name: string | null;
  files: FilePayload[];
}

export async function generateExcel(elaborationId: number): Promise<GenerateExcelPayload> {
  const elaboration = mockElaborations.find(e => e.id === elaborationId);
  const uploads = mockUploads.filter(u => u.elaboration_id === elaborationId);
  
  if (!elaboration) {
    throw new Error('Elaboration not found');
  }

  // Build the payload with one entry per file including mansione/reparto/ruolo
  const filesPayload: FilePayload[] = [];
  
  for (const upload of uploads) {
    for (const file of upload.files) {
      filesPayload.push({
        file_id: file.id,
        filename: file.filename,
        file_path: `/storage/elaborations/${elaborationId}/uploads/${upload.id}/${file.filename}`,
        size: file.size,
        mansione: upload.mansione,
        reparto: upload.reparto,
        ruolo: upload.ruolo,
      });
    }
  }

  const payload: GenerateExcelPayload = {
    elaboration_id: elaborationId,
    elaboration_title: elaboration.title,
    company_name: elaboration.company_name,
    files: filesPayload,
  };

  if (isDemoMode()) {
    await simulateDelay(1000);
    
    // Log the payload that would be sent
    console.log('📤 POST payload per servizio esterno:', JSON.stringify(payload, null, 2));
    
    elaboration.status = 'elaborating';
    elaboration.updated_at = new Date().toISOString();
    
    // Simulate processing completion after 3 seconds
    setTimeout(() => {
      elaboration.status = 'completed';
      elaboration.end_process = new Date().toISOString();
      elaboration.updated_at = new Date().toISOString();
    }, 3000);
    
    return payload;
  }

  await apiClient.post(`/elaborations/${elaborationId}/generate`);
  return payload;
}

export async function downloadExcel(id: number): Promise<void> {
  if (isDemoMode()) {
    console.log(`Mock: Downloading Excel for elaboration ${id}`);
    return;
  }

  const blob = await apiClient.download(`/elaborations/${id}/excel`);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `elaboration-${id}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function downloadZip(id: number): Promise<void> {
  if (isDemoMode()) {
    console.log(`Mock: Downloading ZIP for elaboration ${id}`);
    return;
  }

  const blob = await apiClient.download(`/elaborations/${id}/zip`);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `elaboration-${id}.zip`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
