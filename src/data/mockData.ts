/**
 * Mock data for fallback when APIs are unavailable
 * All data structures match the OpenAPI schema and TypeScript types
 */

import { DVR, FileMetadata, DVRVersion } from "@/types/dvr";
import { Company } from "@/types/company";
import { RiskType, OutputField } from "@/types/risk";
import { Elaboration, ElaborationUpload, ElaborationFile } from "@/types/elaboration";
import { User } from "@/types/user";

// ============= USERS =============
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@hseb5.it",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    role: "Admin",
    active: true,
  },
  {
    id: "2",
    email: "user@hseb5.it",
    password: "user123",
    firstName: "Standard",
    lastName: "User",
    role: "Tecnico",
    active: true,
  },
];

// ============= COMPANIES =============
export const mockCompanies: Company[] = [
  {
    id: 1,
    name: "Bio5 S.r.l.",
    vat_number: "IT12345678901",
    address: "Via Roma 123",
    city: "Milano",
    province: "MI",
    zip: "20100",
    email: "info@bio5.it",
    phone: "+39 02 1234567",
    pec: "bio5@pec.it",
    legal_representative: "Mario Rossi",
    mansioni: ["Operatore", "Tecnico", "Responsabile", "Magazziniere"],
    reparti: ["Produzione", "Logistica", "Amministrazione", "Qualità"],
    ruoli: ["Junior", "Senior", "Supervisor", "Manager"],
  },
  {
    id: 2,
    name: "TechnoSafe S.p.A.",
    vat_number: "IT98765432101",
    address: "Corso Italia 456",
    city: "Roma",
    province: "RM",
    zip: "00100",
    email: "info@technosafe.it",
    phone: "+39 06 7654321",
    pec: "technosafe@pec.it",
    legal_representative: "Giulia Bianchi",
    mansioni: ["Analista", "Sviluppatore", "Project Manager"],
    reparti: ["IT", "R&D", "Commerciale"],
    ruoli: ["Junior", "Mid", "Senior", "Lead"],
  },
  {
    id: 3,
    name: "SafeWork Consulting",
    vat_number: "IT11223344556",
    address: "Piazza Duomo 1",
    city: "Firenze",
    province: "FI",
    zip: "50100",
    email: "info@safework.it",
    phone: "+39 055 1234567",
    legal_representative: "Alessandro Verdi",
    mansioni: ["Consulente", "Formatore", "Auditor"],
    reparti: ["Consulenza", "Formazione"],
    ruoli: ["Specialist", "Expert", "Director"],
  },
];

// ============= DVRs =============
export const mockDVRs: DVR[] = [
  {
    id: "1",
    nome: "DVR Bio5 S.r.l. - 2024",
    descrizione: "Documento di Valutazione dei Rischi annuale per lo stabilimento principale",
    stato: "BOZZA",
    company_id: 1,
    numero_revisione: 1,
    data_creazione: "2024-01-15T10:30:00Z",
    data_ultima_modifica: "2024-01-20T14:45:00Z",
    created_by: "1",
    updated_by: "1",
    files: [],
  },
  {
    id: "2",
    nome: "DVR TechnoSafe - Sede Centrale",
    descrizione: "Valutazione rischi per la sede centrale di Roma",
    stato: "IN_REVISIONE",
    company_id: 2,
    numero_revisione: 3,
    revision_note: "Aggiornamento post-ispezione INAIL",
    data_creazione: "2023-06-01T09:00:00Z",
    data_ultima_modifica: "2024-02-10T16:20:00Z",
    created_by: "1",
    updated_by: "2",
    files: [],
  },
  {
    id: "3",
    nome: "DVR SafeWork - Uffici",
    descrizione: "DVR per gli uffici di consulenza",
    stato: "APPROVATO",
    company_id: 3,
    numero_revisione: 2,
    data_creazione: "2023-09-15T11:00:00Z",
    data_ultima_modifica: "2024-01-05T10:00:00Z",
    created_by: "2",
    updated_by: "1",
    files: [],
  },
];

