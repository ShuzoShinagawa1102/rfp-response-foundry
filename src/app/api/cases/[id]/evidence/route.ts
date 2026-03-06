import { NextRequest, NextResponse } from 'next/server';
import { getCase, addEvidence } from '@/lib/store';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const rfpCase = getCase(params.id);
  if (!rfpCase) {
    return NextResponse.json({ error: '案件が見つかりません' }, { status: 404 });
  }

  const body = await request.json() as {
    requirementId: string;
    name: string;
    validUntil?: string;
  };

  const { requirementId, name, validUntil } = body;
  if (!requirementId || !name) {
    return NextResponse.json({ error: 'requirementId と name は必須です' }, { status: 400 });
  }

  const req = rfpCase.requirements.find((r) => r.id === requirementId);
  if (!req) {
    return NextResponse.json({ error: '要件IDが存在しません' }, { status: 400 });
  }

  const updated = addEvidence(params.id, { requirementId, name, validUntil });
  if (!updated) {
    return NextResponse.json({ error: '証拠追加に失敗しました' }, { status: 500 });
  }

  return NextResponse.json(updated, { status: 201 });
}
