// This file is deprecated - use elaborationApi.ts instead
import { Elaboration } from "@/types/elaboration";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://213.171.186.160:8000";

// Re-export from new API
export { 
  fetchElaborations, 
  deleteElaboration, 
  downloadExcel, 
  downloadZip,
  createElaboration 
} from "@/lib/elaborationApi";

export async function fetchElaborationDetails(id: number): Promise<{ elaboration: Elaboration, files: string[] }> {
  throw new Error('Use elaborationApi.ts instead');
}

export async function updateElaborationTitle(id: number, title: string): Promise<void> {
  throw new Error('Use elaborationApi.ts instead');
}

export function getFileUrl(id: number, filename: string): string {
  return `${API_BASE_URL}/api/rischi/${id}/file/${encodeURIComponent(filename)}`;
}
