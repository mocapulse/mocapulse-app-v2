import { getAirService } from './airkit';
import type { VerificationResult } from './social-verification';

export interface PollCredential {
  pollId: string;
  participantId: string;
  timestamp: string;
  response: any;
}

export interface ReputationCredential {
  userId: string;
  reputationScore: number;
  badges: string[];
  timestamp: string;
}

export interface AgeVerificationCredential {
  userId: string;
  isOver18: boolean;
  verifiedAt: string;
  // Using ZK proof - no actual age/birthdate stored
  zkProof?: string;
}

export interface SocialVerificationCredential {
  userId: string;
  platform: string;
  username: string;
  verifiedAt: string;
  qualityScore: number;
  verificationData: VerificationResult;
}

export type CredentialType =
  | 'poll_participation'
  | 'reputation_badge'
  | 'age_verification'
  | 'social_verification';

export type CredentialData =
  | PollCredential
  | ReputationCredential
  | AgeVerificationCredential
  | SocialVerificationCredential;

export const issueCredential = async (
  credentialType: CredentialType,
  credentialData: CredentialData
) => {
  try {
    const airService = await getAirService();

    // AIR Kit credential issuance
    // Note: The exact API depends on AIR Kit's implementation
    // This is based on common patterns for verifiable credentials

    const credentialPayload = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', credentialType],
      issuer: process.env.NEXT_PUBLIC_MOCA_ISSUER_DID,
      issuanceDate: new Date().toISOString(),
      credentialSubject: credentialData,
    };

    // Check if AIR Kit has credential issuance functionality
    if (typeof (airService as any).issueCredential === 'function') {
      try {
        const result = await (airService as any).issueCredential(credentialPayload);

        // Store reference locally for quick access
        const credentialId = result.id || `${credentialType}_${Date.now()}`;
        const credential = {
          id: credentialId,
          type: credentialType,
          data: credentialData,
          issued: new Date().toISOString(),
          onChain: true,
          proof: result.proof || null
        };

        const existingCredentials = JSON.parse(localStorage.getItem('mocaCredentials') || '[]');
        existingCredentials.push(credential);
        localStorage.setItem('mocaCredentials', JSON.stringify(existingCredentials));

        return credential;
      } catch (airError) {
        console.warn('AIR Kit issuance failed, falling back to local storage:', airError);
      }
    }

    // Fallback: Store locally for development/testing
    const credentialId = `${credentialType}_${Date.now()}`;
    const credential = {
      id: credentialId,
      type: credentialType,
      data: credentialData,
      issued: new Date().toISOString(),
      onChain: false, // Mark as not on-chain
    };

    // Store in localStorage as fallback
    const existingCredentials = JSON.parse(localStorage.getItem('mocaCredentials') || '[]');
    existingCredentials.push(credential);
    localStorage.setItem('mocaCredentials', JSON.stringify(existingCredentials));

    return credential;
  } catch (error) {
    console.error('Failed to issue credential:', error);
    throw error;
  }
};

export const verifyCredential = async (credentialId: string) => {
  try {
    const airService = await getAirService();

    // Check if AIR Kit has credential verification functionality
    if (typeof (airService as any).verifyCredential === 'function') {
      return await (airService as any).verifyCredential({
        credentialId,
        verifier: process.env.NEXT_PUBLIC_MOCA_VERIFIER_DID,
      });
    }

    // Fallback: Check local storage
    const existingCredentials = JSON.parse(localStorage.getItem('mocaCredentials') || '[]');
    const credential = existingCredentials.find((c: any) => c.id === credentialId);

    return credential ? { verified: true, credential } : { verified: false };
  } catch (error) {
    console.error('Failed to verify credential:', error);
    return { verified: false };
  }
};

export const getUserCredentials = async (userId: string) => {
  try {
    // Get credentials from localStorage as fallback
    const existingCredentials = JSON.parse(localStorage.getItem('mocaCredentials') || '[]');
    return existingCredentials.filter((c: any) =>
      c.data.participantId === userId || c.data.userId === userId
    );
  } catch (error) {
    console.error('Failed to get user credentials:', error);
    return [];
  }
};

/**
 * Age Verification using MOCA AIR Kit's Zero-Knowledge Proofs
 * Verifies user is 18+ without revealing actual age or birthdate
 *
 * This requires:
 * 1. User must have an age credential in their AIR wallet
 * 2. NEXT_PUBLIC_MOCA_AGE_VERIFICATION_PROGRAM_ID must be configured
 */
