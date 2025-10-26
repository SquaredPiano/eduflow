import * as Auth0 from '@auth0/nextjs-auth0';
import * as Auth0Server from '@auth0/nextjs-auth0/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const mainExports = Object.keys(Auth0);
  const serverExports = Object.keys(Auth0Server);
  
  console.log('Main Auth0 exports:', mainExports);
  console.log('Server Auth0 exports:', serverExports);
  
  return NextResponse.json({
    mainExports,
    serverExports,
    hasHandleAuth: 'handleAuth' in Auth0,
    hasHandleAuthInServer: 'handleAuth' in Auth0Server,
    auth0Version: '4.11.0'
  });
}