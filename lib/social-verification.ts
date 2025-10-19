/**
 * Social Platform Verification Library
 * Handles verification of user accounts across various social platforms
 * to establish identity and content quality credentials
 */

export type SocialPlatform =
  | 'github'
  | 'twitter'
  | 'lens'
  | 'farcaster'
  | 'mirror'
  | 'linkedin'
  | 'link3';

export interface VerificationResult {
  platform: SocialPlatform;
  verified: boolean;
  accountData?: any;
  qualityScore?: number; // 0-100
  timestamp: string;
  error?: string;
}

export interface SocialAccountData {
  platform: SocialPlatform;
  username: string;
  accountCreatedAt?: string;
  profileUrl?: string;
  isVerified: boolean;
  qualityMetrics: QualityMetrics;
}

export interface QualityMetrics {
  accountAge?: number; // in days
  followersCount?: number;
  followingCount?: number;
  contentCount?: number; // repos, tweets, posts, etc.
  engagementRate?: number; // 0-100
  activityScore?: number; // 0-100
  [key: string]: any; // platform-specific metrics
}

/**
 * GitHub Verification
 * Verifies technical expertise through GitHub activity
 */
export interface GitHubVerificationData {
  username: string;
  accountCreatedAt: string;
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  contributions: {
    last12Months: number;
    currentStreak: number;
  };
  topLanguages: string[];
  hasRealActivity: boolean; // determined by commit patterns
}

