export type ChangelogType = 'major' | 'minor' | 'patch';

export interface ChangelogCategories {
  added: string[];
  changed: string[];
  fixed: string[];
}

export interface ChangelogVersion {
  version: string;
  date: string;
  type: ChangelogType;
  title: string;
  categories: ChangelogCategories;
  read?: boolean; // Added by backend if user is authenticated
}

export interface ChangelogResponse {
  versions: ChangelogVersion[];
}

export interface ChangelogLatestResponse {
  version: ChangelogVersion | null;
}
