import { Elaboration } from "@/types/elaboration";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://213.171.186.160:8000";

// Mock data for fallback
const MOCK_ELABORATIONS: Elaboration[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Analisi Rischio ${['Ferrara', 'Bologna', 'Modena', 'Parma', 'Reggio Emilia'][i % 5]} ${Math.floor(i / 5) + 1}`,
  status: ['completed', 'elaborating', 'error'][i % 3] as 'completed' | 'elaborating' | 'error',
  begin_process: new Date(2024, 0, 15 + (i * 2), 10 + (i % 12), 0, 0).toISOString(),
  end_process: i % 3 === 0 ? new Date(2024, 0, 15 + (i * 2), 10 + (i % 12), 45, 0).toISOString() : null,
  created_at: new Date(2024, 0, 15 + (i * 2), 9, 55, 0).toISOString(),
  updated_at: new Date(2024, 0, 15 + (i * 2), 10 + (i % 12), 45, 0).toISOString(),
  deleted_at: null,
}));

let useMockData = false;

export async function fetchElaborations(): Promise<Elaboration[]> {
  if (useMockData) {
    return MOCK_ELABORATIONS;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/rischi`);
    if (!response.ok) throw new Error('API not available');
    
    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error('API response not successful');
  } catch (error) {
    console.warn('API not available, using mock data');
    useMockData = true;
    return MOCK_ELABORATIONS;
  }
}

export async function fetchElaborationDetails(id: number): Promise<{ elaboration: Elaboration, files: string[] }> {
  if (useMockData) {
    const elaboration = MOCK_ELABORATIONS.find(e => e.id === id);
    if (!elaboration) throw new Error('Not found');
    return {
      elaboration,
      files: [`scheda_sicurezza_${id}_1.pdf`, `scheda_sicurezza_${id}_2.pdf`, `scheda_sicurezza_${id}_3.pdf`]
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/rischi/${id}`);
    if (!response.ok) {
      if (response.status === 404) throw new Error('Documento non trovato');
      throw new Error('API not available');
    }
    
    const result = await response.json();
    if (result.success) {
      return {
        elaboration: result.document,
        files: result.files
      };
    }
    throw new Error('API response not successful');
  } catch (error) {
    console.warn('API not available, using mock data');
    useMockData = true;
    const elaboration = MOCK_ELABORATIONS.find(e => e.id === id);
    if (!elaboration) throw new Error('Not found');
    return {
      elaboration,
      files: [`scheda_sicurezza_${id}_1.pdf`, `scheda_sicurezza_${id}_2.pdf`, `scheda_sicurezza_${id}_3.pdf`]
    };
  }
}

export async function deleteElaboration(id: number): Promise<void> {
  if (useMockData) {
    const index = MOCK_ELABORATIONS.findIndex(e => e.id === id);
    if (index !== -1) {
      MOCK_ELABORATIONS.splice(index, 1);
    }
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/rischi/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      if (response.status === 404) throw new Error('Documento non trovato');
      throw new Error('API not available');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Errore durante l\'eliminazione');
    }
  } catch (error) {
    console.warn('API not available, using mock data');
    useMockData = true;
    const index = MOCK_ELABORATIONS.findIndex(e => e.id === id);
    if (index !== -1) {
      MOCK_ELABORATIONS.splice(index, 1);
    }
  }
}

export function downloadExcel(id: number): void {
  if (useMockData) {
    console.log(`Mock: Downloading Excel for elaboration ${id}`);
    return;
  }
  window.open(`${API_BASE_URL}/api/rischi/${id}/excel`, '_blank');
}

export function downloadZip(id: number): void {
  if (useMockData) {
    console.log(`Mock: Downloading ZIP for elaboration ${id}`);
    return;
  }
  window.open(`${API_BASE_URL}/api/rischi/${id}/pdf`, '_blank');
}

export async function createElaboration(name: string, files: File[]): Promise<void> {
  if (useMockData) {
    console.log(`Mock: Creating elaboration "${name}" with ${files.length} files`);
    return;
  }

  const formData = new FormData();
  formData.append('title', name);
  files.forEach((file) => {
    formData.append('files[]', file);
  });

  try {
    const response = await fetch(`${API_BASE_URL}/api/rischi`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      if (response.status === 422) throw new Error('Errore di validazione');
      throw new Error('API not available');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Errore nel caricamento dei file');
    }
  } catch (error) {
    console.warn('API not available for upload');
    useMockData = true;
    throw error;
  }
}
