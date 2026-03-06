'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RfpCase, CaseStatus } from '@/lib/types';
import CaseCard from '@/components/CaseCard';

type FilterTab = 'all' | 'active' | 'attention' | 'done';

const filterConfig: { key: FilterTab; label: string; statuses?: CaseStatus[] }[] = [
  { key: 'all', label: 'すべて' },
  {
    key: 'active',
    label: '進行中',
    statuses: ['Draft', 'IntakeValidated', 'WaitingForEvidence', 'InReview'],
  },
  { key: 'attention', label: '要確認', statuses: ['Exception', 'Reopened'] },
  { key: 'done', label: '完了', statuses: ['Approved', 'Rejected', 'Closed'] },
];

export default function CaseBoardPage() {
  const [cases, setCases] = useState<RfpCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  useEffect(() => {
    fetch('/api/cases')
      .then((r) => r.json())
      .then((data: RfpCase[]) => {
        setCases(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered =
    activeTab === 'all'
      ? cases
      : cases.filter((c) => {
          const cfg = filterConfig.find((f) => f.key === activeTab);
          return cfg?.statuses?.includes(c.status);
        });

  const stats = {
    total: cases.length,
    inReview: cases.filter((c) => c.status === 'InReview').length,
    attention: cases.filter((c) => ['Exception', 'WaitingForEvidence'].includes(c.status)).length,
    done: cases.filter((c) => ['Approved', 'Rejected', 'Closed'].includes(c.status)).length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">RFP ケースボード</h1>
          <p className="text-sm text-gray-500 mt-1">RFP回答案件の一覧・管理</p>
        </div>
        <Link
          href="/cases/new"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規案件
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '総案件数', value: stats.total, color: 'text-gray-900', bg: 'bg-white' },
          { label: '審査中', value: stats.inReview, color: 'text-purple-700', bg: 'bg-purple-50' },
          { label: '要対応', value: stats.attention, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: '完了', value: stats.done, color: 'text-green-700', bg: 'bg-green-50' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl border border-gray-200 p-4`}>
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 w-fit">
        {filterConfig.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Case grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="mx-auto w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">案件がありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <CaseCard key={c.id} rfpCase={c} />
          ))}
        </div>
      )}
    </div>
  );
}
