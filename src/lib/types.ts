export type CaseStatus =
  | 'Draft'
  | 'IntakeValidated'
  | 'WaitingForEvidence'
  | 'InReview'
  | 'Exception'
  | 'Approved'
  | 'Rejected'
  | 'Closed'
  | 'Reopened';

export interface Requirement {
  id: string;
  label: string;
  category: 'document' | 'review' | 'approval';
  required: boolean;
  dueDate?: string;
}

export interface Evidence {
  id: string;
  requirementId: string;
  name: string;
  uploadedAt: string;
  validUntil?: string;
  status: 'valid' | 'expired' | 'rejected';
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
}

export interface DecisionRecommendation {
  recommendation: 'Approve' | 'Reject' | 'NeedMoreInfo';
  confidence: number;
  reasons: string[];
  gaps: string[];
}

export interface RfpCase {
  id: string;
  title: string;
  account: string;
  issuer: string;
  dealValue: number;
  dueDate: string;
  status: CaseStatus;
  owner: string;
  exceptionReason?: string;
  requirements: Requirement[];
  evidence: Evidence[];
  decision?: {
    recommendation: DecisionRecommendation;
    confirmedBy?: string;
    confirmedAt?: string;
    outcome?: 'Approved' | 'Rejected';
  };
  auditTrail: AuditEntry[];
  createdAt: string;
  updatedAt: string;
}
