import Link from 'next/link';
import { RfpCase } from '@/lib/types';
import StatusBadge from './StatusBadge';
import { computeCompletenessScore } from '@/lib/rules';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function CaseCard({ rfpCase }: { rfpCase: RfpCase }) {
  const completeness = computeCompletenessScore(rfpCase);
  const daysLeft = getDaysUntilDue(rfpCase.dueDate);
  const isUrgent = daysLeft <= 7 && daysLeft >= 0;
  const isOverdue = daysLeft < 0;

  return (
    <Link href={`/cases/${rfpCase.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{rfpCase.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{rfpCase.account}</p>
          </div>
          <StatusBadge status={rfpCase.status} />
        </div>

        {/* Completeness bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">証拠完了率</span>
            <span className="text-xs font-medium text-gray-700">{completeness}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                completeness >= 100 ? 'bg-green-500' : completeness >= 50 ? 'bg-amber-400' : 'bg-red-400'
              }`}
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={isOverdue ? 'text-red-600 font-medium' : isUrgent ? 'text-amber-600 font-medium' : ''}>
              {isOverdue ? `${Math.abs(daysLeft)}日超過` : `${formatDate(rfpCase.dueDate)}（残${daysLeft}日）`}
            </span>
          </div>
          <span className="font-medium text-gray-700">{formatCurrency(rfpCase.dealValue)}</span>
        </div>

        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {rfpCase.owner}
        </div>
      </div>
    </Link>
  );
}
