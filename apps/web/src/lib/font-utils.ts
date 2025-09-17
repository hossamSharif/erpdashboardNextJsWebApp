/**
 * Font utilities for Arabic and English typography
 */

// Font classes for different text types
export const fontClasses = {
  // Body text
  body: {
    ar: 'font-arabic text-lg leading-8',
    en: 'font-sans text-base leading-6',
  },

  // Headings
  heading: {
    ar: 'font-arabic-display text-2xl leading-9 font-semibold',
    en: 'font-sans text-xl leading-7 font-semibold',
  },

  // Display text (large headings)
  display: {
    ar: 'font-arabic-display text-4xl leading-10 font-bold',
    en: 'font-sans text-3xl leading-9 font-bold',
  },

  // Small text (captions, help text)
  small: {
    ar: 'font-arabic text-sm leading-6',
    en: 'font-sans text-sm leading-5',
  },

  // Labels and UI elements
  label: {
    ar: 'font-arabic text-base leading-6 font-medium',
    en: 'font-sans text-sm leading-5 font-medium',
  },

  // Numbers and currency (always LTR)
  numeric: {
    ar: 'font-sans arabic-numbers tabular-nums',
    en: 'font-sans tabular-nums',
  },
} as const;

/**
 * Get font class based on language and text type
 */
export function getFontClass(
  type: keyof typeof fontClasses,
  language: 'ar' | 'en'
): string {
  return fontClasses[type][language];
}

/**
 * Get responsive font class that adapts to current language
 */
export function getResponsiveFontClass(type: keyof typeof fontClasses): string {
  return `rtl:${fontClasses[type].ar} ltr:${fontClasses[type].en}`;
}

/**
 * Arabic text optimization classes
 */
export const arabicOptimization = {
  // Better Arabic text rendering
  base: 'text-rendering-optimize antialiased',

  // Arabic line height optimization
  lineHeight: 'leading-loose',

  // Arabic letter spacing
  letterSpacing: 'tracking-wide',

  // Arabic word spacing
  wordSpacing: 'space-x-1',
} as const;

/**
 * Font size scale for Arabic (larger than English)
 */
export const arabicFontScale = {
  xs: 'text-sm',    // 14px instead of 12px
  sm: 'text-base',  // 16px instead of 14px
  base: 'text-lg',  // 18px instead of 16px
  lg: 'text-xl',    // 20px instead of 18px
  xl: 'text-2xl',   // 24px instead of 20px
  '2xl': 'text-3xl', // 30px instead of 24px
  '3xl': 'text-4xl', // 36px instead of 30px
} as const;

/**
 * Direction-aware text utilities
 */
export const textDirection = {
  // Text alignment
  start: 'rtl:text-right ltr:text-left',
  end: 'rtl:text-left ltr:text-right',
  center: 'text-center',

  // Text indentation for paragraphs
  indent: 'rtl:pr-8 ltr:pl-8',

  // Quote styling
  quote: 'rtl:border-r-4 rtl:pr-4 ltr:border-l-4 ltr:pl-4',
} as const;

/**
 * Test Arabic text samples for font testing
 */
export const arabicTestText = {
  short: 'مرحبا بك في النظام',
  medium: 'نظام المحاسبة المتطور للمتاجر المتعددة مع دعم كامل للغة العربية',
  long: 'هذا النص طويل لاختبار عرض الخط العربي وقابليته للقراءة في واجهة المستخدم. يجب أن يظهر بوضوح مع تباعد مناسب بين الحروف والكلمات.',
  numbers: 'الرقم ١٢٣٤٥٦٧٨٩٠ والرقم الإنجليزي 1234567890',
  mixed: 'النص المختلط: العربية والEnglish معاً مع أرقام ١٢٣ و456',
} as const;

/**
 * Font loading status utilities
 */
export function checkFontLoading(): Promise<boolean> {
  return new Promise((resolve) => {
    if ('fonts' in document) {
      Promise.all([
        document.fonts.load('16px Cairo'),
        document.fonts.load('16px Tajawal'),
      ])
        .then(() => resolve(true))
        .catch(() => resolve(false));
    } else {
      // Fallback for browsers without Font Loading API
      setTimeout(() => resolve(true), 1000);
    }
  });
}

/**
 * Apply font class based on content language detection
 */
export function getContentLanguageFontClass(text: string): string {
  // Simple Arabic detection - checks for Arabic Unicode range
  const arabicRegex = /[\u0600-\u06FF]/;
  const hasArabic = arabicRegex.test(text);

  if (hasArabic) {
    return fontClasses.body.ar;
  }

  return fontClasses.body.en;
}