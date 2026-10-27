export type Language = 'en' | 'hi' | 'ml';

interface Translations {
  [key: string]: { en: string; hi: string; ml: string };
}

export const translations: Translations = {
  welcome: { en: 'Welcome', hi: 'स्वागत है', ml: 'സ്വാഗതം' },
  changeLanguage: { en: 'Change language', hi: 'भाषा बदलें', ml: 'ഭാഷ മാറ്റുക' },
  exploreSchemes: { en: 'Explore Schemes', hi: 'योजनाएँ देखें', ml: 'സ്കീമുകൾ പരിശോധിക്കുക' },
  aiAssistant: { en: 'AI Assistant', hi: 'एआई सहायक', ml: 'എഐ സഹായക' },
  searchPlaceholder: { en: 'Search schemes…', hi: 'योजनाएँ खोजें…', ml: 'സ്കീമുകൾ തിരയുക…' },
  filterCategory: { en: 'Category', hi: 'श्रेणी', ml: 'വിഭാഗം' },
  noResults: { en: 'No schemes found.', hi: 'कोई योजना नहीं मिली।', ml: 'സ്കീമുകളൊന്നും ലഭിച്ചില്ല.' },
  loading: { en: 'Loading…', hi: 'लोड हो रहा है…', ml: 'ലോഡിംഗ്…' },
  login: { en: 'Login', hi: 'लॉगिन', ml: 'ലോഗിൻ' },
  email: { en: 'Email', hi: 'ईमेल', ml: 'ഇമെയിൽ' },
  password: { en: 'Password', hi: 'पासवर्ड', ml: 'പാസ്വേഡ്' },
  submit: { en: 'Submit', hi: 'जमा करें', ml: 'സമർപ്പിക്കുക' },
  save: { en: 'Save', hi: 'सहेजें', ml: 'സംരക്ഷിക്കുക' },
  saved: { en: 'Saved', hi: 'सहेजा गया', ml: 'സംരക്ഷിച്ചു' },
};
