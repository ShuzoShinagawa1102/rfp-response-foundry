import { RfpCase, Requirement, Evidence, AuditEntry } from './types';

function newId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function nowIso(): string {
  return new Date().toISOString();
}

function auditEntry(actor: string, action: string, detail: string): AuditEntry {
  return { id: newId(), timestamp: nowIso(), actor, action, detail };
}

const seedCases: RfpCase[] = [
  {
    id: 'case-001',
    title: '株式会社ABCシステムズ セキュリティ要件書 RFP',
    account: '株式会社ABCシステムズ',
    issuer: '情報システム部 田中部長',
    dealValue: 45000000,
    dueDate: '2025-09-15',
    status: 'WaitingForEvidence',
    owner: '山田 太郎',
    requirements: [
      {
        id: 'req-001-1',
        label: '会社概要書',
        category: 'document',
        required: true,
        dueDate: '2025-09-01',
      },
      {
        id: 'req-001-2',
        label: 'セキュリティ要件回答書',
        category: 'document',
        required: true,
        dueDate: '2025-09-10',
      },
      {
        id: 'req-001-3',
        label: '価格提案書',
        category: 'document',
        required: true,
        dueDate: '2025-09-10',
      },
    ],
    evidence: [
      {
        id: 'ev-001-1',
        requirementId: 'req-001-1',
        name: '会社概要書_2025年版.pdf',
        uploadedAt: '2025-07-20T09:00:00.000Z',
        validUntil: '2026-03-31',
        status: 'valid',
      },
    ],
    auditTrail: [
      {
        id: 'aud-001-1',
        timestamp: '2025-07-15T08:00:00.000Z',
        actor: '山田 太郎',
        action: 'CaseCreated',
        detail: '案件を起票しました',
      },
      {
        id: 'aud-001-2',
        timestamp: '2025-07-15T08:05:00.000Z',
        actor: 'システム',
        action: 'StatusChanged',
        detail: 'Draft → IntakeValidated',
      },
      {
        id: 'aud-001-3',
        timestamp: '2025-07-15T08:06:00.000Z',
        actor: 'システム',
        action: 'StatusChanged',
        detail: 'IntakeValidated → WaitingForEvidence',
      },
      {
        id: 'aud-001-4',
        timestamp: '2025-07-20T09:00:00.000Z',
        actor: '山田 太郎',
        action: 'EvidenceReceived',
        detail: '会社概要書_2025年版.pdf を受領しました（要件: 会社概要書）',
      },
    ],
    createdAt: '2025-07-15T08:00:00.000Z',
    updatedAt: '2025-07-20T09:00:00.000Z',
  },
  {
    id: 'case-002',
    title: '国土交通省 クラウドサービス調達 RFP',
    account: '国土交通省',
    issuer: '調達管理室 佐藤室長',
    dealValue: 180000000,
    dueDate: '2025-08-31',
    status: 'InReview',
    owner: '鈴木 花子',
    requirements: [
      {
        id: 'req-002-1',
        label: '会社概要書',
        category: 'document',
        required: true,
        dueDate: '2025-08-15',
      },
      {
        id: 'req-002-2',
        label: '実績証明書',
        category: 'document',
        required: true,
        dueDate: '2025-08-15',
      },
      {
        id: 'req-002-3',
        label: '価格提案書',
        category: 'document',
        required: true,
        dueDate: '2025-08-20',
      },
      {
        id: 'req-002-4',
        label: '法務確認書',
        category: 'approval',
        required: true,
        dueDate: '2025-08-20',
      },
    ],
    evidence: [
      {
        id: 'ev-002-1',
        requirementId: 'req-002-1',
        name: '会社概要書_最新版.pdf',
        uploadedAt: '2025-07-25T10:00:00.000Z',
        validUntil: '2026-03-31',
        status: 'valid',
      },
      {
        id: 'ev-002-2',
        requirementId: 'req-002-2',
        name: '官公庁向け実績証明書.pdf',
        uploadedAt: '2025-07-26T14:00:00.000Z',
        validUntil: '2026-03-31',
        status: 'valid',
      },
      {
        id: 'ev-002-3',
        requirementId: 'req-002-3',
        name: '価格提案書_v2.xlsx',
        uploadedAt: '2025-07-28T11:30:00.000Z',
        validUntil: '2025-08-31',
        status: 'valid',
      },
      {
        id: 'ev-002-4',
        requirementId: 'req-002-4',
        name: '法務部確認済み契約書.pdf',
        uploadedAt: '2025-07-29T16:00:00.000Z',
        validUntil: '2025-12-31',
        status: 'valid',
      },
    ],
    decision: {
      recommendation: {
        recommendation: 'Approve',
        confidence: 0.85,
        reasons: ['すべての必要書類が提出済みです', '証拠書類の有効期限内です'],
        gaps: [],
      },
    },
    auditTrail: [
      {
        id: 'aud-002-1',
        timestamp: '2025-07-20T09:00:00.000Z',
        actor: '鈴木 花子',
        action: 'CaseCreated',
        detail: '案件を起票しました',
      },
      {
        id: 'aud-002-2',
        timestamp: '2025-07-20T09:05:00.000Z',
        actor: 'システム',
        action: 'StatusChanged',
        detail: 'Draft → WaitingForEvidence',
      },
      {
        id: 'aud-002-3',
        timestamp: '2025-07-25T10:00:00.000Z',
        actor: '鈴木 花子',
        action: 'EvidenceReceived',
        detail: '会社概要書_最新版.pdf を受領しました',
      },
      {
        id: 'aud-002-4',
        timestamp: '2025-07-26T14:00:00.000Z',
        actor: '鈴木 花子',
        action: 'EvidenceReceived',
        detail: '官公庁向け実績証明書.pdf を受領しました',
      },
      {
        id: 'aud-002-5',
        timestamp: '2025-07-28T11:30:00.000Z',
        actor: '鈴木 花子',
        action: 'EvidenceReceived',
        detail: '価格提案書_v2.xlsx を受領しました',
      },
      {
        id: 'aud-002-6',
        timestamp: '2025-07-29T16:00:00.000Z',
        actor: '鈴木 花子',
        action: 'EvidenceReceived',
        detail: '法務部確認済み契約書.pdf を受領しました',
      },
      {
        id: 'aud-002-7',
        timestamp: '2025-07-29T16:05:00.000Z',
        actor: 'システム',
        action: 'StatusChanged',
        detail: 'WaitingForEvidence → InReview（全証拠書類提出完了）',
      },
    ],
    createdAt: '2025-07-20T09:00:00.000Z',
    updatedAt: '2025-07-29T16:05:00.000Z',
  },
  {
    id: 'case-003',
    title: '大手金融機関 基幹システム更改 RFP',
    account: '第一フィナンシャルグループ',
    issuer: 'IT企画本部 中村本部長',
    dealValue: 520000000,
    dueDate: '2025-10-31',
    status: 'Exception',
    owner: '伊藤 誠',
    exceptionReason: 'コンプライアンス審査で追加書類が必要',
    requirements: [
      {
        id: 'req-003-1',
        label: '会社概要書',
        category: 'document',
        required: true,
        dueDate: '2025-10-01',
      },
      {
        id: 'req-003-2',
        label: 'セキュリティ要件回答書',
        category: 'document',
        required: true,
        dueDate: '2025-10-10',
      },
      {
        id: 'req-003-3',
        label: '法務確認書',
        category: 'approval',
        required: true,
        dueDate: '2025-10-10',
      },
      {
        id: 'req-003-4',
        label: 'コンプライアンス審査書',
        category: 'approval',
        required: true,
        dueDate: '2025-10-15',
      },
      {
        id: 'req-003-5',
        label: '価格提案書',
        category: 'document',
        required: true,
        dueDate: '2025-10-15',
      },
    ],
    evidence: [
      {
        id: 'ev-003-1',
        requirementId: 'req-003-1',
        name: '会社概要書_2025.pdf',
        uploadedAt: '2025-07-10T09:00:00.000Z',
        validUntil: '2026-03-31',
        status: 'valid',
      },
      {
        id: 'ev-003-2',
        requirementId: 'req-003-2',
        name: 'セキュリティ要件回答書_draft.pdf',
        uploadedAt: '2025-07-15T14:00:00.000Z',
        validUntil: '2025-10-31',
        status: 'valid',
      },
    ],
    auditTrail: [
      {
        id: 'aud-003-1',
        timestamp: '2025-07-05T08:00:00.000Z',
        actor: '伊藤 誠',
        action: 'CaseCreated',
        detail: '案件を起票しました',
      },
      {
        id: 'aud-003-2',
        timestamp: '2025-07-05T08:05:00.000Z',
        actor: 'システム',
        action: 'StatusChanged',
        detail: 'Draft → WaitingForEvidence',
      },
      {
        id: 'aud-003-3',
        timestamp: '2025-07-10T09:00:00.000Z',
        actor: '伊藤 誠',
        action: 'EvidenceReceived',
        detail: '会社概要書_2025.pdf を受領しました',
      },
      {
        id: 'aud-003-4',
        timestamp: '2025-07-15T14:00:00.000Z',
        actor: '伊藤 誠',
        action: 'EvidenceReceived',
        detail: 'セキュリティ要件回答書_draft.pdf を受領しました',
      },
      {
        id: 'aud-003-5',
        timestamp: '2025-07-18T10:00:00.000Z',
        actor: '伊藤 誠',
        action: 'StatusChanged',
        detail: 'WaitingForEvidence → InReview',
      },
      {
        id: 'aud-003-6',
        timestamp: '2025-07-22T15:30:00.000Z',
        actor: 'コンプライアンス部 渡辺',
        action: 'ExceptionRaised',
        detail: 'Exception昇格: コンプライアンス審査で追加書類が必要',
      },
    ],
    createdAt: '2025-07-05T08:00:00.000Z',
    updatedAt: '2025-07-22T15:30:00.000Z',
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __rfpStore: RfpCase[] | undefined;
}

function getStore(): RfpCase[] {
  if (!global.__rfpStore) {
    global.__rfpStore = JSON.parse(JSON.stringify(seedCases)) as RfpCase[];
  }
  return global.__rfpStore;
}

export function getCases(): RfpCase[] {
  return getStore();
}

export function getCase(id: string): RfpCase | undefined {
  return getStore().find((c) => c.id === id);
}

export function createCase(data: {
  title: string;
  account: string;
  issuer: string;
  dealValue: number;
  dueDate: string;
  owner: string;
}): RfpCase {
  const store = getStore();
  const id = `case-${Date.now()}`;
  const now = nowIso();

  const defaultRequirements: RfpCase['requirements'] = [
    { id: `${id}-req-1`, label: '会社概要書', category: 'document', required: true },
    { id: `${id}-req-2`, label: '価格提案書', category: 'document', required: true },
    { id: `${id}-req-3`, label: 'セキュリティ要件回答書', category: 'document', required: true },
  ];

  const newCase: RfpCase = {
    id,
    ...data,
    status: 'WaitingForEvidence',
    requirements: defaultRequirements,
    evidence: [],
    auditTrail: [
      auditEntry(data.owner, 'CaseCreated', '案件を起票しました'),
      auditEntry('システム', 'StatusChanged', 'Draft → IntakeValidated'),
      auditEntry('システム', 'StatusChanged', 'IntakeValidated → WaitingForEvidence'),
    ],
    createdAt: now,
    updatedAt: now,
  };

  store.push(newCase);
  return newCase;
}

export function updateCase(
  id: string,
  updates: Partial<Omit<RfpCase, 'id' | 'createdAt'>>,
  auditActor?: string,
  auditAction?: string,
  auditDetail?: string,
): RfpCase | undefined {
  const store = getStore();
  const idx = store.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;

  const existing = store[idx]!;
  const updated: RfpCase = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: nowIso(),
    auditTrail: existing.auditTrail,
  };

  if (auditActor && auditAction && auditDetail) {
    updated.auditTrail = [
      ...existing.auditTrail,
      auditEntry(auditActor, auditAction, auditDetail),
    ];
  }

  store[idx] = updated;
  return updated;
}

