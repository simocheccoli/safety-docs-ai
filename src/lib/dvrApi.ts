import { DVR, FileMetadata, DVRVersion, DVRStatus } from "@/types/dvr";
import { apiClient, simulateDelay } from './apiClient';
import { isDemoMode, getApiBaseUrl } from './config';

// Mock data storage
let mockDVRs: DVR[] = [
  {
    id: "1",
    nome: "DVR Bio5 S.r.l. - 2024",
    descrizione: "Documento di Valutazione dei Rischi annuale",
    stato: "BOZZA",
    company_id: 1,
    numero_revisione: 1,
    data_creazione: new Date().toISOString(),
    data_ultima_modifica: new Date().toISOString(),
    created_by: "1",
    updated_by: "1",
    files: []
  }
];

let mockFileIdCounter = 1;
let mockDvrIdCounter = 2;

// Map functions for backend data
function mapDVRFromBackend(data: any): DVR {
  return {
    id: data.id?.toString() || data.id,
    nome: data.title || data.nome,
    descrizione: data.description || data.descrizione || '',
    stato: mapStatusFromBackend(data.status || data.stato),
    company_id: data.companyId || data.company_id,
    numero_revisione: data.version || data.numero_revisione || 1,
    revision_note: data.revision_note,
    data_creazione: data.createdAt || data.created_at || data.data_creazione,
    data_ultima_modifica: data.updatedAt || data.updated_at || data.data_ultima_modifica,
    created_by: data.created_by || "1",
    updated_by: data.updated_by || "1",
    files: data.files?.map(mapFileFromBackend) || []
  };
}

function mapFileFromBackend(file: any): FileMetadata {
  return {
    id: file.id,
    dvr_id: file.dvrId || file.dvr_id,
    file_name: file.filename || file.originalName || file.file_name || file.name,
    risk_id: file.risk_id || 1,
    include: file.include !== undefined ? file.include : true,
    notes: file.notes || '',
    classification_result: file.classification || file.classification_result,
    extraction_data: file.extractedData || file.extraction_data,
    risk: file.risk || { id: 1, code: "RS001", name: "Rischio generico", status: "active" },
    created_at: file.createdAt || file.created_at,
    updated_at: file.updatedAt || file.updated_at
  };
}

function mapVersionFromBackend(version: any): DVRVersion {
  return {
    id: version.id,
    dvr_id: version.dvr_id,
    version: version.version_number || version.version,
    nome: version.nome || version.title || '',
    descrizione: version.descrizione || version.description || null,
    stato: mapStatusFromBackend(version.stato || version.status),
    revision_note: version.revision_note || version.note || null,
    created_at: version.created_at,
    updated_at: version.updated_at
  };
}

function mapStatusFromBackend(status: string): DVRStatus {
  const statusMap: Record<string, DVRStatus> = {
    'draft': 'BOZZA',
    'DRAFT': 'BOZZA',
    'bozza': 'BOZZA',
    'BOZZA': 'BOZZA',
    'in_progress': 'IN_LAVORAZIONE',
    'IN_PROGRESS': 'IN_LAVORAZIONE',
    'in_lavorazione': 'IN_LAVORAZIONE',
    'IN_LAVORAZIONE': 'IN_LAVORAZIONE',
    'in_review': 'IN_REVISIONE',
    'IN_REVIEW': 'IN_REVISIONE',
    'in_revisione': 'IN_REVISIONE',
    'IN_REVISIONE': 'IN_REVISIONE',
    'review': 'IN_REVISIONE',
    'in_approvazione': 'IN_APPROVAZIONE',
    'IN_APPROVAZIONE': 'IN_APPROVAZIONE',
    'approved': 'APPROVATO',
    'APPROVED': 'APPROVATO',
    'approvato': 'APPROVATO',
    'APPROVATO': 'APPROVATO',
    'finalized': 'FINALIZZATO',
    'FINALIZED': 'FINALIZZATO',
    'finalizzato': 'FINALIZZATO',
    'FINALIZZATO': 'FINALIZZATO',
    'archived': 'ARCHIVIATO',
    'ARCHIVED': 'ARCHIVIATO',
    'archiviato': 'ARCHIVIATO',
    'ARCHIVIATO': 'ARCHIVIATO'
  };
  return statusMap[status] || 'BOZZA';
}

