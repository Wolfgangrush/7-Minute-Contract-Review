import { ReactNode } from 'react';

export interface StepDefinition {
  id: number;
  title: string;
  duration: number; // in seconds
  icon: ReactNode;
  description: string;
  checklist: string[];
}

export interface FindingData {
  checked: string[];
  notes: string;
}

export interface FindingsMap {
  [stepIndex: number]: FindingData;
}
