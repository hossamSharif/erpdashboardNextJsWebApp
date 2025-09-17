/**
 * RTL-aware utility classes and functions
 */

// RTL-aware spacing utilities
export const rtlSpacing = {
  // Margin utilities
  'ml-auto': 'ms-auto', // margin-left -> margin-inline-start
  'mr-auto': 'me-auto', // margin-right -> margin-inline-end
  'ml-1': 'ms-1',
  'ml-2': 'ms-2',
  'ml-3': 'ms-3',
  'ml-4': 'ms-4',
  'ml-6': 'ms-6',
  'ml-8': 'ms-8',
  'mr-1': 'me-1',
  'mr-2': 'me-2',
  'mr-3': 'me-3',
  'mr-4': 'me-4',
  'mr-6': 'me-6',
  'mr-8': 'me-8',

  // Padding utilities
  'pl-1': 'ps-1',
  'pl-2': 'ps-2',
  'pl-3': 'ps-3',
  'pl-4': 'ps-4',
  'pl-6': 'ps-6',
  'pl-8': 'ps-8',
  'pr-1': 'pe-1',
  'pr-2': 'pe-2',
  'pr-3': 'pe-3',
  'pr-4': 'pe-4',
  'pr-6': 'pe-6',
  'pr-8': 'pe-8',

  // Border utilities
  'border-l': 'border-s',
  'border-r': 'border-e',
  'border-l-2': 'border-s-2',
  'border-r-2': 'border-e-2',

  // Positioning utilities
  'left-0': 'start-0',
  'left-4': 'start-4',
  'left-1/2': 'start-1/2',
  'right-0': 'end-0',
  'right-4': 'end-4',
  'right-1/2': 'end-1/2',

  // Text alignment
  'text-left': 'text-start',
  'text-right': 'text-end',
} as const;

// RTL-aware positioning utilities
export const rtlPositioning = {
  // Float utilities
  'float-left': 'float-start',
  'float-right': 'float-end',

  // Clear utilities
  'clear-left': 'clear-start',
  'clear-right': 'clear-end',

  // Flexbox utilities
  'justify-start': 'rtl:justify-end ltr:justify-start',
  'justify-end': 'rtl:justify-start ltr:justify-end',

  // Text utilities
  'text-left': 'rtl:text-right ltr:text-left',
  'text-right': 'rtl:text-left ltr:text-right',
} as const;

/**
 * Convert standard Tailwind classes to RTL-aware classes
 */
export function makeRTLAware(className: string): string {
  return className
    .split(' ')
    .map(cls => {
      // Check if it's a directional class that needs RTL conversion
      if (cls in rtlSpacing) {
        return rtlSpacing[cls as keyof typeof rtlSpacing];
      }
      if (cls in rtlPositioning) {
        return rtlPositioning[cls as keyof typeof rtlPositioning];
      }
      return cls;
    })
    .join(' ');
}

/**
 * Conditional RTL class helper
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

/**
 * RTL-aware class generator
 */
export function rtlClass(ltrClass: string, rtlClass?: string): string {
  const rtlClassToUse = rtlClass || ltrClass;
  return `ltr:${ltrClass} rtl:${rtlClassToUse}`;
}

/**
 * Icon rotation for RTL
 */
export function iconRTL(baseClass: string = ''): string {
  return cn(baseClass, 'rtl:rotate-y-180');
}

/**
 * Direction-aware transform
 */
export function directionTransform(direction: 'ltr' | 'rtl'): string {
  return direction === 'rtl' ? 'scale-x-[-1]' : '';
}

/**
 * Common RTL-aware component classes
 */
export const rtlClasses = {
  // Navigation
  navbar: 'rtl:flex-row-reverse',
  navItem: 'rtl:ml-0 rtl:mr-4 ltr:mr-0 ltr:ml-4',

  // Cards and containers
  card: 'rtl:text-right ltr:text-left',
  cardHeader: 'rtl:text-right ltr:text-left',

  // Forms
  formLabel: 'rtl:text-right ltr:text-left',
  formInput: 'rtl:text-right ltr:text-left rtl:pr-3 ltr:pl-3',
  formHelp: 'rtl:text-right ltr:text-left',

  // Buttons
  buttonWithIcon: 'rtl:flex-row-reverse',
  buttonIcon: 'rtl:ml-2 rtl:mr-0 ltr:mr-2 ltr:ml-0',

  // Tables
  tableHeader: 'rtl:text-right ltr:text-left',
  tableCell: 'rtl:text-right ltr:text-left rtl:pr-6 ltr:pl-6',

  // Modals and dialogs
  modal: 'rtl:text-right ltr:text-left',
  modalClose: 'rtl:left-4 ltr:right-4',

  // Sidebar
  sidebar: 'rtl:border-l rtl:border-r-0 ltr:border-r ltr:border-l-0',
  sidebarItem: 'rtl:text-right ltr:text-left rtl:pr-4 ltr:pl-4',

  // Tooltips and dropdowns
  tooltip: 'rtl:text-right ltr:text-left',
  dropdown: 'rtl:right-0 ltr:left-0',
  dropdownArrow: 'rtl:left-4 ltr:right-4',
} as const;