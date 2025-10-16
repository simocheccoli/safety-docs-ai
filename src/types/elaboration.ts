export type ElaborationStatus = 'processing' | 'completed' | 'error';

export interface Elaboration {
  id: string;
  name: string;
  status: ElaborationStatus;
  filesCount: number;
  createdAt: Date;
  completedAt?: Date;
  excelUrl?: string;
  progress?: number;
}
