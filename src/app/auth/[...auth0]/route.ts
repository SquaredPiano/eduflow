import * as Auth0 from '@auth0/nextjs-auth0';
import * as Auth0Server from '@auth0/nextjs-auth0/server';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    mainExports: Object.keys(Auth0),
    serverExports: Object.keys(Auth0Server),
    hasHandleAuth: 'handleAuth' in Auth0,
    hasHandleAuthInServer: 'handleAuth' in Auth0Server
  });
}
