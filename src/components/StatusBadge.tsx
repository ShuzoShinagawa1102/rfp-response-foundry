import { CaseStatus } from '@/lib/types';

const statusConfig: Record<CaseStatus, { label: string; className: string }> = {
  Draft: { label: '起票', className: 'bg-gray-100 text-gray-700' },
  IntakeValidated: { label: '受付確認済', className: 'bg-blue-100 text-blue-700' },
  WaitingForEvidence: { label: '証拠収集中', className: 'bg-amber-100 text-amber-700' },
  InReview: { label: '審査中', className: 'bg-purple-100 text-purple-700' },
  Exception: { label: '例外対応中', className: 'bg-orange-100 text-orange-700' },
  Approved: { label: '承認済', className: 'bg-green-100 text-green-700' },
  Rejected: { label: '却下', className: 'bg-red-100 text-red-700' },
  Closed: { label: 'クローズ', className: 'bg-gray-200 text-gray-600' },
  Reopened: { label: '再審査中', className: 'bg-orange-100 text-orange-700' },
};

export default function StatusBadge({ status }: { status: CaseStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
