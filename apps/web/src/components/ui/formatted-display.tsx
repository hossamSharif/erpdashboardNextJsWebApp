'use client';

import { useFormatting, useCurrency, useDateFormatting } from '../../hooks/use-formatting';
import { rtlClasses } from '../../lib/rtl-utils';

// Number Display Component
interface FormattedNumberProps {
  value: number | null | undefined;
  options?: Intl.NumberFormatOptions;
  className?: string;
  defaultValue?: string;
}

export function FormattedNumber({
  value,
  options,
  className = '',
  defaultValue = '-'
}: FormattedNumberProps) {
  const { formatNumber } = useFormatting();

  if (value === null || value === undefined) {
    return <span className={className}>{defaultValue}</span>;
  }

  return (
    <span className={`${className} arabic-numbers`}>
      {formatNumber(value, options)}
    </span>
  );
}

// Currency Display Component
interface FormattedCurrencyProps {
  value: number | null | undefined;
  currency?: string;
  useArabicNumerals?: boolean;
  className?: string;
  defaultValue?: string;
  showPositiveSign?: boolean;
}

export function FormattedCurrency({
  value,
  currency,
  useArabicNumerals = false,
  className = '',
  defaultValue = '-',
  showPositiveSign = false
}: FormattedCurrencyProps) {
  const { formatCurrency } = useCurrency(currency);

  if (value === null || value === undefined) {
    return <span className={className}>{defaultValue}</span>;
  }

  const formatted = formatCurrency(value, useArabicNumerals);
  const displayValue = showPositiveSign && value > 0 ? `+${formatted}` : formatted;

  // Color coding for positive/negative values
  const colorClass = value > 0
    ? 'text-green-600 dark:text-green-400'
    : value < 0
    ? 'text-red-600 dark:text-red-400'
    : 'text-gray-600 dark:text-gray-400';

  return (
    <span className={`${className} ${colorClass} arabic-numbers`}>
      {displayValue}
    </span>
  );
}

// Percentage Display Component
interface FormattedPercentageProps {
  value: number | null | undefined;
  useArabicNumerals?: boolean;
  className?: string;
  defaultValue?: string;
  precision?: number;
}

export function FormattedPercentage({
  value,
  useArabicNumerals = false,
  className = '',
  defaultValue = '-',
  precision = 1
}: FormattedPercentageProps) {
  const { formatPercentage } = useFormatting();

  if (value === null || value === undefined) {
    return <span className={className}>{defaultValue}</span>;
  }

  return (
    <span className={`${className} arabic-numbers`}>
      {formatPercentage(value, useArabicNumerals)}
    </span>
  );
}

// Date Display Component
interface FormattedDateProps {
  value: Date | string | null | undefined;
  pattern?: 'short' | 'medium' | 'long' | 'full';
  className?: string;
  defaultValue?: string;
}

export function FormattedDate({
  value,
  pattern = 'medium',
  className = '',
  defaultValue = '-'
}: FormattedDateProps) {
  const { formatDateWithPattern } = useDateFormatting();

  if (!value) {
    return <span className={className}>{defaultValue}</span>;
  }

  return (
    <span className={`${className} arabic-numbers`}>
      {formatDateWithPattern(value, pattern)}
    </span>
  );
}

// Relative Time Display Component
interface FormattedRelativeTimeProps {
  value: Date | string | null | undefined;
  className?: string;
  defaultValue?: string;
}

export function FormattedRelativeTime({
  value,
  className = '',
  defaultValue = '-'
}: FormattedRelativeTimeProps) {
  const { timeAgo } = useDateFormatting();

  if (!value) {
    return <span className={className}>{defaultValue}</span>;
  }

  return (
    <span className={`${className} arabic-numbers text-gray-500 dark:text-gray-400`}>
      {timeAgo(value)}
    </span>
  );
}

// DateTime Display Component
interface FormattedDateTimeProps {
  value: Date | string | null | undefined;
  includeSeconds?: boolean;
  className?: string;
  defaultValue?: string;
}

export function FormattedDateTime({
  value,
  includeSeconds = false,
  className = '',
  defaultValue = '-'
}: FormattedDateTimeProps) {
  const { formatDateTime } = useFormatting();

  if (!value) {
    return <span className={className}>{defaultValue}</span>;
  }

  return (
    <span className={`${className} arabic-numbers`}>
      {formatDateTime(value, includeSeconds)}
    </span>
  );
}

// Large Number Display Component (with K, M, B suffixes)
interface FormattedLargeNumberProps {
  value: number | null | undefined;
  useArabicNumerals?: boolean;
  className?: string;
  defaultValue?: string;
}

export function FormattedLargeNumber({
  value,
  useArabicNumerals = false,
  className = '',
  defaultValue = '-'
}: FormattedLargeNumberProps) {
  const { formatLargeNumber } = useFormatting();

  if (value === null || value === undefined) {
    return <span className={className}>{defaultValue}</span>;
  }

  return (
    <span className={`${className} arabic-numbers`}>
      {formatLargeNumber(value, useArabicNumerals)}
    </span>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number | null | undefined;
  type: 'number' | 'currency' | 'percentage';
  currency?: string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  className?: string;
}

export function StatsCard({
  title,
  value,
  type,
  currency,
  change,
  changeType,
  className = ''
}: StatsCardProps) {
  const { isArabic } = useFormatting();

  const renderValue = () => {
    switch (type) {
      case 'currency':
        return <FormattedCurrency value={value} currency={currency} className="text-2xl font-bold" />;
      case 'percentage':
        return <FormattedPercentage value={value} className="text-2xl font-bold" />;
      default:
        return <FormattedLargeNumber value={value} className="text-2xl font-bold" />;
    }
  };

  const renderChange = () => {
    if (change === null || change === undefined) return null;

    const isPositive = change > 0;
    const changeColorClass = isPositive
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';

    const arrowIcon = isPositive ? '↗' : '↘';

    return (
      <div className={`flex items-center gap-1 text-sm ${changeColorClass} ${rtlClasses.buttonWithIcon}`}>
        <span>{arrowIcon}</span>
        <FormattedPercentage value={Math.abs(change)} />
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className={`space-y-2 ${rtlClasses.card}`}>
        <h3 className={`text-sm font-medium text-gray-600 dark:text-gray-400 ${rtlClasses.cardHeader} ${isArabic ? 'font-arabic' : ''}`}>
          {title}
        </h3>
        <div className="flex items-end justify-between">
          <div>
            {renderValue()}
          </div>
          {renderChange()}
        </div>
      </div>
    </div>
  );
}