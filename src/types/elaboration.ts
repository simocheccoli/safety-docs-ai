export type ElaborationStatus = 'elaborating' | 'completed' | 'error';

export interface Elaboration {
  id: number;
  title: string;
  status: ElaborationStatus;
  begin_process: string;
  end_process: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