export function addEvidence(
  caseId: string,
  evidenceData: { requirementId: string; name: string; validUntil?: string },
): RfpCase | undefined {
  const store = getStore();
  const idx = store.findIndex((c) => c.id === caseId);
  if (idx === -1) return undefined;

  const existing = store[idx]!;
  const req = existing.requirements.find((r) => r.id === evidenceData.requirementId);
  if (!req) return undefined;

  const newEvidence: Evidence = {
    id: `ev-${Date.now()}`,
    requirementId: evidenceData.requirementId,
    name: evidenceData.name,
    uploadedAt: nowIso(),
    validUntil: evidenceData.validUntil,
    status: 'valid',
  };

  const updatedEvidence = [
    ...existing.evidence.filter((e) => e.requirementId !== evidenceData.requirementId),
    newEvidence,
  ];

  const newAuditEntry = auditEntry(
    'ユーザー',
    'EvidenceReceived',
    `${evidenceData.name} を受領しました（要件: ${req.label}）`,
  );

  let newStatus = existing.status;
  const extraAudit: AuditEntry[] = [];

  if (existing.status === 'WaitingForEvidence') {
    const required = existing.requirements.filter((r) => r.required);
    const allFulfilled = required.every((r) => {
      const ev = updatedEvidence.find((e) => e.requirementId === r.id);
      return ev && ev.status === 'valid';
    });
    if (allFulfilled) {
      newStatus = 'InReview';
      extraAudit.push(
        auditEntry('システム', 'StatusChanged', 'WaitingForEvidence → InReview（全証拠書類提出完了）'),
      );
    }
  }

  const updated: RfpCase = {
    ...existing,
    evidence: updatedEvidence,
    status: newStatus,
    updatedAt: nowIso(),
    auditTrail: [...existing.auditTrail, newAuditEntry, ...extraAudit],
  };

  store[idx] = updated;
  return updated;
}
