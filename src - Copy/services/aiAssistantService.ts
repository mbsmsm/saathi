import { schemeData } from '../data/schemes';
import type { Scheme } from '../types/Scheme';

export type DetectedLanguage = 'en' | 'ml' | 'hi';

export interface AssistantResponse {
  text: string;
  relatedSchemeId?: string;
  links?: { title: string; url: string }[];
}

/**
 * Detect language of query:
 * 1. Malayalam script Unicode range [\u0D00-\u0D7F]
 * 2. Hindi (Devanagari) script Unicode range [\u0900-\u097F]
 * 3. Manglish (Malayalam written in Latin script)
 * 4. Hinglish (Hindi written in Latin script)
 * 5. English default
 */
export function detectLanguage(query: string, fallbackLang: DetectedLanguage = 'en'): DetectedLanguage {
  const text = query.trim();

  // 1. Script checks
  if (/[\u0D00-\u0D7F]/.test(text)) {
    return 'ml';
  }
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi';
  }

  const lower = text.toLowerCase();

  // 2. Manglish detection (Malayalam words written in English letters)
  const manglishPatterns = [
    /\b(namaskaram|swagatham|ariyumo|ariyanam|ariynam|cheyyanam|keralathile|padhathi|padhathikal|yojanagal|sahayam|vidyarthikal|karshakar|karshaka|evide|engane|enthaanu|enthanu|enthellam|undo|undoo|aarokke|njan|ningal|parayumo|samsarikkumo|rekha|rekhakal)\b/i,
    /malayalam\s+(parayumo|samsarikkumo|ariyumo|padikkumo)/i,
    /(kerala|malayalam)\s+.*(scheme|scholarship|pension|sahayam)/i,
  ];

  for (const pattern of manglishPatterns) {
    if (pattern.test(lower)) {
      return 'ml';
    }
  }

  // 3. Hinglish detection (Hindi words written in English letters)
  const hinglishPatterns = [
    /\b(namaste|pranam|kya|kaise|kaun|kaunsi|kisan|yojana|yojanaye|yojanaen|batao|bataiye|chahiye|shukriya|dhanyavad|patrata|dastavez|madad|kariye|kijiye)\b/i,
    /hindi\s+(aati|bolte|samajhte|me\s+batao)/i,
  ];

  for (const pattern of hinglishPatterns) {
    if (pattern.test(lower)) {
      return 'hi';
    }
  }

  return fallbackLang;
}

/**
 * Identify conversational intents: Language capability inquiry, Greetings, Gratitude, Capability
 */