export const verifyAge = async (userId: string): Promise<boolean> => {
  try {
    const airService = await getAirService();

    // Get program ID from environment
    const programId = process.env.NEXT_PUBLIC_MOCA_AGE_VERIFICATION_PROGRAM_ID;

    if (!programId) {
      throw new Error(
        'Age verification program ID not configured. Please add NEXT_PUBLIC_MOCA_AGE_VERIFICATION_PROGRAM_ID to your .env.local file. ' +
        'See VERIFICATION_GUIDE.md for instructions on obtaining a program ID from MOCA Network.'
      );
    }

    // Get auth token
    const tokenResult = await airService.getAccessToken();
    const authToken = tokenResult.token;

    // Call verifyCredential with age verification program
    const result = await airService.verifyCredential({
      authToken,
      programId,
      redirectUrl: window.location.href, // Return to current page after verification
    });

    // Check if verification succeeded
    if (result.verified) {
      // Issue our own credential recording the verification
      const credentialData: AgeVerificationCredential = {
        userId,
        isOver18: true,
        verifiedAt: new Date().toISOString(),
        zkProof: result.proof || undefined
      };

      await issueCredential('age_verification', credentialData);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Age verification failed:', error);

    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('program ID not configured')) {
        throw error; // Re-throw configuration errors
      }
      if (error.message.includes('not found')) {
        throw new Error(
          'No age credential found in your AIR wallet. Please use document upload to create one first.'
        );
      }
    }

    throw new Error(
      'Age verification failed. You may not have an age credential yet. Try uploading a government ID instead.'
    );
  }
};

/**
 * Age Verification via Document Upload
 * For first-time users who don't have an age credential yet
 */
export const verifyAgeWithDocument = async (
  userId: string,
  documentFile: File,
  birthdate: string,
  documentType: 'passport' | 'drivers_license' | 'national_id'
): Promise<boolean> => {
  try {
    // Prepare form data
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('birthdate', birthdate);
    formData.append('documentType', documentType);
    formData.append('document', documentFile);

    // Submit to API
    const response = await fetch('/api/verify-age-document', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || 'Verification failed');
    }

    if (result.isOver18) {
      // Store local reference
      const credentialData: AgeVerificationCredential = {
        userId,
        isOver18: true,
        verifiedAt: new Date().toISOString(),
      };

      await issueCredential('age_verification', credentialData);
      return true;
    }

    throw new Error(result.error || 'Age verification failed');
  } catch (error) {
    console.error('Document verification failed:', error);
    throw error;
  }
};

/**
 * Check if user has valid age verification credential
 */
export const hasAgeVerification = async (userId: string): Promise<boolean> => {
  try {
    const credentials = await getUserCredentials(userId);
    const ageCredential = credentials.find(
      (c: any) => c.type === 'age_verification' && c.data.isOver18
    );

    return !!ageCredential;
  } catch (error) {
    console.error('Failed to check age verification:', error);
    return false;
  }
};

/**
 * Issue social verification credential after successful platform verification
 */
export const issueSocialCredential = async (
  userId: string,
  verificationResult: VerificationResult
): Promise<any> => {
  if (!verificationResult.verified) {
    throw new Error('Cannot issue credential for unverified account');
  }

  const credentialData: SocialVerificationCredential = {
    userId,
    platform: verificationResult.platform,
    username: verificationResult.accountData?.username || verificationResult.accountData?.handle || '',
    verifiedAt: verificationResult.timestamp,
    qualityScore: verificationResult.qualityScore || 0,
    verificationData: verificationResult
  };

  return await issueCredential('social_verification', credentialData);
};

/**
 * Get user's social verification credentials
 */
export const getSocialVerifications = async (userId: string): Promise<SocialVerificationCredential[]> => {
  try {
    const credentials = await getUserCredentials(userId);
    return credentials
      .filter((c: any) => c.type === 'social_verification')
      .map((c: any) => c.data);
  } catch (error) {
    console.error('Failed to get social verifications:', error);
    return [];
  }
};

/**
 * Get credentials by type
 */
export const getCredentialsByType = async (
  userId: string,
  credentialType: CredentialType
): Promise<any[]> => {
  try {
    const credentials = await getUserCredentials(userId);
    return credentials.filter((c: any) => c.type === credentialType);
  } catch (error) {
    console.error(`Failed to get credentials of type ${credentialType}:`, error);
    return [];
  }
};