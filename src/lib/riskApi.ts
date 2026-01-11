import { RiskType, OutputField, RiskVersion } from '@/types/risk';

// DEMO MODE
const DEMO_MODE = true;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Mock data
let mockRisks: RiskType[] = [
  {
    id: "1",
    uuid: "risk-001",
    name: "Rischio Fonometrico",
    description: "Valutazione del rischio rumore per esposizione a livelli sonori elevati negli ambienti di lavoro",
    status: "active",
    inputExpectations: "Misurazioni fonometriche, dati di esposizione al rumore (Lex,8h), tempi di esposizione, tipologia di macchinari e attrezzature rumorose, DPI uditivi in uso",
    outputStructure: [
      { name: "postazione_lavoro", type: "string", required: true, description: "Identificativo della postazione o area di lavoro" },
      { name: "livello_esposizione_leq", type: "number", required: true, description: "Livello equivalente di pressione sonora LEQ in dB(A)" },
      { name: "livello_esposizione_lex8h", type: "number", required: true, description: "Livello di esposizione giornaliera Lex,8h in dB(A)" },
      { name: "livello_picco", type: "number", required: false, description: "Livello di picco Lpeak in dB(C)" },
      { name: "classe_rischio", type: "string", required: true, description: "Classificazione rischio (Trascurabile/Basso/Medio/Alto/Molto Alto)" },
      { name: "superamento_limiti", type: "boolean", required: true, description: "Indica se vengono superati i valori limite di esposizione" },
      { name: "mansioni_esposte", type: "array", required: true, description: "Elenco delle mansioni esposte al rischio" },
      { name: "sorgenti_rumore", type: "array", required: true, description: "Elenco delle principali sorgenti di rumore" },
      { name: "dpi_uditivi", type: "array", required: true, description: "DPI uditivi raccomandati (cuffie, inserti, ecc.)" },
      { name: "misure_prevenzione", type: "array", required: true, description: "Misure tecniche e organizzative di prevenzione" },
      { name: "sorveglianza_sanitaria", type: "boolean", required: true, description: "Necessità di sorveglianza sanitaria" },
      { name: "formazione_richiesta", type: "boolean", required: true, description: "Necessità di formazione specifica" }
    ],
    aiPrompt: "Analizza il documento fornito relativo alla valutazione del rischio rumore. Estrai i dati delle misurazioni fonometriche, identifica i livelli di esposizione LEQ e Lex,8h per ogni postazione di lavoro, classifica il livello di rischio secondo i limiti del D.Lgs. 81/2008 (valore inferiore di azione 80 dB(A), valore superiore di azione 85 dB(A), valore limite 87 dB(A)). Identifica le mansioni esposte, le sorgenti di rumore principali e indica i DPI uditivi necessari e le misure di prevenzione. Restituisci i dati in formato JSON strutturato.",
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    uuid: "risk-002",
    name: "Rischio Chimico",
    description: "Valutazione del rischio chimico per esposizione a sostanze pericolose",
    status: "active",
    inputExpectations: "Schede di sicurezza SDS, elenco sostanze utilizzate, quantità e frequenza di utilizzo",
    outputStructure: [
      { name: "sostanza", type: "string", required: true, description: "Nome della sostanza chimica" },
      { name: "livello_rischio", type: "string", required: true, description: "Livello di rischio (Basso/Medio/Alto)" },
      { name: "misure_prevenzione", type: "array", required: true, description: "Elenco misure di prevenzione" },
      { name: "dpi_necessari", type: "array", required: false, description: "DPI necessari" }
    ],
    aiPrompt: "Analizza il documento fornito ed estrai le informazioni relative al rischio chimico. Identifica le sostanze chimiche presenti, valuta il livello di rischio e suggerisci le misure di prevenzione appropriate. Restituisci i dati in formato JSON.",
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "3",
    uuid: "risk-003",
    name: "Rischio Biologico",
    description: "Valutazione del rischio biologico per esposizione ad agenti biologici",
    status: "active",
    inputExpectations: "Protocolli di sicurezza, procedure di disinfezione, registro esposizioni",
    outputStructure: [
      { name: "agente_biologico", type: "string", required: true, description: "Tipo di agente biologico" },
      { name: "classe_rischio", type: "number", required: true, description: "Classe di rischio (1-4)" },
      { name: "procedure_sicurezza", type: "array", required: true, description: "Procedure di sicurezza" }
    ],
    aiPrompt: "Analizza il documento ed estrai informazioni sul rischio biologico. Identifica gli agenti biologici, la classe di rischio e le procedure di sicurezza. Restituisci in JSON.",
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "4",
    uuid: "risk-004",
    name: "Rischio Ergonomico",
    description: "Valutazione del rischio da movimentazione manuale dei carichi e posture",
    status: "active",
    inputExpectations: "Schede mansioni, valutazioni NIOSH, analisi postazioni di lavoro",
    outputStructure: [
      { name: "attivita", type: "string", required: true, description: "Attività lavorativa" },
      { name: "indice_rischio", type: "number", required: true, description: "Indice di rischio" },
      { name: "interventi", type: "array", required: false, description: "Interventi migliorativi" }
    ],
    aiPrompt: "Analizza il documento per il rischio ergonomico. Estrai le attività, calcola l'indice di rischio e suggerisci interventi. Formato JSON.",
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let mockRiskIdCounter = 5;

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Backend API response types
interface BackendRisk {
  id: number;
  uuid: string;
  code?: string;
  name: string;
  description: string | null;
  content_expectations: string | null;
  output_structure: any[];
  prompt: string | null;
  status: 'draft' | 'validated' | 'active';
  version: number;
  created_at: string;
  updated_at: string;
}

// Convert backend risk to frontend format
const mapBackendRiskToFrontend = (backendRisk: BackendRisk): RiskType => {
  return {
    id: backendRisk.id.toString(),
    uuid: backendRisk.uuid,
    name: backendRisk.name,
    description: backendRisk.description || '',
    status: backendRisk.status,
    inputExpectations: backendRisk.content_expectations || '',
    outputStructure: Array.isArray(backendRisk.output_structure) 
      ? backendRisk.output_structure as OutputField[]
      : [],
    aiPrompt: backendRisk.prompt || '',
    version: backendRisk.version,
    createdAt: backendRisk.created_at,
    updatedAt: backendRisk.updated_at,
  };
};

// Convert frontend risk to backend format
const mapFrontendRiskToBackend = (risk: Partial<RiskType>) => {
  return {
    uuid: risk.uuid,
    name: risk.name,
    description: risk.description || null,
    content_expectations: risk.inputExpectations || null,
    output_structure: risk.outputStructure || [],
    prompt: risk.aiPrompt || null,
    status: risk.status || 'draft',
  };
};

export const getRiskTypes = async (): Promise<RiskType[]> => {
  if (DEMO_MODE) {
    await simulateDelay(300);
    return [...mockRisks];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/risks`);
    if (!response.ok) {
      throw new Error('Failed to fetch risks');
    }
    const data = await response.json();
    return data.map(mapBackendRiskToFrontend);
  } catch (error) {
    console.error('Error fetching risks:', error);
    throw error;
  }
};

export const getRiskTypeById = async (id: string): Promise<RiskType | null> => {
  if (DEMO_MODE) {
    await simulateDelay(200);
    return mockRisks.find(r => r.id === id) || null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/risks/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch risk');
    }
    const data = await response.json();
    return mapBackendRiskToFrontend(data);
  } catch (error) {
    console.error('Error fetching risk:', error);
    throw error;
  }
};

export const saveRiskType = async (risk: RiskType): Promise<RiskType> => {
  if (DEMO_MODE) {
    await simulateDelay(400);
    
    if (risk.id && risk.id !== 'new') {
      const index = mockRisks.findIndex(r => r.id === risk.id);
      if (index !== -1) {
        mockRisks[index] = {
          ...risk,
          version: mockRisks[index].version + 1,
          updatedAt: new Date().toISOString()
        };
        return mockRisks[index];
      }
    }
    
    // Create new
    const newRisk: RiskType = {
      ...risk,
      id: (mockRiskIdCounter++).toString(),
      uuid: `risk-${Date.now()}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockRisks.push(newRisk);
    return newRisk;
  }

  try {
    const backendRisk = mapFrontendRiskToBackend(risk);
    
    if (risk.id && risk.id !== 'new') {
      const response = await fetch(`${API_BASE_URL}/api/risks/${risk.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendRisk),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update risk');
      }
      
      const data = await response.json();
      return mapBackendRiskToFrontend(data);
    } else {
      const response = await fetch(`${API_BASE_URL}/api/risks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendRisk),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create risk');
      }
      
      const data = await response.json();
      return mapBackendRiskToFrontend(data);
    }
  } catch (error) {
    console.error('Error saving risk:', error);
    throw error;
  }
};

export const deleteRiskType = async (id: string): Promise<void> => {
  if (DEMO_MODE) {
    await simulateDelay(300);
    mockRisks = mockRisks.filter(r => r.id !== id);
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/risks/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete risk');
    }
  } catch (error) {
    console.error('Error deleting risk:', error);
    throw error;
  }
};