function handleConversationalIntents(query: string, lang: DetectedLanguage): AssistantResponse | null {
  const q = query.toLowerCase();

  // 1. Language capability question: e.g. "Do you speak Malayalam?", "Can you speak Hindi?", "മലയാളം അറിയാമോ"
  const isMalayalamInquiry = 
    /do you (speak|know|understand) malayalam/i.test(q) ||
    /can you (speak|reply in) malayalam/i.test(q) ||
    /(malayalam|മലയാളം)\s*(ariyumo|samsarikkumo|parayumo|അറിയാമോ|സംസാരിക്കുമോ|അറിയുമോ)/i.test(q) ||
    /മലയാളത്തിൽ\s*(സംസാരിക്കുമോ|മറുപടി)/i.test(q);

  if (isMalayalamInquiry) {
    return {
      text: 
        `Yes, I speak Malayalam! തീർച്ചയായും, എനിക്ക് മലയാളത്തിൽ സംസാരിക്കാനും കേന്ദ്ര-സംസ്ഥാന സർക്കാർ ക്ഷേമപദ്ധതികളെക്കുറിച്ച് നിങ്ങളെ സഹായിക്കാനും സാധിക്കും.\n\n` +
        `നിങ്ങൾക്ക് ഇനിപ്പറയുന്ന കാര്യങ്ങളെക്കുറിച്ച് മലയാളത്തിൽ ചോദിക്കാം:\n` +
        `• വിദ്യാർത്ഥികൾക്കുള്ള സ്കോളർഷിപ്പുകൾ\n` +
        `• കർഷകർക്കുള്ള ധനസഹായ പദ്ധതികൾ (PM-KISAN)\n` +
        `• ആരോഗ്യ ഇൻഷുറൻസ് (ആയുഷ്മാൻ ഭാരത്)\n` +
        `• ജൻ ധൻ ബാങ്കിംഗ് സേവനങ്ങളും ആവശ്യമായ രേഖകളും\n\n` +
        `എന്ത് വിവരമാണ് നിങ്ങൾക്ക് അറിയേണ്ടത്?`,
      links: [{ title: 'Explore Schemes Catalog', url: '/schemes' }],
    };
  }

  const isHindiInquiry = 
    /do you (speak|know|understand) hindi/i.test(q) ||
    /can you (speak|reply in) hindi/i.test(q) ||
    /(hindi|हिंदी)\s*(bolte|aati|samajhte|बोलते|आती)/i.test(q) ||
    /क्या\s*आप\s*हिंदी/i.test(q);

  if (isHindiInquiry) {
    return {
      text: 
        `हाँ, मैं हिंदी समझता और बोलता हूँ! आप मुझसे केंद्र एवं राज्य सरकार की कल्याणकारी योजनाओं, उनकी पात्रता और आवश्यक दस्तावेजों के बारे में हिंदी में पूछ सकते हैं।\n\n` +
        `उदाहरण के लिए:\n` +
        `• किसानों के लिए कौन-सी सरकारी योजनाएँ हैं?\n` +
        `• छात्रों के लिए छात्रवृत्तियां\n` +
        `• आयुष्मान भारत स्वास्थ्य बीमा\n` +
        `• जन धन खाता खोलने के लिए आवश्यक दस्तावेज़`,
      links: [{ title: 'योजना सूची देखें', url: '/schemes' }],
    };
  }

  // 2. Greetings
  const isGreeting = 
    /\b(hello|hi|hey|good morning|good afternoon|good evening|namaste|namaskar|pranam)\b/i.test(q) ||
    q.includes('नमस्ते') || q.includes('नमस्कार') || q.includes('प्रणाम') ||
    q.includes('നമസ്കാരം') || q.includes('ഹലോ') || q.includes('സുപ്രഭാതം');

  if (isGreeting) {
    if (lang === 'ml') {
      return {
        text: 
          `നമസ്കാരം! ഞാൻ സാഥി (Saathi) - ഭാരത സർക്കാർ സേവന എഐ സഹായിയാണ്. 🇮🇳\n\n` +
          `കേന്ദ്ര-സംസ്ഥാന സർക്കാരുകളുടെ വിവിധ ക്ഷേമപദ്ധതികൾ, സ്കോളർഷിപ്പുകൾ, കർഷക ആനുകൂല്യങ്ങൾ, ആരോഗ്യ ഇൻഷുറൻസ്, ബാങ്കിംഗ് എന്നിവയുടെ വിവരങ്ങളും ആവശ്യമായ രേഖകളും യോഗ്യതയും ഞാൻ പങ്കുവെക്കാം.\n\n` +
          `ഏത് പദ്ധതിയെക്കുറിച്ചാണ് നിങ്ങൾക്ക് അറിയേണ്ടത്?`,
        links: [{ title: 'പദ്ധതികൾ പരിശോധിക്കുക (Explore Schemes)', url: '/schemes' }],
      };
    }
    if (lang === 'hi') {
      return {
        text: 
          `नमस्ते! मैं साथी (Saathi) - सरकारी सेवा सहायक हूँ। 🇮🇳\n\n` +
          `मैं आपको केंद्र और राज्य सरकार की प्रमुख योजनाओं (जैसे किसान सम्मान निधि, आयुष्मान भारत, छात्रवृत्ति, जन धन योजना आदि), उनकी पात्रता और आवश्यक दस्तावेजों की सटीक जानकारी दे सकता हूँ।\n\n` +
          `आप किस योजना या सेवा के बारे में जानना चाहते हैं?`,
        links: [{ title: 'सभी योजनाएं देखें (View All Schemes)', url: '/schemes' }],
      };
    }
    return {
      text: 
        `Hello! I am Saathi, your Indian Government Services & Schemes Assistant. 🇮🇳\n\n` +
        `I can help you discover verified Central and State welfare programs, check eligibility criteria, identify required documents, and guide you to official application portals.\n\n` +
        `How can I assist you today?`,
      links: [{ title: 'Explore All Schemes', url: '/schemes' }],
    };
  }

  // 3. Gratitude
  const isGratitude = 
    /\b(thank you|thanks|thanku|thx|dhanyavad|shukriya)\b/i.test(q) ||
    q.includes('നന്ദി') ||
    q.includes('धन्यवाद') || q.includes('शुक्रिया');

  if (isGratitude) {
    if (lang === 'ml') {
      return {
        text: `സന്തോഷം! സർക്കാർ പദ്ധതികളെക്കുറിച്ച് കൂടുതൽ സംശയങ്ങളുണ്ടെങ്കിൽ എപ്പോൾ വേണമെങ്കിലും ചോദിക്കാം. ശുഭദിനം നേരുന്നു!`,
      };
    }
    if (lang === 'hi') {
      return {
        text: `आपका स्वागत है! यदि आपके पास सरकारी योजनाओं के संबंध में कोई अन्य प्रश्न हों, तो बेझिझक पूछें।`,
      };
    }
    return {
      text: `You're welcome! Feel free to ask anytime if you need more information about government schemes and citizen services.`,
    };
  }

  // 4. Capability / Help
  const isCapability = 
    /\b(who are you|what can you do|help me|help)\b/i.test(q) ||
    q.includes('ആരാണ്') || q.includes('സഹായിക്കാമോ') || q.includes('എന്തൊക്കെ ചെയ്യാം') ||
    q.includes('तुम कौन हो') || q.includes('आप कौन हैं') || q.includes('क्या कर सकते') || q.includes('मदद');

  if (isCapability) {
    if (lang === 'ml') {
      return {
        text: 
          `ഇന്ത്യൻ പൗരന്മാർക്ക് സർക്കാർ ക്ഷേമപദ്ധതികൾ കണ്ടെത്താനും അവയുടെ യോഗ്യതകളും രേഖകളും മനസ്സിലാക്കാനും സഹായിക്കുന്ന സിറ്റിസൺ അസിസ്റ്റന്റാണ് **സാഥി (Saathi)**.\n\n` +
          `എനിക്ക് നിങ്ങളെ സഹായിക്കാനാകുന്ന മേഖലകൾ:\n` +
          `1. **സ്കോളർഷിപ്പുകൾ**: വിദ്യാർത്ഥികൾക്കുള്ള പഠന സഹായങ്ങൾ (NSP)\n` +
          `2. **കർഷക ആനുകൂല്യങ്ങൾ**: PM-KISAN ₹6,000 ധനസഹായം\n` +
          `3. **ചികിത്സാ സഹായം**: ആയുഷ്മാൻ ഭാരത് ₹5 ലക്ഷം വരെയുള്ള ആരോഗ്യ ഇൻഷുറൻസ്\n` +
          `4. **ബാങ്കിംഗ് & സമ്പാദ്യം**: ജൻ ധൻ യോജന, സുകന്യ സമൃദ്ധി യോജന\n` +
          `5. **തൊഴിലുറപ്പ്**: മഹാത്മാഗാന്ധി NREGA 100 ദിന തൊഴിൽ`,
        links: [{ title: 'സ്കീം കാറ്റലോഗ് കാണുക', url: '/schemes' }],
      };
    }
    if (lang === 'hi') {
      return {
        text: 
          `मैं **साथी (Saathi)** हूँ - भारतीय नागरिकों के लिए एक सरकारी सेवा सहायक।\n\n` +
          `मैं आपको निम्न विषयों पर प्रमाणित जानकारी दे सकता हूँ:\n` +
          `1. **छात्रवृत्ति**: उच्च शिक्षा व पोस्ट-मैट्रिक छात्रवृत्तियां (NSP)\n` +
          `2. **कृषि सहायता**: पीएम-किसान योजना (प्रतिवर्ष ₹6,000)\n` +
          `3. **स्वास्थ्य बीमा**: आयुष्मान भारत (प्रति परिवार ₹5 लाख तक कैशलेस इलाज)\n` +
          `4. **बैंकिंग व बचत**: जन धन योजना, सुकन्या समृद्धि योजना\n` +
          `5. **ग्रामीण रोजगार**: मनरेगा 100 दिन का गारंटीशुदा रोजगार`,
        links: [{ title: 'सभी योजनाएं देखें', url: '/schemes' }],
      };
    }
    return {
      text: 
        `I am **Saathi**, an assistant dedicated to helping Indian citizens discover welfare schemes and public services.\n\n` +
        `I can provide reliable information on:\n` +
        `1. **Education & Scholarships**: National Scholarship Portal post-matric awards\n` +
        `2. **Farmers & Agriculture**: PM-KISAN direct income support\n` +
        `3. **Healthcare**: Ayushman Bharat (PM-JAY) hospital assurance\n` +
        `4. **Financial Inclusion**: Jan Dhan zero-balance accounts & RuPay\n` +
        `5. **Women & Child**: Sukanya Samriddhi savings for girl children\n` +
        `6. **Employment**: MGNREGA rural wage employment`,
      links: [{ title: 'Explore Schemes', url: '/schemes' }],
    };
  }

  return null;
}

