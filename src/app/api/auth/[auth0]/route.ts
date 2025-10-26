/**
 * Auth0 Authentication Routes
 * Manual implementation for Next.js App Router
 * Routes: /api/auth/login, /api/auth/logout, /api/auth/callback, /api/auth/me
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncUserToDatabase } from '@/lib/userSync';

// Configuration
const BASE_URL = process.env.AUTH0_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
const AUTH0_DOMAIN = process.env.AUTH0_ISSUER_BASE_URL?.replace(/^https?:\/\//, '').replace(/\/$/, '');
const CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ auth0: string }> }
) {
  const { auth0: route } = await params;

  switch (route) {
    case 'login': {
      // Redirect to Auth0 Universal Login
      const loginUrl = new URL(`https://${AUTH0_DOMAIN}/authorize`);
      loginUrl.searchParams.set('response_type', 'code');
      loginUrl.searchParams.set('client_id', CLIENT_ID!);
      loginUrl.searchParams.set('redirect_uri', `${BASE_URL}/api/auth/callback`);
      loginUrl.searchParams.set('scope', 'openid profile email');
      loginUrl.searchParams.set('audience', process.env.AUTH0_AUDIENCE || '');
      
      return NextResponse.redirect(loginUrl.toString());
    }

    case 'logout': {
      // Clear session and redirect to Auth0 logout
      const logoutUrl = new URL(`https://${AUTH0_DOMAIN}/v2/logout`);
      logoutUrl.searchParams.set('client_id', CLIENT_ID!);
      logoutUrl.searchParams.set('returnTo', BASE_URL);
      
      const response = NextResponse.redirect(logoutUrl.toString());
      response.cookies.delete('appSession');
      
      return response;
    }

    case 'callback': {
      try {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          console.error('Auth0 error:', error);
          return NextResponse.redirect(`${BASE_URL}?error=${error}`);
        }

        if (!code) {
          return NextResponse.redirect(`${BASE_URL}?error=no_code`);
        }

        // Exchange code for tokens
        const tokenResponse = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            redirect_uri: `${BASE_URL}/api/auth/callback`,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('Token exchange failed:', errorText);
          return NextResponse.redirect(`${BASE_URL}?error=token_failed`);
        }

        const tokens = await tokenResponse.json();

        // Get user info
        const userInfoResponse = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        if (!userInfoResponse.ok) {
          return NextResponse.redirect(`${BASE_URL}?error=userinfo_failed`);
        }

        const user = await userInfoResponse.json();

        // Create session
        const session = {
          user: {
            sub: user.sub,
            name: user.name,
            email: user.email,
            picture: user.picture,
          },
          accessToken: tokens.access_token,
          idToken: tokens.id_token,
        };

        // Sync user to database
        try {
          await syncUserToDatabase(session);
        } catch (dbError) {
          console.error('Database sync error:', dbError);
          // Continue anyway - don't block login
        }

        // Set session cookie
        const response = NextResponse.redirect(`${BASE_URL}/dashboard`);
        response.cookies.set('appSession', JSON.stringify(session), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });

        return response;
      } catch (error) {
        console.error('Callback error:', error);
        return NextResponse.redirect(`${BASE_URL}?error=auth_failed`);
      }
    }

    case 'me': {
      try {
        const sessionCookie = request.cookies.get('appSession');
        if (!sessionCookie) {
          return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const session = JSON.parse(sessionCookie.value);
        return NextResponse.json({ user: session.user });
      } catch (error) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      }
    }

    default:
      return NextResponse.json({ error: 'Invalid auth route' }, { status: 404 });
  }
}
