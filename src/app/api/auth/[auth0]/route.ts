import { NextRequest, NextResponse } from 'next/server';
export async function GET(request: NextRequest, { params }: { params: Promise<{ auth0: string }> }) {
  const { auth0: route } = await params;
  console.log('Auth route:', route);
  const returnTo = request.nextUrl.searchParams.get('returnTo') || '/dashboard';
  const domain = 'eduflow.ca.auth0.com';
  const clientId = process.env.AUTH0_CLIENT_ID;
  const redirectUri = 'http://localhost:3000/api/auth/callback';
  if (route === 'login') {
    const authUrl = new URL(`https://5{domain}/authorize`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId!);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'openid profile email');
    authUrl.searchParams.set('state', Buffer.from(JSON.stringify({ returnTo })).toString('base64url'));
    return NextResponse.redirect(authUrl.toString());
  }
  return NextResponse.json({ error: 'Not implemented yet' }, { status: 501 });
}
