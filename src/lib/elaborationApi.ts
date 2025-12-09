import { Elaboration, ElaborationUpload, ElaborationFile, ElaborationStatus } from "@/types/elaboration";

const DEMO_MODE = true;

// Mock data
let mockElaborationIdCounter = 4;
let mockUploadIdCounter = 10;
let mockFileIdCounter = 30;

const mockElaborations: Elaboration[] = [
  {
    id: 1,
    title: "Scheda Sicurezza Stabilimento Nord",
    description: "Analisi rischi per stabilimento zona nord",
    company_id: 1,
    company_name: "Acme Industries S.r.l.",
    status: 'completed',
    uploads_count: 3,
    files_count: 8,
    begin_process: new Date(2024, 10, 15, 10, 30).toISOString(),
    end_process: new Date(2024, 10, 15, 11, 45).toISOString(),
    created_at: new Date(2024, 10, 15, 10, 0).toISOString(),
    updated_at: new Date(2024, 10, 15, 11, 45).toISOString(),
    deleted_at: null,
  },
  {
    id: 2,
    title: "Scheda Sicurezza Magazzino",
    description: "Valutazione rischi magazzino centrale",
    company_id: 2,
    company_name: "TechCorp S.p.A.",
    status: 'elaborating',
    uploads_count: 2,
    files_count: 5,
    begin_process: new Date(2024, 11, 1, 14, 0).toISOString(),
    end_process: null,
    created_at: new Date(2024, 11, 1, 13, 30).toISOString(),
    updated_at: new Date(2024, 11, 1, 14, 0).toISOString(),
    deleted_at: null,
  },
  {
    id: 3,
    title: "Scheda Sicurezza Uffici",
    description: "Valutazione rischi uffici amministrativi",
    company_id: 1,
    company_name: "Acme Industries S.r.l.",
    status: 'bozza',
    uploads_count: 1,
    files_count: 2,
    begin_process: new Date(2024, 11, 5, 9, 0).toISOString(),
    end_process: null,
    created_at: new Date(2024, 11, 5, 9, 0).toISOString(),
    updated_at: new Date(2024, 11, 5, 9, 0).toISOString(),
    deleted_at: null,
  },
];

const mockUploads: ElaborationUpload[] = [
  {
    id: 1,
    elaboration_id: 1,
    mansione: "Operatore Macchine CNC",
    reparto: "Produzione",
    ruolo: "Operaio Specializzato",
    files: [
      { id: 1, upload_id: 1, filename: "scheda_rumore_cnc.pdf", size: 1024000, created_at: new Date(2024, 10, 15).toISOString() },
      { id: 2, upload_id: 1, filename: "scheda_vibrazioni.pdf", size: 856000, created_at: new Date(2024, 10, 15).toISOString() },
      { id: 3, upload_id: 1, filename: "scheda_oli_lubrificanti.pdf", size: 720000, created_at: new Date(2024, 10, 15).toISOString() },
    ],
    created_at: new Date(2024, 10, 15).toISOString(),
    status: 'completed',
  },
  {
    id: 2,
    elaboration_id: 1,
    mansione: "Addetto Saldatura",
    reparto: "Assemblaggio",
    ruolo: "Operaio",
    files: [
      { id: 4, upload_id: 2, filename: "scheda_fumi_saldatura.pdf", size: 1200000, created_at: new Date(2024, 10, 15).toISOString() },
      { id: 5, upload_id: 2, filename: "scheda_radiazioni.pdf", size: 980000, created_at: new Date(2024, 10, 15).toISOString() },
    ],
    created_at: new Date(2024, 10, 15).toISOString(),
    status: 'completed',
  },
  {
    id: 3,
    elaboration_id: 1,
    mansione: "Responsabile Qualità",
    reparto: "Controllo Qualità",
    ruolo: "Impiegato Tecnico",
    files: [
      { id: 6, upload_id: 3, filename: "scheda_sostanze_chimiche.pdf", size: 1500000, created_at: new Date(2024, 10, 15).toISOString() },
      { id: 7, upload_id: 3, filename: "scheda_laboratorio.pdf", size: 890000, created_at: new Date(2024, 10, 15).toISOString() },
      { id: 8, upload_id: 3, filename: "scheda_attrezzature.pdf", size: 670000, created_at: new Date(2024, 10, 15).toISOString() },
    ],
    created_at: new Date(2024, 10, 15).toISOString(),
    status: 'completed',
  },
  {
    id: 4,
    elaboration_id: 2,
    mansione: "Carrellista",
    reparto: "Logistica",
    ruolo: "Operaio",
    files: [
      { id: 9, upload_id: 4, filename: "scheda_movimentazione.pdf", size: 780000, created_at: new Date(2024, 11, 1).toISOString() },
      { id: 10, upload_id: 4, filename: "scheda_carrelli.pdf", size: 650000, created_at: new Date(2024, 11, 1).toISOString() },
    ],
    created_at: new Date(2024, 11, 1).toISOString(),
    status: 'elaborating',
  },
  {
    id: 5,
    elaboration_id: 2,
    mansione: "Addetto Imballaggio",
    reparto: "Spedizioni",
    ruolo: "Operaio",
    files: [
      { id: 11, upload_id: 5, filename: "scheda_imballaggio.pdf", size: 520000, created_at: new Date(2024, 11, 1).toISOString() },
      { id: 12, upload_id: 5, filename: "scheda_nastri.pdf", size: 430000, created_at: new Date(2024, 11, 1).toISOString() },
      { id: 13, upload_id: 5, filename: "scheda_adesivi.pdf", size: 380000, created_at: new Date(2024, 11, 1).toISOString() },
    ],
    created_at: new Date(2024, 11, 1).toISOString(),
    status: 'pending',
  },
  {
    id: 6,
    elaboration_id: 3,
    mansione: "Impiegato Amministrativo",
    reparto: "Amministrazione",
    ruolo: "Impiegato",
    files: [
      { id: 14, upload_id: 6, filename: "scheda_vdt.pdf", size: 320000, created_at: new Date(2024, 11, 5).toISOString() },
      { id: 15, upload_id: 6, filename: "scheda_ergonomia.pdf", size: 280000, created_at: new Date(2024, 11, 5).toISOString() },
    ],
    created_at: new Date(2024, 11, 5).toISOString(),
    status: 'pending',
  },
];

