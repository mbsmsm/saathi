import { useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { useAuth } from '../firebase/authContext';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User as UserIcon, 
  AlertCircle, 
  CheckCircle2, 
  LogOut,
  Info
} from 'lucide-react';

function Auth() {
  const { t } = useTranslation();
  const { user, login, register, logout, resetPassword, signInWithGoogle, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [googleLoading, setGoogleLoading] = useState(false);

  const getFriendlyError = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Incorrect email or password. Please verify and try again.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'This email address is already registered. Please sign in instead.';
    }
    if (code === 'auth/weak-password') {
      return 'Password is too weak. Please use at least 6 characters.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'Google Sign-In is not enabled in your Firebase Console. Go to Authentication > Sign-in method, click Google, and enable it with a support email.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in window was closed before completing the sign-in.';
    }
    if (code === 'auth/popup-blocked') {
      return 'Google sign-in popup was blocked by your browser. Please allow popups for localhost to sign in.';
    }
    if (code === 'auth/cancelled-popup-request') {
      return 'Another sign-in popup request is already in progress.';
    }
    if (code === 'auth/unauthorized-domain') {
      return 'Current domain (localhost) is not in Firebase Authorized Domains. In Firebase Console, navigate to Authentication > Settings > Authorized domains and ensure localhost is listed.';
    }
    if (code === 'auth/account-exists-with-different-credential') {
      return 'An account already exists with this email address using different sign-in credentials. Please sign in with your email and password.';
    }
    if (code === 'auth/network-request-failed') {
      return 'Network connection error. Please check your internet connectivity and try again.';
    }
    return err?.message || 'Authentication error. Please check your credentials.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        setSuccessMsg('Successfully signed in.');
        setTimeout(() => navigate('/schemes'), 600);
      } else if (mode === 'register') {
        await register(email, password, name);
        setSuccessMsg('Account registered successfully.');
        setTimeout(() => navigate('/schemes'), 600);
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMsg('Password reset link sent to your email. Check your inbox.');
      }
    } catch (err: any) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      setSuccessMsg('Signed in with Google successfully. Redirecting to dashboard...');
      setTimeout(() => navigate('/'), 600);
    } catch (err: any) {
      setError(getFriendlyError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  // If already logged in
  if (user) {
    return (
      <div className="max-w-md mx-auto my-10 bg-white p-8 rounded-2xl border border-slate-200 shadow-md text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8 text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Signed In As</h2>
          <p className="text-sm font-semibold text-primary mt-1">{user.displayName || 'Citizen'}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
          {user.isDemo && (
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Demo Session (Local)
            </span>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
          <button
            onClick={() => navigate('/schemes')}
            className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors"
          >
            Explore Schemes
          </button>
          <button
            onClick={() => logout()}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-8 space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-md">
        
        {/* Header Branding */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-7 h-7 text-accent" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {mode === 'login' && 'Citizen Portal Login'}
            {mode === 'register' && 'New Citizen Registration'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'forgot'
              ? 'Enter your registered email to receive a password reset link.'
              : 'Save favorite schemes, track eligibility, and access citizen services.'}
          </p>
        </div>

        {/* Demo Mode or Live Status Banner */}
        {!isFirebaseConfigured ? (
          <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Demo Mode Active:</span> Firebase credentials are not yet configured in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">.env.local</code>. Authentication runs locally in simulated demo mode.
            </div>
          </div>
        ) : (
          <div className="mb-5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Connected to Live Firebase Authentication</span>
          </div>
        )}

        {/* Notifications */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="leading-tight">{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>{successMsg}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:border-primary bg-slate-50 focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t('email') || 'Email Address'}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="citizen@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:border-primary bg-slate-50 focus:bg-white transition-all"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">{t('password') || 'Password'}</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:border-primary bg-slate-50 focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-colors shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
            <span>
              {mode === 'login' && (t('login') || 'Sign In')}
              {mode === 'register' && 'Create Citizen Account'}
              {mode === 'forgot' && 'Send Password Reset Link'}
            </span>
          </button>
        </form>

        {/* Google Sign In option */}
        {mode !== 'forgot' && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {googleLoading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-600 border-t-transparent" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Switch mode links */}
        <div className="text-center pt-4 text-xs space-y-1">
          {mode === 'login' ? (
            <p className="text-slate-500">
              New to Saathi?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Register here
              </button>
            </p>
          ) : (
            <p className="text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>

      <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          Citizens can explore all government schemes freely without an account. Registration is only required to save and bookmark schemes.
        </span>
      </div>
    </div>
  );
}

export default Auth;
