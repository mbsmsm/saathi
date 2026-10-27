import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';

const LOCAL_STORAGE_PREFIX = 'favorites_';

export async function getUserFavorites(userId: string | null | undefined, language: string = 'en'): Promise<string[]> {
  // If user is authenticated and real Firestore is configured
  if (isFirebaseConfigured && db && userId && !userId.startsWith('demo-')) {
    try {
      const favsRef = collection(db, 'users', userId, 'favorites');
      const snapshot = await getDocs(favsRef);
      return snapshot.docs.map((docSnap) => docSnap.id);
    } catch (err) {
      console.warn('[Saathi Favorites] Could not load from Firestore, falling back to local storage:', err);
    }
  }

  // Fallback to localStorage (for demo mode & unauthenticated visitors)
  const key = `${LOCAL_STORAGE_PREFIX}${language}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function addFavorite(userId: string | null | undefined, schemeId: string, language: string = 'en'): Promise<void> {
  if (isFirebaseConfigured && db && userId && !userId.startsWith('demo-')) {
    try {
      const favDocRef = doc(db, 'users', userId, 'favorites', schemeId);
      await setDoc(favDocRef, {
        schemeId,
        savedAt: serverTimestamp(),
      });
      return;
    } catch (err) {
      console.warn('[Saathi Favorites] Firestore write failed, saving locally:', err);
    }
  }

  // Local storage fallback
  const key = `${LOCAL_STORAGE_PREFIX}${language}`;
  const current = await getUserFavorites(userId, language);
  if (!current.includes(schemeId)) {
    localStorage.setItem(key, JSON.stringify([...current, schemeId]));
    window.dispatchEvent(new Event('storage'));
  }
}

export async function removeFavorite(userId: string | null | undefined, schemeId: string, language: string = 'en'): Promise<void> {
  if (isFirebaseConfigured && db && userId && !userId.startsWith('demo-')) {
    try {
      const favDocRef = doc(db, 'users', userId, 'favorites', schemeId);
      await deleteDoc(favDocRef);
      return;
    } catch (err) {
      console.warn('[Saathi Favorites] Firestore delete failed, removing locally:', err);
    }
  }

  // Local storage fallback
  const key = `${LOCAL_STORAGE_PREFIX}${language}`;
  const current = await getUserFavorites(userId, language);
  localStorage.setItem(key, JSON.stringify(current.filter((id) => id !== schemeId)));
  window.dispatchEvent(new Event('storage'));
}

export async function toggleSchemeFavorite(
  userId: string | null | undefined, 
  schemeId: string, 
  currentFavs: string[], 
  language: string = 'en'
): Promise<string[]> {
  const isCurrentlyFav = currentFavs.includes(schemeId);
  if (isCurrentlyFav) {
    await removeFavorite(userId, schemeId, language);
    return currentFavs.filter((id) => id !== schemeId);
  } else {
    await addFavorite(userId, schemeId, language);
    return [...currentFavs, schemeId];
  }
}
