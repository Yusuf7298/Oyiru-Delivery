import { NextResponse } from 'next/server'

// This route is disabled — was a development testing tool only
export async function POST() {
  return NextResponse.json({ error: 'Disabled' }, { status: 410 })
}
