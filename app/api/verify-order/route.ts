import { NextResponse } from 'next/server'

// This route is disabled — was a development debugging tool only
export async function GET() {
  return NextResponse.json({ error: 'Disabled' }, { status: 410 })
}
