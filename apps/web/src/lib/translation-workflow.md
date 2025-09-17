# Translation Management Workflow

This document outlines the translation management system and workflow for the Multi-Shop Accounting System.

## Overview

The translation system is built on top of react-i18next and provides:
- Type-safe translation keys
- Arabic-first internationalization
- RTL layout support
- Dynamic language switching
- Translation validation and completeness tracking

## File Structure

```
apps/web/
├── public/locales/           # Translation files
│   ├── ar/                   # Arabic translations
│   │   ├── common.json      # Common UI elements
│   │   ├── navigation.json  # Navigation and menu items
│   │   └── auth.json        # Authentication forms
│   └── en/                   # English translations
│       ├── common.json
│       ├── navigation.json
│       └── auth.json
├── src/lib/
│   ├── i18n.ts              # i18n configuration
│   ├── translation-utils.ts # Translation utilities
│   └── translation-workflow.md # This documentation
└── src/hooks/
    ├── use-translations.ts   # Enhanced translation hooks
    └── use-formatting.ts     # Number/date formatting hooks
```

## Translation Namespaces

### 1. Common (`common.json`)
Contains general UI elements, buttons, labels, messages, and status indicators.

```json
{
  "buttons": {
    "save": "حفظ",
    "cancel": "إلغاء"
  },
  "labels": {
    "name": "الاسم",
    "description": "الوصف"
  },
  "messages": {
    "loading": "جاري التحميل...",
    "success": "تم بنجاح"
  }
}
```

### 2. Navigation (`navigation.json`)
Contains menu items, breadcrumbs, and navigation sections.

```json
{
  "menu": {
    "dashboard": "لوحة التحكم",
    "inventory": "المخزون"
  },
  "breadcrumb": {
    "home": "الرئيسية"
  }
}
```

### 3. Authentication (`auth.json`)
Contains login, registration, and authentication-related translations.

```json
{
  "login": {
    "title": "تسجيل الدخول",
    "email": "البريد الإلكتروني"
  },
  "errors": {
    "loginFailed": "فشل تسجيل الدخول"
  }
}
```

## Usage in Components

### Basic Translation

```tsx
import { useTranslations } from '@/hooks/use-translations';

function MyComponent() {
  const { t } = useTranslations('common');

  return (
    <button>{t('buttons.save')}</button>
  );
}
```

### With Fallback

```tsx
const { t } = useTranslations('common');
const label = t('labels.customField', { defaultValue: 'Custom Field' });
```

### Form Translations

```tsx
import { useFormTranslations } from '@/hooks/use-translations';

function LoginForm() {
  const { labels, buttons, validation } = useFormTranslations();

  return (
    <form>
      <label>{labels.email}</label>
      <input placeholder={labels.email} />
      <button>{buttons.submit}</button>
    </form>
  );
}
```

### Navigation Translations

```tsx
import { useNavigationTranslations } from '@/hooks/use-translations';

function Sidebar() {
  const { menu } = useNavigationTranslations();

  return (
    <nav>
      <a href="/dashboard">{menu.dashboard}</a>
      <a href="/inventory">{menu.inventory}</a>
    </nav>
  );
}
```

## Adding New Translations

### 1. Add to Translation Files

Add the new key to both Arabic and English translation files:

**Arabic (`ar/common.json`):**
```json
{
  "buttons": {
    "export": "تصدير"
  }
}
```

**English (`en/common.json`):**
```json
{
  "buttons": {
    "export": "Export"
  }
}
```

### 2. Update TypeScript Types

Add the new key to the corresponding interface in `packages/shared/src/types/i18n.ts`:

```typescript
export interface CommonTranslations {
  buttons: {
    save: string;
    cancel: string;
    export: string; // New key
  };
}
```

### 3. Use in Components

```tsx
const { t } = useTranslations('common');
return <button>{t('buttons.export')}</button>;
```

## Translation Guidelines

### Arabic Translation Guidelines

1. **Use formal Arabic** (Modern Standard Arabic) for consistency
2. **Right-to-left flow** - ensure text flows naturally
3. **Cultural context** - adapt UI concepts to Arabic-speaking users
4. **Number formatting** - support both Arabic-Indic and Western numerals
5. **Date formats** - use DD/MM/YYYY format for Arabic

### Key Naming Conventions

1. **Use dot notation** for nested keys: `buttons.save`
2. **Be descriptive** but concise: `messages.confirmDelete`
3. **Group related items** under namespaces
4. **Use camelCase** for multi-word keys: `forgotPassword`

### Translation Quality

1. **Consistency** - use the same terms throughout the app
2. **Context awareness** - consider the UI context
3. **Completeness** - ensure all languages have all keys
4. **Validation** - use the validation utilities to check completeness

## Validation and Testing

### Check Translation Completeness

```typescript
import { validateTranslations, calculateCompleteness } from '@/lib/translation-utils';

const validation = validateTranslations(englishTranslations, arabicTranslations);
const completeness = calculateCompleteness(englishTranslations, arabicTranslations);

console.log('Missing keys:', validation.missingKeys);
console.log('Completeness:', completeness + '%');
```

### Development Warnings

In development mode, missing translations will show warnings in the console:
```
Warning: Missing translation for key: common:buttons.newButton
```

## RTL Considerations

### CSS Classes
Use RTL-aware classes for proper layout:

```tsx
// Good - uses RTL utilities
<div className="rtl:text-right ltr:text-left">
  {t('messages.welcome')}
</div>

// Better - uses translation hook utilities
const { getDirectionClass } = useTranslations();
<div className={getDirectionClass('text-right', 'text-left')}>
  {t('messages.welcome')}
</div>
```

### Icons and UI Elements
Some icons need to be flipped for RTL:

```tsx
import { iconRTL } from '@/lib/rtl-utils';

<ChevronIcon className={iconRTL('transform')} />
```

## Performance Considerations

### Lazy Loading
Translation files are loaded asynchronously to improve initial page load.

### Caching
Translations are cached in localStorage for better performance.

### Bundle Splitting
Each namespace is loaded separately to reduce bundle size.

## Best Practices

1. **Always use translation keys** - never hardcode strings
2. **Test both languages** - ensure UI works in both Arabic and English
3. **Use semantic keys** - prefer `buttons.save` over `saveBtn`
4. **Keep translations flat** - avoid deep nesting when possible
5. **Validate regularly** - check translation completeness frequently
6. **Update types** - keep TypeScript types in sync with translation files

## Troubleshooting

### Common Issues

1. **Missing translations showing as keys**
   - Check if the key exists in the translation file
   - Verify the namespace is correct
   - Ensure the translation file is loaded

2. **RTL layout issues**
   - Use RTL-aware CSS classes
   - Test with Arabic content
   - Check icon orientations

3. **Number formatting problems**
   - Use the formatting hooks
   - Check locale settings
   - Verify Arabic numeral conversion

### Debug Mode

Enable debug mode to see detailed translation logs:

```typescript
// In development
localStorage.setItem('i18next:debug', 'true');
```

## Future Enhancements

1. **Translation Management UI** - Admin interface for managing translations
2. **Automated validation** - CI/CD pipeline checks
3. **Pluralization rules** - Complex plural forms for Arabic
4. **Context-based translations** - Different translations based on context
5. **Translation memory** - Reuse existing translations