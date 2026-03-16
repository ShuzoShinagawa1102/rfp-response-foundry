import { RfpCase, DecisionRecommendation } from './types';

export function computeDecisionRecommendation(rfpCase: RfpCase): DecisionRecommendation {
  const gaps: string[] = [];
  const reasons: string[] = [];

  for (const req of rfpCase.requirements.filter((r) => r.required)) {
    const evidence = rfpCase.evidence.find((e) => e.requirementId === req.id);
    if (!evidence) {
      gaps.push(`「${req.label}」が未提出です`);
    } else if (evidence.status === 'expired') {
      gaps.push(`「${req.label}」の証拠書類が期限切れです`);
    } else if (evidence.status === 'rejected') {
      gaps.push(`「${req.label}」の証拠書類が却下されました`);
    }
  }

  const completenessRate = computeCompletenessScore(rfpCase);

  if (gaps.length === 0 && completenessRate >= 100) {
    reasons.push('すべての必要書類が提出済みです');
    reasons.push('証拠書類の有効期限内です');
    return { recommendation: 'Approve', confidence: 0.85, reasons, gaps };
  } else if (gaps.length > 0) {
    reasons.push(`${gaps.length}件の必要書類が不足または無効です`);
    return { recommendation: 'NeedMoreInfo', confidence: 0.9, reasons, gaps };
  } else {
    reasons.push('提出書類に不備があります');
    return { recommendation: 'Reject', confidence: 0.6, reasons, gaps };
  }
}

export function computeCompletenessScore(rfpCase: RfpCase): number {
  const required = rfpCase.requirements.filter((r) => r.required);
  if (required.length === 0) return 100;

  const fulfilled = required.filter((req) => {
    const ev = rfpCase.evidence.find((e) => e.requirementId === req.id);
    return ev && ev.status === 'valid';
  });

  return Math.round((fulfilled.length / required.length) * 100);
}
