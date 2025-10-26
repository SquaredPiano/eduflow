/**
 * Auth0 API Routes
 * 
 * Handles authentication routes using Auth0
 * Simplified to avoid redirect loops
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncUserToDatabase } from '@/lib/userSync';

// Remove trailing slash from base URL
const BASE_URL = process.env.AUTH0_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
const AUTH0_DOMAIN = process.env.AUTH0_ISSUER_BASE_URL?.replace(/^https?:\/\//, '').replace(/\/$/, '') || '';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ auth0: string }> }
) {
  const { auth0: route } = await params;

  try {
    switch (route) {
      case 'login': {
        // Redirect to Auth0 Universal Login
        const loginUrl = new URL(`https://${AUTH0_DOMAIN}/authorize`);
        loginUrl.searchParams.set('response_type', 'code');
        loginUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!);
        loginUrl.searchParams.set('redirect_uri', `${BASE_URL}/api/auth/callback`);
        loginUrl.searchParams.set('scope', 'openid profile email');
        
        console.log('Redirecting to Auth0:', loginUrl.toString());
        return NextResponse.redirect(loginUrl.toString());
      }
      
      case 'logout': {
        // Clear session and redirect to Auth0 logout
        const logoutUrl = new URL(`https://${AUTH0_DOMAIN}/v2/logout`);
        logoutUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!);
        logoutUrl.searchParams.set('returnTo', BASE_URL);
        
        // Create response that clears the session cookie
        const response = NextResponse.redirect(logoutUrl.toString());
        response.cookies.delete('appSession');
        
        return response;
      }
      
      case 'callback': {
        // Exchange code for tokens
        try {
          const url = new URL(request.url);
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');
          const errorDescription = url.searchParams.get('error_description');
          
          if (error) {
            console.error('Auth0 error:', error, errorDescription);
            return NextResponse.redirect(`${BASE_URL}?error=${error}`);
          }
          
          if (!code) {
            console.error('No code provided in callback');
            return NextResponse.redirect(`${BASE_URL}?error=no_code`);
          }

          console.log('Exchanging code for tokens...');
          
          // Exchange the code for tokens
          const tokenUrl = `https://${AUTH0_DOMAIN}/oauth/token`;
          const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              grant_type: 'authorization_code',
              client_id: process.env.AUTH0_CLIENT_ID,
              client_secret: process.env.AUTH0_CLIENT_SECRET,
              code,
              redirect_uri: `${BASE_URL}/api/auth/callback`,
            }),
          });

          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Token exchange failed:', errorText);
            return NextResponse.redirect(`${BASE_URL}?error=token_exchange_failed`);
          }

          const tokens = await tokenResponse.json();
          console.log('Token exchange successful');
          
          // Get user info
          const userInfoResponse = await fetch(
            `https://${AUTH0_DOMAIN}/userinfo`,
            {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
              },
            }
          );

          if (!userInfoResponse.ok) {
            console.error('Failed to get user info');
            return NextResponse.redirect(`${BASE_URL}?error=userinfo_failed`);
          }

          const user = await userInfoResponse.json();
          console.log('Got user info:', user.email);

          // Create session object
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
            console.log('User synced to database');
          } catch (dbError) {
            console.error('Database sync error:', dbError);
            // Continue anyway - don't block login
          }

          // Create session cookie manually
          const response = NextResponse.redirect(`${BASE_URL}/dashboard`);
          
          // Set session cookie (simplified - in production use encrypted sessions)
          response.cookies.set('appSession', JSON.stringify(session), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
          });

          console.log('Session created, redirecting to dashboard');
          return response;
        } catch (error) {
          console.error('Callback error:', error);
          return NextResponse.redirect(`${BASE_URL}?error=callback_failed`);
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
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
  }
}
