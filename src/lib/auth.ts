import { auth0 } from './auth0';

/**
 * Get the current user session
 * @returns User session or null if not authenticated
 */
export async function getSession() {
  try {
    return await auth0.getSession();
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
    const tokenResponse = await auth0.getAccessToken();
    return tokenResponse?.token || null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}
