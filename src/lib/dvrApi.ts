import { DVR, FileMetadata, DVRRevisione } from "@/types/dvr";
import { getDVRById, updateDVR as updateDVRStorage, getDVRFiles, saveDVRFile } from "./dvrStorage";

// Simula un delay per le chiamate API
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * API mockate per la gestione dei DVR
 */

export const dvrApi = {
  /**
   * Recupera un DVR per ID
   */
  getDVR: async (id: string): Promise<DVR | null> => {
    await mockDelay();
    return getDVRById(id);
  },

  /**
   * Aggiorna i dati di un DVR
   */
  updateDVR: async (id: string, data: Partial<DVR>): Promise<DVR> => {
    await mockDelay();
    
    // Validazione
    if (data.nome && data.nome.trim().length === 0) {
      throw new Error("Il nome non può essere vuoto");
    }
    if (data.nome && data.nome.length > 200) {
      throw new Error("Il nome non può superare i 200 caratteri");
    }
    if (data.descrizione && data.descrizione.length > 1000) {
      throw new Error("La descrizione non può superare i 1000 caratteri");
    }

    updateDVRStorage(id, data);
    const updated = getDVRById(id);
    if (!updated) {
      throw new Error("DVR non trovato");
    }
    return updated;
  },

  /**
   * Recupera i file associati a un DVR
   */
  getDVRFiles: async (dvrId: string): Promise<FileMetadata[]> => {
    await mockDelay();
    return getDVRFiles(dvrId);
  },

  /**
   * Aggiorna un file
   */
  updateFile: async (fileId: string, data: Partial<FileMetadata>): Promise<void> => {
    await mockDelay();
    
    // Validazione note
    if (data.note_rspp && data.note_rspp.length > 2000) {
      throw new Error("Le note non possono superare i 2000 caratteri");
    }

    // In un'app reale, questo farebbe una chiamata al backend
    // Per ora usiamo il localStorage
    const files = getDVRFiles(data.dvr_id || "");
    const file = files.find(f => f.file_id === fileId);
    if (!file) {
      throw new Error("File non trovato");
    }

    saveDVRFile({
      ...file,
      ...data,
      updated_at: new Date().toISOString()
    });
  },

  /**
   * Cambia lo stato di un DVR
   */
  changeStatus: async (id: string, newStatus: string): Promise<DVR> => {
    await mockDelay();
    
    const validStatuses = ['BOZZA', 'IN_REVISIONE', 'IN_APPROVAZIONE', 'APPROVATO', 'FINALIZZATO', 'ARCHIVIATO'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error("Stato non valido");
    }

    updateDVRStorage(id, { 
      stato: newStatus as any,
      data_ultima_modifica: new Date().toISOString()
    });
    
    const updated = getDVRById(id);
    if (!updated) {
      throw new Error("DVR non trovato");
    }
    return updated;
  }
};