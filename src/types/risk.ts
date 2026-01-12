// Aligned with OpenAPI spec: components/schemas/RiskType
export type RiskStatus = 'draft' | 'validated' | 'active' | 'archived';

export interface OutputField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  children?: OutputField[];
}

// Aligned with OpenAPI spec: components/schemas/RiskType
// Supports both camelCase (OpenAPI) and legacy formats
export interface RiskType {
  id: string;
  name: string;
  description: string;
  icon?: string; // New from OpenAPI
  color?: string; // New from OpenAPI
  prompt?: string; // OpenAPI uses 'prompt'
  aiPrompt?: string; // Legacy alias
  inputExpectations?: string;
  outputStructure?: OutputField[] | object;
  version?: number;
  createdAt?: string; // OpenAPI uses camelCase
  updatedAt?: string; // OpenAPI uses camelCase

  // Legacy fields
  uuid?: string;
  status?: RiskStatus;
}

export interface RiskVersion {
  id: number;
  risk_id: number;
  version: number;
  name: string;
  description: string | null;
  content_expectations: string | null;
  output_structure: OutputField[];
  prompt: string | null;
  state: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface RiskTestResult {
  success: boolean;
  valid: boolean;
  output: any;
  error?: string;
}

// Aligned with OpenAPI spec: components/schemas/CreateRiskTypeRequest
export interface CreateRiskTypeRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  prompt?: string;
  inputExpectations?: string;
  outputStructure?: object;
  status?: RiskStatus;
}

// Helper to get prompt (supports both formats)
export const getRiskPrompt = (risk: RiskType): string => {
  return risk.prompt || risk.aiPrompt || '';
};

// Helper to convert backend response to frontend format
export const mapRiskFromBackend = (data: any): RiskType => ({
  id: String(data.id),
  name: data.name,
  description: data.description || '',
  icon: data.icon,
  color: data.color,
  prompt: data.prompt,
  aiPrompt: data.prompt, // Legacy alias
  inputExpectations: data.inputExpectations,
  outputStructure: data.outputStructure,
  version: data.version,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
  uuid: data.uuid,
  status: data.status || 'active',
});

// Helper to convert frontend data to backend format
export const mapRiskToBackend = (data: Partial<RiskType>): CreateRiskTypeRequest => ({
  name: data.name || '',
  description: data.description,
  icon: data.icon,
  color: data.color,
  prompt: data.prompt || data.aiPrompt,
  inputExpectations: data.inputExpectations,
  outputStructure: Array.isArray(data.outputStructure) ? data.outputStructure : data.outputStructure,
  status: data.status,
});