export const verifyGitHub = async (
  githubUsername: string
): Promise<VerificationResult> => {
  try {
    // Fetch user data from GitHub API
    const userResponse = await fetch(`https://api.github.com/users/${githubUsername}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        // Add GitHub token if available for higher rate limits
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`
        })
      }
    });

    if (!userResponse.ok) {
      throw new Error('GitHub user not found');
    }

    const userData = await userResponse.json();

    // Fetch repositories to calculate quality metrics
    const reposResponse = await fetch(
      `https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=updated`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          ...(process.env.GITHUB_TOKEN && {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`
          })
        }
      }
    );

    const repos = await reposResponse.json();

    // Calculate total stars across all repos
    const totalStars = repos.reduce((sum: number, repo: any) => sum + (repo.stargazers_count || 0), 0);

    // Determine primary languages
    const languages = repos
      .filter((repo: any) => repo.language)
      .map((repo: any) => repo.language);
    const topLanguages = [...new Set(languages)].slice(0, 5);

    // Calculate account age in days
    const accountAge = Math.floor(
      (Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate quality score (0-100)
    let qualityScore = 0;

    // Account age factor (max 20 points)
    qualityScore += Math.min(accountAge / 365 * 20, 20);

    // Repository count (max 20 points)
    qualityScore += Math.min(userData.public_repos / 20 * 20, 20);

    // Stars received (max 30 points)
    qualityScore += Math.min(totalStars / 100 * 30, 30);

    // Followers (max 15 points)
    qualityScore += Math.min(userData.followers / 100 * 15, 15);

    // Has real activity (max 15 points)
    const hasRealActivity = userData.public_repos > 0 && repos.some((r: any) => !r.fork);
    qualityScore += hasRealActivity ? 15 : 0;

    const verificationData: GitHubVerificationData = {
      username: userData.login,
      accountCreatedAt: userData.created_at,
      publicRepos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
      totalStars,
      contributions: {
        last12Months: 0, // Would need GitHub GraphQL API for this
        currentStreak: 0
      },
      topLanguages,
      hasRealActivity
    };

    return {
      platform: 'github',
      verified: true,
      accountData: verificationData,
      qualityScore: Math.round(qualityScore),
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      platform: 'github',
      verified: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Lens Protocol Verification
 * Verifies Web3 social presence and content quality
 */
export interface LensVerificationData {
  handle: string;
  profileId: string;
  ownedBy: string; // wallet address
  totalFollowers: number;
  totalFollowing: number;
  totalPosts: number;
  totalComments: number;
  totalMirrors: number;
  hasNFTPicture: boolean;
}

export const verifyLensProfile = async (
  handleOrProfileId: string
): Promise<VerificationResult> => {
  try {
    // Lens Protocol API endpoint
    const LENS_API = 'https://api-v2.lens.dev';

    // Query to fetch profile by handle
    const query = `
      query Profile($request: ProfileRequest!) {
        profile(request: $request) {
          id
          handle {
            fullHandle
            localName
          }
          ownedBy {
            address
          }
          stats {
            followers
            following
            posts
            comments
            mirrors
            publications
          }
          metadata {
            picture {
              ... on NftImage {
                uri
              }
            }
          }
        }
      }
    `;

    const variables = {
      request: {
        forHandle: handleOrProfileId.startsWith('lens/')
          ? handleOrProfileId
          : `lens/${handleOrProfileId}`
      }
    };

    const response = await fetch(LENS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables })
    });

    const result = await response.json();

    if (result.errors || !result.data?.profile) {
      throw new Error('Lens profile not found');
    }

    const profile = result.data.profile;
    const stats = profile.stats;

    // Calculate quality score
    let qualityScore = 0;

    // Follower count (max 30 points)
    qualityScore += Math.min(stats.followers / 1000 * 30, 30);

    // Publication count (max 30 points)
    qualityScore += Math.min(stats.publications / 100 * 30, 30);

    // Engagement (mirrors + comments, max 25 points)
    const engagement = stats.mirrors + stats.comments;
    qualityScore += Math.min(engagement / 50 * 25, 25);

    // Has NFT picture (quality signal, 15 points)
    const hasNFTPicture = !!profile.metadata?.picture?.uri;
    qualityScore += hasNFTPicture ? 15 : 0;

    const verificationData: LensVerificationData = {
      handle: profile.handle.fullHandle,
      profileId: profile.id,
      ownedBy: profile.ownedBy.address,
      totalFollowers: stats.followers,
      totalFollowing: stats.following,
      totalPosts: stats.posts,
      totalComments: stats.comments,
      totalMirrors: stats.mirrors,
      hasNFTPicture
    };

    return {
      platform: 'lens',
      verified: true,
      accountData: verificationData,
      qualityScore: Math.round(qualityScore),
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      platform: 'lens',
      verified: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Farcaster Verification
 * Verifies Web3 developer community presence
 */
export interface FarcasterVerificationData {
  fid: number; // Farcaster ID
  username: string;
  displayName: string;
  pfpUrl?: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
  activeOnFarcasterSince?: string;
  hasPowerBadge: boolean;
}

export const verifyFarcaster = async (
  username: string
): Promise<VerificationResult> => {
  try {
    // Use Neynar API (public Farcaster data provider)
    const NEYNAR_API = 'https://api.neynar.com/v2/farcaster';

    // Note: In production, you'd need a Neynar API key
    const response = await fetch(
      `${NEYNAR_API}/user/by_username?username=${username}`,
      {
        headers: {
          'Accept': 'application/json',
          ...(process.env.NEYNAR_API_KEY && {
            'api_key': process.env.NEYNAR_API_KEY
          })
        }
      }
    );

    if (!response.ok) {
      throw new Error('Farcaster user not found');
    }

    const data = await response.json();
    const user = data.result?.user;

    if (!user) {
      throw new Error('Farcaster user data not found');
    }

    // Calculate quality score
    let qualityScore = 0;

    // Power badge (highly curated, 40 points)
    qualityScore += user.power_badge ? 40 : 0;

    // Follower count (max 30 points)
    qualityScore += Math.min(user.follower_count / 500 * 30, 30);

    // Activity (has bio and pfp, 15 points each)
    qualityScore += user.bio ? 15 : 0;
    qualityScore += user.pfp_url ? 15 : 0;

    const verificationData: FarcasterVerificationData = {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      bio: user.bio,
      followerCount: user.follower_count,
      followingCount: user.following_count,
      activeOnFarcasterSince: user.active_on_fc_since,
      hasPowerBadge: user.power_badge || false
    };

    return {
      platform: 'farcaster',
      verified: true,
      accountData: verificationData,
      qualityScore: Math.round(qualityScore),
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      platform: 'farcaster',
      verified: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Twitter/X Verification
 * Verifies social presence and Web3 community involvement
 */
export interface TwitterVerificationData {
  username: string;
  displayName: string;
  accountCreatedAt: string;
  followersCount: number;
  followingCount: number;
  tweetCount: number;
  isVerified: boolean; // blue checkmark
  description?: string;
}

export const verifyTwitter = async (
  username: string
): Promise<VerificationResult> => {
  try {
    // Note: This requires Twitter API v2 credentials
    // In a real implementation, this would be done server-side via OAuth

    const response = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}?user.fields=created_at,description,public_metrics,verified`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        }
      }
    );

    if (!response.ok) {
      throw new Error('Twitter user not found');
    }

    const data = await response.json();
    const user = data.data;

    // Calculate account age
    const accountAge = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate quality score
    let qualityScore = 0;

    // Account age (max 20 points)
    qualityScore += Math.min(accountAge / 365 * 20, 20);

    // Verified status (30 points)
    qualityScore += user.verified ? 30 : 0;

    // Followers (max 25 points)
    qualityScore += Math.min(user.public_metrics.followers_count / 1000 * 25, 25);

    // Tweet count / activity (max 15 points)
    qualityScore += Math.min(user.public_metrics.tweet_count / 1000 * 15, 15);

    // Has description (10 points)
    qualityScore += user.description ? 10 : 0;

    const verificationData: TwitterVerificationData = {
      username: user.username,
      displayName: user.name,
      accountCreatedAt: user.created_at,
      followersCount: user.public_metrics.followers_count,
      followingCount: user.public_metrics.following_count,
      tweetCount: user.public_metrics.tweet_count,
      isVerified: user.verified || false,
      description: user.description
    };

    return {
      platform: 'twitter',
      verified: true,
      accountData: verificationData,
      qualityScore: Math.round(qualityScore),
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      platform: 'twitter',
      verified: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Mirror Verification
 * Verifies long-form content writing ability (critical for quality test reports)
 */
export interface MirrorVerificationData {
  ensName?: string;
  address: string;
  articleCount: number;
  totalCollects: number;
  articles: Array<{
    title: string;
    digest: string;
    publishedAt: string;
    collectCount: number;
  }>;
}

export const verifyMirror = async (
  ensNameOrAddress: string
): Promise<VerificationResult> => {
  try {
    // Mirror uses The Graph for queries
    // This is a simplified version - you'd need to query the Mirror subgraph

    // For now, returning a placeholder structure
    // In production, query: https://mirror.xyz/api/graphql

    return {
      platform: 'mirror',
      verified: false,
      timestamp: new Date().toISOString(),
      error: 'Mirror verification requires subgraph integration - coming soon'
    };

  } catch (error) {
    return {
      platform: 'mirror',
      verified: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Calculate overall reputation score from all verified platforms
 */
export const calculateOverallReputation = (
  verifications: VerificationResult[]
): number => {
  const verifiedPlatforms = verifications.filter(v => v.verified);

  if (verifiedPlatforms.length === 0) return 0;

  // Weight different platforms differently
  const platformWeights: Record<SocialPlatform, number> = {
    github: 2.0,      // Highest weight - proves technical ability
    lens: 1.5,        // Web3 native
    farcaster: 1.5,   // Web3 builder community
    mirror: 1.3,      // Writing ability
    twitter: 1.0,     // General social
    linkedin: 1.2,    // Professional background
    link3: 1.0
  };

  let totalScore = 0;
  let totalWeight = 0;

  for (const verification of verifiedPlatforms) {
    const weight = platformWeights[verification.platform] || 1.0;
    const score = verification.qualityScore || 0;

    totalScore += score * weight;
    totalWeight += weight;
  }

  return Math.round(totalScore / totalWeight);
};

/**
 * Get user's verified platforms
 */
export const getUserVerifications = async (
  userId: string
): Promise<VerificationResult[]> => {
  try {
    // In production, this would query your database or AIR Kit
    // For now, using localStorage as fallback
    const stored = localStorage.getItem(`verifications_${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get user verifications:', error);
    return [];
  }
};

/**
 * Store user verification
 */
export const storeVerification = async (
  userId: string,
  verification: VerificationResult
): Promise<void> => {
  try {
    const existing = await getUserVerifications(userId);
    const updated = existing.filter(v => v.platform !== verification.platform);
    updated.push(verification);

    localStorage.setItem(`verifications_${userId}`, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to store verification:', error);
    throw error;
  }
};
