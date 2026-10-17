import { DialectOption, VoiceOption, AlgerianExpression } from '../types';

export const DIALECTS: DialectOption[] = [
  {
    id: 'general',
    name: 'Algérien Général',
    nameAr: 'دارجة جزائرية جامعة',
    region: 'Toutes les régions (Algérie)',
    description: 'Le dialecte pan-algérien compréhensible par tous les Algériens.',
    example: 'واش راك، لاباس؟ كلش بخير؟'
  },
  {
    id: 'algerois',
    name: 'Algérois (Casbah & Centre)',
    nameAr: 'العاصمية (القصبة، باب الواد)',
    region: 'Alger, Blida, Boumerdès, Tipaza',
    description: 'Accent musical caractérisé par "يا خو", "حنا هكذا", intonations douces.',
    example: 'واش يا خو، صافا؟ قولي واش كاين جديد اليوم؟'
  },
  {
    id: 'oranais',
    name: 'Oranais (Wahran & Ouest)',
    nameAr: 'الوهرانية (الغرب الجزائري)',
    region: 'Oran, Tlemcen, Mostaganem, Sidi Bel Abbès',
    description: 'Rythme enjoué avec les célèbres "واه", "راك غاية", "حرز روحك".',
    example: 'واه خويا، راك غاية؟ راني فرحان بزاف كي هدرت معاك.'
  },
  {
    id: 'constantinois',
    name: 'Constantinois (Est Algérien)',
    nameAr: 'القسنطينية (الشرق الجزائري)',
    region: 'Constantine, Annaba, Sétif, Skikda, Guelma',
    description: 'Nuances orientales raffinées, prononciation distincte du "القاف" et politesse.',
    example: 'واش راك خويا، يسلمك ويعيشك، واش حوالكم اليوم؟'
  },
  {
    id: 'saharien',
    name: 'Saharien (Sud & Oasis)',
    nameAr: 'الصحراوية (الجنوب الكبير)',
    region: 'Ghardaïa, Ouargla, Biskra, Béchar, Tamanrasset',
    description: 'Profondeur poétique, accueil chaleureux et sérénité du désert.',
    example: 'يا مرحبا بيك وسهلا، واش راك وكيفاش حال الأهل؟'
  }
];

export const VOICES: VoiceOption[] = [
  {
    id: 'Kore',
    name: 'Amina (أمينة)',
    gender: 'female',
    tone: 'Chaleureuse & expressive',
    description: 'Voix féminine claire, posée et naturelle pour la Darija algérienne.'
  },
  {
    id: 'Puck',
    name: 'Walid (وليد)',
    gender: 'male',
    tone: 'Dynamique & moderne',
    description: 'Voix masculine jeune, énergique et conviviale.'
  },
  {
    id: 'Fenrir',
    name: 'Karim (كريم)',
    gender: 'male',
    tone: 'Posé & profond',
    description: 'Voix masculine chaleureuse, posée, style présentateur radio.'
  },
  {
    id: 'Zephyr',
    name: 'Leila (ليلى)',
    gender: 'female',
    tone: 'Douce & amicale',
    description: 'Voix féminine apaisante et bienveillante.'
  }
];

