# MocaPulse Verification System

Complete guide to the age verification and social platform integration system built with MOCA Network AIR Kit.

## Overview

This system enables users to:
1. **Verify their age (18+)** using MOCA AIR Kit's zero-knowledge proofs (privacy-preserving)
2. **Connect social accounts** (GitHub, Lens, Farcaster, Twitter/X) to prove identity and expertise
3. **Earn verifiable credentials** stored on-chain via MOCA Network
4. **Build reputation scores** based on verified accounts and activity
5. **Unlock opportunities** - age verification is required to apply for testing projects

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
│  /verify page  |  /projects/[id]/apply  |  Profile badges   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Application Logic Layer                    │
│  lib/credentials.ts  |  lib/social-verification.ts          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Integration Layer                         │
│  MOCA AIR Kit  |  GitHub API  |  Lens API  |  Farcaster     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Storage Layer                            │
│  On-chain (MOCA Network)  |  localStorage (dev fallback)    │
└─────────────────────────────────────────────────────────────┘
```

## Features

### 🛡️ Age Verification (18+)

**Technology**: MOCA AIR Kit Zero-Knowledge Proofs + Document Upload

**Two Verification Methods**:

**Method 1: Zero-Knowledge Proofs** (For users with existing credentials)
- User proves they are 18+ without revealing actual birthdate
- Uses cryptographic ZK proofs - mathematically verifiable, privacy-preserving
- Credential is verified on MOCA Network blockchain
- Instant verification (no document upload)

**Method 2: Document Upload** (For first-time users)
- User uploads government-issued ID (passport, driver's license, or national ID)
- System extracts birthdate without storing document
- Age credential is issued to AIR wallet
- Document is immediately discarded (privacy-preserving)

**How it works**:
1. User chooses verification method
2. If ZK Proof: Uses existing age credential from AIR wallet
3. If Document: Uploads ID → Enters birthdate → System verifies age >= 18 → Credential issued
4. Required to apply for testing projects

**Files**:
- `lib/credentials.ts` - `verifyAge()`, `verifyAgeWithDocument()`, `hasAgeVerification()`
- `lib/document-verification.ts` - Document processing and age calculation
- `app/verify/page.tsx` - Age verification UI with two methods
- `app/api/verify-age-document/route.ts` - Document upload API
- `components/document-upload.tsx` - Document upload component
- `components/verification-method-selector.tsx` - Method selection UI
- `app/projects/[id]/apply/page.tsx` - Age check enforcement

### 🔗 Social Platform Verification

#### Tier 1 - Highest Priority

**1. GitHub** (Technical Expertise)
- Verifies: Account age, repositories, stars, contributions
- Quality indicators: Code quality, community engagement
- Weight: 2.0x (highest)
- API: GitHub REST API v3
- File: `lib/social-verification.ts` - `verifyGitHub()`

**2. Lens Protocol** (Web3 Social)
- Verifies: Publications, followers, engagement
- Quality indicators: Content quality, community size
- Weight: 1.5x
- API: Lens Protocol API v2
- File: `lib/social-verification.ts` - `verifyLensProfile()`

**3. Farcaster** (Web3 Builder Community)
- Verifies: Power Badge, followers, casts
- Quality indicators: Builder reputation, community standing
- Weight: 1.5x
- API: Neynar API (Farcaster data provider)
- File: `lib/social-verification.ts` - `verifyFarcaster()`

#### Tier 2 - High Value

**4. Mirror** (Long-form Content)
- Verifies: Published articles, collects/mints
- Quality indicators: Writing ability (important for test reports!)
- Weight: 1.3x
- API: The Graph (Mirror subgraph)
- Status: Placeholder implemented, needs subgraph integration

**5. Twitter/X** (Social Presence)
- Verifies: Account age, followers, verification status
- Quality indicators: Community engagement
- Weight: 1.0x
- API: Twitter API v2
- File: `lib/social-verification.ts` - `verifyTwitter()`

### 📊 Reputation Scoring

**Overall Score Calculation**:
```
Overall Score = Σ(Platform Quality Score × Platform Weight) / Σ(Platform Weight)
```

**Platform Quality Scores** (0-100):
- Each platform has custom scoring logic
- Example (GitHub):
  - Account age: max 20 points
  - Repository count: max 20 points
  - Stars received: max 30 points
  - Followers: max 15 points
  - Real activity: max 15 points

**File**: `lib/social-verification.ts` - `calculateOverallReputation()`

## Setup Instructions

### 1. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env.local
```

