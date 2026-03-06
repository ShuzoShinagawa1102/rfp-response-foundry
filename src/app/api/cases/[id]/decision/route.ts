import { NextRequest, NextResponse } from 'next/server';
import { getCase, updateCase } from '@/lib/store';
import { computeDecisionRecommendation } from '@/lib/rules';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const rfpCase = getCase(params.id);
  if (!rfpCase) {
    return NextResponse.json({ error: '案件が見つかりません' }, { status: 404 });
  }

  const body = await request.json() as {
    outcome: 'Approved' | 'Rejected';
    confirmedBy: string;
  };

  const { outcome, confirmedBy } = body;
  if (!outcome || !confirmedBy) {
    return NextResponse.json({ error: 'outcome と confirmedBy は必須です' }, { status: 400 });
  }

  const recommendation = rfpCase.decision?.recommendation ?? computeDecisionRecommendation(rfpCase);
  const newStatus = outcome === 'Approved' ? 'Approved' : 'Rejected';

  const updated = updateCase(
    params.id,
    {
      status: newStatus,
      decision: {
        recommendation,
        confirmedBy,
        confirmedAt: new Date().toISOString(),
        outcome,
      },
    },
    confirmedBy,
    'DecisionConfirmed',
    `判断確定: ${outcome}（確認者: ${confirmedBy}）`,
  );

  if (!updated) {
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
  }

  return NextResponse.json(updated);
}
