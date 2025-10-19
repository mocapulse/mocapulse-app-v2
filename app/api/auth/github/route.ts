import { NextRequest, NextResponse } from 'next/server';

/**
 * GitHub OAuth Callback Handler
 *
 * This endpoint handles the OAuth callback from GitHub after user authorizes.
 *
 * Flow:
 * 1. User clicks "Connect GitHub" on /verify page
 * 2. User is redirected to GitHub OAuth authorization page
 * 3. User authorizes the app
 * 4. GitHub redirects back to this endpoint with a code
 * 5. We exchange the code for an access token
 * 6. We fetch user data using the token
 * 7. We verify and issue credential
 * 8. Redirect back to /verify with success/error
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/verify?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/verify?error=missing_code', request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    const accessToken = tokenData.access_token;

    // Fetch user data
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await userResponse.json();

    // Store the GitHub connection in session/database
    // For now, redirect with username so client can verify
    const redirectUrl = new URL('/verify', request.url);
    redirectUrl.searchParams.set('github_connected', 'true');
    redirectUrl.searchParams.set('github_username', userData.login);

    // In production, you would:
    // 1. Store the access token securely
    // 2. Verify the user's GitHub account
    // 3. Issue a credential via AIR Kit
    // 4. Associate with the user's wallet address

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return NextResponse.redirect(
      new URL(
        `/verify?error=${encodeURIComponent(error instanceof Error ? error.message : 'unknown_error')}`,
        request.url
      )
    );
  }
}

/**
 * Initiate GitHub OAuth Flow
 *
 * This endpoint initiates the GitHub OAuth flow by redirecting to GitHub's authorization page.
 *
 * Usage: Redirect user to /api/auth/github/authorize?userId={userId}
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Generate state parameter for CSRF protection
    const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');

    // Build GitHub OAuth URL
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID || '');
    githubAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github`);
    githubAuthUrl.searchParams.set('scope', 'read:user user:email');
    githubAuthUrl.searchParams.set('state', state);

    return NextResponse.json({ authUrl: githubAuthUrl.toString() });
  } catch (error) {
    console.error('Failed to initiate GitHub OAuth:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initiate OAuth' },
      { status: 500 }
    );
  }
}
