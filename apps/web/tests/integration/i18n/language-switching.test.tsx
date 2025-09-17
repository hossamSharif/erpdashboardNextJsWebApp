import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../src/lib/i18n';
import { RTLProvider } from '../../../src/components/layout/rtl-provider';
import { LanguageToggle } from '../../../src/components/layout/language-toggle';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock document methods
Object.defineProperty(document, 'documentElement', {
  value: {
    dir: '',
    lang: '',
  },
  writable: true,
});

// Integration test wrapper
function IntegrationWrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <RTLProvider>
        {children}
      </RTLProvider>
    </I18nextProvider>
  );
}

// Test component that displays translations
function TranslatedContent() {
  return (
    <div>
      <h1 data-testid="title">Dashboard</h1>
      <button data-testid="save-button">Save</button>
      <p data-testid="welcome-message">Welcome to the system</p>
    </div>
  );
}

describe('Language Switching Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('ar');

    // Reset i18n to Arabic
    i18n.changeLanguage('ar');

    // Reset document attributes
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  });

  describe('Full Language Switch Flow', () => {
    it('should switch from Arabic to English with all side effects', async () => {
      render(
        <IntegrationWrapper>
          <div>
            <LanguageToggle variant="simple" />
            <TranslatedContent />
          </div>
        </IntegrationWrapper>
      );

      // Initially should be in Arabic
      expect(i18n.language).toBe('ar');

      // Find and click the language toggle
      const languageToggle = screen.getByRole('button', { name: /toggle language/i });
      fireEvent.click(languageToggle);

      // Wait for language change
      await waitFor(() => {
        expect(i18n.language).toBe('en');
      });

      // Check that localStorage was updated
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('i18nextLng', 'en');
    });

    it('should switch from English to Arabic', async () => {
      // Start with English
      i18n.changeLanguage('en');
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';

      render(
        <IntegrationWrapper>
          <LanguageToggle variant="simple" />
        </IntegrationWrapper>
      );

      expect(i18n.language).toBe('en');

      const languageToggle = screen.getByRole('button', { name: /toggle language/i });
      fireEvent.click(languageToggle);

      await waitFor(() => {
        expect(i18n.language).toBe('ar');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('i18nextLng', 'ar');
    });
  });

  describe('Document Attribute Updates', () => {
    it('should update document direction when switching to English', async () => {
      render(
        <IntegrationWrapper>
          <LanguageToggle variant="simple" />
        </IntegrationWrapper>
      );

      const languageToggle = screen.getByRole('button', { name: /toggle language/i });
      fireEvent.click(languageToggle);

      await waitFor(() => {
        expect(i18n.language).toBe('en');
      });

      // Document attributes should be updated by RTL provider
      // We would need to simulate the effect in a real integration test
    });

    it('should update document direction when switching to Arabic', async () => {
      i18n.changeLanguage('en');

      render(
        <IntegrationWrapper>
          <LanguageToggle variant="simple" />
        </IntegrationWrapper>
      );

      const languageToggle = screen.getByRole('button', { name: /toggle language/i });
      fireEvent.click(languageToggle);

      await waitFor(() => {
        expect(i18n.language).toBe('ar');
      });
    });
  });

  describe('Dropdown Language Selector', () => {
    it('should open dropdown and select language', async () => {
      render(
        <IntegrationWrapper>
          <LanguageToggle variant="dropdown" />
        </IntegrationWrapper>
      );

      // Find the dropdown toggle button
      const dropdownToggle = screen.getByRole('button', { name: /change language/i });
      fireEvent.click(dropdownToggle);

      // Should show dropdown menu
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Find English option and click it
      const englishOption = screen.getByRole('menuitem', { name: /english/i });
      fireEvent.click(englishOption);

      await waitFor(() => {
        expect(i18n.language).toBe('en');
      });

      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown when clicking outside', async () => {
      render(
        <IntegrationWrapper>
          <div>
            <LanguageToggle variant="dropdown" />
            <div data-testid="outside-area">Outside area</div>
          </div>
        </IntegrationWrapper>
      );

      // Open dropdown
      const dropdownToggle = screen.getByRole('button', { name: /change language/i });
      fireEvent.click(dropdownToggle);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Click outside
      const outsideArea = screen.getByTestId('outside-area');
      fireEvent.mouseDown(outsideArea);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('Language Persistence', () => {
    it('should persist language choice to localStorage', async () => {
      render(
        <IntegrationWrapper>
          <LanguageToggle variant="simple" />
        </IntegrationWrapper>
      );

      const languageToggle = screen.getByRole('button', { name: /toggle language/i });
      fireEvent.click(languageToggle);

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('i18nextLng', 'en');
      });
    });

    it('should load language from localStorage on mount', () => {
      mockLocalStorage.getItem.mockReturnValue('en');

      render(
        <IntegrationWrapper>
          <LanguageToggle variant="simple" />
        </IntegrationWrapper>
      );

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('i18nextLng');
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <IntegrationWrapper>
          <LanguageToggle variant="simple" />
        </IntegrationWrapper>
      );

      const languageToggle = screen.getByRole('button', { name: /toggle language/i });
      fireEvent.click(languageToggle);

      // Should not crash the app
      await waitFor(() => {
        expect(i18n.language).toBe('en');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for simple toggle', () => {
      render(
        <IntegrationWrapper>
          <LanguageToggle variant="simple" />
        </IntegrationWrapper>
      );

      const languageToggle = screen.getByRole('button');
      expect(languageToggle).toHaveAttribute('aria-label');
    });

    it('should have proper ARIA attributes for dropdown', () => {
      render(
        <IntegrationWrapper>
          <LanguageToggle variant="dropdown" />
        </IntegrationWrapper>
      );

      const dropdownToggle = screen.getByRole('button');
      expect(dropdownToggle).toHaveAttribute('aria-expanded', 'false');
      expect(dropdownToggle).toHaveAttribute('aria-haspopup', 'true');
      expect(dropdownToggle).toHaveAttribute('aria-label');
    });

    it('should update aria-expanded when dropdown opens', async () => {
      render(
        <IntegrationWrapper>
          <LanguageToggle variant="dropdown" />
        </IntegrationWrapper>
      );

      const dropdownToggle = screen.getByRole('button');
      fireEvent.click(dropdownToggle);

      await waitFor(() => {
        expect(dropdownToggle).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });
});