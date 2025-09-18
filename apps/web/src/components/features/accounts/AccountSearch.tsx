'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Search, X, Filter, SortAsc, SortDesc } from 'lucide-react';
import type { AccountSearchFilters, AccountType } from '@multi-shop/shared';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AccountSearchProps {
  onSearch: (filters: AccountSearchFilters) => void;
  filters: AccountSearchFilters;
  language?: 'ar' | 'en';
  placeholder?: string;
  className?: string;
  showAdvancedFilters?: boolean;
}

interface SearchFilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
  language: 'ar' | 'en';
}

function SearchFilterChip({ label, value, onRemove, language }: SearchFilterChipProps) {
  return (
    <Badge
      variant="secondary"
      className="flex items-center gap-1 text-xs h-6"
    >
      <span>{label}: {value}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-4 w-4 p-0 hover:bg-transparent"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </Badge>
  );
}

export function AccountSearch({
  onSearch,
  filters,
  language = 'ar',
  placeholder,
  className,
  showAdvancedFilters = true,
}: AccountSearchProps) {
  const [localQuery, setLocalQuery] = useState(filters.query || '');
  const [showFilters, setShowFilters] = useState(false);

  // Account type options
  const accountTypeOptions = useMemo(() => [
    { value: 'ASSET', labelAr: 'أصول', labelEn: 'Assets' },
    { value: 'LIABILITY', labelAr: 'خصوم', labelEn: 'Liabilities' },
    { value: 'EQUITY', labelAr: 'حقوق ملكية', labelEn: 'Equity' },
    { value: 'REVENUE', labelAr: 'إيرادات', labelEn: 'Revenue' },
    { value: 'EXPENSE', labelAr: 'مصروفات', labelEn: 'Expenses' },
  ], []);

  // Level options
  const levelOptions = useMemo(() => [
    { value: 1, labelAr: 'المستوى الأول', labelEn: 'Level 1' },
    { value: 2, labelAr: 'المستوى الثاني', labelEn: 'Level 2' },
    { value: 3, labelAr: 'المستوى الثالث', labelEn: 'Level 3' },
  ], []);

  // Status options
  const statusOptions = useMemo(() => [
    { value: true, labelAr: 'نشط', labelEn: 'Active' },
    { value: false, labelAr: 'غير نشط', labelEn: 'Inactive' },
  ], []);

  // Handle search input change with debouncing
  const handleSearchChange = useCallback((value: string) => {
    setLocalQuery(value);

    // Simple debouncing
    const timeoutId = setTimeout(() => {
      onSearch({
        ...filters,
        query: value || undefined,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, onSearch]);

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof AccountSearchFilters, value: any) => {
    onSearch({
      ...filters,
      [key]: value,
    });
  }, [filters, onSearch]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setLocalQuery('');
    onSearch({});
  }, [onSearch]);

  // Remove specific filter
  const removeFilter = useCallback((key: keyof AccountSearchFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];

    if (key === 'query') {
      setLocalQuery('');
    }

    onSearch(newFilters);
  }, [filters, onSearch]);

  // Get active filter chips
  const getActiveFilterChips = useMemo(() => {
    const chips: Array<{ key: keyof AccountSearchFilters; label: string; value: string }> = [];

    if (filters.accountType) {
      const option = accountTypeOptions.find(opt => opt.value === filters.accountType);
      chips.push({
        key: 'accountType',
        label: language === 'ar' ? 'النوع' : 'Type',
        value: option ? (language === 'ar' ? option.labelAr : option.labelEn) : filters.accountType,
      });
    }

    if (filters.level) {
      const option = levelOptions.find(opt => opt.value === filters.level);
      chips.push({
        key: 'level',
        label: language === 'ar' ? 'المستوى' : 'Level',
        value: option ? (language === 'ar' ? option.labelAr : option.labelEn) : String(filters.level),
      });
    }

    if (filters.isActive !== undefined) {
      const option = statusOptions.find(opt => opt.value === filters.isActive);
      chips.push({
        key: 'isActive',
        label: language === 'ar' ? 'الحالة' : 'Status',
        value: option ? (language === 'ar' ? option.labelAr : option.labelEn) : String(filters.isActive),
      });
    }

    return chips;
  }, [filters, accountTypeOptions, levelOptions, statusOptions, language]);

  const hasActiveFilters = Object.keys(filters).length > 0;
  const defaultPlaceholder = language === 'ar'
    ? 'ابحث عن الحسابات... (اسم، رمز)'
    : 'Search accounts... (name, code)';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Search Input */}
      <div className="relative">
        <Search className={cn(
          'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
          language === 'ar' ? 'right-3' : 'left-3'
        )} />
        <Input
          type="text"
          value={localQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={placeholder || defaultPlaceholder}
          className={cn(
            'w-full',
            language === 'ar' ? 'pr-10' : 'pl-10'
          )}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        />

        {/* Clear Search Button */}
        {localQuery && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'absolute top-1/2 -translate-y-1/2 h-6 w-6 p-0',
              language === 'ar' ? 'left-2' : 'right-2'
            )}
            onClick={() => handleSearchChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Advanced Filters Toggle */}
      {showAdvancedFilters && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {language === 'ar' ? 'فلاتر متقدمة' : 'Advanced Filters'}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              {language === 'ar' ? 'مسح الكل' : 'Clear All'}
            </Button>
          )}
        </div>
      )}

      {/* Active Filter Chips */}
      {getActiveFilterChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {getActiveFilterChips.map((chip) => (
            <SearchFilterChip
              key={chip.key}
              label={chip.label}
              value={chip.value}
              onRemove={() => removeFilter(chip.key)}
              language={language}
            />
          ))}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && showAdvancedFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/30">
          {/* Account Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'ar' ? 'نوع الحساب' : 'Account Type'}
            </label>
            <div className="space-y-1">
              {accountTypeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.accountType === option.value ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() =>
                    handleFilterChange(
                      'accountType',
                      filters.accountType === option.value ? undefined : option.value as AccountType
                    )
                  }
                >
                  {language === 'ar' ? option.labelAr : option.labelEn}
                </Button>
              ))}
            </div>
          </div>

          {/* Level Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'ar' ? 'المستوى' : 'Level'}
            </label>
            <div className="space-y-1">
              {levelOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.level === option.value ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() =>
                    handleFilterChange(
                      'level',
                      filters.level === option.value ? undefined : option.value as 1 | 2 | 3
                    )
                  }
                >
                  {language === 'ar' ? option.labelAr : option.labelEn}
                </Button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'ar' ? 'الحالة' : 'Status'}
            </label>
            <div className="space-y-1">
              {statusOptions.map((option) => (
                <Button
                  key={String(option.value)}
                  variant={filters.isActive === option.value ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() =>
                    handleFilterChange(
                      'isActive',
                      filters.isActive === option.value ? undefined : option.value
                    )
                  }
                >
                  {language === 'ar' ? option.labelAr : option.labelEn}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}