/**
 * Determine what aspect the user is asking about (documents, eligibility, benefits, how to apply, or general overview)
 */
interface QueryAspect {
  documents: boolean;
  eligibility: boolean;
  benefits: boolean;
  application: boolean;
}

function extractAspect(query: string): QueryAspect {
  const q = query.toLowerCase();
  return {
    documents: /\b(document|documents|proof|proofs|papers|kyc|രേഖ|രേഖകൾ|ആവശ്യമായ രേഖകൾ|दस्तावेज|कागजात|प्रमाण पत्र)\b/i.test(q),
    eligibility: /\b(eligibility|eligible|qualification|qualify|who can apply|യോഗ്യത|ആർക്കൊക്കെ|പാത്രത|पात्रता|योग्यता|शर्तें|कौन आवेदन कर सकता है)\b/i.test(q),
    benefits: /\b(benefit|benefits|amount|money|rupees|fasility|features|ആനുകൂല്യം|ആനുകൂല്യങ്ങൾ|പണം|തുക|लाभ|फायदे|कितने पैसे|सहायता)\b/i.test(q),
    application: /\b(how to apply|apply|application|procedure|steps|process|എങ്ങനെ അപേക്ഷിക്കാം|അപേക്ഷ|आवेदन कैसे करें|प्रक्रिया)\b/i.test(q),
  };
}

