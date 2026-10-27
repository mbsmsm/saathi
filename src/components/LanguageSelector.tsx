import { useNavigate } from 'react-router-dom';
import { useTranslation, setLanguage } from '../i18n/useTranslation';
import type { Language } from '../i18n/translations';
import { Globe } from 'lucide-react';

const languages: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
];

function LanguageSelector() {
  const { language, t } = useTranslation();
  const navigate = useNavigate();

  const handleSelect = (code: Language) => {
    setLanguage(code);
    navigate(0);
  };

  return (
    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs border border-white/20 rounded-lg p-1 text-white shadow-xs">
      <Globe className="w-3.5 h-3.5 ml-1.5 text-accent opacity-90 hidden sm:inline" />
      <div className="flex items-center gap-1">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => handleSelect(l.code)}
            className={`px-2 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              language === l.code
                ? 'bg-accent text-slate-950 font-bold shadow-xs'
                : 'text-white/85 hover:text-white hover:bg-white/15'
            }`}
            title={`${t('changeLanguage')}: ${l.label}`}
          >
            {l.native}
          </button>
        ))}
      </div>
    </div>
  );
}

export default LanguageSelector;
