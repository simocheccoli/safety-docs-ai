import { FileMetadata } from '@/types/dvr';

const STORAGE_KEY = 'hseb5_dvr_files';

export const getDVRFiles = (): FileMetadata[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveDVRFile = (file: FileMetadata): void => {
  const files = getDVRFiles();
  const existingIndex = files.findIndex(f => f.file_id === file.file_id);
  
  if (existingIndex >= 0) {
    files[existingIndex] = { ...file, updated_at: new Date().toISOString() };
  } else {
    files.push(file);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  }
};

export const deleteDVRFile = (fileId: string): void => {
  const files = getDVRFiles().filter(f => f.file_id !== fileId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
};

export const getDVRFileById = (fileId: string): FileMetadata | undefined => {
  return getDVRFiles().find(f => f.file_id === fileId);
};