/**
 * Find matching scheme based on multilingual keywords and synonyms
 */
function findMatchingScheme(query: string): Scheme | null {
  const q = query.toLowerCase();

  // 1. PM-KISAN / Agriculture / Farmers
  if (
    q.includes('farmer') || q.includes('farmers') || q.includes('kisan') || 
    q.includes('pm-kisan') || q.includes('pmkisan') || q.includes('agriculture') || 
    q.includes('krishi') || q.includes('കർഷക') || q.includes('കർഷകർ') || 
    q.includes('കൃഷി') || q.includes('किसान') || q.includes('कृषि') || q.includes('खेती')
  ) {
    return schemeData.find((s) => s.id === 'sch-002') || null;
  }

  // 2. Scholarships / Students / Education
  if (
    q.includes('scholarship') || q.includes('scholarships') || q.includes('student') || 
    q.includes('students') || q.includes('education') || q.includes('study') || 
    q.includes('matric') || q.includes('vidyarthi') || q.includes('വിദ്യാർത്ഥി') || 
    q.includes('വിദ്യാർത്ഥികൾ') || q.includes('സ്കോളർഷിപ്പ്') || q.includes('സ്കോളർഷിപ്പുകൾ') || 
    q.includes('പഠനം') || q.includes('छात्र') || q.includes('छात्रों') || 
    q.includes('छात्रवृत्ति') || q.includes('छात्रवृत्तियां') || q.includes('पढ़ाई')
  ) {
    return schemeData.find((s) => s.id === 'sch-005') || null;
  }

  // 3. Jan Dhan / Banking / Accounts / Overdraft
  if (
    q.includes('jan dhan') || q.includes('pmjdy') || q.includes('jandhan') || 
    q.includes('bank account') || q.includes('zero balance') || q.includes('rupay') || 
    q.includes('overdraft') || q.includes('ജൻ ധൻ') || q.includes('ജന ധൻ') || 
    q.includes('ബാങ്ക് അക്കൗണ്ട്') || q.includes('ജനധൻ') || q.includes('जन धन') || 
    q.includes('बैंक खाता') || q.includes('जीरो बैलेंस')
  ) {
    return schemeData.find((s) => s.id === 'sch-001') || null;
  }

  // 4. Ayushman Bharat / Health / Insurance / Hospital
  if (
    q.includes('ayushman') || q.includes('pm-jay') || q.includes('pmjay') || 
    q.includes('health') || q.includes('hospital') || q.includes('medical') || 
    q.includes('insurance') || q.includes('treatment') || q.includes('cashless') || 
    q.includes('ആരോഗ്യം') || q.includes('ചികിത്സ') || q.includes('ആശുപത്രി') || 
    q.includes('ഇൻഷുറൻസ്') || q.includes('ആയുഷ്മാൻ') || q.includes('आयुष्मान') || 
    q.includes('स्वास्थ्य') || q.includes('इलाज') || q.includes('अस्पताल') || q.includes('बीमा')
  ) {
    return schemeData.find((s) => s.id === 'sch-003') || null;
  }

  // 5. Sukanya Samriddhi / Girl Child / Marriage fund
  if (
    q.includes('sukanya') || q.includes('samriddhi') || q.includes('girl') || 
    q.includes('daughter') || q.includes('ssy') || q.includes('പെൺകുട്ടി') || 
    q.includes('മകൾ') || q.includes('സുകന്യ') || q.includes('सुकन्या') || 
    q.includes('बेटी') || q.includes('बालिका')
  ) {
    return schemeData.find((s) => s.id === 'sch-004') || null;
  }

  // 6. MGNREGA / 100 days work / Rural employment
  if (
    q.includes('nrega') || q.includes('mgnrega') || q.includes('100 days') || 
    q.includes('rural work') || q.includes('job card') || q.includes('employment') || 
    q.includes('തൊഴിലുറപ്പ്') || q.includes('നൂറു തൊഴിൽ') || q.includes('തൊഴിൽ') || 
    q.includes('मनरेगा') || q.includes('रोजगार') || q.includes('जॉब कार्ड')
  ) {
    return schemeData.find((s) => s.id === 'sch-006') || null;
  }

  // Fallback: match by scheme name keywords
  for (const s of schemeData) {
    const nameLower = s.name.toLowerCase();
    const catLower = s.category.toLowerCase();
    if (nameLower.split(' ').some((word) => word.length > 4 && q.includes(word))) {
      return s;
    }
    if (catLower.split(' ').some((word) => word.length > 4 && q.includes(word))) {
      return s;
    }
  }

  return null;
}

