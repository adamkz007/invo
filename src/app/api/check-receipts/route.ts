import { NextResponse } from 'next/server';
import { receipts } from '../receipts/route';

export async function GET() {
  return NextResponse.json({
    count: receipts.length,
    receipts: receipts
  });
}