import { getAirService } from './airkit';

export interface CredentialField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  value: string | number | boolean;
}

export interface IssueCredentialResult {
  success: boolean;
  credentialId?: string;
  error?: string;
}

/**
 * Convert credential fields to a credential subject object
 */
const convertFieldsToCredentialSubject = (fields: CredentialField[]): Record<string, string | number | boolean> => {
  const subject: Record<string, string | number | boolean> = {};

  fields.forEach((field) => {
    if (field.name.trim()) {
      let value: string | number | boolean = field.value;

      // Convert value based on type
      switch (field.type) {
        case 'number':
          value = typeof field.value === 'string' ? parseFloat(field.value) || 0 : field.value;
          break;
        case 'boolean':
          value = typeof field.value === 'string' ? field.value === 'true' : field.value;
          break;
        case 'date':
          if (typeof field.value === 'string') {
            // Convert date string to YYYYMMDD format (integer)
            const date = new Date(field.value);
            if (!isNaN(date.getTime())) {
              value = parseInt(
                date.getFullYear().toString() +
                (date.getMonth() + 1).toString().padStart(2, '0') +
                date.getDate().toString().padStart(2, '0')
              );
            }
          }
          break;
        default:
          value = field.value;
      }

      subject[field.name] = value;
    }
  });

  return subject;
};

/**
 * Get JWT token for credential issuance
 * In production, this should call a backend API endpoint
 */
const getAuthToken = async (): Promise<string> => {
  try {
    const airService = await getAirService();
    const tokenResult = await airService.getAccessToken();
    return tokenResult.token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    throw new Error('Failed to authenticate. Please ensure you are logged in.');
  }
};

/**
 * Issue an age credential to the user's AIR wallet
 * @param birthdate - User's birthdate in YYYY-MM-DD format
 */
export const issueAgeCredential = async (birthdate: string): Promise<IssueCredentialResult> => {
  try {
    const airService = await getAirService();
    const authToken = await getAuthToken();

    const credentialId = process.env.NEXT_PUBLIC_MOCA_AGE_ISSUANCE_PROGRAM_ID;
    const issuerDid = process.env.NEXT_PUBLIC_MOCA_ISSUER_DID;

    if (!credentialId) {
      return {
        success: false,
        error: 'Age credential issuance program ID not configured. Please add NEXT_PUBLIC_MOCA_AGE_ISSUANCE_PROGRAM_ID to your .env.local file.'
      };
    }

    if (!issuerDid) {
      return {
        success: false,
        error: 'Issuer DID not configured. Please add NEXT_PUBLIC_MOCA_ISSUER_DID to your .env.local file.'
      };
    }

    // Convert birthdate to YYYYMMDD integer format
    const date = new Date(birthdate);
    const birthdateInt = parseInt(
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0')
    );

    // Calculate age
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }

    const credentialSubject = {
      birthdate: birthdateInt,
      age: age
    };

    await airService.issueCredential({
      authToken,
      credentialId,
      credentialSubject,
      issuerDid,
    });

    return {
      success: true,
      credentialId
    };
  } catch (error) {
    console.error('Failed to issue age credential:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to issue age credential'
    };
  }
};

/**
 * Issue a social verification credential
 * @param platform - Social platform name
 * @param username - Username on the platform
 * @param qualityScore - Quality score from verification (0-100)
 */
export const issueSocialCredential = async (
  platform: string,
  username: string,
  qualityScore: number
): Promise<IssueCredentialResult> => {
  try {
    const airService = await getAirService();
    const authToken = await getAuthToken();

    const credentialId = process.env.NEXT_PUBLIC_MOCA_SOCIAL_ISSUANCE_PROGRAM_ID;
    const issuerDid = process.env.NEXT_PUBLIC_MOCA_ISSUER_DID;

    if (!credentialId) {
      return {
        success: false,
        error: 'Social credential issuance program ID not configured. Please add NEXT_PUBLIC_MOCA_SOCIAL_ISSUANCE_PROGRAM_ID to your .env.local file.'
      };
    }

    if (!issuerDid) {
      return {
        success: false,
        error: 'Issuer DID not configured. Please add NEXT_PUBLIC_MOCA_ISSUER_DID to your .env.local file.'
      };
    }

    const credentialSubject = {
      platform,
      username,
      qualityScore,
      verifiedAt: new Date().toISOString()
    };

    await airService.issueCredential({
      authToken,
      credentialId,
      credentialSubject,
      issuerDid,
    });

    return {
      success: true,
      credentialId
    };
  } catch (error) {
    console.error('Failed to issue social credential:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to issue social credential'
    };
  }
};

/**
 * Issue a custom credential with user-defined fields
 * @param fields - Array of credential fields
 */
export const issueCustomCredential = async (fields: CredentialField[]): Promise<IssueCredentialResult> => {
  try {
    const airService = await getAirService();
    const authToken = await getAuthToken();

    const credentialId = process.env.NEXT_PUBLIC_MOCA_CUSTOM_ISSUANCE_PROGRAM_ID;
    const issuerDid = process.env.NEXT_PUBLIC_MOCA_ISSUER_DID;

    if (!credentialId) {
      return {
        success: false,
        error: 'Custom credential issuance program ID not configured. Please add NEXT_PUBLIC_MOCA_CUSTOM_ISSUANCE_PROGRAM_ID to your .env.local file.'
      };
    }

    if (!issuerDid) {
      return {
        success: false,
        error: 'Issuer DID not configured. Please add NEXT_PUBLIC_MOCA_ISSUER_DID to your .env.local file.'
      };
    }

    const credentialSubject = convertFieldsToCredentialSubject(fields);

    if (Object.keys(credentialSubject).length === 0) {
      return {
        success: false,
        error: 'No valid credential fields provided. Please add at least one field.'
      };
    }

    await airService.issueCredential({
      authToken,
      credentialId,
      credentialSubject,
      issuerDid,
    });

    return {
      success: true,
      credentialId
    };
  } catch (error) {
    console.error('Failed to issue custom credential:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to issue custom credential'
    };
  }
};
