import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  GraduationCap, 
  Sprout, 
  HeartPulse, 
  Baby, 
  Landmark, 
  Briefcase, 
  ShieldCheck, 
  Bot, 
  ArrowRight, 
  ExternalLink,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { schemeData } from '../data/schemes';
import { useTranslation } from '../i18n/useTranslation';

function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/schemes');
    }
  };

  const categories = [
    { name: 'Education and Scholarships', label: 'Education & Scholarships', icon: GraduationCap, count: '100+ Schemes' },
    { name: 'Agriculture', label: 'Agriculture & Farmers', icon: Sprout, count: '85+ Schemes' },
    { name: 'Healthcare', label: 'Health & Wellness', icon: HeartPulse, count: '50+ Schemes' },
    { name: 'Women and Child Welfare', label: 'Women & Child Welfare', icon: Baby, count: '65+ Schemes' },
    { name: 'Financial Inclusion', label: 'Banking & Financial Inclusion', icon: Landmark, count: '40+ Schemes' },
    { name: 'Employment and Skill Development', label: 'Employment & Skill Development', icon: Briefcase, count: '75+ Schemes' },
  ];

  // Pick top 4 popular verified schemes
  const popularSchemes = schemeData.slice(0, 4);

  return (
    <div className="space-y-12 pb-8">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-primary-dark to-slate-900 text-white shadow-xl px-6 py-12 md:py-16 md:px-12">
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 border border-accent/40 text-accent text-xs md:text-sm font-semibold tracking-wide backdrop-blur-xs">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Indian Government Services Assistant | भारत सरकार सेवा साथी</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Find Every Government Scheme <br className="hidden sm:inline" />
            <span className="text-accent underline decoration-accent/40 decoration-4 underline-offset-8">You Are Eligible For</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Discover verified Central and State welfare initiatives, understand documentation requirements, check eligibility, and apply directly via official portals.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-2">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white p-2 rounded-2xl shadow-2xl border border-white/20">
              <div className="flex items-center flex-1 px-3 text-slate-700">
                <Search className="w-5 h-5 text-slate-400 shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder') || 'Search by scheme name, e.g., PM Kisan, scholarship, Ayushman...'}
                  className="w-full py-2.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-hidden bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 font-bold text-sm sm:text-base transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Filter Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-200">
            <span className="text-slate-400 font-medium">Quick Filters:</span>
            {[
              { label: 'Farmers', query: 'Agriculture' },
              { label: 'Students', query: 'Education' },
              { label: 'Health', query: 'Healthcare' },
              { label: 'Women', query: 'Women' },
              { label: 'Financial', query: 'Financial' },
            ].map((tag) => (
              <button
                key={tag.label}
                onClick={() => navigate(`/schemes?q=${encodeURIComponent(tag.query)}`)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer text-white font-medium"
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/schemes"
              className="px-6 py-3 rounded-xl bg-white text-primary font-bold text-sm shadow-md hover:bg-slate-100 transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-primary" />
              <span>{t('exploreSchemes') || 'Explore All Schemes'}</span>
            </Link>
            <Link
              to="/chat"
              className="px-6 py-3 rounded-xl bg-accent text-slate-950 font-bold text-sm shadow-md hover:bg-accent-hover transition-all flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-slate-950" />
              <span>{t('aiAssistant') || 'Ask Saathi AI Assistant'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Key Trust Indicators */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Official Portals Only', desc: 'Direct links to .gov.in & .nic.in sites', icon: ShieldCheck, color: 'text-secondary' },
          { label: 'Multilingual Support', desc: 'English, हिन्दी, and മലയാളം', icon: Sparkles, color: 'text-accent' },
          { label: 'No Intermediaries', desc: 'Direct benefit transfer awareness', icon: Landmark, color: 'text-primary' },
          { label: '100% Free Public Service', desc: 'Zero charges, citizen-first', icon: CheckCircle2, color: 'text-secondary' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-slate-50 border border-slate-100 ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.label}</h4>
                <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Browse By Category Cards */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent">Browse By Domain</span>
            <h2 className="text-2xl font-extrabold text-slate-900">Government Scheme Categories</h2>
          </div>
          <Link to="/schemes" className="text-sm font-semibold text-primary hover:text-primary-light flex items-center gap-1">
            <span>View All Schemes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => navigate(`/schemes?cat=${encodeURIComponent(cat.name)}`)}
                className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-primary/40 hover:shadow-lg transition-all text-left flex items-start gap-4 cursor-pointer"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-base">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Central & State welfare programs with verified requirements.
                  </p>
                  <span className="inline-block mt-3 text-xs font-semibold text-accent group-hover:underline">
                    Explore Schemes &rarr;
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Popular Government Schemes */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">Verified Welfare Programs</span>
            <h2 className="text-2xl font-extrabold text-slate-900">Featured Government Schemes</h2>
          </div>
          <Link to="/schemes" className="text-sm font-semibold text-primary hover:text-primary-light flex items-center gap-1">
            <span>See full catalog ({schemeData.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {popularSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                    {scheme.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Official</span>
                  </div>
                </div>

                {/* Scheme Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                  <Link to={`/schemes/${scheme.id}`} className="hover:text-primary transition-colors">
                    {scheme.name}
                  </Link>
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 mb-4 line-clamp-2">
                  {scheme.shortDescription}
                </p>

                {/* Key Benefits highlight box */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4 text-xs">
                  <strong className="text-slate-800 block mb-1">Key Benefits:</strong>
                  <p className="text-slate-600 line-clamp-2">{scheme.benefits}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to={`/schemes/${scheme.id}`}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>View Details & Eligibility</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <a
                  href={scheme.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
                  title="Visit official government website"
                >
                  <span>Official Site</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Clear AI Assistant Entry Point */}
      <section className="rounded-3xl bg-linear-to-r from-slate-900 via-primary to-slate-900 text-white p-8 md:p-10 shadow-xl border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-semibold">
              <Bot className="w-3.5 h-3.5" />
              <span>Saathi Multilingual AI Assistant</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Confused About Eligibility or Documents? Ask Saathi.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Get instant, rule-based and AI-guided recommendations in Malayalam, English, or Hindi. Ask about scholarship deadlines, farmer support criteria, or required identity proofs.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                'What documents do I need for PMJDY?',
                'Which schemes support farmers?',
                'കേരളത്തിലെ സ്കോളർഷിപ്പുകൾ?',
                'आयुष्मान भारत के लिए पात्रता क्या है?',
              ].map((sample, i) => (
                <Link
                  key={i}
                  to="/chat"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-slate-200 border border-white/10 transition-colors"
                >
                  "{sample}"
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xs text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-slate-950 shadow-lg">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Instant Citizen Help</h4>
              <p className="text-xs text-slate-300 mt-0.5">Available 24/7 across 3 languages</p>
            </div>
            <Link
              to="/chat"
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 font-bold text-sm transition-colors shadow-md text-center"
            >
              Launch AI Assistant
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
