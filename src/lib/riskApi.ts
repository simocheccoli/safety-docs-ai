import { RiskType, OutputField } from '@/types/risk';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Backend API response types
interface BackendRisk {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  content_expectations: string | null;
  output_structure: any[];
  prompt: string | null;
  state: 'draft' | 'published' | 'archived';
  version: number;
  created_at: string;
  updated_at: string;
}

// Map backend status to frontend status
const mapBackendStatus = (state: string): 'draft' | 'validated' | 'active' => {
  switch (state) {
    case 'published':
      return 'validated';
    case 'archived':
      return 'active';
    case 'draft':
    default:
      return 'draft';
  }
};

// Map frontend status to backend state
const mapFrontendStatus = (status: string): 'draft' | 'published' | 'archived' => {
  switch (status) {
    case 'validated':
      return 'published';
    case 'active':
      return 'archived';
    case 'draft':
    default:
      return 'draft';
  }
};

// Convert backend risk to frontend format
const mapBackendRiskToFrontend = (backendRisk: BackendRisk): RiskType => {
  return {
    id: backendRisk.id.toString(),
    uuid: backendRisk.uuid,
    name: backendRisk.name,
    description: backendRisk.description || '',
    status: mapBackendStatus(backendRisk.state),
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
    state: risk.status ? mapFrontendStatus(risk.status) : 'draft',
  };
};

export const getRiskTypes = async (): Promise<RiskType[]> => {
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
  try {
    const backendRisk = mapFrontendRiskToBackend(risk);
    
    // If risk has an id, update it
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
      // Create new risk
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