/**
 * Generate scheme response in Malayalam
 */
function buildMalayalamSchemeReply(scheme: Scheme, aspect: QueryAspect): AssistantResponse {
  const links = [
    { title: `${scheme.name} ഔദ്യോഗിക വെബ്സൈറ്റ്`, url: scheme.officialUrl },
  ];
  if (scheme.applicationUrl) {
    links.push({ title: 'ഓൺലൈൻ അപേക്ഷാ ലിങ്ക് (Apply Online)', url: scheme.applicationUrl });
  }

  // If user specifically asked about documents
  if (aspect.documents) {
    return {
      text: 
        `**${scheme.name}** പദ്ധതിക്ക് ആവശ്യമായ രേഖകൾ താഴെ നൽകുന്നു:\n\n` +
        `📋 **ആവശ്യമായ രേഖകൾ:**\n${scheme.documents}\n\n` +
        `ℹ️ **പദ്ധതിയെക്കുറിച്ച് ചുരുക്കത്തിൽ:**\n${scheme.shortDescription}\n\n` +
        `⚠️ *ശ്രദ്ധിക്കുക: ഔദ്യോഗിക സർക്കാർ പോർട്ടലിൽ (${new URL(scheme.officialUrl).hostname}) വിവരങ്ങൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക.*`,
      relatedSchemeId: scheme.id,
      links,
    };
  }

  // If user specifically asked about eligibility
  if (aspect.eligibility) {
    return {
      text: 
        `**${scheme.name}** പദ്ധതിയുടെ യോഗ്യതാ മാനദണ്ഡങ്ങൾ താഴെ നൽകുന്നു:\n\n` +
        `✅ **യോഗ്യത (Eligibility):**\n${scheme.eligibility}\n\n` +
        `🎁 **പ്രധാന ആനുകൂല്യം:**\n${scheme.benefits}\n\n` +
        `📋 **ആവശ്യമായ രേഖകൾ:**\n${scheme.documents}\n\n` +
        `⚠️ *ശ്രദ്ധിക്കുക: യോഗ്യതാ മാനദണ്ഡങ്ങൾ ഔദ്യോഗിക സർക്കാർ പോർട്ടലിൽ സ്ഥിരീകരിക്കുക.*`,
      relatedSchemeId: scheme.id,
      links,
    };
  }

  // Default comprehensive scheme overview in Malayalam
  return {
    text: 
      `**${scheme.name}** (${scheme.category} - ${scheme.classification} Government Scheme)\n\n` +
      `📌 **വിവരണം:**\n${scheme.shortDescription}\n\n` +
      `🎁 **പ്രധാന ആനുകൂല്യങ്ങൾ:**\n${scheme.benefits}\n\n` +
      `✅ **യോഗ്യത:**\n${scheme.eligibility}\n\n` +
      `📋 **ആവശ്യമായ രേഖകൾ:**\n${scheme.documents}\n\n` +
      `📝 **അപേക്ഷിക്കേണ്ട വിധം:**\n${scheme.applicationProcess}\n\n` +
      `⚠️ *കൂടുതൽ വിവരങ്ങൾക്കും അപേക്ഷ സമർപ്പിക്കുന്നതിനും താഴെ നൽകിയിരിക്കുന്ന ഔദ്യോഗിക ലിങ്ക് സന്ദർശിക്കുക.*`,
    relatedSchemeId: scheme.id,
    links,
  };
}

