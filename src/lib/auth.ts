import { cookies } from 'next/headers';

/**
 * Get the current user session from cookies
 * @returns User session or null if not authenticated
 */
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('appSession');
    
    if (!sessionCookie) {
      return null;
    }
    
    const session = JSON.parse(sessionCookie.value);
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get the access token for the current user
 * @returns Access token or null if not available
 */
export async function getAccessToken() {
  try {
    const session = await getSession();
    // In Auth0 v4, the access token is in the session
    return session?.accessToken || null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}