// ============= DVR FILES =============
export const mockDVRFiles: FileMetadata[] = [
  {
    id: 1,
    dvr_id: 1,
    file_name: "planimetria_stabilimento.pdf",
    include: true,
    risk_id: 1,
    risk: { id: 1, code: "RS001", name: "Rischio generico", status: "active" },
    created_at: "2024-01-15T10:35:00Z",
    notes: "Planimetria aggiornata a gennaio 2024",
  },
  {
    id: 2,
    dvr_id: 1,
    file_name: "scheda_attrezzature.xlsx",
    include: true,
    risk_id: 2,
    risk: { id: 2, code: "RS002", name: "Rischio meccanico", status: "active" },
    created_at: "2024-01-15T11:00:00Z",
  },
  {
    id: 3,
    dvr_id: 2,
    file_name: "valutazione_rumore.pdf",
    include: true,
    risk_id: 3,
    risk: { id: 3, code: "RS003", name: "Rischio rumore", status: "active" },
    created_at: "2023-06-01T10:00:00Z",
  },
];

// ============= DVR VERSIONS =============
export const mockDVRVersions: DVRVersion[] = [
  {
    id: 1,
    dvr_id: "1",
    version: 1,
    nome: "DVR Bio5 S.r.l. - 2024",
    descrizione: "Documento di Valutazione dei Rischi annuale",
    stato: "BOZZA",
    revision_note: "Creazione documento",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    dvr_id: "2",
    version: 1,
    nome: "DVR TechnoSafe - Sede Centrale",
    descrizione: "Prima versione",
    stato: "BOZZA",
    revision_note: "Creazione documento",
    created_at: "2023-06-01T09:00:00Z",
    updated_at: "2023-06-01T09:00:00Z",
  },
  {
    id: 3,
    dvr_id: "2",
    version: 2,
    nome: "DVR TechnoSafe - Sede Centrale",
    descrizione: "Aggiornamento generale",
    stato: "IN_REVISIONE",
    revision_note: "Aggiornamento rischi chimici",
    created_at: "2023-09-15T14:00:00Z",
    updated_at: "2023-09-15T14:00:00Z",
  },
  {
    id: 4,
    dvr_id: "2",
    version: 3,
    nome: "DVR TechnoSafe - Sede Centrale",
    descrizione: "Valutazione rischi per la sede centrale di Roma",
    stato: "IN_REVISIONE",
    revision_note: "Aggiornamento post-ispezione INAIL",
    created_at: "2024-02-10T16:20:00Z",
    updated_at: "2024-02-10T16:20:00Z",
  },
];

// ============= OUTPUT STRUCTURES =============
const riskOutputStructure1: OutputField[] = [
  { name: "livello_rischio", type: "string", description: "Livello di rischio calcolato", required: true },
  { name: "misure_preventive", type: "string", description: "Misure preventive da adottare", required: true },
];

const riskOutputStructure2: OutputField[] = [
  { name: "classificazione", type: "string", description: "Classificazione sostanza", required: true },
  { name: "dpi_necessari", type: "string", description: "DPI richiesti", required: true },
];

const riskOutputStructure3: OutputField[] = [
  { name: "fascia_rischio", type: "string", description: "Fascia di rischio rumore", required: true },
  { name: "protezione_richiesta", type: "string", description: "Protezione auricolare richiesta", required: true },
];

const riskOutputStructure4: OutputField[] = [
  { name: "indice_niosh", type: "string", description: "Indice NIOSH calcolato", required: true },
  { name: "azioni_correttive", type: "string", description: "Azioni correttive consigliate", required: true },
];

