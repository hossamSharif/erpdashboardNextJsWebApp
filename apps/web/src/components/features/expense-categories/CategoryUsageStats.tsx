'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslation } from 'next-i18next';
import { api } from '@/lib/trpc/client';
import { CategoryUsageStats as UsageStatsType } from '@packages/shared/src/types/expenseCategory';

interface CategoryUsageStatsProps {
  categoryId?: string;
  showFilters?: boolean;
}

export function CategoryUsageStats({ categoryId, showFilters = true }: CategoryUsageStatsProps) {
  const { t } = useTranslation('common');
  const [limit, setLimit] = useState(50);
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '90d' | '1y'>('all');

  // Get usage statistics
  const { data: usageStats, isLoading } = api.expenseCategory.getCategoryUsageStats.useQuery({
    categoryId,
    limit,
  });

  // Get most used categories
  const { data: mostUsedCategories } = api.expenseCategory.getMostUsedCategories?.useQuery({
    limit: 10,
    timeRange: timeRange !== 'all' ? {
      startDate: new Date(Date.now() - getTimeRangeMs(timeRange)),
      endDate: new Date(),
    } : undefined,
  }) || { data: [] };

  // Get unused categories
  const { data: unusedCategories } = api.expenseCategory.getUnusedCategories?.useQuery() || { data: [] };

  function getTimeRangeMs(range: string): number {
    switch (range) {
      case '30d': return 30 * 24 * 60 * 60 * 1000;
      case '90d': return 90 * 24 * 60 * 60 * 1000;
      case '1y': return 365 * 24 * 60 * 60 * 1000;
      default: return 0;
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const formatDate = (date?: Date) => {
    if (!date) return t('common.never');
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {t('expenseCategory.usageStatistics')}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('expenseCategory.usageStatisticsDescription')}
          </p>
        </div>

        {showFilters && (
          <div className="flex gap-2 items-center">
            <Select
              value={timeRange}
              onValueChange={(value: 'all' | '30d' | '90d' | '1y') => setTimeRange(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('expenseCategory.allTime')}</SelectItem>
                <SelectItem value="30d">{t('expenseCategory.last30Days')}</SelectItem>
                <SelectItem value="90d">{t('expenseCategory.last90Days')}</SelectItem>
                <SelectItem value="1y">{t('expenseCategory.lastYear')}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={limit.toString()}
              onValueChange={(value) => setLimit(parseInt(value))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('expenseCategory.totalCategories')}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('expenseCategory.activeCategoriesCount')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('expenseCategory.mostUsedCount')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostUsedCategories?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('expenseCategory.categoriesWithTransactions')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('expenseCategory.unusedCount')}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unusedCategories?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('expenseCategory.categoriesWithoutTransactions')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Statistics Table */}
      {usageStats && usageStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('expenseCategory.categoryUsageDetails')}</CardTitle>
            <CardDescription>
              {t('expenseCategory.categoryUsageDetailsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">{t('expenseCategory.code')}</TableHead>
                    <TableHead>{t('expenseCategory.nameEn')}</TableHead>
                    <TableHead className="text-right">{t('expenseCategory.nameAr')}</TableHead>
                    <TableHead className="w-24 text-center">{t('expenseCategory.accounts')}</TableHead>
                    <TableHead className="w-24 text-center">{t('expenseCategory.transactions')}</TableHead>
                    <TableHead className="w-32 text-right">{t('expenseCategory.totalAmount')}</TableHead>
                    <TableHead className="w-32">{t('expenseCategory.lastUsed')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageStats.map((stat: UsageStatsType) => (
                    <TableRow key={stat.categoryId}>
                      <TableCell>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {stat.category.code}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {stat.category.nameEn}
                      </TableCell>
                      <TableCell className="text-right" dir="rtl">
                        {stat.category.nameAr}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {stat.assignedAccountsCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={stat.transactionCount > 0 ? 'default' : 'secondary'} className="text-xs">
                          {stat.transactionCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(stat.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {formatDate(stat.lastUsedAt)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Most Used Categories */}
      {mostUsedCategories && mostUsedCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('expenseCategory.mostUsedCategories')}</CardTitle>
            <CardDescription>
              {t('expenseCategory.mostUsedCategoriesDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mostUsedCategories.slice(0, 5).map((category: UsageStatsType, index: number) => (
                <div key={category.categoryId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs bg-white px-2 py-1 rounded">
                          {category.category.code}
                        </span>
                        <span className="font-medium">{category.category.nameEn}</span>
                      </div>
                      <span className="text-sm text-gray-600" dir="rtl">
                        {category.category.nameAr}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      {category.transactionCount} {t('expenseCategory.transactions')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(category.totalAmount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unused Categories Warning */}
      {unusedCategories && unusedCategories.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">
              {t('expenseCategory.unusedCategories')}
            </CardTitle>
            <CardDescription className="text-yellow-700">
              {t('expenseCategory.unusedCategoriesDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {unusedCategories.slice(0, 9).map((category: any) => (
                <div key={category.id} className="flex items-center space-x-2 text-sm">
                  <span className="font-mono text-xs bg-yellow-100 px-2 py-1 rounded">
                    {category.code}
                  </span>
                  <span className="truncate">{category.nameEn}</span>
                </div>
              ))}
            </div>
            {unusedCategories.length > 9 && (
              <p className="text-sm text-yellow-700 mt-2">
                {t('expenseCategory.andMoreUnused', { count: unusedCategories.length - 9 })}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}