// API Functions
export async function fetchElaborations(): Promise<Elaboration[]> {
  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockElaborations.filter(e => e.deleted_at === null);
  }
  throw new Error('API not implemented');
}

export async function fetchElaborationById(id: number): Promise<Elaboration | null> {
  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockElaborations.find(e => e.id === id && e.deleted_at === null) || null;
  }
  throw new Error('API not implemented');
}

export async function createElaboration(
  title: string,
  description: string,
  companyId: number | null,
  companyName: string | null
): Promise<Elaboration> {
  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newElaboration: Elaboration = {
      id: ++mockElaborationIdCounter,
      title,
      description,
      company_id: companyId,
      company_name: companyName,
      status: 'bozza',
      uploads_count: 0,
      files_count: 0,
      begin_process: new Date().toISOString(),
      end_process: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };
    mockElaborations.push(newElaboration);
    return newElaboration;
  }
  throw new Error('API not implemented');
}

export async function updateElaboration(
  id: number,
  updates: Partial<Pick<Elaboration, 'title' | 'description' | 'company_id' | 'company_name'>>
): Promise<Elaboration> {
  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const elaboration = mockElaborations.find(e => e.id === id);
    if (!elaboration) throw new Error('Elaboration not found');
    Object.assign(elaboration, updates, { updated_at: new Date().toISOString() });
    return elaboration;
  }
  throw new Error('API not implemented');
}

export async function deleteElaboration(id: number): Promise<void> {
  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const elaboration = mockElaborations.find(e => e.id === id);
    if (elaboration) {
      elaboration.deleted_at = new Date().toISOString();
    }
    return;
  }
  throw new Error('API not implemented');
}

export async function fetchElaborationUploads(elaborationId: number): Promise<ElaborationUpload[]> {
  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUploads.filter(u => u.elaboration_id === elaborationId);
  }
  throw new Error('API not implemented');
}

export async function createUpload(
  elaborationId: number,
  mansione: string,
  reparto: string,
  ruolo: string,
  files: File[]
): Promise<ElaborationUpload> {
  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const uploadId = ++mockUploadIdCounter;
    const newFiles: ElaborationFile[] = files.map(file => ({
      id: ++mockFileIdCounter,
      upload_id: uploadId,
      filename: file.name,
      size: file.size,
      created_at: new Date().toISOString(),
    }));

    const newUpload: ElaborationUpload = {
      id: uploadId,
      elaboration_id: elaborationId,
      mansione,
      reparto,
      ruolo,
      files: newFiles,
      created_at: new Date().toISOString(),
      status: 'pending',
    };
    mockUploads.push(newUpload);

    // Update elaboration counts
    const elaboration = mockElaborations.find(e => e.id === elaborationId);
    if (elaboration) {
      elaboration.uploads_count++;
      elaboration.files_count += files.length;
      elaboration.updated_at = new Date().toISOString();
    }

    return newUpload;
  }
  throw new Error('API not implemented');
}

export async function deleteUpload(uploadId: number): Promise<void> {
  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const uploadIndex = mockUploads.findIndex(u => u.id === uploadId);
    if (uploadIndex !== -1) {
      const upload = mockUploads[uploadIndex];
      const elaboration = mockElaborations.find(e => e.id === upload.elaboration_id);
      if (elaboration) {
        elaboration.uploads_count--;
        elaboration.files_count -= upload.files.length;
        elaboration.updated_at = new Date().toISOString();
      }
      mockUploads.splice(uploadIndex, 1);
    }
    return;
  }
  throw new Error('API not implemented');
}

export async function generateExcel(elaborationId: number): Promise<void> {
  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const elaboration = mockElaborations.find(e => e.id === elaborationId);
    if (elaboration) {
      elaboration.status = 'elaborating';
      elaboration.updated_at = new Date().toISOString();
      
      // Simulate processing completion after 3 seconds
      setTimeout(() => {
        elaboration.status = 'completed';
        elaboration.end_process = new Date().toISOString();
        elaboration.updated_at = new Date().toISOString();
      }, 3000);
    }
    return;
  }
  throw new Error('API not implemented');
}

export function downloadExcel(id: number): void {
  if (DEMO_MODE) {
    console.log(`Mock: Downloading Excel for elaboration ${id}`);
    return;
  }
}

export function downloadZip(id: number): void {
  if (DEMO_MODE) {
    console.log(`Mock: Downloading ZIP for elaboration ${id}`);
    return;
  }
}
