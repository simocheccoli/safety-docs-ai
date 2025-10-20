export interface RiskType {
  id: string;
  title: string;
  contextPrompt: string;
  outputPrompt: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RiskTestResult {
  success: boolean;
  extractedData: any;
  error?: string;
}