/**
 * Generate scheme response in Hindi
 */
function buildHindiSchemeReply(scheme: Scheme, aspect: QueryAspect): AssistantResponse {
  const links = [
    { title: `${scheme.name} आधिकारिक पोर्टल`, url: scheme.officialUrl },
  ];
  if (scheme.applicationUrl) {
    links.push({ title: 'ऑनलाइन आवेदन करें', url: scheme.applicationUrl });
  }

  // If user asked about documents
  if (aspect.documents) {
    return {
      text: 
        `**${scheme.name}** के लिए आवश्यक दस्तावेजों की सूची:\n\n` +
        `📋 **आवश्यक दस्तावेज़:**\n${scheme.documents}\n\n` +
        `ℹ️ **योजना का संक्षिप्त विवरण:**\n${scheme.shortDescription}\n\n` +
        `⚠️ *नोट: आवेदन करने से पहले आधिकारिक सरकारी पोर्टल पर विवरण अवश्य सत्यापित करें।*`,
      relatedSchemeId: scheme.id,
      links,
    };
  }

  // If user asked about eligibility
  if (aspect.eligibility) {
    return {
      text: 
        `**${scheme.name}** की पात्रता शर्तें:\n\n` +
        `✅ **पात्रता (Eligibility):**\n${scheme.eligibility}\n\n` +
        `🎁 **प्रमुख लाभ:**\n${scheme.benefits}\n\n` +
        `📋 **आवश्यक दस्तावेज़:**\n${scheme.documents}\n\n` +
        `⚠️ *नोट: आधिकारिक सरकारी पोर्टल पर अंतिम नियमों की जांच करें।*`,
      relatedSchemeId: scheme.id,
      links,
    };
  }

  // Default comprehensive overview in Hindi
  return {
    text: 
      `**${scheme.name}** (${scheme.category} - ${scheme.classification} सरकारी योजना)\n\n` +
      `📌 **विवरण:**\n${scheme.shortDescription}\n\n` +
      `🎁 **प्रमुख लाभ:**\n${scheme.benefits}\n\n` +
      `✅ **पात्रता:**\n${scheme.eligibility}\n\n` +
      `📋 **आवश्यक दस्तावेज़:**\n${scheme.documents}\n\n` +
      `📝 **आवेदन प्रक्रिया:**\n${scheme.applicationProcess}\n\n` +
      `⚠️ *आधिकारिक पोर्टल से जानकारी सत्यापित कर आवेदन करें।*`,
    relatedSchemeId: scheme.id,
    links,
  };
}

