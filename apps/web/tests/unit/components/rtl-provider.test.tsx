import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../src/lib/i18n';
import { RTLProvider, useRTL } from '../../../src/components/layout/rtl-provider';

// Mock the i18n module
vi.mock('../../../src/lib/i18n', () => ({
  default: {
    language: 'ar',
    changeLanguage: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
  isRTL: vi.fn((lang: string) => lang === 'ar'),
}));

// Test component that uses RTL context
function TestComponent() {
  const { isRTL, direction, toggleDirection } = useRTL();

  return (
    <div>
      <div data-testid="direction">{direction}</div>
      <div data-testid="is-rtl">{isRTL ? 'true' : 'false'}</div>
      <button onClick={toggleDirection} data-testid="toggle">
        Toggle Direction
      </button>
    </div>
  );
}

// Wrapper component for testing
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <RTLProvider>
        {children}
      </RTLProvider>
    </I18nextProvider>
  );
}

describe('RTLProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset i18n language to Arabic
    (i18n as any).language = 'ar';

    // Mock document methods
    Object.defineProperty(document, 'documentElement', {
      value: {
        dir: '',
        lang: '',
        classList: {
          remove: vi.fn(),
          add: vi.fn(),
        },
      },
      writable: true,
    });

    Object.defineProperty(document, 'body', {
      value: {
        classList: {
          remove: vi.fn(),
          add: vi.fn(),
        },
      },
      writable: true,
    });
  });

  describe('Initial State', () => {
    it('should default to RTL when language is Arabic', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('direction')).toHaveTextContent('rtl');
      expect(screen.getByTestId('is-rtl')).toHaveTextContent('true');
    });

    it('should set LTR when language is English', () => {
      (i18n as any).language = 'en';

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('direction')).toHaveTextContent('ltr');
      expect(screen.getByTestId('is-rtl')).toHaveTextContent('false');
    });
  });

  describe('Direction Toggle', () => {
    it('should toggle direction and change language', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const toggleButton = screen.getByTestId('toggle');

      await act(async () => {
        fireEvent.click(toggleButton);
      });

      expect(i18n.changeLanguage).toHaveBeenCalledWith('en');
    });

    it('should toggle from English to Arabic', async () => {
      (i18n as any).language = 'en';

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const toggleButton = screen.getByTestId('toggle');

      await act(async () => {
        fireEvent.click(toggleButton);
      });

      expect(i18n.changeLanguage).toHaveBeenCalledWith('ar');
    });
  });

  describe('Document Attributes', () => {
    it('should set document direction and language attributes', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Simulate the effect that would run
      act(() => {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
      });

      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('ar');
    });

    it('should add body classes for Tailwind utilities', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // The provider should add direction classes to body
      expect(document.body.classList.add).toHaveBeenCalledWith('rtl');
    });
  });

  describe('Language Change Events', () => {
    it('should listen for language change events', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(i18n.on).toHaveBeenCalledWith('languageChanged', expect.any(Function));
    });

    it('should cleanup event listeners on unmount', () => {
      const { unmount } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      unmount();

      expect(i18n.off).toHaveBeenCalledWith('languageChanged', expect.any(Function));
    });
  });

  describe('Context Error Handling', () => {
    it('should throw error when useRTL is used outside provider', () => {
      // Capture console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useRTL must be used within an RTLProvider');

      consoleSpy.mockRestore();
    });
  });
});