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
 */
export const verifyAge = async (userId: string): Promise<boolean> => {
  try {
    const airService = await getAirService();

    // Check if AIR Kit has age verification with ZK proofs
    if (typeof (airService as any).verifyAge === 'function') {
      // Request age verification - this should trigger AIR Kit's ZK proof flow
      const result = await (airService as any).verifyAge({
        minimumAge: 18,
        userId
      });

      if (result.verified) {
        // Issue age verification credential
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
    }

    // Fallback: For development, show a prompt
    // In production, this should ALWAYS use AIR Kit's ZK proof system
    console.warn('AIR Kit age verification not available - using fallback');

    // Simulated age verification for development
    const confirmed = window.confirm(
      'Age Verification Required\n\n' +
      'In production, this will use MOCA AIR Kit\'s zero-knowledge proofs to verify you are 18+ without revealing your actual age.\n\n' +
      'For development purposes: Are you 18 years or older?'
    );

    if (confirmed) {
      const credentialData: AgeVerificationCredential = {
        userId,
        isOver18: true,
        verifiedAt: new Date().toISOString(),
      };

      await issueCredential('age_verification', credentialData);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Age verification failed:', error);
    return false;
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