### 2. MOCA Network Setup

Required for age verification and credential issuance.

1. Sign up at [MOCA Network](https://moca.network)
2. Get your Partner ID from the developer dashboard
3. Get your Issuer DID and Verifier DID
4. Add to `.env.local`:

```env
NEXT_PUBLIC_MOCA_PARTNER_ID=your_partner_id
NEXT_PUBLIC_MOCA_BUILD_ENV=sandbox
NEXT_PUBLIC_MOCA_ISSUER_DID=did:moca:your_issuer_did
NEXT_PUBLIC_MOCA_VERIFIER_DID=did:moca:your_verifier_did
```

**Resources**:
- [MOCA Network Docs](https://docs.moca.network)
- [AIR Kit Guide](https://moca.network/blog/what-is-air-kit/)
- [ZK Proofs Explained](https://moca.network/blog/what-is-zero-knowledge-proof/)

### 3. Get Age Verification Program ID

**CRITICAL**: Required for ZK Proof age verification to work.

#### Option A: MOCA Network Partner Dashboard

1. **Login** to MOCA Network Partner Dashboard
   - URL: https://partner.moca.network (or equivalent)
   - Use your partner account credentials

2. **Navigate to Credential Programs**
   - Look for "Credential Programs", "Verification Programs", or "AIR Programs" section
   - Click "Create New Program" or "Add Program"

3. **Create Age Verification Program**
   ```
   Program Name: Age Verification (18+)
   Program Type: Age Verification
   Verification Method: Zero-Knowledge Proof
   Minimum Age: 18
   Credential Schema: Standard Age Credential
   Privacy Level: Maximum (ZK Proofs)
   ```

4. **Copy Program ID**
   - After creation, you'll receive a `programId` (e.g., `age-verify-18-prod`)
   - This is typically in format: `[purpose]-[requirement]-[environment]`

5. **Add to .env.local**:
   ```env
   NEXT_PUBLIC_MOCA_AGE_VERIFICATION_PROGRAM_ID=age-verify-18-prod
   ```

#### Option B: Contact MOCA Support

If you can't find the dashboard option or need assistance:

1. **Email MOCA Developer Support**
   - Email: developers@moca.network or support@moca.network
   - Subject: "Request Age Verification Program ID"

2. **Include in Your Request**:
   ```
   Partner ID: [YOUR_PARTNER_ID]
   Purpose: Age verification (18+) for testing platform
   Required verification: Zero-knowledge proof
   Environment: Sandbox (for development) or Production
   ```

3. **Expected Response**:
   - They will provide your `programId`
   - May include additional configuration instructions
   - Typical response time: 1-2 business days

#### Option C: Use Developer Documentation

1. **Check MOCA Docs** for programId setup:
   - Visit: https://docs.moca.network
   - Look for: "AIR Kit" → "Credential Programs" → "Age Verification"
   - Follow the setup wizard

2. **Alternative Docs Paths**:
   - https://docs.moca.network/air-kit/credentials
   - https://docs.moca.network/developers/programs
   - Check `/llms.txt` or `/llms-full.txt` for detailed guides

#### Troubleshooting Program ID Issues

**Error: "Program ID not configured"**
- Check `.env.local` has `NEXT_PUBLIC_MOCA_AGE_VERIFICATION_PROGRAM_ID`
- Restart development server after adding environment variable
- Ensure no typos in the programId

**Error: "Invalid program ID"**
- Verify programId matches exactly (case-sensitive)
- Check you're using the correct environment (sandbox vs production)
- Confirm programId is active in partner dashboard

**Error: "Program not found"**
- Your partner account may not have access to this program
- Contact MOCA support to enable age verification for your account
- Verify your partner ID is correct

### 4. Document Upload Configuration (Optional)

For document-based age verification (first-time users):

```env
# Document Upload Settings
MAX_DOCUMENT_SIZE_MB=5
ALLOWED_DOCUMENT_TYPES=jpg,jpeg,png,pdf
RATE_LIMIT_ATTEMPTS_PER_DAY=3
```

**Privacy Notice**: Documents are:
- Processed in memory only (never written to disk)
- Deleted immediately after birthdate extraction
- Never logged or stored anywhere
- Only age verification (18+ yes/no) is recorded

**Rate Limiting**: Prevents abuse by limiting verification attempts to 3 per day per user.

### 5. Social Platform API Keys

#### GitHub (Optional for basic use, required for OAuth)

For basic username verification (no OAuth):
```env
GITHUB_TOKEN=your_personal_access_token
```

Create: [GitHub Personal Access Token](https://github.com/settings/tokens)

For OAuth flow:
1. Create OAuth App: [GitHub Developer Settings](https://github.com/settings/developers)
2. Set redirect URI: `http://localhost:3000/api/auth/github`
3. Add to `.env.local`:

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

#### Twitter/X (Required)

1. Create app: [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Get API keys (Essential access is free)
3. Add to `.env.local`:

```env
TWITTER_BEARER_TOKEN=your_bearer_token
# For OAuth:
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
```

#### Farcaster (Required for Farcaster verification)

1. Sign up: [Neynar](https://neynar.com)
2. Get API key (1000 requests/day free)
3. Add to `.env.local`:

```env
NEYNAR_API_KEY=your_api_key
```

#### Lens Protocol (No API key needed)

Uses public Lens API - no configuration required!

#### Mirror (No API key needed)

Uses The Graph subgraph - no configuration required!
(Implementation pending - currently returns placeholder)

### 4. Application URL

Set your application URL for OAuth redirects:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

In production, change to your actual domain.

## Usage

### For Users

#### 1. Verify Your Age

1. Navigate to `/verify`
2. Click "Verify Age (18+)"
3. Complete AIR Kit's ZK proof flow
4. Receive verifiable credential
5. Can now apply to projects!

#### 2. Connect Social Accounts

**GitHub**:
1. Go to `/verify`
2. Enter your GitHub username
3. Click "Verify GitHub"
4. System checks your profile and issues credential

**Lens Protocol**:
1. Enter your Lens handle (e.g., `vitalik.lens`)
2. Click "Verify Lens"
3. System queries Lens API and issues credential

**Farcaster**:
1. Enter your Farcaster username
2. Click "Verify Farcaster"
3. System checks via Neynar API and issues credential

**Twitter** (requires OAuth setup):
1. Enter your Twitter username
2. Click "Verify Twitter"
3. System verifies via API and issues credential

#### 3. Apply to Projects

1. Browse projects at `/browse`
2. Click "Apply as Tester"
3. System checks requirements including age verification
4. If age verified, proceed with application
5. If not, prompted to verify age first

### For Developers

#### Issue a Custom Credential

```typescript
import { issueCredential } from '@/lib/credentials';

// Issue age verification credential
const ageCredential = await issueCredential('age_verification', {
  userId: user.id,
  isOver18: true,
  verifiedAt: new Date().toISOString(),
  zkProof: 'proof_data'
});

// Issue social verification credential
const socialCredential = await issueCredential('social_verification', {
  userId: user.id,
  platform: 'github',
  username: 'octocat',
  verifiedAt: new Date().toISOString(),
  qualityScore: 85,
  verificationData: verificationResult
});
```

#### Verify a Platform Manually

```typescript
import { verifyGitHub, verifyLensProfile, verifyFarcaster } from '@/lib/social-verification';

// Verify GitHub
const githubResult = await verifyGitHub('octocat');
if (githubResult.verified) {
  console.log(`Quality Score: ${githubResult.qualityScore}/100`);
  console.log('Account Data:', githubResult.accountData);
}

// Verify Lens
const lensResult = await verifyLensProfile('vitalik.lens');

// Verify Farcaster
const farcasterResult = await verifyFarcaster('dwr');
```

#### Calculate Reputation Score

```typescript
import { calculateOverallReputation } from '@/lib/social-verification';

const verifications = [
  { platform: 'github', verified: true, qualityScore: 85 },
  { platform: 'lens', verified: true, qualityScore: 70 },
  { platform: 'farcaster', verified: true, qualityScore: 90 }
];

const overallScore = calculateOverallReputation(verifications);
// Returns weighted average (GitHub has 2x weight)
```

#### Check Age Verification

```typescript
import { hasAgeVerification } from '@/lib/credentials';

const isVerified = await hasAgeVerification(userId);
if (!isVerified) {
  // Prompt user to verify age
  router.push('/verify');
}
```

#### Display Verification Badges

```typescript
import { VerificationBadgeList, VerificationStatus } from '@/components/verification-badge';

// Compact badge list
<VerificationBadgeList
  verifications={[
    { platform: 'github', verified: true, username: 'octocat', qualityScore: 85 },
    { platform: 'lens', verified: true, username: 'vitalik.lens', qualityScore: 70 }
  ]}
  size="sm"
  showLabels={false}
  maxDisplay={3}
/>

// Full verification status
<VerificationStatus
  hasAgeVerification={true}
  socialVerifications={userSocialVerifications}
  overallScore={82}
  compact={false}
/>
```

## File Structure

```
mocapulse-app/
├── lib/
│   ├── credentials.ts              # Credential issuance & verification
│   ├── social-verification.ts      # Social platform verification logic
│   └── airkit.ts                   # MOCA AIR Kit integration
│
├── app/
│   ├── verify/
│   │   └── page.tsx                # Verification dashboard
│   ├── projects/[id]/apply/
│   │   └── page.tsx                # Application page (with age check)
│   └── api/auth/
│       ├── github/route.ts         # GitHub OAuth callback
│       └── twitter/route.ts        # Twitter OAuth callback
│
├── components/
│   └── verification-badge.tsx      # Badge components
│
├── contexts/
│   └── airkit-context.tsx          # AIR Kit authentication context
│
├── .env.example                    # Environment variables template
└── VERIFICATION_GUIDE.md           # This file
```

## API Reference

### Credentials API

#### `issueCredential(type, data)`
Issues a verifiable credential via AIR Kit.

**Parameters**:
- `type`: `'age_verification' | 'social_verification' | 'poll_participation' | 'reputation_badge'`
- `data`: Credential data object

**Returns**: Credential object with proof

#### `verifyAge(userId)`
Verifies user is 18+ using ZK proofs.

**Parameters**:
- `userId`: User identifier

**Returns**: `Promise<boolean>`

#### `hasAgeVerification(userId)`
Checks if user has age verification credential.

**Parameters**:
- `userId`: User identifier

**Returns**: `Promise<boolean>`

#### `issueSocialCredential(userId, verificationResult)`
Issues credential after social verification.

**Parameters**:
- `userId`: User identifier
- `verificationResult`: Result from platform verification

**Returns**: Credential object

### Social Verification API

#### `verifyGitHub(username)`
Verifies GitHub account and calculates quality score.

**Returns**: `VerificationResult`

#### `verifyLensProfile(handle)`
Verifies Lens Protocol profile.

**Returns**: `VerificationResult`

#### `verifyFarcaster(username)`
Verifies Farcaster account.

**Returns**: `VerificationResult`

#### `verifyTwitter(username)`
Verifies Twitter/X account.

**Returns**: `VerificationResult`

#### `calculateOverallReputation(verifications[])`
Calculates weighted reputation score.

**Returns**: `number` (0-100)

## Production Deployment

### 1. Database Setup

For production, replace localStorage with a proper database:

**PostgreSQL** (recommended):
```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

**Schema**:
```sql
CREATE TABLE credentials (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  data JSONB NOT NULL,
  issued_at TIMESTAMP NOT NULL,
  on_chain BOOLEAN DEFAULT false,
  proof JSONB
);

CREATE TABLE verifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  platform VARCHAR NOT NULL,
  username VARCHAR,
  quality_score INTEGER,
  verified_at TIMESTAMP NOT NULL,
  data JSONB,
  UNIQUE(user_id, platform)
);
```

### 2. Security Checklist

- [ ] Set `NEXT_PUBLIC_MOCA_BUILD_ENV=production`
- [ ] Configure database (remove localStorage usage)
- [ ] Set up JWT authentication for API routes
- [ ] Enable rate limiting on verification endpoints
- [ ] Configure OAuth redirect URIs for production domain
- [ ] Set up proper error tracking (Sentry, etc.)
- [ ] Enable HTTPS/SSL
- [ ] Secure API keys in environment variables (not in code)
- [ ] Implement CORS policies
- [ ] Set up monitoring and alerts

### 3. OAuth Redirect URIs

Update OAuth apps with production URLs:

**GitHub**:
- `https://yourdomain.com/api/auth/github`

**Twitter**:
- `https://yourdomain.com/api/auth/twitter`

### 4. Performance Optimization

- Cache verification results (with expiration)
- Use CDN for static assets
- Implement request batching for multiple verifications
- Add loading states and optimistic UI updates
- Consider background jobs for slow API calls

## Troubleshooting

### Age Verification Not Working

**Symptoms**: "AIR Kit age verification not available" warning

**Solution**:
1. Check `NEXT_PUBLIC_MOCA_PARTNER_ID` is set
2. Verify `NEXT_PUBLIC_MOCA_BUILD_ENV=sandbox`
3. Check AIR Kit service is initialized
4. For production: Ensure AIR Kit SDK has `verifyAge()` method

**Fallback**: Development mode shows browser confirm dialog

### GitHub Verification Fails

**Symptoms**: "GitHub user not found" or rate limit errors

**Solutions**:
- Check username spelling
- Set `GITHUB_TOKEN` for higher rate limits (5000/hour vs 60/hour)
- If OAuth: Verify client ID and secret are correct

### Farcaster Returns "Not Found"

**Cause**: Missing or invalid Neynar API key

**Solution**:
1. Sign up at [Neynar](https://neynar.com)
2. Get API key
3. Set `NEYNAR_API_KEY` in `.env.local`

### Lens Profile Not Found

**Common issues**:
- Handle format: Use `username.lens` or `lens/username`
- Profile doesn't exist on Lens Protocol
- Lens API is down (check status)

**Solution**: Verify handle exists at [hey.xyz](https://hey.xyz)

### OAuth Redirect Errors

**Symptoms**: "redirect_uri_mismatch" error

**Solution**:
1. Check `NEXT_PUBLIC_APP_URL` matches OAuth app settings
2. In GitHub/Twitter app settings, verify redirect URI exactly matches
3. For local dev: Use `http://localhost:3000` (not `127.0.0.1`)

## Best Practices

### 1. User Experience
- Show clear loading states during verification
- Provide helpful error messages
- Allow users to re-verify if first attempt fails
- Display quality scores to encourage improvement

### 2. Security
- Never store raw API tokens in localStorage
- Use HTTPS in production
- Validate all inputs
- Implement rate limiting
- Use CSRF tokens for OAuth flows

### 3. Privacy
- Age verification uses ZK proofs - no birthdate stored
- Only store necessary verification data
- Allow users to disconnect accounts
- Clear communication about what data is collected

### 4. Performance
- Cache verification results
- Batch API calls when possible
- Use loading states and optimistic updates
- Consider webhook updates for real-time changes

## Roadmap

### Phase 1 (Current)
- [x] Age verification with ZK proofs
- [x] GitHub verification
- [x] Lens Protocol verification
- [x] Farcaster verification
- [x] Twitter verification (API integration)
- [x] Reputation scoring system
- [x] Verification badges UI
- [x] Project application age gating

### Phase 2 (Next)
- [ ] Mirror.xyz integration (subgraph)
- [ ] LinkedIn verification
- [ ] Link3 integration
- [ ] Database migration from localStorage
- [ ] OAuth flows for GitHub/Twitter
- [ ] Credential expiration and renewal
- [ ] Admin dashboard for credential management

### Phase 3 (Future)
- [ ] Discord role verification
- [ ] GitLab integration
- [ ] Stack Overflow reputation
- [ ] Credential NFTs
- [ ] Reputation delegation
- [ ] Cross-platform reputation aggregation
- [ ] Machine learning for fraud detection

## Support

- **MOCA Network Docs**: https://docs.moca.network
- **GitHub Issues**: Report bugs in this repo
- **Community**: Join Discord for questions

## License

MIT License - see LICENSE file for details
