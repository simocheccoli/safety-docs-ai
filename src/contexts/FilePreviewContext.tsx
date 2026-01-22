import { createContext, useContext, useState, ReactNode } from 'react';

export interface FilePreviewData {
  previewUrl: string;
  filename: string;
  size?: number;
  metadata?: Record<string, string | undefined>;
}

interface FilePreviewContextType {
  openPreview: (file: FilePreviewData) => void;
  closePreview: () => void;
  previewFile: FilePreviewData | null;
  isOpen: boolean;
}

const FilePreviewContext = createContext<FilePreviewContextType | undefined>(undefined);

export function FilePreviewProvider({ children }: { children: ReactNode }) {
  const [previewFile, setPreviewFile] = useState<FilePreviewData | null>(null);

  const openPreview = (file: FilePreviewData) => {
    setPreviewFile(file);
  };

  const closePreview = () => {
    setPreviewFile(null);
  };

  return (
    <FilePreviewContext.Provider
      value={{
        openPreview,
        closePreview,
        previewFile,
        isOpen: !!previewFile,
      }}
    >
      {children}
    </FilePreviewContext.Provider>
  );
}

export function useFilePreview() {
  const context = useContext(FilePreviewContext);
  if (context === undefined) {
    throw new Error('useFilePreview must be used within a FilePreviewProvider');
  }
  return context;
}
