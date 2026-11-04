/**
 * All Arabic copy, taken from the Figma frames "IPhone 18 Pro max" with the
 * Pro Max corrections applied (6.9" display, 45h video, Arabic spec labels,
 * «آيفون 18 برو ماكس», «إمكانيات مذهلة», Arabic-Indic prices).
 */

export const PRICE_WAFI = '٥٬٩٩٩';
export const PRICE_COMPETITORS = '٦٬١٩٩';
export const PRICE_SAVING = '٢٠٠';
export const RIYAL = 'ريال';

export const PRODUCT_NAME_LATIN = 'iPhone 18 Pro Max';
export const PRODUCT_NAME_AR = 'آيفون 18 برو ماكس';

export type NavItem = { label: string; href: string };

/** Nav labels exactly as in Figma. See README for the anchor mapping. */
export const NAV_ITEMS: NavItem[] = [
  { label: 'المواصفات', href: '#specs' },
  { label: 'الاستلام', href: '#pickup' },
  { label: 'التوصيل', href: '#pickup' },
  { label: 'الدفع', href: '#order' },
  { label: 'خطوات الطلب', href: '#order' },
];

/** The mobile menu adds the FAQ row (frame 463:1118). */
export const MENU_ITEMS: NavItem[] = [...NAV_ITEMS, { label: 'الأسئلة الشائعة', href: '#faq' }];

export const FOOTER_LINKS: NavItem[] = [
  { label: 'المواصفات', href: '#specs' },
  { label: 'الاستلام', href: '#pickup' },
  { label: 'التوصيل', href: '#pickup' },
  { label: 'الدفع', href: '#order' },
  { label: 'الأسئلة الشائعة', href: '#faq' },
];

export const HERO = {
  chip: 'متاح للشراء',
  title: 'استلام فوري',
  copyLead: 'اختر اللون والسعة المناسبين لك، وراجع تفاصيل الشراء ',
  copyStrong: 'والاستلام فوري',
  cta: 'اشترِ الآن',
  note: 'توفّر الألوان والسعات حسب المخزون.',
  modelLabel: 'الطراز',
  trust: [
    { label: 'استلام من الفرع', icon: '/icons/store.svg' },
    { label: 'توصيل لباب البيت', icon: '/icons/delivery.svg' },
  ],
};

export const PRICE_COMPARE = {
  eyebrow: 'قارن واحسبها بنفسك',
  title: 'نفس الجهاز، بسعر أقل، وبدون انتظار الطلب المسبق.',
  wafi: {
    chip: 'متوفر الآن',
    chipDesktop: 'عالم وافي (متوفر الآن)',
    name: 'عالم وافي',
    tagline: 'استلام فوري من الفرع',
    sub: 'أو توصيل لباب البيت',
    points: ['استلام فوري من الفرع', 'أو توصيل لباب البيت'],
  },
  competitors: {
    chip: 'طلب مسبق',
    chipDesktop: 'المنافسون (طلب مسبق)',
    name: 'المنافسون',
    // The ٦٬١٩٩ figure is the pre-order price at competitors, never a former Wafi price.
    tagline: 'سعر الطلب المسبق لدى المنافسين',
    sub: 'مع انتظار حتى توفر الجهاز',
    note: 'الطلب المسبق فقط',
    points: ['مع انتظار حتى توفر الجهاز', 'الطلب المسبق فقط'],
  },
  savings: {
    label: 'توفيرك',
    desktopTagline: 'عند الاستلام من فروعنا',
    sub: 'عند الاستلام من فروعنا في الرياض',
    city: 'في الرياض',
  },
  cta: 'اشترِ الآن',
};

export const OVERVIEW = {
  eyebrow: 'سلسلة آيفون 18 برو ماكس',
  paragraph:
    'صُمم لمن يصوّرون ويحرّرون ويبدعون بلا تنازل. يأتي آيفون 18 برو ماكس بشريحة A20 Pro، مع مستشعر رئيسي بدقة 48 ميجابكسل بفتحة عدسة متغيرة من ست شفرات، وشاشة أكثر إشراقاً، وجزيرة ديناميكية أصغر، وبطارية تدوم أكثر من أي إصدار برو سابق.',
  ghostWord: 'كاميرا احترافية',
};

/**
 * Spec cells.
 *
 * The desktop frame (463:441) labels these in English, left-aligned, reading
 * 6.9" / 48MP / 8x / 45 HRS from the left; the mobile frame (463:719) uses
 * Arabic labels in a right-aligned 2x2. Each breakpoint keeps its own frame's
 * wording and order, hence the duplicated label and the order classes.
 *
 * Values carry the Pro Max corrections: 6.9" display, 45 hours of video.
 */
