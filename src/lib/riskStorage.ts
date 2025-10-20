import { RiskType } from '@/types/risk';

const STORAGE_KEY = 'hseb5_risk_types';

export const getRiskTypes = (): RiskType[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveRiskType = (risk: RiskType): void => {
  const risks = getRiskTypes();
  const existingIndex = risks.findIndex(r => r.id === risk.id);
  
  if (existingIndex >= 0) {
    risks[existingIndex] = { ...risk, updatedAt: new Date().toISOString() };
  } else {
    risks.push(risk);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(risks));
};

export const deleteRiskType = (id: string): void => {
  const risks = getRiskTypes().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(risks));
};

export const getRiskTypeById = (id: string): RiskType | undefined => {
  return getRiskTypes().find(r => r.id === id);
};
