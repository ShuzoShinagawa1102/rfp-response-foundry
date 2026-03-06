import { AuditEntry } from '@/lib/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const actionLabels: Record<string, string> = {
  CaseCreated: '案件作成',
  StatusChanged: 'ステータス変更',
  EvidenceReceived: '証拠受領',
  ExceptionRaised: '例外昇格',
  DecisionConfirmed: '判断確定',
};

export default function AuditTrail({ entries }: { entries: AuditEntry[] }) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {sorted.map((entry, idx) => (
          <li key={entry.id}>
            <div className="relative pb-8">
              {idx < sorted.length - 1 && (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center ring-8 ring-white">
                    <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-gray-900">
                        {actionLabels[entry.action] ?? entry.action}
                      </span>
                      {' — '}
                      {entry.detail}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">担当: {entry.actor}</p>
                  </div>
                  <div className="whitespace-nowrap text-right text-xs text-gray-500">
                    {formatDate(entry.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