export const SPECS = [
  {
    to: 6.9,
    decimals: 1,
    suffix: '"',
    suffixEn: '"',
    label: 'شاشة ProMotion بمعدل تحديث حتى 120 هرتز',
    labelEn: 'ProMotion display, up to 120Hz',
    mobileOrder: 'order-2',
    lgOrder: 'lg:order-4',
  },
  {
    to: 48,
    decimals: 0,
    suffix: 'MP',
    suffixEn: 'MP',
    label: 'كاميرا Fusion الرئيسية بفتحة عدسة متغيرة',
    labelEn: 'Fusion main, variable aperture',
    mobileOrder: 'order-1',
    lgOrder: 'lg:order-3',
  },
  {
    to: 8,
    decimals: 0,
    suffix: '×',
    suffixEn: '×',
    label: 'تقريب بجودة بصرية',
    labelEn: 'Optical-quality zoom',
    mobileOrder: 'order-4',
    lgOrder: 'lg:order-2',
  },
  {
    to: 45,
    decimals: 0,
    suffix: ' ساعة',
    suffixEn: ' HRS',
    label: 'تشغيل فيديو كحد أقصى',
    labelEn: 'Video playback, up to',
    mobileOrder: 'order-3',
    lgOrder: 'lg:order-1',
  },
] as const;

export const APERTURE = {
  eyebrow: 'نظام كاميرا احترافي متطور',
  titleSolid: 'ست شفرات.',
  titleOutline: 'فتحة عدسة واحدة.',
  copy:
    'في آيفون، فتحة عدسة الكاميرا الرئيسية تتحرك للضوء المنخفض والعزل الطبيعي. أدوات Pro توفر تحكماً يدوياً، والكاميرا الأمامية بدقة 18 ميجابكسل مع تركيز تلقائي.',
  chips: ['كاميرا أمامية 18MP', 'تحكم احترافي بالفيديو', 'فتحة عدسة متغيرة'],
};

export type ColorId = 'burgundy' | 'black' | 'glacier';

export type Finish = {
  id: ColorId;
  name: string;
  heading: string;
  /** Inner fill of the swatch, taken from the Figma swatch assets. */
  dot: string;
  image: string;
  /** True while we are still showing the burgundy photo as a stand-in. */
  imageIsPlaceholder: boolean;
};

export const FINISHES: Finish[] = [
  {
    id: 'burgundy',
    name: 'عنابي',
    heading: 'عنابي.',
    dot: '#5B1A24',
    image: '/images/burgundy-phone.webp',
    imageIsPlaceholder: false,
  },
  {
    id: 'black',
    name: 'أسود',
    heading: 'أسود.',
    dot: '#1D1D1F',
    // TODO: replace with black product photos — only burgundy shots exist in Figma.
    image: '/images/burgundy-phone.webp',
    imageIsPlaceholder: true,
  },
  {
    id: 'glacier',
    name: 'أزرق جليدي',
    heading: 'أزرق جليدي.',
    dot: '#C7D4DB',
    // TODO: replace with glacier-blue product photos — only burgundy shots exist in Figma.
    image: '/images/burgundy-phone.webp',
    imageIsPlaceholder: true,
  },
];

export const FINISHES_SECTION = {
  eyebrow: 'ثلاثة ألوان.',
  copy: 'لون عميق ودافئ، يلتقط الضوء مع كل زاوية. متوفر أيضاً بالأسود والأزرق الجليدي.',
  swatchList: 'أسود · أزرق جليدي · عنابي',
  cta: 'اشترِ الآن',
};

export const ACCESSORIES_TITLE = 'إمكانيات مذهلة';

/**
 * Listed in the mobile right-to-left reading order of frame 463:781.
 * `lgOrder` restores the 3x2 arrangement of the desktop frame (463:507).
 */
export const ACCESSORIES = [
  {
    icon: 'acc-case',
    title: 'غطاء MagSafe',
    desc: 'قبضة لحماية الكاميرا والحفاظ على محاذاة الشحن.',
    lgOrder: 'lg:order-3',
  },
  {
    icon: 'acc-magsafe',
    title: 'شاحن MagSafe',
    desc: 'شحن لاسلكي مغناطيسي بمحاذاة دقيقة.',
    lgOrder: 'lg:order-2',
  },
  {
    icon: 'acc-adapter',
    title: 'محول طاقة USB-C',
    desc: 'شحن سلكي سريع لأيام التصوير الطويلة.',
    lgOrder: 'lg:order-1',
  },
  {
    icon: 'acc-tripod',
    title: 'حامل ثلاثي للمبدعين',
    desc: 'ثبات لتصوير اللقطات المتتابعة وفيديوهات Pro.',
    lgOrder: 'lg:order-6',
  },
  {
    icon: 'acc-buds',
    title: 'سماعات لاسلكية',
    desc: 'راقب المزيج الصوتي أثناء التصوير.',
    lgOrder: 'lg:order-5',
  },
  {
    icon: 'acc-cable',
    title: 'كابل USB-C',
    desc: 'انقل فيديوهات ProRes مباشرة إلى وحدة التخزين.',
    lgOrder: 'lg:order-4',
  },
];

