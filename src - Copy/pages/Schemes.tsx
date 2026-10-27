import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { schemeData } from '../data/schemes';
import { getSchemes } from '../firebase/schemesRepository';
import type { Scheme } from '../types/Scheme';
import { useTranslation } from '../i18n/useTranslation';
import { useAuth } from '../firebase/authContext';
import { getUserFavorites, toggleSchemeFavorite } from '../firebase/favorites';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  ArrowRight, 
  Bookmark, 
  FileText,
  RotateCcw,
  CheckCircle2,
  Loader2
} from 'lucide-react';

function Schemes() {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [schemes, setSchemes] = useState<Scheme[]>(schemeData);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initialSearch = searchParams.get('q') || '';
  const initialCategory = searchParams.get('cat') || '';
  const initialOnlySaved = searchParams.get('saved') === 'true';

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [onlySaved, setOnlySaved] = useState(initialOnlySaved);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favNotification, setFavNotification] = useState<string | null>(null);

  // Load schemes from repository (Firestore if available, falls back to local schemeData)
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getSchemes()
      .then((data) => {
        if (isMounted) {
          setSchemes(data && data.length > 0 ? data : schemeData);
        }
      })
      .catch((err) => {
        console.warn('Could not load dynamic schemes, using bundled fallback:', err);
        if (isMounted) {
          setSchemes(schemeData);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Load favorites from Firestore (when authenticated) or localStorage (in demo/anonymous)
  useEffect(() => {
    let isMounted = true;
    getUserFavorites(user?.uid, language).then((favs) => {
      if (isMounted) setFavorites(favs);
    });

    const handleStorage = () => {
      getUserFavorites(user?.uid, language).then((favs) => {
        if (isMounted) setFavorites(favs);
      });
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
    };
  }, [user?.uid, language]);

  // Sync state if URL query params change
  useEffect(() => {
    setSearch(searchParams.get('q') || '');
    setCategory(searchParams.get('cat') || '');
    setOnlySaved(searchParams.get('saved') === 'true');
  }, [searchParams]);

  const updateFilters = (newSearch: string, newCat: string, newSaved: boolean) => {
    const params: Record<string, string> = {};
    if (newSearch) params.q = newSearch;
    if (newCat) params.cat = newCat;
    if (newSaved) params.saved = 'true';
    setSearchParams(params);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    updateFilters(val, category, onlySaved);
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    updateFilters(search, val, onlySaved);
  };

  const handleToggleSavedView = (val: boolean) => {
    setOnlySaved(val);
    updateFilters(search, category, val);
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setOnlySaved(false);
    setSearchParams({});
  };

  const filtered = useMemo(() => {
    return schemes.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch = 
        s.name.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.benefits.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q);
      const matchesCat = category ? s.category === category : true;
      const matchesSaved = onlySaved ? favorites.includes(s.id) : true;
      return matchesSearch && matchesCat && matchesSaved;
    });
  }, [schemes, search, category, onlySaved, favorites]);

  const handleFavoriteClick = async (schemeId: string, schemeName: string) => {
    const isCurrentlyFav = favorites.includes(schemeId);
    const updated = await toggleSchemeFavorite(user?.uid, schemeId, favorites, language);
    setFavorites(updated);

    const message = isCurrentlyFav
      ? `Removed "${schemeName}" from saved schemes.`
      : `Saved "${schemeName}" to your bookmarks${user && !user.isDemo ? ' in Firestore' : ''}.`;

    setFavNotification(message);
    setTimeout(() => setFavNotification(null), 3000);
  };

  const isFav = (id: string) => favorites.includes(id);

  const categories = useMemo(() => {
    return Array.from(new Set(schemes.map((s) => s.category)));
  }, [schemes]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {favNotification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span>{favNotification}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent">National Database</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            {t('exploreSchemes') || 'Explore Government Schemes'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and filter verified central and state welfare initiatives. Showing {filtered.length} of {schemes.length} programs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Saved Schemes toggle button */}
          <button
            onClick={() => handleToggleSavedView(!onlySaved)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
              onlySaved
                ? 'bg-accent text-slate-950 border-accent font-bold shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${onlySaved ? 'fill-slate-950' : ''}`} />
            <span>Saved Schemes ({favorites.length})</span>
          </button>

          {(search || category || onlySaved) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('searchPlaceholder') || 'Search schemes by keyword, benefit, or qualification...'}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-primary transition-all"
          />
        </div>

        <div className="sm:col-span-4 relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-primary transition-all cursor-pointer"
          >
            <option value="">All Categories ({schemes.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schemes List */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading government schemes catalog...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">
            {onlySaved ? 'No Saved Schemes Yet' : (t('noResults') || 'No Schemes Found')}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {onlySaved 
              ? 'Click the bookmark icon on any scheme to save it for quick access here.' 
              : 'Try adjusting your search query or removing the category filter.'}
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((s) => {
            const favorited = isFav(s.id);
            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      {s.category}
                    </span>
                    <button
                      onClick={() => handleFavoriteClick(s.id, s.name)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                        favorited
                          ? 'bg-amber-50 border-accent text-accent font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                      title={favorited ? t('saved') || 'Saved' : t('save') || 'Save to Favorites'}
                    >
                      <Bookmark className={`w-4 h-4 ${favorited ? 'fill-accent' : ''}`} />
                      <span className="text-[11px] hidden sm:inline">
                        {favorited ? (t('saved') || 'Saved') : (t('save') || 'Save')}
                      </span>
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 hover:text-primary transition-colors mb-2">
                    <Link to={`/schemes/${s.id}`}>{s.name}</Link>
                  </h3>

                  <p className="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                    {s.shortDescription}
                  </p>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs mb-4">
                    <span className="font-semibold text-slate-700 block mb-0.5">Key Benefit:</span>
                    <span className="text-slate-600 line-clamp-2">{s.benefits}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/schemes/${s.id}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <a
                    href={s.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Schemes;
