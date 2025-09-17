import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import i18n, { loadResources, isRTL, RTL_LANGUAGES } from '../../../src/lib/i18n';

// Mock fetch for translation loading
global.fetch = vi.fn();

describe('i18n Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset i18n to default state
    i18n.changeLanguage('ar');
  });

  describe('Basic Configuration', () => {
    it('should have Arabic as default language', () => {
      expect(i18n.language).toBe('ar');
    });

    it('should have English as fallback language', () => {
      expect(i18n.options.fallbackLng).toBe('en');
    });

    it('should have correct namespaces configured', () => {
      expect(i18n.options.ns).toEqual(['common', 'navigation', 'auth']);
      expect(i18n.options.defaultNS).toBe('common');
    });

    it('should not use suspense for React', () => {
      expect(i18n.options.react?.useSuspense).toBe(false);
    });
  });

  describe('RTL Language Detection', () => {
    it('should identify Arabic as RTL', () => {
      expect(isRTL('ar')).toBe(true);
    });

    it('should identify English as LTR', () => {
      expect(isRTL('en')).toBe(false);
    });

    it('should identify Hebrew as RTL', () => {
      expect(isRTL('he')).toBe(true);
    });

    it('should identify Persian as RTL', () => {
      expect(isRTL('fa')).toBe(true);
    });

    it('should contain expected RTL languages', () => {
      expect(RTL_LANGUAGES).toContain('ar');
      expect(RTL_LANGUAGES).toContain('he');
      expect(RTL_LANGUAGES).toContain('fa');
      expect(RTL_LANGUAGES).toContain('ur');
    });
  });

  describe('Resource Loading', () => {
    beforeEach(() => {
      // Mock successful fetch responses
      (fetch as any).mockImplementation((url: string) => {
        const mockTranslations = {
          '/locales/ar/common.json': { buttons: { save: 'حفظ' } },
          '/locales/ar/navigation.json': { menu: { dashboard: 'لوحة التحكم' } },
          '/locales/ar/auth.json': { login: { title: 'تسجيل الدخول' } },
          '/locales/en/common.json': { buttons: { save: 'Save' } },
          '/locales/en/navigation.json': { menu: { dashboard: 'Dashboard' } },
          '/locales/en/auth.json': { login: { title: 'Login' } },
        };

        return Promise.resolve({
          json: () => Promise.resolve(mockTranslations[url as keyof typeof mockTranslations] || {}),
        });
      });
    });

    it('should load all translation resources', async () => {
      await loadResources();

      expect(fetch).toHaveBeenCalledTimes(6);
      expect(fetch).toHaveBeenCalledWith('/locales/ar/common.json');
      expect(fetch).toHaveBeenCalledWith('/locales/ar/navigation.json');
      expect(fetch).toHaveBeenCalledWith('/locales/ar/auth.json');
      expect(fetch).toHaveBeenCalledWith('/locales/en/common.json');
      expect(fetch).toHaveBeenCalledWith('/locales/en/navigation.json');
      expect(fetch).toHaveBeenCalledWith('/locales/en/auth.json');
    });

    it('should handle fetch errors gracefully', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await loadResources();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load translation resources:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Language Detection', () => {
    it('should detect language from localStorage', () => {
      const detectOrder = i18n.options.detection?.order;
      expect(detectOrder).toContain('localStorage');
      expect(detectOrder?.[0]).toBe('localStorage');
    });

    it('should cache language preference in localStorage', () => {
      const caches = i18n.options.detection?.caches;
      expect(caches).toContain('localStorage');
    });

    it('should use correct localStorage key', () => {
      const lookupKey = i18n.options.detection?.lookupLocalStorage;
      expect(lookupKey).toBe('i18nextLng');
    });
  });

  describe('Language Switching', () => {
    it('should switch from Arabic to English', async () => {
      expect(i18n.language).toBe('ar');

      await i18n.changeLanguage('en');

      expect(i18n.language).toBe('en');
    });

    it('should switch from English to Arabic', async () => {
      await i18n.changeLanguage('en');
      expect(i18n.language).toBe('en');

      await i18n.changeLanguage('ar');

      expect(i18n.language).toBe('ar');
    });

    it('should emit languageChanged event', async () => {
      const languageChangedSpy = vi.fn();
      i18n.on('languageChanged', languageChangedSpy);

      await i18n.changeLanguage('en');

      expect(languageChangedSpy).toHaveBeenCalledWith('en');

      i18n.off('languageChanged', languageChangedSpy);
    });
  });

  describe('Translation Interpolation', () => {
    it('should not escape values by default', () => {
      expect(i18n.options.interpolation?.escapeValue).toBe(false);
    });
  });
});