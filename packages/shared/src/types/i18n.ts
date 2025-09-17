// Translation key types for type-safe translations

export type Language = 'ar' | 'en';

export type Direction = 'ltr' | 'rtl';

// Common namespace keys
export interface CommonTranslations {
  buttons: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    close: string;
    submit: string;
    back: string;
    next: string;
    previous: string;
    confirm: string;
    view: string;
    search: string;
    filter: string;
    export: string;
    import: string;
    print: string;
  };
  labels: {
    name: string;
    description: string;
    status: string;
    date: string;
    time: string;
    amount: string;
    quantity: string;
    price: string;
    total: string;
    notes: string;
    category: string;
    type: string;
    code: string;
    reference: string;
  };
  messages: {
    success: string;
    error: string;
    warning: string;
    info: string;
    loading: string;
    noData: string;
    confirmDelete: string;
    unsavedChanges: string;
    required: string;
    invalidFormat: string;
  };
  status: {
    active: string;
    inactive: string;
    pending: string;
    completed: string;
    cancelled: string;
    draft: string;
  };
  time: {
    today: string;
    yesterday: string;
    tomorrow: string;
    thisWeek: string;
    thisMonth: string;
    thisYear: string;
  };
}

// Navigation namespace keys
export interface NavigationTranslations {
  menu: {
    dashboard: string;
    inventory: string;
    sales: string;
    purchases: string;
    customers: string;
    suppliers: string;
    reports: string;
    settings: string;
    users: string;
    profile: string;
    logout: string;
  };
  breadcrumb: {
    home: string;
    dashboard: string;
  };
  sections: {
    main: string;
    management: string;
    reports: string;
    system: string;
  };
}

// Authentication namespace keys
export interface AuthTranslations {
  login: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    rememberMe: string;
    forgotPassword: string;
    loginButton: string;
    noAccount: string;
    signUp: string;
  };
  register: {
    title: string;
    subtitle: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: string;
    registerButton: string;
    haveAccount: string;
    signIn: string;
  };
  forgotPassword: {
    title: string;
    subtitle: string;
    email: string;
    sendReset: string;
    backToLogin: string;
  };
  errors: {
    invalidEmail: string;
    passwordTooShort: string;
    passwordMismatch: string;
    loginFailed: string;
    emailExists: string;
    requiredField: string;
  };
  success: {
    loginSuccess: string;
    registerSuccess: string;
    resetSent: string;
  };
}

// Complete translations interface
export interface Translations {
  common: CommonTranslations;
  navigation: NavigationTranslations;
  auth: AuthTranslations;
}

// Translation file structure
export interface TranslationFile {
  [key: string]: any;
}

export interface LocaleResources {
  common: TranslationFile;
  navigation: TranslationFile;
  auth: TranslationFile;
}

// Translation metadata
export interface TranslationMetadata {
  language: Language;
  locale: string;
  direction: Direction;
  completeness: number; // Percentage of translated keys
  lastUpdated: string;
  version: string;
}

// Translation key path helper
export type TranslationPath<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends object
        ? `${K & string}.${TranslationPath<T[K]> & string}`
        : K & string;
    }[keyof T]
  : never;

// Flattened translation keys
export type CommonKeys = TranslationPath<CommonTranslations>;
export type NavigationKeys = TranslationPath<NavigationTranslations>;
export type AuthKeys = TranslationPath<AuthTranslations>;

// Helper type for translation function
export type TFunction = (key: string, options?: any) => string;

// Language detection result
export interface LanguageDetectionResult {
  detectedLanguage: Language;
  confidence: number;
  browserLanguage: string;
  savedLanguage?: Language;
}

// RTL language configuration
export interface RTLConfig {
  languages: Language[];
  defaultDirection: Direction;
  autoDetect: boolean;
}

// Translation validation result
export interface ValidationResult {
  isValid: boolean;
  missingKeys: string[];
  extraKeys: string[];
  errors: string[];
}