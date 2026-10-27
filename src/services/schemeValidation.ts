import type { Scheme } from '../types/Scheme';

/**
 * Validates whether a given object strictly conforms to the required Scheme interface.
 * Returns true if valid, false otherwise.
 */
export function isValidScheme(item: unknown): item is Scheme {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const candidate = item as Record<string, unknown>;

  // Required string fields
  const requiredStringFields: (keyof Scheme)[] = [
    'id',
    'name',
    'shortDescription',
    'detailedOverview',
    'benefits',
    'eligibility',
    'documents',
    'applicationProcess',
    'category',
    'officialUrl',
    'source',
    'lastVerified'
  ];

  for (const field of requiredStringFields) {
    if (typeof candidate[field] !== 'string' || (candidate[field] as string).trim() === '') {
      return false;
    }
  }

  // Classification check
  if (candidate.classification !== 'Central' && candidate.classification !== 'State') {
    return false;
  }

  // If State classification, state should ideally be a string if provided
  if (candidate.classification === 'State' && candidate.state !== undefined && typeof candidate.state !== 'string') {
    return false;
  }

  // Verification status check
  const validStatuses = ['verified', 'unverified', 'sample'];
  if (typeof candidate.verificationStatus !== 'string' || !validStatuses.includes(candidate.verificationStatus)) {
    return false;
  }

  // Optional string fields
  if (candidate.applicationUrl !== undefined && typeof candidate.applicationUrl !== 'string') {
    return false;
  }

  // Basic URL safety check for officialUrl
  try {
    const url = new URL(candidate.officialUrl as string);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
  } catch {
    return false;
  }

  return true;
}

/**
 * Filters an array of unknown items, returning only records that satisfy the Scheme schema.
 */
export function filterValidSchemes(items: unknown[]): Scheme[] {
  if (!Array.isArray(items)) return [];
  return items.filter(isValidScheme);
}
