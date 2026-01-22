import { ChangelogVersion, ChangelogResponse, ChangelogLatestResponse } from "@/types/changelog";
import { apiClient, simulateDelay } from './apiClient';
import { isDemoMode } from './config';

// Mock data
const mockChangelogVersions: ChangelogVersion[] = [
  {
    version: "2.0.0",
    date: "2024-01-01",
    type: "major",
    title: "Versione iniziale del sistema",
    categories: {
      added: [
        "Sistema di changelog per comunicare aggiornamenti agli utenti"
      ],
      changed: [],
      fixed: []
    }
  }
];

/**
 * Get all changelog versions
 */
export async function getChangelog(): Promise<ChangelogVersion[]> {
  if (isDemoMode()) {
    await simulateDelay(300);
    return mockChangelogVersions;
  }

  const response = await apiClient.get<ChangelogResponse>('/changelog');
  return response.versions || [];
}

/**
 * Get the latest changelog version
 */
export async function getLatest(): Promise<ChangelogVersion | null> {
  if (isDemoMode()) {
    await simulateDelay(200);
    return mockChangelogVersions.length > 0 ? mockChangelogVersions[0] : null;
  }

  const response = await apiClient.get<ChangelogLatestResponse>('/changelog/latest');
  return response.version;
}

/**
 * Get unread changelog versions for the current user
 */
export async function getUnread(): Promise<ChangelogVersion[]> {
  if (isDemoMode()) {
    await simulateDelay(200);
    // In demo mode, return all versions as unread
    return mockChangelogVersions;
  }

  const response = await apiClient.get<ChangelogResponse>('/changelog/unread');
  return response.versions || [];
}

/**
 * Mark a changelog version as read
 */
export async function markAsRead(version: string): Promise<void> {
  if (isDemoMode()) {
    await simulateDelay(200);
    return;
  }

  await apiClient.post(`/changelog/${version}/mark-read`);
}

/**
 * Create a new changelog version (admin only)
 */
export async function createVersion(version: Omit<ChangelogVersion, 'read'>): Promise<ChangelogVersion> {
  if (isDemoMode()) {
    await simulateDelay(300);
    const newVersion: ChangelogVersion = { ...version, read: false };
    mockChangelogVersions.unshift(newVersion);
    return newVersion;
  }

  const response = await apiClient.post<{ version: ChangelogVersion }>('/changelog', version);
  return response.version;
}

/**
 * Update an existing changelog version (admin only)
 */
export async function updateVersion(
  version: string,
  updates: Partial<Omit<ChangelogVersion, 'version' | 'read'>>
): Promise<void> {
  if (isDemoMode()) {
    await simulateDelay(200);
    const index = mockChangelogVersions.findIndex(v => v.version === version);
    if (index !== -1) {
      mockChangelogVersions[index] = { ...mockChangelogVersions[index], ...updates };
    }
    return;
  }

  await apiClient.patch(`/changelog/${version}`, updates);
}

/**
 * Delete a changelog version (admin only)
 */
export async function deleteVersion(version: string): Promise<void> {
  if (isDemoMode()) {
    await simulateDelay(200);
    const index = mockChangelogVersions.findIndex(v => v.version === version);
    if (index !== -1) {
      mockChangelogVersions.splice(index, 1);
    }
    return;
  }

  await apiClient.delete(`/changelog/${version}`);
}
