'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RfpCase, Requirement, DecisionRecommendation } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import AuditTrail from '@/components/AuditTrail';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

type CaseWithRecommendation = RfpCase & { _recommendation?: DecisionRecommendation };

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [rfpCase, setRfpCase] = useState<CaseWithRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Evidence modal state
  const [evidenceModal, setEvidenceModal] = useState<{ reqId: string; reqLabel: string } | null>(null);
  const [evidenceName, setEvidenceName] = useState('');
  const [evidenceValidUntil, setEvidenceValidUntil] = useState('');

  // Exception modal state
  const [exceptionModal, setExceptionModal] = useState(false);
  const [exceptionReason, setExceptionReason] = useState('');

  const fetchCase = useCallback(async () => {
    try {
      const res = await fetch(`/api/cases/${id}`);
      if (!res.ok) {
        router.push('/');
        return;
      }
      const data = await res.json() as CaseWithRecommendation;
      setRfpCase(data);
    } catch {
      setError('データ取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  async function transitionStatus(
    status: string,
    extra?: Record<string, unknown>,
  ) {
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra }),
      });
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? '更新に失敗しました');
      }
      await fetchCase();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました');
    } finally {
      setActionLoading(false);
    }
  }

  async function submitEvidence() {
    if (!evidenceModal || !evidenceName.trim()) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/cases/${id}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirementId: evidenceModal.reqId,
          name: evidenceName.trim(),
          validUntil: evidenceValidUntil || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? '追加に失敗しました');
      }
      setEvidenceModal(null);
      setEvidenceName('');
      setEvidenceValidUntil('');
      await fetchCase();
    } catch (err) {
      setError(err instanceof Error ? err.message : '追加に失敗しました');
    } finally {
      setActionLoading(false);
    }
  }

  async function submitException() {
    if (!exceptionReason.trim()) return;
    await transitionStatus('Exception', { exceptionReason: exceptionReason.trim() });
    setExceptionModal(false);
    setExceptionReason('');
  }

  function closeEvidenceModal() {
    setEvidenceModal(null);
    setEvidenceName('');
    setEvidenceValidUntil('');
  }

  function closeExceptionModal() {
    setExceptionModal(false);
    setExceptionReason('');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!rfpCase) {
    return <div className="p-8 text-gray-500">案件が見つかりません</div>;
  }

  const completeness = (() => {
    const required = rfpCase.requirements.filter((r) => r.required);
    if (required.length === 0) return 100;
    const fulfilled = required.filter((req) => {
      const ev = rfpCase.evidence.find((e) => e.requirementId === req.id);
      return ev && ev.status === 'valid';
    });
    return Math.round((fulfilled.length / required.length) * 100);
  })();

  const rec = rfpCase._recommendation;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/')}
          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ケースボードに戻る
        </button>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{rfpCase.title}</h1>
                <StatusBadge status={rfpCase.status} />
              </div>
              <p className="text-sm text-gray-500 mt-1">{rfpCase.account} / {rfpCase.issuer}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-gray-900">{formatCurrency(rfpCase.dealValue)}</p>
              <p className="text-xs text-gray-500 mt-0.5">期限: {formatDate(rfpCase.dueDate)}</p>
              <p className="text-xs text-gray-400">担当: {rfpCase.owner}</p>
            </div>
          </div>

          {rfpCase.status === 'Exception' && rfpCase.exceptionReason && (
            <div className="mt-4 rounded-lg bg-orange-50 border border-orange-200 p-3 text-sm text-orange-800">
              <span className="font-semibold">例外理由: </span>{rfpCase.exceptionReason}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-5 flex flex-wrap gap-2">
            {rfpCase.status === 'Draft' && (
              <ActionButton
                label="受付確認"
                onClick={() => transitionStatus('IntakeValidated')}
                loading={actionLoading}
                color="blue"
              />
            )}
            {rfpCase.status === 'IntakeValidated' && (
              <ActionButton
                label="証拠収集開始"
                onClick={() => transitionStatus('WaitingForEvidence')}
                loading={actionLoading}
                color="blue"
              />
            )}
            {rfpCase.status === 'WaitingForEvidence' && (
              <ActionButton
                label="レビュー開始"
                onClick={() => transitionStatus('InReview')}
                loading={actionLoading}
                disabled={completeness < 100}
                color="purple"
                title={completeness < 100 ? '全証拠書類を提出してください' : undefined}
              />
            )}
            {rfpCase.status === 'InReview' && (
              <>
                <ActionButton
                  label="承認"
                  onClick={() => transitionStatus('Approved', { confirmedBy: rfpCase.owner })}
                  loading={actionLoading}
                  color="green"
                />
                <ActionButton
                  label="却下"
                  onClick={() => transitionStatus('Rejected', { confirmedBy: rfpCase.owner })}
                  loading={actionLoading}
                  color="red"
                />
                <ActionButton
                  label="例外昇格"
                  onClick={() => setExceptionModal(true)}
                  loading={actionLoading}
                  color="orange"
                />
              </>
            )}
            {rfpCase.status === 'Exception' && (
              <>
                <ActionButton
                  label="証拠収集に戻す"
                  onClick={() => transitionStatus('WaitingForEvidence')}
                  loading={actionLoading}
                  color="blue"
                />
                <ActionButton
                  label="レビューに戻す"
                  onClick={() => transitionStatus('InReview')}
                  loading={actionLoading}
                  color="purple"
                />
              </>
            )}
            {(rfpCase.status === 'Approved' || rfpCase.status === 'Rejected') && (
              <ActionButton
                label="クローズ"
                onClick={() => transitionStatus('Closed')}
                loading={actionLoading}
                color="gray"
              />
            )}
          </div>

          {error && (
            <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Requirements & Evidence - left 2/3 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">要件・証拠書類</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">完了率</span>
                <span className="text-sm font-bold text-gray-900">{completeness}%</span>
                <div className="w-24 bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      completeness >= 100 ? 'bg-green-500' : completeness >= 50 ? 'bg-amber-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {rfpCase.requirements.map((req: Requirement) => {
                const ev = rfpCase.evidence.find((e) => e.requirementId === req.id);
                const hasValid = ev && ev.status === 'valid';
                return (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        hasValid ? 'bg-green-100' : 'bg-gray-200'
                      }`}>
                        {hasValid ? (
                          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {req.label}
                          {req.required && <span className="ml-1 text-xs text-red-500">必須</span>}
                        </p>
                        {ev && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {ev.name}
                            {ev.validUntil && ` (有効期限: ${formatDate(ev.validUntil)})`}
                          </p>
                        )}
                      </div>
                    </div>
                    {!hasValid && ['WaitingForEvidence', 'InReview', 'Exception'].includes(rfpCase.status) && (
                      <button
                        onClick={() => setEvidenceModal({ reqId: req.id, reqLabel: req.label })}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 hover:border-indigo-400 px-3 py-1 rounded-md transition-colors whitespace-nowrap"
                      >
                        証拠を追加
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Decision Support - right 1/3 */}
        {['InReview', 'Exception', 'Approved', 'Rejected', 'Closed'].includes(rfpCase.status) && rec && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">判断支援</h2>

              <div className={`rounded-lg p-3 mb-4 ${
                rec.recommendation === 'Approve'
                  ? 'bg-green-50 border border-green-200'
                  : rec.recommendation === 'Reject'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-amber-50 border border-amber-200'
              }`}>
                <p className={`text-sm font-bold ${
                  rec.recommendation === 'Approve'
                    ? 'text-green-700'
                    : rec.recommendation === 'Reject'
                    ? 'text-red-700'
                    : 'text-amber-700'
                }`}>
                  {rec.recommendation === 'Approve'
                    ? '✓ 推奨: 承認'
                    : rec.recommendation === 'Reject'
                    ? '✗ 推奨: 却下'
                    : '⚠ 追加情報が必要'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  確信度: {Math.round(rec.confidence * 100)}%
                </p>
              </div>

              {rec.reasons.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-600 mb-2">理由</p>
                  <ul className="space-y-1">
                    {rec.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <svg className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {rec.gaps.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">不足事項</p>
                  <ul className="space-y-1">
                    {rec.gaps.map((g, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <svg className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {rfpCase.decision?.confirmedBy && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    確認者: {rfpCase.decision.confirmedBy}
                  </p>
                  {rfpCase.decision.confirmedAt && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(rfpCase.decision.confirmedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Audit Trail */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">監査証跡</h2>
        <AuditTrail entries={rfpCase.auditTrail} />
      </div>

      {/* Evidence Modal */}
      {evidenceModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              証拠書類を追加: {evidenceModal.reqLabel}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  書類名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={evidenceName}
                  onChange={(e) => setEvidenceName(e.target.value)}
                  placeholder="例: 会社概要書_2025版.pdf"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  有効期限 (任意)
                </label>
                <input
                  type="date"
                  value={evidenceValidUntil}
                  onChange={(e) => setEvidenceValidUntil(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={submitEvidence}
                disabled={!evidenceName.trim() || actionLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                {actionLoading ? '追加中...' : '追加する'}
              </button>
              <button
                onClick={closeEvidenceModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exception Modal */}
      {exceptionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-4">例外昇格</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                例外理由 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={exceptionReason}
                onChange={(e) => setExceptionReason(e.target.value)}
                placeholder="例: コンプライアンス審査で追加書類が必要"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={submitException}
                disabled={!exceptionReason.trim() || actionLoading}
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                {actionLoading ? '処理中...' : '例外昇格する'}
              </button>
              <button
                onClick={closeExceptionModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  loading,
  disabled,
  color,
  title,
}: {
  label: string;
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
  color: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'gray';
  title?: string;
}) {
  const colorMap = {
    blue: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400',
    purple: 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400',
    green: 'bg-green-600 hover:bg-green-700 disabled:bg-green-400',
    red: 'bg-red-600 hover:bg-red-700 disabled:bg-red-400',
    orange: 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300',
    gray: 'bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300',
  };

  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      title={title}
      className={`text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors ${colorMap[color]} disabled:cursor-not-allowed`}
    >
      {loading ? '処理中...' : label}
    </button>
  );
}
