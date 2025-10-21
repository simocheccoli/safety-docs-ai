import { FileMetadata, DVR, DVRRevisione } from '@/types/dvr';

const DVR_STORAGE_KEY = 'hseb5_dvr_list';
const FILES_STORAGE_KEY = 'hseb5_dvr_files';
const REVISIONS_STORAGE_KEY = 'hseb5_dvr_revisions';

// DVR Management
export const getDVRList = (): DVR[] => {
  const data = localStorage.getItem(DVR_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getDVRById = (dvrId: string): DVR | undefined => {
  return getDVRList().find(d => d.id === dvrId);
};

export const saveDVR = (dvr: DVR): void => {
  const dvrs = getDVRList();
  const existingIndex = dvrs.findIndex(d => d.id === dvr.id);
  
  if (existingIndex >= 0) {
    dvrs[existingIndex] = { ...dvr, data_ultima_modifica: new Date().toISOString() };
  } else {
    dvrs.push(dvr);
  }
  
  localStorage.setItem(DVR_STORAGE_KEY, JSON.stringify(dvrs));
};

export const updateDVR = (dvrId: string, updates: Partial<DVR>): void => {
  const dvrs = getDVRList();
  const existingIndex = dvrs.findIndex(d => d.id === dvrId);
  
  if (existingIndex >= 0) {
    dvrs[existingIndex] = { 
      ...dvrs[existingIndex], 
      ...updates, 
      data_ultima_modifica: new Date().toISOString() 
    };
    localStorage.setItem(DVR_STORAGE_KEY, JSON.stringify(dvrs));
  }
};

export const deleteDVR = (dvrId: string): void => {
  const dvrs = getDVRList().filter(d => d.id !== dvrId);
  localStorage.setItem(DVR_STORAGE_KEY, JSON.stringify(dvrs));
  
  // Delete associated files and revisions
  const files = getDVRFiles().filter(f => f.dvr_id !== dvrId);
  localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
  
  const revisions = getDVRRevisions(dvrId).filter(r => r.dvr_id !== dvrId);
  localStorage.setItem(REVISIONS_STORAGE_KEY, JSON.stringify(revisions));
};

// File Management
export const getDVRFiles = (dvrId?: string): FileMetadata[] => {
  const data = localStorage.getItem(FILES_STORAGE_KEY);
  const allFiles = data ? JSON.parse(data) : [];
  return dvrId ? allFiles.filter((f: FileMetadata) => f.dvr_id === dvrId) : allFiles;
};

export const saveDVRFile = (file: FileMetadata): void => {
  const files = getDVRFiles();
  const existingIndex = files.findIndex(f => f.file_id === file.file_id);
  
  if (existingIndex >= 0) {
    files[existingIndex] = { ...file, updated_at: new Date().toISOString() };
  } else {
    files.push(file);
  }
  
  localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
};

export const updateDVRFile = (fileId: string, updates: Partial<FileMetadata>): void => {
  const files = getDVRFiles();
  const existingIndex = files.findIndex(f => f.file_id === fileId);
  
  if (existingIndex >= 0) {
    files[existingIndex] = { 
      ...files[existingIndex], 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
  }
};

export const deleteDVRFile = (fileId: string): void => {
  const files = getDVRFiles().filter(f => f.file_id !== fileId);
  localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
};

export const getDVRFileById = (fileId: string): FileMetadata | undefined => {
  return getDVRFiles().find(f => f.file_id === fileId);
};

// Revision Management
export const getDVRRevisions = (dvrId: string): DVRRevisione[] => {
  const data = localStorage.getItem(REVISIONS_STORAGE_KEY);
  const allRevisions = data ? JSON.parse(data) : [];
  return allRevisions.filter((r: DVRRevisione) => r.dvr_id === dvrId);
};

export const saveDVRRevision = (revision: DVRRevisione): void => {
  const data = localStorage.getItem(REVISIONS_STORAGE_KEY);
  const revisions = data ? JSON.parse(data) : [];
  revisions.push(revision);
  localStorage.setItem(REVISIONS_STORAGE_KEY, JSON.stringify(revisions));
};

export const createNewRevision = (dvrId: string, userId: string, note: string): void => {
  const dvr = getDVRById(dvrId);
  if (!dvr) return;
  
  const newRevisionNumber = dvr.numero_revisione + 1;
  
  // Create revision record
  const revision: DVRRevisione = {
    id: crypto.randomUUID(),
    dvr_id: dvrId,
    numero_revisione: newRevisionNumber,
    data_revisione: new Date().toISOString(),
    user_id: userId,
    note
  };
  
  saveDVRRevision(revision);
  
  // Update DVR
  updateDVR(dvrId, {
    numero_revisione: newRevisionNumber,
    updated_by: userId
  });
};