export const getRiskVersions = async (riskId: string): Promise<RiskVersion[]> => {
  if (DEMO_MODE) {
    await simulateDelay(200);
    const risk = mockRisks.find(r => r.id === riskId);
    if (!risk) return [];
    
    return [{
      id: 1,
      risk_id: parseInt(riskId),
      version: risk.version,
      name: risk.name,
      description: risk.description,
      content_expectations: risk.inputExpectations,
      output_structure: Array.isArray(risk.outputStructure) ? risk.outputStructure : [],
      prompt: risk.aiPrompt,
      state: 'published' as const,
      created_at: risk.createdAt,
      updated_at: risk.updatedAt
    }];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/risks/${riskId}/versions`);
    if (!response.ok) {
      throw new Error('Failed to fetch risk versions');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching risk versions:', error);
    throw error;
  }
};

export const revertRiskToVersion = async (riskId: string, version: number): Promise<RiskType> => {
  if (DEMO_MODE) {
    await simulateDelay(300);
    const risk = mockRisks.find(r => r.id === riskId);
    if (!risk) throw new Error('Risk not found');
    return risk;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/risks/${riskId}/revert/${version}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to revert risk to version');
    }
    
    const data = await response.json();
    return mapBackendRiskToFrontend(data);
  } catch (error) {
    console.error('Error reverting risk to version:', error);
    throw error;
  }
};