/**
 * Generate scheme response in English
 */
function buildEnglishSchemeReply(scheme: Scheme, aspect: QueryAspect): AssistantResponse {
  const links = [
    { title: `${scheme.name} Official Website`, url: scheme.officialUrl },
  ];
  if (scheme.applicationUrl) {
    links.push({ title: 'Direct Application Portal', url: scheme.applicationUrl });
  }

  if (aspect.documents) {
    return {
      text: 
        `Here are the required documents for **${scheme.name}**:\n\n` +
        `📋 **Required Documents:**\n${scheme.documents}\n\n` +
        `ℹ️ **Overview:** ${scheme.shortDescription}\n\n` +
        `⚠️ *Verification Notice: Always verify latest document requirements on the official government portal.*`,
      relatedSchemeId: scheme.id,
      links,
    };
  }

  if (aspect.eligibility) {
    return {
      text: 
        `Here is the eligibility criteria for **${scheme.name}**:\n\n` +
        `✅ **Eligibility:**\n${scheme.eligibility}\n\n` +
        `🎁 **Key Benefits:**\n${scheme.benefits}\n\n` +
        `📋 **Required Documents:**\n${scheme.documents}\n\n` +
        `⚠️ *Verification Notice: Eligibility rules are governed by official department notifications.*`,
      relatedSchemeId: scheme.id,
      links,
    };
  }

  return {
    text: 
      `**${scheme.name}** (${scheme.category} • ${scheme.classification} Government Scheme)\n\n` +
      `📌 **Overview:**\n${scheme.shortDescription}\n\n` +
      `🎁 **Key Benefits:**\n${scheme.benefits}\n\n` +
      `✅ **Eligibility Criteria:**\n${scheme.eligibility}\n\n` +
      `📋 **Required Documents:**\n${scheme.documents}\n\n` +
      `📝 **Application Process:**\n${scheme.applicationProcess}\n\n` +
      `⚠️ *Please verify official rules and deadlines on the government portal before submitting documents.*`,
    relatedSchemeId: scheme.id,
    links,
  };
}

/**
 * Main Assistant Inference Function: Rule-based & knowledge-grounded
 */