// ============= RISKS =============
export const mockRisks: RiskType[] = [
  {
    id: "1",
    name: "Caduta dall'alto",
    description: "Rischio di caduta durante lavori in quota",
    status: "active",
    inputExpectations: "Altezza lavoro (m), Presenza DPI (sì/no), Tipo di protezione collettiva",
    outputStructure: riskOutputStructure1,
    aiPrompt: "Analizza il rischio di caduta dall'alto considerando l'altezza di lavoro e i DPI disponibili. Calcola il livello di rischio e suggerisci misure preventive.",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    version: 1,
  },
  {
    id: "2",
    name: "Esposizione a sostanze chimiche",
    description: "Rischio derivante dalla manipolazione di prodotti chimici",
    status: "active",
    inputExpectations: "Tipo sostanza, Durata esposizione (ore), Ventilazione ambiente",
    outputStructure: riskOutputStructure2,
    aiPrompt: "Valuta l'esposizione a sostanze chimiche basandoti sulla scheda di sicurezza e sulla durata dell'esposizione.",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-16T11:00:00Z",
    version: 2,
  },
  {
    id: "3",
    name: "Rumore",
    description: "Rischio da esposizione prolungata al rumore",
    status: "validated",
    inputExpectations: "Livello dB misurato, Ore esposizione giornaliere, Tipo di sorgente",
    outputStructure: riskOutputStructure3,
    aiPrompt: "Analizza l'esposizione al rumore e determina la fascia di rischio secondo D.Lgs. 81/08.",
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-17T09:00:00Z",
    version: 1,
  },
  {
    id: "4",
    name: "Movimentazione manuale carichi",
    description: "Rischio legato al sollevamento e trasporto di carichi",
    status: "draft",
    inputExpectations: "Peso carico (kg), Frequenza sollevamento, Altezza sollevamento",
    outputStructure: riskOutputStructure4,
    aiPrompt: "Calcola l'indice NIOSH per la movimentazione manuale dei carichi e suggerisci azioni correttive.",
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-18T14:00:00Z",
    version: 1,
  },
];

// ============= ELABORATIONS =============
export const mockElaborations: Elaboration[] = [
  {
    id: 1,
    title: "Scheda Sicurezza Bio5 - Q1 2024",
    description: "Elaborazione schede di sicurezza primo trimestre",
    status: "completed",
    company_id: 1,
    company_name: "Bio5 S.r.l.",
    begin_process: "2024-01-10T09:00:00Z",
    end_process: "2024-01-10T12:00:00Z",
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-01-10T12:00:00Z",
    deleted_at: null,
    uploads_count: 3,
    files_count: 8,
  },
  {
    id: 2,
    title: "Scheda Sicurezza TechnoSafe",
    description: "Analisi sicurezza reparto IT",
    status: "elaborating",
    company_id: 2,
    company_name: "TechnoSafe S.p.A.",
    begin_process: "2024-02-01T10:00:00Z",
    end_process: null,
    created_at: "2024-02-01T10:00:00Z",
    updated_at: "2024-02-01T10:00:00Z",
    deleted_at: null,
    uploads_count: 2,
    files_count: 5,
  },
  {
    id: 3,
    title: "Formazione SafeWork 2024",
    description: "Documentazione formazione sicurezza",
    status: "pending",
    company_id: 3,
    company_name: "SafeWork Consulting",
    begin_process: "2024-02-15T11:00:00Z",
    end_process: null,
    created_at: "2024-02-15T11:00:00Z",
    updated_at: "2024-02-15T11:00:00Z",
    deleted_at: null,
    uploads_count: 1,
    files_count: 2,
  },
];

// ============= ELABORATION FILES =============
const createFile = (id: number, upload_id: number, filename: string, size: number, created_at: string): ElaborationFile => ({
  id,
  upload_id,
  filename,
  size,
  created_at,
});