export const PURCHASE_CARD = {
  kicker: 'A NEW PRO PERSPECTIVE',
  chip: 'متاح للشراء',
  title: 'استلام فوري',
  copy: 'اختر اللون والسعة المناسبين لك، وراجع تفاصيل الشراء والاستلام قبل تأكيد طلبك.',
  cta: 'اشترِ الآن',
  note: 'توفّر الألوان والسعات حسب المخزون.',
};

export const FAQ_TITLE = 'الأسئلة الشائعة';

/**
 * Q1 and its answer come from Figma. Figma left answers 2–5 as component
 * placeholders, so the copy below was authored to match the corrected specs.
 */
export const FAQ = [
  {
    q: 'ما الجديد في كاميرا آيفون 18 برو ماكس؟',
    a: 'كاميرا Fusion بدقة 48 ميجابكسل مع فتحة عدسة متغيرة من ست شفرات، وتحكم احترافي بالفيديو، وتقريب بجودة بصرية حتى ×8، وكاميرا أمامية بدقة 18 ميجابكسل مع تركيز تلقائي.',
  },
  {
    q: 'ما الشريحة المستخدمة؟',
    a: 'شريحة A20 Pro، أسرع شريحة في آيفون حتى الآن، بأداء أعلى في التصوير والتحرير وكفاءة أفضل في استهلاك الطاقة.',
  },
  {
    q: 'ما الألوان المتاحة؟',
    a: 'ثلاثة ألوان: عنابي، وأسود، وأزرق جليدي. يختلف توفّر الألوان والسعات حسب المخزون في فروعنا.',
  },
  {
    q: 'ما مقاس الشاشة؟',
    a: 'شاشة ProMotion بمقاس 6.9 بوصة، بمعدل تحديث حتى 120 هرتز وسطوع أعلى في الأجواء المشمسة.',
  },
  {
    q: 'كم تدوم البطارية؟',
    a: 'تشغيل فيديو حتى 45 ساعة كحد أقصى، وهي أطول مدة بطارية في أي إصدار آيفون برو.',
  },
];

export const FINAL_CTA = {
  title: 'والاستلام فوري من وافي',
  priceLead: 'آيفون 18 برو ماكس ابتداءً من ',
  cta: 'اشترِ الآن',
};

export const FOOTER = {
  copyright: '© ٢٠٢٦ عالم وافي · تصميم تصوري غير تابع لشركة Apple Inc. ولا معتمد منها.',
  copyrightShort: '© ٢٠٢٦ عالم وافي',
};

export const STICKY_BAR = {
  caption: 'استلام فوري · وفّر ٢٠٠ ريال',
  cta: 'اشترِ الآن',
};

/* ---------------------------------- flow ---------------------------------- */

/**
 * Maps an API colour key (e.g. "burgundy", "test_black", "glacier_blue") to
 * the finish whose swatch and photo represent it. Unknown colours get null.
 */
export function finishIdFor(colorKey: string): ColorId | null {
  const key = colorKey.toLowerCase();
  if (key.includes('burgundy') || key.includes('wine') || key.includes('red')) return 'burgundy';
  if (key.includes('glacier') || key.includes('blue')) return 'glacier';
  if (key.includes('black')) return 'black';
  return null;
}

export type FulfillmentId = 'shipping' | 'pickup';

/**
 * Frame 494:153. Figma's visual order is الشحن (left) · الاستلام من الفرع
 * (right); under `dir="rtl"` the first DOM child renders on the right.
 */
export const FULFILLMENTS: { id: FulfillmentId; label: string }[] = [
  { id: 'pickup', label: 'الاستلام من الفرع' },
  { id: 'shipping', label: 'الشحن' },
];

/** How many upcoming pickup days to offer. Fridays are skipped (frames 467:449 / 463:157). */
export const PICKUP_DAYS_SHOWN = 6;