export function getAssistantResponse(query: string, currentUiLanguage: 'en' | 'ml' | 'hi' = 'en'): AssistantResponse {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return {
      text: 'Please type your question about Indian government schemes, eligibility, or required documents.',
    };
  }

  // 1. Detect language
  const detectedLang = detectLanguage(cleanQuery, currentUiLanguage);

  // 2. Check conversational intents (greetings, language inquiries, capabilities, thanks)
  const conversationalReply = handleConversationalIntents(cleanQuery, detectedLang);
  if (conversationalReply) {
    return conversationalReply;
  }

  // 3. Match against Scheme Knowledge Base
  const matchedScheme = findMatchingScheme(cleanQuery);
  const aspect = extractAspect(cleanQuery);

  if (matchedScheme) {
    if (detectedLang === 'ml') {
      return buildMalayalamSchemeReply(matchedScheme, aspect);
    }
    if (detectedLang === 'hi') {
      return buildHindiSchemeReply(matchedScheme, aspect);
    }
    return buildEnglishSchemeReply(matchedScheme, aspect);
  }

  // 4. Helpful Fallback when no direct match is found
  if (detectedLang === 'ml') {
    return {
      text: 
        `നിങ്ങൾ തിരഞ്ഞ വിവരങ്ങൾ ലഭ്യമായ സ്കീം ഡാറ്റാബേസിൽ നേരിട്ട് കണ്ടെത്താനായില്ല.\n\n` +
        `താഴെ പറയുന്ന വിഷയങ്ങളെക്കുറിച്ച് ചോദിച്ചു നോക്കൂ:\n` +
        `• **സ്കോളർഷിപ്പുകൾ**: വിദ്യാർത്ഥികൾക്കുള്ള സഹായങ്ങൾ (NSP)\n` +
        `• **കർഷകർ**: പിഎം കിസാൻ ₹6,000 ധനസഹായം\n` +
        `• **ആരോഗ്യം**: ആയുഷ്മാൻ ഭാരത് സൗജന്യ ചികിത്സ\n` +
        `• **ബാങ്കിംഗ്**: ജൻ ധൻ സീറോ ബാലൻസ് അക്കൗണ്ട്\n` +
        `• **തൊഴിലുറപ്പ്**: മഹാത്മാഗാന്ധി NREGA തൊഴിൽ\n\n` +
        `അല്ലെങ്കിൽ താഴെയുള്ള ലിങ്ക് വഴി മുഴുവൻ പദ്ധതികളും പരിശോധിക്കാം.`,
      links: [{ title: 'എല്ലാ പദ്ധതികളും കാണുക (Explore All Schemes)', url: '/schemes' }],
    };
  }

  if (detectedLang === 'hi') {
    return {
      text: 
        `आपकी खोज से संबंधित विशिष्ट योजना वर्तमान डेटाबेस में नहीं मिली।\n\n` +
        `आप निम्न विषयों के बारे में पूछ सकते हैं:\n` +
        `• **छात्रवृत्ति**: छात्रों के लिए उच्च शिक्षा सहायता (NSP)\n` +
        `• **किसान**: पीएम-किसान सम्मान निधि (₹6,000 वार्षिक)\n` +
        `• **स्वास्थ्य**: आयुष्मान भारत (₹5 लाख तक मुफ्त इलाज)\n` +
        `• **बैंकिंग**: जन धन योजना और आवश्यक दस्तावेज़\n` +
        `• **रोजगार**: मनरेगा 100 दिन का कार्य\n\n` +
        `आप नीचे दिए गए लिंक से योजनाओं की पूरी सूची भी देख सकते हैं।`,
      links: [{ title: 'पूरी योजना सूची देखें (View All Schemes)', url: '/schemes' }],
    };
  }

  return {
    text: 
      `I could not find an exact match for that specific inquiry in our starter scheme dataset.\n\n` +
      `You can ask about:\n` +
      `• **Students**: "What scholarships are available for students?"\n` +
      `• **Farmers**: "Which schemes support farmers?"\n` +
      `• **Healthcare**: "How does Ayushman Bharat work?"\n` +
      `• **Banking**: "What documents are needed for Jan Dhan?"\n` +
      `• **Employment**: "MGNREGA 100 days job details"\n\n` +
      `You can also browse all available welfare initiatives in our full catalog.`,
    links: [{ title: 'Browse All Government Schemes', url: '/schemes' }],
  };
}
