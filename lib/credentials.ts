import { getAirService } from './airkit';

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

export const issueCredential = async (
  credentialType: 'poll_participation' | 'reputation_badge',
  credentialData: PollCredential | ReputationCredential
) => {
  try {
    const airService = await getAirService();

    // Check if AIR Kit has credential issuance functionality
    if (typeof (airService as any).issueCredential === 'function') {
      return await (airService as any).issueCredential({
        type: credentialType,
        data: credentialData,
        issuer: process.env.NEXT_PUBLIC_MOCA_ISSUER_DID,
      });
    }

    // Fallback: Store locally for now
    const credentialId = `${credentialType}_${Date.now()}`;
    const credential = {
      id: credentialId,
      type: credentialType,
      data: credentialData,
      issued: new Date().toISOString(),
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