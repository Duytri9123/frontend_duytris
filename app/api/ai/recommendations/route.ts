import { NextRequest, NextResponse } from 'next/server'
import type { Product } from '@/types'

export async function POST(_req: NextRequest) {
  // Returns empty array — recommendations require backend integration
  return NextResponse.json([] as Product[])
}
