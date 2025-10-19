import { NextRequest, NextResponse } from 'next/server';

/**
 * Twitter/X OAuth 2.0 Callback Handler
 *
 * This endpoint handles the OAuth callback from Twitter after user authorizes.
 *
 * Flow:
 * 1. User clicks "Connect Twitter" on /verify page
 * 2. User is redirected to Twitter OAuth authorization page
 * 3. User authorizes the app
 * 4. Twitter redirects back to this endpoint with a code
 * 5. We exchange the code for an access token
 * 6. We fetch user data using the token
 * 7. We verify and issue credential
 * 8. Redirect back to /verify with success/error
 *
 * Note: This uses Twitter OAuth 2.0 (not 1.0a)
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
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter`,
        code_verifier: 'challenge', // In production, store and retrieve the code_verifier
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Twitter token exchange error:', errorData);
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user data
    const userResponse = await fetch(
      'https://api.twitter.com/2/users/me?user.fields=created_at,description,public_metrics,verified',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await userResponse.json();
    const user = userData.data;

    // Store the Twitter connection in session/database
    // For now, redirect with username so client can verify
    const redirectUrl = new URL('/verify', request.url);
    redirectUrl.searchParams.set('twitter_connected', 'true');
    redirectUrl.searchParams.set('twitter_username', user.username);

    // In production, you would:
    // 1. Store the access token securely
    // 2. Verify the user's Twitter account
    // 3. Issue a credential via AIR Kit
    // 4. Associate with the user's wallet address

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Twitter OAuth error:', error);
    return NextResponse.redirect(
      new URL(
        `/verify?error=${encodeURIComponent(error instanceof Error ? error.message : 'unknown_error')}`,
        request.url
      )
    );
  }
}

/**
 * Initiate Twitter OAuth Flow
 *
 * This endpoint initiates the Twitter OAuth 2.0 flow.
 *
 * Usage: POST to /api/auth/twitter with { userId: string }
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

    // Generate code challenge for PKCE
    const codeVerifier = 'challenge'; // In production, generate random string and store it
    const codeChallenge = codeVerifier; // In production, hash the code_verifier

    // Build Twitter OAuth URL
    const twitterAuthUrl = new URL('https://twitter.com/i/oauth2/authorize');
    twitterAuthUrl.searchParams.set('response_type', 'code');
    twitterAuthUrl.searchParams.set('client_id', process.env.TWITTER_CLIENT_ID || '');
    twitterAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter`);
    twitterAuthUrl.searchParams.set('scope', 'tweet.read users.read');
    twitterAuthUrl.searchParams.set('state', state);
    twitterAuthUrl.searchParams.set('code_challenge', codeChallenge);
    twitterAuthUrl.searchParams.set('code_challenge_method', 'plain');

    return NextResponse.json({ authUrl: twitterAuthUrl.toString() });
  } catch (error) {
    console.error('Failed to initiate Twitter OAuth:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initiate OAuth' },
      { status: 500 }
    );
  }
}
