import { FileMetadata, DVR } from '@/types/dvr';

const DVR_STORAGE_KEY = 'hseb5_dvr_list';
const FILES_STORAGE_KEY = 'hseb5_dvr_files';

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
  
  // Delete associated files
  const files = getDVRFiles().filter(f => f.dvr_id !== dvrId);
  localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
  
  // Delete associated versions
  const versions = JSON.parse(localStorage.getItem('dvr_versions') || '{}');
  delete versions[dvrId];
  localStorage.setItem('dvr_versions', JSON.stringify(versions));
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
