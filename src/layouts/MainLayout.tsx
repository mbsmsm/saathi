import { useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';
import { useTranslation } from '../i18n/useTranslation';
import { useAuth } from '../firebase/authContext';
import { 
  Menu, 
  X, 
  Search, 
  Bot, 
  Info, 
  LogIn, 
  LogOut,
  User,
  Home as HomeIcon,
  ShieldCheck,
  ExternalLink,
  PhoneCall
} from 'lucide-react';

function MainLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: t('welcome') || 'Home', path: '/', icon: HomeIcon },
    { name: t('exploreSchemes') || 'Explore Schemes', path: '/schemes', icon: Search },
    { name: t('aiAssistant') || 'AI Assistant', path: '/chat', icon: Bot },
    { name: 'About & Help', path: '/about', icon: Info },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
      {/* Top National Tricolor Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="h-full flex-1 bg-accent" />
        <div className="h-full flex-1 bg-white" />
        <div className="h-full flex-1 bg-secondary" />
      </div>

      {/* Main Government Portal Header */}
      <header className="sticky top-0 z-40 bg-primary text-white shadow-md border-b border-primary-hover">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            
            {/* Logo / Branding */}
            <Link to="/" className="flex items-center gap-3 group text-white decoration-transparent">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 text-accent" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white">साथी</span>
                  <span className="text-xl font-extrabold tracking-wider text-accent">SAATHI</span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/30 hidden sm:inline">
                    AI Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 font-normal leading-tight hidden sm:block">
                  Indian Government Services & Schemes Assistant
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-white/15 text-white shadow-xs font-semibold'
                          : 'text-slate-200 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 opacity-80" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Right Action Area */}
            <div className="flex items-center gap-2.5">
              <LanguageSelector />
              
              {user ? (
                <div className="hidden sm:flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
                  <div className="w-6 h-6 rounded-full bg-accent text-slate-950 font-bold text-xs flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Citizen" className="w-full h-full object-cover" />
                    ) : user.displayName ? (
                      user.displayName[0].toUpperCase()
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="text-left leading-none max-w-[120px] truncate">
                    <span className="text-xs font-semibold text-white block truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[9px] text-accent font-medium">
                      {user.isDemo ? 'Demo Mode' : 'Verified'}
                    </span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="p-1 hover:bg-white/20 rounded text-slate-200 hover:text-white transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent text-slate-950 hover:bg-accent-hover transition-colors shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('login') || 'Sign In'}</span>
                </Link>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 focus:outline-hidden"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-primary-hover border-t border-white/10 px-4 pt-3 pb-5 space-y-2 shadow-xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-slate-200 hover:bg-white/10 text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-accent" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
            <div className="pt-2 border-t border-white/10 flex justify-between items-center">
              {user ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-accent text-slate-950 font-bold text-xs flex items-center justify-center overflow-hidden">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Citizen" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div className="text-xs text-white">
                      <div className="font-semibold">{user.displayName || user.email}</div>
                      <div className="text-[10px] text-accent">{user.isDemo ? 'Demo Mode' : 'Citizen Account'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-600/80 text-white font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-accent text-slate-950 w-full justify-center"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('login') || 'Citizen Login / Register'}</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Trustworthy Official Government Portal Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">साथी</span>
                <span className="text-xl font-extrabold text-accent">SAATHI</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empowering Indian citizens with direct discovery of government welfare schemes, eligibility guidance, and document checklists in English, Hindi, and Malayalam.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-[11px] text-accent border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Official Data Sources</span>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Quick Navigation</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/schemes" className="text-slate-400 hover:text-white transition-colors">Explore All Schemes</Link></li>
                <li><Link to="/chat" className="text-slate-400 hover:text-white transition-colors">AI Eligibility Assistant</Link></li>
                <li><Link to="/about" className="text-slate-400 hover:text-white transition-colors">About & Verification Policy</Link></li>
                <li><Link to="/auth" className="text-slate-400 hover:text-white transition-colors">Citizen Account</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">National Portals</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
                    National Portal of India <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://www.myscheme.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
                    myScheme Portal <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://pmjay.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
                    Ayushman Bharat (PM-JAY) <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://scholarships.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
                    National Scholarship Portal <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Citizen Helplines</h4>
              <div className="space-y-2.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-200">14443</span> - National Citizen Services
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-200">1800-180-1551</span> - Kisan Call Centre
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-200">14555</span> - Ayushman Bharat Health
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} Saathi Project. Dedicated to citizen welfare across India.</p>
            <p className="text-center sm:text-right">
              Saathi compiles public information from official government portals for civic assistance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