export const FLOW = {
  step1: {
    kicker: 'الخطوة الأولى · الجهاز',
    title: 'اختر اللون والسعة',
    sub: 'حدّد اختيارك، ثم تابع لمراجعة تفاصيل الشراء.',
    colorLabel: 'اللون',
    storageLabel: 'سعة التخزين',
    storageNote: 'توفّر الألوان والسعات حسب المخزون.',
    fulfillmentLabel: 'طريقة التوصيل',
    fulfillmentNote: 'اختر الشحن إلى عنوانك أو الاستلام من الفرع.',
    summaryLabel: 'اختيارك',
    loading: 'جارٍ تحميل الخيارات المتوفرة…',
    loadError: 'تعذّر تحميل الخيارات المتوفرة. تحقق من اتصالك وحاول مرة أخرى.',
    empty: 'لا توجد أجهزة متوفرة حالياً.',
    retry: 'إعادة المحاولة',
  },
  step2: {
    kicker: 'الخطوة الثانية · الاستلام',
    title: 'الاستلام من الفرع',
    sub: 'اختر الفرع ويوم الاستلام، ثم أدخل بيانات التواصل.',
    subShort: 'اختر الفرع واليوم وأدخل بياناتك.',
    branchLabel: 'الفرع',
    branchesLoading: 'جارٍ تحميل الفروع…',
    branchesError: 'تعذّر تحميل الفروع.',
    noBranches: 'لا توجد فروع متاحة للاستلام حالياً.',
    dayLabel: 'يوم الاستلام',
    dayHint: 'من السبت إلى الخميس',
    contactLabel: 'بيانات التواصل',
    proceed: 'المتابعة للدفع',
    back: 'رجوع',
  },
  /**
   * Frame 494:212 — reached from step 1 when «الشحن» is the chosen method.
   * Figma's «الدولة» field is replaced by المدينة + الحي, which the order API
   * requires; shipping is Saudi-only (+966).
   */
  shipping: {
    kicker: 'الخطوة الثانية · الشحن',
    title: 'بيانات الشحن',
    sub: 'املأ البيانات أدناه لتأكيد عنوان الشحن.',
    subShort: 'املأ بياناتك لتأكيد عنوان الشحن.',
    save: 'حفظ بيانات الشحن',
    back: 'رجوع',
  },
  /** Shared by the shipping form and the pickup contact block. */
  fields: {
    email: {
      label: 'البريد الإلكتروني',
      placeholder: 'name@example.com',
      error: 'أدخل بريدًا إلكترونيًا صحيحًا.',
    },
    name: {
      label: 'الاسم الكامل',
      placeholder: 'اسم المستلم',
      error: 'أدخل اسم المستلم.',
    },
    phone: {
      label: 'رقم الجوال',
      placeholder: '50 000 0000',
      error: 'أدخل رقم جوال صحيحًا لرمز الدولة المختار.',
    },
    city: {
      label: 'المدينة',
      placeholder: 'الرياض',
      error: 'أدخل المدينة.',
    },
    district: {
      label: 'الحي',
      placeholder: 'اسم الحي',
      error: 'أدخل الحي.',
    },
    nationalAddress: {
      label: 'العنوان',
      placeholder: 'العنوان الوطني أو: شارع، مبنى، رقم الشقة',
      error: 'أدخل عنوان الشحن بالتفصيل.',
    },
  },
  dialCodeLabel: 'رمز الدولة',
  step3: {
    kicker: 'الخطوة الثالثة · الدفع',
    title: 'الدفع',
    sub: 'ادفع بأمان عبر ميسر لتأكيد طلبك.',
    orderLabel: 'رقم الطلب',
    totalLabel: 'الإجمالي',
    loading: 'جارٍ تجهيز نموذج الدفع…',
    loadError: 'تعذّر تحميل نموذج الدفع. حدّث الصفحة وحاول مرة أخرى.',
    missingKey: 'الدفع غير مهيأ بعد (مفتاح ميسر غير موجود).',
  },
  result: {
    verifying: 'جارٍ التحقق من الدفع…',
    paidTitle: 'تم تأكيد طلبك',
    paidSub: 'شكراً لك! استلمنا الدفع وسنتواصل معك قريباً لتأكيد التفاصيل.',
    pendingTitle: 'الدفع قيد المعالجة',
    pendingSub: 'لم يصلنا تأكيد الدفع بعد. سنحدّث حالة طلبك فور وصوله.',
    failedTitle: 'لم يكتمل الدفع',
    failedSub: 'لم يتم تأكيد الدفع. يمكنك المحاولة مرة أخرى.',
    cancelledTitle: 'تم إلغاء الطلب',
    orderLabel: 'رقم الطلب',
    checkAgain: 'تحديث الحالة',
    tryAgain: 'حاول مرة أخرى',
    done: 'تم',
  },
  orderError: 'تعذّر إنشاء الطلب. تحقق من البيانات وحاول مرة أخرى.',
  networkError: 'تعذّر الاتصال بالخادم. تحقق من اتصالك وحاول مرة أخرى.',
  continue: 'متابعة الشراء',
  submitting: 'جارٍ إنشاء الطلب…',
  note: 'راجع تفاصيل طلبك قبل الدفع.',
  close: 'إغلاق',
  previewCaption: 'لون عميق ودافئ، يلتقط الضوء مع كل زاوية.',
};
