import { DVR, FileMetadata, DVRVersion, DVRStatus } from "@/types/dvr";

// DEMO MODE: Use mock data instead of real API
const DEMO_MODE = true;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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

/**
 * API per la gestione dei DVR - DEMO MODE con dati mock
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
    if (DEMO_MODE) {
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

    try {
      const formData = new FormData();
      formData.append('title', title);
      
      if (description) {
        formData.append('description', description);
      }
      
      if (companyId) {
        formData.append('company_id', companyId.toString());
      }
      
      files.forEach(file => {
        formData.append('files[]', file);
      });

      const response = await fetch(`${API_BASE_URL}/api/dvrs`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Errore nella creazione del DVR");
      }
      
      const backendData = await response.json();
      return mapDVRFromBackend(backendData);
    } catch (error) {
      console.error("Errore createDVR:", error);
      throw error;
    }
  },

  /**
   * Recupera tutti i DVR
   */
  getDVRList: async (): Promise<DVR[]> => {
    if (DEMO_MODE) {
      await simulateDelay(300);
      return [...mockDVRs];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/dvrs`);
      
      if (!response.ok) {
        throw new Error("Errore nel recupero della lista DVR");
      }
      
      const data = await response.json();
      return data.map(mapDVRFromBackend);
    } catch (error) {
      console.error("Errore getDVRList:", error);
      throw error;
    }
  },

  /**
   * Recupera un DVR per ID
   */
  getDVR: async (id: string): Promise<DVR | null> => {
    if (DEMO_MODE) {
      await simulateDelay(200);
      return mockDVRs.find(d => d.id === id) || null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/dvrs/${id}`);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error("Errore nel recupero del DVR");
      }
      
      const backendData = await response.json();
      return mapDVRFromBackend(backendData);
    } catch (error) {
      console.error("Errore getDVR:", error);
      throw error;
    }
  },

  /**
   * Aggiorna i dati di un DVR (salvataggio normale senza creare revisione)
   */
  updateDVR: async (id: string, data: Partial<DVR>): Promise<DVR> => {
    if (DEMO_MODE) {
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

    try {
      const updatePayload: any = {};
      
      if (data.nome !== undefined) {
        updatePayload.title = data.nome;
      }
      
      if (data.descrizione !== undefined) {
        updatePayload.description = data.descrizione;
      }
      
      if (data.stato !== undefined) {
        updatePayload.status = data.stato;
      }
      
      if (data.company_id !== undefined) {
        updatePayload.company_id = data.company_id;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/dvrs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Errore nell'aggiornamento del DVR");
      }
      
      const backendData = await response.json();
      return mapDVRFromBackend(backendData);
    } catch (error) {
      console.error("Errore updateDVR:", error);
      throw error;
    }
  },

  /**
   * Salva una nuova revisione del DVR (con nota)
   */
  saveRevision: async (id: string, data: Partial<DVR>, revisionNote: string): Promise<DVR> => {
    if (DEMO_MODE) {
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

    try {
      if (revisionNote.trim().length === 0) {
        throw new Error("La nota di revisione è obbligatoria");
      }

      const response = await fetch(`${API_BASE_URL}/api/dvrs/${id}/revision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: revisionNote,
          title: data.nome,
          description: data.descrizione,
          status: data.stato,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Errore nel salvataggio della revisione");
      }
      
      return await dvrApi.getDVR(id) as DVR;
    } catch (error) {
      console.error("Errore saveRevision:", error);
      throw error;
    }
  },

  /**
   * Recupera i file associati a un DVR
   */
  getDVRFiles: async (dvrId: string): Promise<FileMetadata[]> => {
    if (DEMO_MODE) {
      await simulateDelay(200);
      const dvr = mockDVRs.find(d => d.id === dvrId);
      return dvr?.files || [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/dvrs/${dvrId}`);
      
      if (!response.ok) {
        throw new Error("Errore nel recupero dei file del DVR");
      }
      
      const data = await response.json();
      const files = data.files || [];
      return files.map(mapFileFromBackend);
    } catch (error) {
      console.error("Errore getDVRFiles:", error);
      throw error;
    }
  },

  /**
   * Aggiorna un file (assegnazione rischio, inclusione, note, risultati AI)
   */
  updateFile: async (dvrId: string, fileId: string, data: Partial<FileMetadata>): Promise<void> => {
    if (DEMO_MODE) {
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

    try {
      const updatePayload: any = {};
      
      if (data.risk_id !== undefined) {
        updatePayload.risk_id = data.risk_id;
      }
      
      if (data.include !== undefined) {
        updatePayload.include = data.include;
      }
      
      if (data.notes !== undefined) {
        updatePayload.notes = data.notes;
      }

      if (data.classification_result !== undefined) {
        updatePayload.classification_result = data.classification_result;
      }

      if (data.extraction_data !== undefined) {
        updatePayload.extraction_data = data.extraction_data;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/dvrs/${dvrId}/files/${fileId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Errore nell'aggiornamento del file");
      }
    } catch (error) {
      console.error("Errore updateFile:", error);
      throw error;
    }
  },

  /**
   * Finalizza DVR
   */
  finalize: async (id: string, title: string): Promise<DVR> => {
    if (DEMO_MODE) {
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

    try {
      const response = await fetch(`${API_BASE_URL}/api/dvrs/${id}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Errore nella finalizzazione del DVR");
      }
      
      return await dvrApi.getDVR(id) as DVR;
    } catch (error) {
      console.error("Errore finalize:", error);
      throw error;
    }
  },

  /**
   * Recupera le versioni di un DVR
   */
  getDVRVersions: async (dvrId: string): Promise<DVRVersion[]> => {
    if (DEMO_MODE) {
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

    try {
      const response = await fetch(`${API_BASE_URL}/api/dvrs/${dvrId}/versions`);
      
      if (!response.ok) {
        throw new Error("Errore nel recupero delle versioni");
      }
      
      const versions = await response.json();
      return versions.map(mapVersionFromBackend);
    } catch (error) {
      console.error("Errore getDVRVersions:", error);
      return [];
    }
  },

  /**
   * Ripristina un DVR a una versione precedente
   */
  revertToVersion: async (dvrId: string, versionNumber: number): Promise<DVR> => {
    if (DEMO_MODE) {
      await simulateDelay(300);
      const dvr = mockDVRs.find(d => d.id === dvrId);
      if (!dvr) throw new Error("DVR non trovato");
      return dvr;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/dvrs/${dvrId}/revert/${versionNumber}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Errore nel ripristino della versione");
      }
      
      return await dvrApi.getDVR(dvrId) as DVR;
    } catch (error) {
      console.error("Errore revertToVersion:", error);
      throw error;
    }
  },

  /**
   * Elimina un DVR
   */
  deleteDVR: async (id: string): Promise<void> => {
    if (DEMO_MODE) {
      await simulateDelay(300);
      mockDVRs = mockDVRs.filter(d => d.id !== id);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/dvrs/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Errore nell'eliminazione del DVR");
      }
    } catch (error) {
      console.error("Errore deleteDVR:", error);
      throw error;
    }
  },

  /**
   * Scarica il documento finale del DVR
   */
  downloadDocument: async (id: string): Promise<Blob> => {
    if (DEMO_MODE) {
      await simulateDelay(500);
      return new Blob(["Demo document content"], { type: "application/pdf" });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/dvrs/${id}/download`);
      
      if (!response.ok) {
        throw new Error("Errore nel download del documento");
      }
      
      return await response.blob();
    } catch (error) {
      console.error("Errore downloadDocument:", error);
      throw error;
    }
  },

  /**
   * Aggiunge file a un DVR esistente
   */
  addFilesToDVR: async (dvrId: string, files: File[]): Promise<DVR> => {
    if (DEMO_MODE) {
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

    try {
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append('files[]', file);
      });

      const response = await fetch(`${API_BASE_URL}/api/dvrs/${dvrId}/files`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Errore nell'aggiunta dei file");
      }
      
      const backendData = await response.json();
      return mapDVRFromBackend(backendData);
    } catch (error) {
      console.error("Errore addFilesToDVR:", error);
      throw error;
    }
  },

  /**
   * Avvia l'elaborazione AI dei file
   */
  startProcessing: async (dvrId: string, apiKey?: string): Promise<void> => {
    if (DEMO_MODE) {
      await simulateDelay(300);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/dvrs/${dvrId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ api_key: apiKey }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Errore nell'avvio dell'elaborazione");
      }
    } catch (error) {
      console.error("Errore startProcessing:", error);
      throw error;
    }
  },

  /**
   * Verifica lo stato dell'elaborazione
   */
  getProcessingProgress: async (dvrId: string): Promise<any> => {
    if (DEMO_MODE) {
      return { progress: 100, status: "completed" };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/dvrs/${dvrId}/progress`);
      
      if (!response.ok) {
        throw new Error("Errore nel recupero dello stato dell'elaborazione");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Errore getProcessingProgress:", error);
      throw error;
    }
  },

  /**
   * Recupera il documento HTML di un DVR
   */
  getDocument: async (dvrId: string): Promise<{ html: string }> => {
    if (DEMO_MODE) {
      await simulateDelay(300);
      return { html: "<h1>Documento di Valutazione dei Rischi</h1><p>Contenuto demo del documento DVR.</p>" };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/dvrs/${dvrId}/document`);
      
      if (!response.ok) {
        throw new Error("Errore nel recupero del documento");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Errore getDocument:", error);
      throw error;
    }
  },

  /**
   * Salva il documento HTML di un DVR
   */
  updateDocument: async (dvrId: string, html: string): Promise<{ success: boolean; html: string }> => {
    if (DEMO_MODE) {
      await simulateDelay(300);
      return { success: true, html };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/dvrs/${dvrId}/document`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Errore nel salvataggio del documento");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Errore updateDocument:", error);
      throw error;
    }
  },

  /**
   * Rigenera il documento da template
   */
  regenerateDocument: async (dvrId: string, template?: string): Promise<{ success: boolean; document_path: string; download_url: string }> => {
    if (DEMO_MODE) {
      await simulateDelay(500);
      return { success: true, document_path: "/demo/document.docx", download_url: "/demo/download" };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/dvrs/${dvrId}/document/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template ? { template } : {}),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Errore nella rigenerazione del documento");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Errore regenerateDocument:", error);
      throw error;
    }
  },

  /**
   * Esporta il documento in formato DOCX o PDF
   */
  exportDocument: async (dvrId: string, format: 'docx' | 'pdf'): Promise<{ success: boolean; path: string }> => {
    if (DEMO_MODE) {
      await simulateDelay(500);
      return { success: true, path: `/demo/document.${format}` };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/dvrs/${dvrId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Errore nell'esportazione ${format.toUpperCase()}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Errore exportDocument:", error);
      throw error;
    }
  },
};

// Helper function for demo delays
function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Map functions for backend data
function mapDVRFromBackend(data: any): DVR {
  return {
    id: data.id?.toString() || data.id,
    nome: data.title || data.nome,
    descrizione: data.description || data.descrizione || '',
    stato: mapStatusFromBackend(data.status || data.stato),
    company_id: data.company_id,
    numero_revisione: data.version || data.numero_revisione || 1,
    revision_note: data.revision_note,
    data_creazione: data.created_at || data.data_creazione,
    data_ultima_modifica: data.updated_at || data.data_ultima_modifica,
    created_by: data.created_by || "1",
    updated_by: data.updated_by || "1",
    files: data.files?.map(mapFileFromBackend) || []
  };
}

function mapFileFromBackend(file: any): FileMetadata {
  return {
    id: file.id,
    dvr_id: file.dvr_id,
    file_name: file.file_name || file.name,
    risk_id: file.risk_id || 1,
    include: file.include !== undefined ? file.include : true,
    notes: file.notes || '',
    classification_result: file.classification_result,
    extraction_data: file.extraction_data,
    risk: file.risk || { id: 1, code: "RS001", name: "Rischio generico", status: "active" },
    created_at: file.created_at,
    updated_at: file.updated_at
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
    'in_review': 'IN_REVISIONE',
    'IN_REVIEW': 'IN_REVISIONE',
    'in_revisione': 'IN_REVISIONE',
    'IN_REVISIONE': 'IN_REVISIONE',
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
