/**
 * Auth Page
 * 
 * This page is a placeholder for the Auth0 authentication flow.
 * Users will be redirected to Auth0 for login, then back to the callback.
 */

import { redirect } from 'next/navigation'

export default function AuthPage() {
  // Redirect to Auth0 login
  redirect('/api/auth/login')
}
