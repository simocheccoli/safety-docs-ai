import { DVR, FileMetadata, DVRVersion } from "@/types/dvr";
import { getDVRById, updateDVR as updateDVRStorage, getDVRFiles, saveDVRFile } from "./dvrStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
   * Aggiorna i dati di un DVR (salvataggio normale)
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
   * Salva una nuova revisione del DVR (con nota)
   * Incrementa automaticamente la versione
   */
  saveRevision: async (id: string, data: Partial<DVR>, revisionNote: string): Promise<DVR> => {
    await mockDelay();
    
    // Validazione
    if (data.nome && data.nome.trim().length === 0) {
      throw new Error("Il nome non può essere vuoto");
    }
    if (revisionNote.trim().length === 0) {
      throw new Error("La nota di revisione è obbligatoria");
    }
    if (revisionNote.length > 2000) {
      throw new Error("La nota di revisione non può superare i 2000 caratteri");
    }

    const currentDVR = getDVRById(id);
    if (!currentDVR) {
      throw new Error("DVR non trovato");
    }

    // Incrementa la versione
    const newVersion = currentDVR.numero_revisione + 1;
    
    updateDVRStorage(id, {
      ...data,
      numero_revisione: newVersion,
      data_ultima_modifica: new Date().toISOString()
    });

    // Salva la versione nel localStorage (in un'app reale sarebbe sul backend)
    const versions = JSON.parse(localStorage.getItem('dvr_versions') || '{}');
    if (!versions[id]) {
      versions[id] = [];
    }
    
    versions[id].push({
      id: Date.now(),
      dvr_id: id,
      version: currentDVR.numero_revisione,
      nome: currentDVR.nome,
      descrizione: currentDVR.descrizione,
      stato: currentDVR.stato,
      revision_note: revisionNote,
      created_at: currentDVR.data_ultima_modifica,
      updated_at: currentDVR.data_ultima_modifica
    });
    
    localStorage.setItem('dvr_versions', JSON.stringify(versions));
    
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
  },

  /**
   * Recupera le versioni di un DVR
   */
  getDVRVersions: async (dvrId: string): Promise<DVRVersion[]> => {
    await mockDelay();
    
    const versions = JSON.parse(localStorage.getItem('dvr_versions') || '{}');
    return versions[dvrId] || [];
  },

  /**
   * Ripristina un DVR a una versione precedente
   */
  revertToVersion: async (dvrId: string, versionNumber: number): Promise<DVR> => {
    await mockDelay();
    
    const versions = JSON.parse(localStorage.getItem('dvr_versions') || '{}');
    const dvrVersions = versions[dvrId] || [];
    
    const targetVersion = dvrVersions.find((v: DVRVersion) => v.version === versionNumber);
    if (!targetVersion) {
      throw new Error("Versione non trovata");
    }

    const currentDVR = getDVRById(dvrId);
    if (!currentDVR) {
      throw new Error("DVR non trovato");
    }

    // Salva la versione corrente prima del ripristino
    dvrVersions.push({
      id: Date.now(),
      dvr_id: dvrId,
      version: currentDVR.numero_revisione,
      nome: currentDVR.nome,
      descrizione: currentDVR.descrizione,
      stato: currentDVR.stato,
      revision_note: `Salvato prima del ripristino alla versione ${versionNumber}`,
      created_at: currentDVR.data_ultima_modifica,
      updated_at: currentDVR.data_ultima_modifica
    });
    
    versions[dvrId] = dvrVersions;
    localStorage.setItem('dvr_versions', JSON.stringify(versions));

    // Incrementa la versione e ripristina i dati
    const newVersion = currentDVR.numero_revisione + 1;
    
    updateDVRStorage(dvrId, {
      nome: targetVersion.nome,
      descrizione: targetVersion.descrizione,
      stato: targetVersion.stato,
      numero_revisione: newVersion,
      data_ultima_modifica: new Date().toISOString()
    });

    const updated = getDVRById(dvrId);
    if (!updated) {
      throw new Error("DVR non trovato");
    }
    return updated;
  }
};