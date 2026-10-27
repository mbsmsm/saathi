import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { schemeData } from '../data/schemes';
import { isValidScheme } from '../services/schemeValidation';
import type { Scheme } from '../types/Scheme';

const SCHEMES_COLLECTION = 'schemes';

/**
 * In-memory cache to prevent repeated redundant network requests across page navigation.
 */
let memoryCachedSchemes: Scheme[] | null = null;
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches all schemes.
 * Priority:
 * 1. Checks memory cache (if fresh within TTL).
 * 2. Attempts to query Firestore 'schemes' collection if configured and accessible.
 * 3. Falls back immediately to the local bundled `src/data/schemes.ts` if:
 *    - Firebase is unconfigured or db is null
 *    - Firestore collection is empty
 *    - Firestore request times out or rejects (e.g. offline, permissions, network error)
 */
export async function getSchemes(): Promise<Scheme[]> {
  const now = Date.now();
  if (memoryCachedSchemes && memoryCachedSchemes.length > 0 && (now - lastFetchTimestamp) < CACHE_TTL_MS) {
    return memoryCachedSchemes;
  }

  if (!isFirebaseConfigured || !db) {
    return schemeData;
  }

  try {
    const colRef = collection(db, SCHEMES_COLLECTION);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      // No documents in Firestore yet, use local bundled fallback
      return schemeData;
    }

    const fetchedSchemes: Scheme[] = [];
    snapshot.forEach((docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() };
      if (isValidScheme(data)) {
        fetchedSchemes.push(data);
      } else {
        console.warn(`[Firestore Schemes] Skipping invalid scheme document: ${docSnap.id}`);
      }
    });

    if (fetchedSchemes.length > 0) {
      memoryCachedSchemes = fetchedSchemes;
      lastFetchTimestamp = now;
      return fetchedSchemes;
    }

    return schemeData;
  } catch (error) {
    // If permission denied, offline, or any error occurs, safely fall back without breaking the UI
    console.warn('[Firestore Schemes] Could not retrieve schemes from Firestore. Falling back to local data.', error);
    return schemeData;
  }
}

/**
 * Fetches a single scheme by its identifier.
 */
export async function getSchemeById(id: string): Promise<Scheme | undefined> {
  if (!id) return undefined;

  // Check cache first
  if (memoryCachedSchemes) {
    const cached = memoryCachedSchemes.find((s) => s.id === id);
    if (cached) return cached;
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, SCHEMES_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() };
        if (isValidScheme(data)) {
          return data;
        }
      }
    } catch (error) {
      console.warn(`[Firestore Schemes] Failed fetching scheme ${id} from Firestore, checking local data.`, error);
    }
  }

  // Fallback to bundled schemes
  return schemeData.find((s) => s.id === id);
}

/**
 * Clears the in-memory cache if needed (e.g., after manual refresh).
 */
export function invalidateSchemesCache(): void {
  memoryCachedSchemes = null;
  lastFetchTimestamp = 0;
}
