import { NextRequest, NextResponse } from 'next/server';
import { getCase, updateCase } from '@/lib/store';
import { computeDecisionRecommendation } from '@/lib/rules';
import { CaseStatus } from '@/lib/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const rfpCase = getCase(params.id);
  if (!rfpCase) {
    return NextResponse.json({ error: '案件が見つかりません' }, { status: 404 });
  }

  const recommendation = computeDecisionRecommendation(rfpCase);
  return NextResponse.json({ ...rfpCase, _recommendation: recommendation });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const rfpCase = getCase(params.id);
  if (!rfpCase) {
    return NextResponse.json({ error: '案件が見つかりません' }, { status: 404 });
  }

  const body = await request.json() as {
    status?: CaseStatus;
    exceptionReason?: string;
    confirmedBy?: string;
    [key: string]: unknown;
  };
  const { status, exceptionReason, confirmedBy, ...rest } = body;

  let updates: Parameters<typeof updateCase>[1] = { ...rest };
  let auditActor = confirmedBy ?? 'ユーザー';
  let auditAction = 'StatusChanged';
  let auditDetail = '';

  if (status) {
    const prevStatus = rfpCase.status;
    auditDetail = `${prevStatus} → ${status}`;
    updates.status = status;

    if (status === 'InReview') {
      const recommendation = computeDecisionRecommendation(rfpCase);
      updates.decision = { ...rfpCase.decision, recommendation };
    }

    if (status === 'Approved') {
      if (!confirmedBy) {
        return NextResponse.json({ error: 'confirmedBy が必要です' }, { status: 400 });
      }
      updates.decision = {
        ...rfpCase.decision,
        recommendation: rfpCase.decision?.recommendation ?? computeDecisionRecommendation(rfpCase),
        confirmedBy,
        confirmedAt: new Date().toISOString(),
        outcome: 'Approved',
      };
    }

    if (status === 'Rejected') {
      if (!confirmedBy) {
        return NextResponse.json({ error: 'confirmedBy が必要です' }, { status: 400 });
      }
      updates.decision = {
        ...rfpCase.decision,
        recommendation: rfpCase.decision?.recommendation ?? computeDecisionRecommendation(rfpCase),
        confirmedBy,
        confirmedAt: new Date().toISOString(),
        outcome: 'Rejected',
      };
    }

    if (status === 'Exception') {
      if (!exceptionReason) {
        return NextResponse.json({ error: 'exceptionReason が必要です' }, { status: 400 });
      }
      updates.exceptionReason = exceptionReason;
      auditAction = 'ExceptionRaised';
      auditDetail = `Exception昇格: ${exceptionReason}`;
    }

    if (status === 'Closed') {
      auditDetail = `${prevStatus} → Closed`;
    }
  }

  const updated = updateCase(params.id, updates, auditActor, auditAction, auditDetail || '更新しました');
  if (!updated) {
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
  }

  return NextResponse.json(updated);
}