// ============= ELABORATION UPLOADS =============
export const mockElaborationUploads: ElaborationUpload[] = [
  {
    id: 1,
    elaboration_id: 1,
    mansione: "Operatore",
    reparto: "Produzione",
    ruolo: "Senior",
    created_at: "2024-01-10T09:30:00Z",
    files: [
      createFile(1, 1, "scheda_operatore_prod.pdf", 245000, "2024-01-10T09:30:00Z"),
      createFile(2, 1, "formazione_base.pdf", 180000, "2024-01-10T09:31:00Z"),
      createFile(3, 1, "attestato_sicurezza.pdf", 95000, "2024-01-10T09:32:00Z"),
    ],
  },
  {
    id: 2,
    elaboration_id: 1,
    mansione: "Tecnico",
    reparto: "Qualità",
    ruolo: "Supervisor",
    created_at: "2024-01-10T10:00:00Z",
    files: [
      createFile(4, 2, "scheda_tecnico_qa.pdf", 320000, "2024-01-10T10:00:00Z"),
      createFile(5, 2, "procedure_controllo.pdf", 450000, "2024-01-10T10:01:00Z"),
    ],
  },
  {
    id: 3,
    elaboration_id: 1,
    mansione: "Magazziniere",
    reparto: "Logistica",
    ruolo: "Junior",
    created_at: "2024-01-10T11:00:00Z",
    files: [
      createFile(6, 3, "scheda_magazzino.pdf", 210000, "2024-01-10T11:00:00Z"),
      createFile(7, 3, "movimentazione_carichi.pdf", 175000, "2024-01-10T11:01:00Z"),
      createFile(8, 3, "uso_muletto.pdf", 290000, "2024-01-10T11:02:00Z"),
    ],
  },
  {
    id: 4,
    elaboration_id: 2,
    mansione: "Sviluppatore",
    reparto: "IT",
    ruolo: "Senior",
    created_at: "2024-02-01T10:30:00Z",
    files: [
      createFile(9, 4, "scheda_vdu.pdf", 150000, "2024-02-01T10:30:00Z"),
      createFile(10, 4, "ergonomia_postazione.pdf", 220000, "2024-02-01T10:31:00Z"),
    ],
  },
  {
    id: 5,
    elaboration_id: 2,
    mansione: "Analista",
    reparto: "IT",
    ruolo: "Mid",
    created_at: "2024-02-01T11:00:00Z",
    files: [
      createFile(11, 5, "scheda_analista.pdf", 185000, "2024-02-01T11:00:00Z"),
      createFile(12, 5, "stress_lavoro_correlato.pdf", 310000, "2024-02-01T11:01:00Z"),
      createFile(13, 5, "illuminazione_ufficio.pdf", 125000, "2024-02-01T11:02:00Z"),
    ],
  },
  {
    id: 6,
    elaboration_id: 3,
    mansione: "Consulente",
    reparto: "Consulenza",
    ruolo: "Expert",
    created_at: "2024-02-15T11:30:00Z",
    files: [
      createFile(14, 6, "scheda_consulente.pdf", 200000, "2024-02-15T11:30:00Z"),
      createFile(15, 6, "trasferte_sicurezza.pdf", 165000, "2024-02-15T11:31:00Z"),
    ],
  },
];

// ============= RISK VERSIONS =============
export const mockRiskVersions: { riskId: string; versions: any[] }[] = [
  {
    riskId: "1",
    versions: [
      { version: 1, name: "Caduta dall'alto", status: "active", createdAt: "2024-01-01T00:00:00Z", note: "Versione iniziale" },
    ],
  },
  {
    riskId: "2",
    versions: [
      { version: 1, name: "Esposizione a sostanze chimiche", status: "draft", createdAt: "2024-01-02T00:00:00Z", note: "Versione iniziale" },
      { version: 2, name: "Esposizione a sostanze chimiche", status: "active", createdAt: "2024-01-16T11:00:00Z", note: "Aggiornato prompt AI" },
    ],
  },
];

// ============= ID COUNTERS FOR NEW ITEMS =============
export let mockCompanyIdCounter = 4;
export let mockDvrIdCounter = 4;
export let mockFileIdCounter = 4;
export let mockElaborationIdCounter = 4;
export let mockUploadIdCounter = 7;
export let mockRiskIdCounter = 5;

export const incrementCompanyId = () => ++mockCompanyIdCounter;
export const incrementDvrId = () => ++mockDvrIdCounter;
export const incrementFileId = () => ++mockFileIdCounter;
export const incrementElaborationId = () => ++mockElaborationIdCounter;
export const incrementUploadId = () => ++mockUploadIdCounter;
export const incrementRiskId = () => ++mockRiskIdCounter;
