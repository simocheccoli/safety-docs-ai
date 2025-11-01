export type RiskStatus = 'draft' | 'validated' | 'active';

export interface OutputField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  children?: OutputField[];
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

export interface RiskType {
  id: string;
  uuid?: string;
  name: string;
  description: string;
  status: RiskStatus;
  inputExpectations: string;
  outputStructure: OutputField[];
  aiPrompt: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface RiskTestResult {
  success: boolean;
  valid: boolean;
  output: any;
  error?: string;
}
