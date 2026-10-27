import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { schemeData } from '../data/schemes';
import { getSchemeById } from '../firebase/schemesRepository';
import type { Scheme } from '../types/Scheme';
import { useTranslation } from '../i18n/useTranslation';
import { 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle2, 
  FileCheck, 
  Users, 
  Award, 
  FileText,
  CalendarCheck,
  ShieldCheck,
  Loader2
} from 'lucide-react';

function SchemeDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  // Initialize with local schemeData match immediately if present to prevent layout shift
  const [scheme, setScheme] = useState<Scheme | undefined>(() => 
    id ? schemeData.find((s) => s.id === id) : undefined
  );
  const [loading, setLoading] = useState<boolean>(!scheme && Boolean(id));

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    getSchemeById(id)
      .then((data) => {
        if (isMounted) {
          setScheme(data ?? schemeData.find((s) => s.id === id));
        }
      })
      .catch((err) => {
        console.warn(`Could not load scheme ${id} from repository:`, err);
        if (isMounted) {
          setScheme(schemeData.find((s) => s.id === id));
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 max-w-lg mx-auto my-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading scheme details...</p>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <h2 className="text-xl font-bold text-slate-900">{t('noResults') || 'Scheme Not Found'}</h2>
        <p className="text-sm text-slate-500">The requested scheme could not be found or has been updated.</p>
        <Link
          to="/schemes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Schemes</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <div>
        <Link
          to="/schemes"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-primary transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Schemes Catalog</span>
        </Link>
      </div>

      {/* Main Scheme Hero Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
            {scheme.category}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {scheme.classification} Government Scheme
          </span>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Official Data</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          {scheme.name}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {scheme.shortDescription}
        </p>

        {/* Action button bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
          <a
            href={scheme.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            <span>Visit Official Portal</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          {scheme.applicationUrl && (
            <a
              href={scheme.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 text-xs sm:text-sm font-bold transition-colors shadow-xs"
            >
              <span>Apply Online Direct</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Key Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Benefits Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Award className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-slate-900 text-base">Scheme Benefits</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {scheme.benefits}
          </p>
        </div>

        {/* Eligibility Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Users className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-slate-900 text-base">Eligibility Criteria</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {scheme.eligibility}
          </p>
        </div>

        {/* Documents Required */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <FileCheck className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-slate-900 text-base">Required Documents</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {scheme.documents}
          </p>
        </div>

        {/* Application Process */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <FileText className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-slate-900 text-base">Application Procedure</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {scheme.applicationProcess}
          </p>
        </div>
      </div>

      {/* Detailed Overview */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-lg font-bold text-slate-900">Detailed Overview</h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {scheme.detailedOverview}
        </p>
      </div>

      {/* Verification & Metadata Disclaimer */}
      <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-secondary" />
          <span>Verified Government Source: {scheme.source}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Last Verified On: {scheme.lastVerified}</span>
        </div>
      </div>
    </div>
  );
}

export default SchemeDetail;
