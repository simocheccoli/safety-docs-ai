import { DVR, FileMetadata, DVRVersion, DVRStatus } from "@/types/dvr";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * API reali per la gestione dei DVR tramite backend
 */

export const dvrApi = {
  /**
   * Crea un nuovo DVR con file
   */
  createDVR: async (title: string, files: File[]): Promise<DVR> => {
    try {
      const formData = new FormData();
      formData.append('title', title);
      
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
    try {
      const response = await fetch(`${API_BASE_URL}/api/dvrs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.nome,
          status: mapStatusToBackend(data.stato),
        }),
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
   * Incrementa automaticamente la versione
   */
  saveRevision: async (id: string, data: Partial<DVR>, revisionNote: string): Promise<DVR> => {
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
          status: data.stato ? mapStatusToBackend(data.stato) : undefined,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Errore nel salvataggio della revisione");
      }
      
      // Dopo il salvataggio, recupera il DVR aggiornato
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
   * Aggiorna un file
   */
  updateFile: async (dvrId: string, fileId: string, data: Partial<FileMetadata>): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dvrs/${dvrId}/files/${fileId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          risk_id: data.rischio_associato,
          include: data.inclusione_dvr,
          notes: data.note_rspp,
        }),
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
      
      // Dopo la finalizzazione, recupera il DVR aggiornato
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
    try {
      const response = await fetch(`${API_BASE_URL}/api/dvrs/${dvrId}/revert/${versionNumber}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Errore nel ripristino della versione");
      }
      
      // Dopo il ripristino, recupera il DVR aggiornato
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
   * Avvia l'elaborazione AI dei file
   */
  startProcessing: async (dvrId: string, apiKey?: string): Promise<void> => {
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
  }
};

/**
 * Mappa un DVR dal formato backend a quello frontend
 */
function mapDVRFromBackend(backendDVR: any): DVR {
  return {
    id: backendDVR.id?.toString(), // Use numeric ID, not UUID
    nome: backendDVR.title,
    descrizione: backendDVR.description || '',
    numero_revisione: backendDVR.revision,
    data_creazione: backendDVR.created_at,
    data_ultima_modifica: backendDVR.updated_at,
    stato: mapStatusFromBackend(backendDVR.status),
    created_by: backendDVR.created_by || '',
    updated_by: backendDVR.updated_by || '',
    files_count: backendDVR.files_count,
    files: backendDVR.files ? backendDVR.files.map(mapFileFromBackend) : undefined,
  } as DVR;
}

/**
 * Mappa un file dal formato backend a quello frontend
 */
function mapFileFromBackend(backendFile: any): FileMetadata {
  return {
    file_id: backendFile.id?.toString(),
    dvr_id: backendFile.dvr_id?.toString(),
    nome_file: backendFile.file_name,
    file_size: backendFile.file_size || 0,
    file_type: backendFile.file_type || '',
    file_content: backendFile.file_content,
    rischio_associato: backendFile.risk_id?.toString() || '',
    rischio_nome: backendFile.risk_name || '',
    stato_elaborazione_ai: backendFile.classification_result || 'IN_ELABORAZIONE',
    motivazione_stato: backendFile.extraction_data?.motivation || '',
    output_json_completo: backendFile.extraction_data || {},
    output_json_modificato: backendFile.modified_extraction_data,
    modificato_manualmente: backendFile.manually_modified || false,
    inclusione_dvr: backendFile.include || false,
    note_rspp: backendFile.notes || '',
    created_at: backendFile.created_at || new Date().toISOString(),
    updated_at: backendFile.updated_at || new Date().toISOString(),
  };
}

/**
 * Mappa una versione dal formato backend a quello frontend
 */
function mapVersionFromBackend(backendVersion: any): DVRVersion {
  return {
    id: backendVersion.id,
    dvr_id: backendVersion.dvr_id?.toString(),
    version: backendVersion.version,
    nome: backendVersion.title,
    descrizione: backendVersion.description || null,
    stato: mapStatusFromBackend(backendVersion.status),
    revision_note: backendVersion.revision_note || null,
    created_at: backendVersion.created_at,
    updated_at: backendVersion.updated_at,
  };
}

/**
 * Mappa gli stati frontend a quelli backend
 */
function mapStatusToBackend(status?: string): string {
  const statusMap: Record<string, string> = {
    'BOZZA': 'draft',
    'IN_REVISIONE': 'draft',
    'IN_APPROVAZIONE': 'draft',
    'APPROVATO': 'draft',
    'FINALIZZATO': 'completed',
    'ARCHIVIATO': 'archived'
  };
  
  return status ? statusMap[status] || 'draft' : 'draft';
}

/**
 * Mappa gli stati backend a quelli frontend
 */
export function mapStatusFromBackend(status: string): DVRStatus {
  const statusMap: Record<string, DVRStatus> = {
    'draft': 'BOZZA',
    'completed': 'FINALIZZATO',
    'archived': 'ARCHIVIATO'
  };
  
  return statusMap[status] || 'BOZZA';
}