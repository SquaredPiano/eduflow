import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Extract domain from issuer base URL (e.g., https://dev-xxx.us.auth0.com -> dev-xxx.us.auth0.com)
const domain = process.env.AUTH0_ISSUER_BASE_URL?.replace(/^https?:\/\//, '') || ''

export const auth0 = new Auth0Client({
  domain,
  appBaseUrl: process.env.AUTH0_BASE_URL,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
});
