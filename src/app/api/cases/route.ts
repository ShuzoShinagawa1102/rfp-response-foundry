import { NextRequest, NextResponse } from 'next/server';
import { getCases, createCase } from '@/lib/store';

export async function GET() {
  const cases = getCases().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  return NextResponse.json(cases);
}

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    title: string;
    account: string;
    issuer: string;
    dealValue: number;
    dueDate: string;
    owner: string;
  };

  const { title, account, issuer, dealValue, dueDate, owner } = body;
  if (!title || !account || !issuer || !dealValue || !dueDate || !owner) {
    return NextResponse.json({ error: '必須フィールドが不足しています' }, { status: 400 });
  }

  const newCase = createCase({ title, account, issuer, dealValue, dueDate, owner });
  return NextResponse.json(newCase, { status: 201 });
}