export const QUICK_PROMPTS = [
  {
    ar: 'واش راك خويا؟ لاباس عليك؟',
    arabizi: 'Wach rak khoya? Labas 3lik?',
    label: 'تحية وتعارف (Salutations)',
    category: 'discussion'
  },
  {
    ar: 'شحال راه الأورو والدولار اليوم في السكوار؟',
    arabizi: 'Chhal rah l euro w dollar lyoum f le Square?',
    label: 'سعر العملات في السكوار (Devises)',
    category: 'finance'
  },
  {
    ar: 'كيفاش نأكتيفي تطبيق بريدي موب BaridiMob ونشيك الحساب؟',
    arabizi: 'Kifech n\'aktivi BaridiMob w nchouf l compte?',
    label: 'بريدي موب وحساب CCP',
    category: 'admin'
  },
  {
    ar: 'أعطيني وصفة شخشوخة بسكرية حارة وأصيلة خطوة بخطوة',
    arabizi: 'A3tini recette Chakhchoukha bsikriya hara',
    label: 'وصفة الشخشوخة البسكرية (Cuisine)',
    category: 'cuisine'
  },
  {
    ar: 'واش كاين أخبار جديدة على الفريق الوطني ومحرز؟',
    arabizi: 'Wach kayen akhbar 3la l\'equipe nationale w Mahrez?',
    label: 'أخبار الخضر ومحرز (Sport)',
    category: 'sport'
  },
  {
    ar: 'أحكي لي نكتة مضحكة بالدارجة الجزائرية تفرفش عليا',
    arabizi: 'Ahkili noukta da7ak bdarija jazairia',
    label: 'نكتة جزائرية (Humour)',
    category: 'humour'
  }
];

export const ALGERIAN_EXPRESSIONS: AlgerianExpression[] = [
  {
    phraseAr: 'حنا في حنا',
    arabizi: 'Hna f hna',
    meaningFr: 'On est entre nous / nous sommes une même famille',
    meaningAr: 'نحن أهل ولا داعي للرسميات بيننا',
    usageContext: 'Utilisé pour rassurer quelqu\'un et marquer la solidarité fraternelle.',
    region: 'Partout en Algérie'
  },
  {
    phraseAr: 'يعطيك الصحة',
    arabizi: 'Yaatik essaha',
    meaningFr: 'Que la santé te soit donnée (Merci beaucoup / Bravo)',
    meaningAr: 'دعاء بالصحة والعافية وعبارة شكر وامتنان',
    usageContext: 'Formule incontournable de remerciement et d\'encouragement.',
    region: 'Nationale'
  },
  {
    phraseAr: 'على بالي',
    arabizi: '3la bali',
    meaningFr: 'Je sais / C\'est dans mon esprit',
    meaningAr: 'أنا على علم بذلك وفي خاطري',
    usageContext: 'Marque l\'accord ou la connaissance préalable d\'un fait.',
    region: 'Nationale'
  },
  {
    phraseAr: 'راك غاية؟',
    arabizi: 'Rak ghaya?',
    meaningFr: 'Est-ce que tu vas super bien ?',
    meaningAr: 'هل أنت بخير وفي أحسن حال؟',
    usageContext: 'Salutation typique de l\'Ouest algérien (Oran, Mostaganem).',
    region: 'Oranie (الغرب)'
  },
  {
    phraseAr: 'واش يا خو',
    arabizi: 'Wach ya kho',
    meaningFr: 'Quoi de neuf mon frère / mon ami',
    meaningAr: 'تحية عاصمية شهيرة بين الأصدقاء والإخوة',
    usageContext: 'Formule décontractée et chaleureuse du Grand Alger.',
    region: 'Algérois (العاصمة)'
  },
  {
    phraseAr: 'ماشي مشكل',
    arabizi: 'Machi mochkil',
    meaningFr: 'Pas de souci / Aucun problème',
    meaningAr: 'لا مشكلة والأمر بسيط',
    usageContext: 'Expression universelle de complaisance et de facilité.',
    region: 'Nationale'
  },
  {
    phraseAr: 'ربي يحفظك ويسلمك',
    arabizi: 'Rabi yahfdak w ysalmak',
    meaningFr: 'Que Dieu te préserve et te garde en sécurité',
    meaningAr: 'دعاء لطيف بالحفظ والسلامة',
    usageContext: 'Poli, chaleureux et plein de bienveillance.',
    region: 'Nationale'
  },
  {
    phraseAr: 'زَعْمَة',
    arabizi: 'Za3ma',
    meaningFr: 'Genre / Soi-disant / Comme si',
    meaningAr: 'بمعنى "كأنما" أو "يزعم"',
    usageContext: 'Employé pour ironiser ou donner un exemple.',
    region: 'Nationale'
  }
];
