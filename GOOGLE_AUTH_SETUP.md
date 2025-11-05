# Google Authentication Setup

This guide explains how to set up Google OAuth authentication for the Bosbase Next.js application.

## Prerequisites

- A Google Cloud Platform account
- Access to Google Cloud Console

## Step 1: Create OAuth 2.0 Credentials in Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace account)
   - Fill in the required information:
     - App name
     - User support email
     - Developer contact information
   - Add scopes (at minimum, you'll need `email` and `profile`)
   - Add test users if your app is in testing mode

6. Configure the OAuth client:
   - Application type: **Web application**
   - Name: Give it a descriptive name (e.g., "Bosbase Next.js App")
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)

7. Click **Create**
8. Copy the **Client ID** and **Client Secret** - you'll need these for your environment variables

## Step 2: Configure Environment Variables

Add the following environment variables to your `.env.local` or `.env` file:

```bash
# NextAuth Configuration
AUTH_SECRET=your-secret-key-here
AUTH_TRUST_HOST=true

# Google OAuth Credentials
AUTH_GOOGLE_ID=your-google-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your-google-client-secret

# Optional: For production, you may want to set AUTH_TRUST_HOST explicitly
# AUTH_TRUST_HOST=true
```

### Generating AUTH_SECRET

You can generate a secure secret using one of these methods:

**Using OpenSSL:**
```bash
openssl rand -base64 32
```

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Using an online generator:**
- Visit: https://generate-secret.vercel.app/32

## Step 3: Verify the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/auth/signin` in your browser

3. Click the "Continue with Google" button

4. You should be redirected to Google's OAuth consent screen

5. After authorizing, you should be redirected back to your application and logged in

## Troubleshooting

### Error: "redirect_uri_mismatch"

- Make sure the redirect URI in your Google Cloud Console matches exactly:
  - For development: `http://localhost:3000/api/auth/callback/google`
  - For production: `https://yourdomain.com/api/auth/callback/google`
- Note: The port number must match your development server port

### Error: "invalid_client"

- Verify that `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set correctly in your `.env` file
- Make sure there are no extra spaces or quotes around the values
- Restart your development server after changing environment variables

### Error: "access_denied"

- Check your OAuth consent screen configuration
- If your app is in testing mode, make sure you've added test users
- Verify that the required scopes (email, profile) are added

### Session not persisting

- Make sure `AUTH_SECRET` is set and is a secure random string
- Check that cookies are enabled in your browser
- Verify `AUTH_TRUST_HOST` is set correctly for your environment

## Production Deployment

For production deployment:

1. Update your Google Cloud Console OAuth client with production URLs:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com/api/auth/callback/google`

2. Set environment variables in your hosting platform:
   - Vercel: Add them in Project Settings > Environment Variables
   - Other platforms: Follow their documentation for setting environment variables

3. Ensure `AUTH_TRUST_HOST` is set appropriately:
   - For Vercel: `AUTH_TRUST_HOST=true`
   - For other platforms: Check NextAuth documentation

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

