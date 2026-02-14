import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    // Redirect to dashboard - the client will handle the code exchange
    return NextResponse.redirect(`${origin}/dashboard?code=${code}`)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
