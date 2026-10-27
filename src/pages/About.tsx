import { ShieldCheck, Globe, Database, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Hero */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span>About Project Saathi</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          AI Agent for Indian Government Services & Citizen Welfare
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Saathi is a full-stack, AI-driven civic empowerment application built to bridge the gap between Indian citizens and the hundreds of government welfare schemes available to them.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Multilingual Access</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Support for Malayalam, Hindi, and English ensures every citizen can explore entitlements in their native tongue.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-accent/20 text-slate-950 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-accent" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Verified Portals Only</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Direct redirects to official government portals (.gov.in / .nic.in). No third-party middlemen or fraudulent charges.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Free & Resilient</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Works out of the box with built-in rule-based intelligence and optional local Ollama AI integration. No paid API locks.
          </p>
        </div>
      </div>

      {/* Disclaimer Section */}
      <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-200/80 space-y-3">
        <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-700" />
          <span>Official Verification & Independent Status Disclaimer</span>
        </h3>
        <p className="text-xs text-amber-900 leading-relaxed">
          Saathi is an independent educational and civic assistance portal designed as a CSE engineering project. It is not an official government entity. All scheme rules, eligibility qualifications, and deadlines must be confirmed directly on the official ministries' websites referenced on each scheme's page.
        </p>
      </div>

      {/* CTA Box */}
      <div className="text-center pt-4">
        <Link
          to="/schemes"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-md transition-all"
        >
          <span>Start Exploring Schemes</span>
        </Link>
      </div>
    </div>
  );
}

export default About;