function mapStatusToBackend(status: DVRStatus): string {
  const statusMap: Record<DVRStatus, string> = {
    'BOZZA': 'draft',
    'IN_LAVORAZIONE': 'in_progress',
    'IN_REVISIONE': 'review',
    'IN_APPROVAZIONE': 'review',
    'APPROVATO': 'approved',
    'FINALIZZATO': 'approved',
    'ARCHIVIATO': 'archived'
  };
  return statusMap[status] || 'draft';
}

/**
 * API per la gestione dei DVR
 */
export const dvrApi = {
  /**
   * Crea un nuovo DVR con file
   */
  createDVR: async (
    title: string, 
    files: File[], 
    companyId?: number, 
    description?: string
  ): Promise<DVR> => {
    if (isDemoMode()) {
      await simulateDelay(500);
      
      const newFiles: FileMetadata[] = files.map((file) => ({
        id: mockFileIdCounter++,
        dvr_id: mockDvrIdCounter,
        file_name: file.name,
        include: true,
        risk_id: 1,
        risk: { id: 1, code: "RS001", name: "Rischio generico", status: "active" },
        created_at: new Date().toISOString()
      }));
      
      const newDVR: DVR = {
        id: (mockDvrIdCounter++).toString(),
        nome: title,
        descrizione: description || "",
        stato: "BOZZA",
        company_id: companyId,
        numero_revisione: 1,
        data_creazione: new Date().toISOString(),
        data_ultima_modifica: new Date().toISOString(),
        created_by: "1",
        updated_by: "1",
        files: newFiles
      };
      
      mockDVRs.push(newDVR);
      return newDVR;
    }

    // Create DVR first
    const dvrData = await apiClient.post<any>('/dvr', {
      title,
      description,
      companyId
    });
    
    // Upload files if any
    if (files.length > 0) {
      const formData = new FormData();
      files.forEach(file => formData.append('file', file));
      await apiClient.upload(`/dvr/${dvrData.id}/files`, formData);
    }
    
    return mapDVRFromBackend(dvrData);
  },

  /**
   * Recupera tutti i DVR
   */
  getDVRList: async (): Promise<DVR[]> => {
    if (isDemoMode()) {
      await simulateDelay(300);
      return [...mockDVRs];
    }

    const data = await apiClient.get<any[]>('/dvr');
    return data.map(mapDVRFromBackend);
  },

  /**
   * Recupera un DVR per ID
   */
  getDVR: async (id: string): Promise<DVR | null> => {
    if (isDemoMode()) {
      await simulateDelay(200);
      return mockDVRs.find(d => d.id === id) || null;
    }

    try {
      const data = await apiClient.get<any>(`/dvr/${id}`);
      return mapDVRFromBackend(data);
    } catch (error: any) {
      if (error.message?.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Aggiorna i dati di un DVR
   */
  updateDVR: async (id: string, data: Partial<DVR>): Promise<DVR> => {
    if (isDemoMode()) {
      await simulateDelay(300);
      const index = mockDVRs.findIndex(d => d.id === id);
      if (index === -1) throw new Error("DVR non trovato");
      
      mockDVRs[index] = {
        ...mockDVRs[index],
        ...data,
        data_ultima_modifica: new Date().toISOString()
      };
      return mockDVRs[index];
    }

    const updatePayload: any = {};
    if (data.nome !== undefined) updatePayload.title = data.nome;
    if (data.descrizione !== undefined) updatePayload.description = data.descrizione;
    if (data.stato !== undefined) updatePayload.status = mapStatusToBackend(data.stato);
    if (data.company_id !== undefined) updatePayload.companyId = data.company_id;
    
    const result = await apiClient.patch<any>(`/dvr/${id}`, updatePayload);
    return mapDVRFromBackend(result);
  },

  /**
   * Salva una nuova revisione del DVR
   */
  saveRevision: async (id: string, data: Partial<DVR>, revisionNote: string): Promise<DVR> => {
    if (isDemoMode()) {
      await simulateDelay(400);
      const index = mockDVRs.findIndex(d => d.id === id);
      if (index === -1) throw new Error("DVR non trovato");
      
      mockDVRs[index] = {
        ...mockDVRs[index],
        ...data,
        numero_revisione: mockDVRs[index].numero_revisione + 1,
        revision_note: revisionNote,
        data_ultima_modifica: new Date().toISOString()
      };
      return mockDVRs[index];
    }

    // Update DVR with revision note
    const updatePayload: any = {
      title: data.nome,
      description: data.descrizione,
    };
    if (data.stato) updatePayload.status = mapStatusToBackend(data.stato);
    
    await apiClient.patch(`/dvr/${id}`, updatePayload);
    return dvrApi.getDVR(id) as Promise<DVR>;
  },

  /**
   * Recupera i file associati a un DVR
   */
  getDVRFiles: async (dvrId: string): Promise<FileMetadata[]> => {
    if (isDemoMode()) {
      await simulateDelay(200);
      const dvr = mockDVRs.find(d => d.id === dvrId);
      return dvr?.files || [];
    }

    const data = await apiClient.get<any[]>(`/dvr/${dvrId}/files`);
    return data.map(mapFileFromBackend);
  },

  /**
   * Aggiorna un file
   */
  updateFile: async (dvrId: string, fileId: string, data: Partial<FileMetadata>): Promise<void> => {
    if (isDemoMode()) {
      await simulateDelay(200);
      const dvr = mockDVRs.find(d => d.id === dvrId);
      if (dvr && dvr.files) {
        const fileIndex = dvr.files.findIndex(f => f.id.toString() === fileId);
        if (fileIndex !== -1) {
          dvr.files[fileIndex] = { ...dvr.files[fileIndex], ...data };
        }
      }
      return;
    }

    const updatePayload: any = {};
    if (data.classification_result !== undefined) updatePayload.classification = data.classification_result;
    if (data.extraction_data !== undefined) updatePayload.extractedData = data.extraction_data;
    
    await apiClient.patch(`/dvr/${dvrId}/files/${fileId}`, updatePayload);
  },

  /**
   * Elimina un DVR
   */
  deleteDVR: async (id: string): Promise<void> => {
    if (isDemoMode()) {
      await simulateDelay(300);
      mockDVRs = mockDVRs.filter(d => d.id !== id);
      return;
    }

    return apiClient.delete(`/dvr/${id}`);
  },

  /**
   * Recupera il documento HTML di un DVR
   */
  getDocument: async (dvrId: string): Promise<{ html: string }> => {
    if (isDemoMode()) {
      await simulateDelay(300);
      return { html: "<h1>Documento di Valutazione dei Rischi</h1><p>Contenuto demo del documento DVR.</p>" };
    }

    const response = await fetch(`${getApiBaseUrl()}/dvr/${dvrId}/document`, {
      headers: { 'Accept': 'text/html' }
    });
    
    if (!response.ok) {
      throw new Error("Errore nel recupero del documento");
    }
    
    const html = await response.text();
    return { html };
  },

  /**
   * Salva il documento HTML di un DVR
   */
  updateDocument: async (dvrId: string, html: string): Promise<{ success: boolean; html: string }> => {
    if (isDemoMode()) {
      await simulateDelay(300);
      return { success: true, html };
    }

    const response = await fetch(`${getApiBaseUrl()}/dvr/${dvrId}/document`, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/html' },
      body: html,
    });
    
    if (!response.ok) {
      throw new Error("Errore nel salvataggio del documento");
    }
    
    return { success: true, html };
  },

  /**
   * Aggiunge file a un DVR esistente
   */
  addFilesToDVR: async (dvrId: string, files: File[]): Promise<DVR> => {
    if (isDemoMode()) {
      await simulateDelay(400);
      const index = mockDVRs.findIndex(d => d.id === dvrId);
      if (index === -1) throw new Error("DVR non trovato");
      
      const newFiles: FileMetadata[] = files.map(file => ({
        id: mockFileIdCounter++,
        dvr_id: parseInt(dvrId),
        file_name: file.name,
        include: true,
        risk_id: 1,
        risk: { id: 1, code: "RS001", name: "Rischio generico", status: "active" },
        created_at: new Date().toISOString()
      }));
      
      mockDVRs[index].files = [...(mockDVRs[index].files || []), ...newFiles];
      return mockDVRs[index];
    }

    const formData = new FormData();
    files.forEach(file => formData.append('file', file));
    
    await apiClient.upload(`/dvr/${dvrId}/files`, formData);
    return dvrApi.getDVR(dvrId) as Promise<DVR>;
  },

  /**
   * Elimina un file da un DVR
   */
  deleteFile: async (dvrId: string, fileId: string): Promise<void> => {
    if (isDemoMode()) {
      await simulateDelay(200);
      const dvr = mockDVRs.find(d => d.id === dvrId);
      if (dvr && dvr.files) {
        dvr.files = dvr.files.filter(f => f.id.toString() !== fileId);
      }
      return;
    }

    return apiClient.delete(`/dvr/${dvrId}/files/${fileId}`);
  },

  /**
   * Scarica il documento finale del DVR
   */
  downloadDocument: async (id: string): Promise<Blob> => {
    if (isDemoMode()) {
      await simulateDelay(500);
      return new Blob(["Demo document content"], { type: "application/pdf" });
    }

    return apiClient.download(`/dvr/${id}/document`);
  },

  /**
   * Recupera le versioni di un DVR (mock only for now)
   */
  getDVRVersions: async (dvrId: string): Promise<DVRVersion[]> => {
    if (isDemoMode()) {
      await simulateDelay(200);
      return [
        {
          id: 1,
          dvr_id: dvrId,
          version: 1,
          nome: "Versione iniziale",
          descrizione: null,
          stato: "BOZZA",
          revision_note: "Creazione documento",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }

    // API not in OpenAPI spec, return empty for now
    return [];
  },

  /**
   * Finalizza DVR (mock only for now)
   */
  finalize: async (id: string, title: string): Promise<DVR> => {
    if (isDemoMode()) {
      await simulateDelay(300);
      const index = mockDVRs.findIndex(d => d.id === id);
      if (index === -1) throw new Error("DVR non trovato");
      
      mockDVRs[index] = {
        ...mockDVRs[index],
        stato: "FINALIZZATO",
        data_ultima_modifica: new Date().toISOString()
      };
      return mockDVRs[index];
    }

    return dvrApi.updateDVR(id, { stato: "APPROVATO" });
  },

  /**
   * Ripristina un DVR a una versione precedente (mock only)
   */
  revertToVersion: async (dvrId: string, versionNumber: number): Promise<DVR> => {
    if (isDemoMode()) {
      await simulateDelay(300);
      const dvr = mockDVRs.find(d => d.id === dvrId);
      if (!dvr) throw new Error("DVR non trovato");
      return dvr;
    }

    // Not in OpenAPI spec
    throw new Error("Funzionalità non disponibile");
  },

  /**
   * Avvia l'elaborazione AI dei file (mock only)
   */
  startProcessing: async (dvrId: string, apiKey?: string): Promise<void> => {
    if (isDemoMode()) {
      await simulateDelay(300);
      return;
    }
    // Not in OpenAPI spec
  },

  /**
   * Verifica lo stato dell'elaborazione (mock only)
   */
  getProcessingProgress: async (dvrId: string): Promise<any> => {
    if (isDemoMode()) {
      return { progress: 100, status: "completed" };
    }
    return { progress: 100, status: "completed" };
  },

  /**
   * Rigenera il documento da template (mock only)
   */
  regenerateDocument: async (dvrId: string, template?: string): Promise<{ success: boolean; document_path: string; download_url: string }> => {
    if (isDemoMode()) {
      await simulateDelay(500);
      return { success: true, document_path: "/demo/document.docx", download_url: "/demo/download" };
    }
    return { success: true, document_path: "", download_url: "" };
  },

  /**
   * Esporta il documento in formato DOCX o PDF (mock only)
   */
  exportDocument: async (dvrId: string, format: 'docx' | 'pdf'): Promise<{ success: boolean; path: string }> => {
    if (isDemoMode()) {
      await simulateDelay(500);
      return { success: true, path: `/demo/document.${format}` };
    }
    return { success: true, path: "" };
  },
};
