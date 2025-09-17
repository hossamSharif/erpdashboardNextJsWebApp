'use client';

import { useState } from 'react';
import { Search, Filter, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'next-i18next';
import { ExpenseCategory, ExpenseCategorySearchFilters } from '@packages/shared/src/types/expenseCategory';
import { api } from '@/lib/trpc/client';
import { toast } from '@/hooks/use-toast';

interface CategoryListProps {
  categories: ExpenseCategory[];
  onEdit?: (category: ExpenseCategory) => void;
  onDelete?: (category: ExpenseCategory) => void;
  onAdd?: () => void;
  isLoading?: boolean;
}

export function CategoryList({
  categories,
  onEdit,
  onDelete,
  onAdd,
  isLoading = false,
}: CategoryListProps) {
  const { t } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ExpenseCategorySearchFilters>({});

  const toggleCategoryStatusMutation = api.expenseCategory.toggleCategoryStatus.useMutation({
    onSuccess: () => {
      toast({
        title: t('expenseCategory.statusUpdated'),
        description: t('expenseCategory.statusUpdatedDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('error.title'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleToggleStatus = async (category: ExpenseCategory) => {
    await toggleCategoryStatusMutation.mutateAsync({
      id: category.id,
      isActive: !category.isActive,
    });
  };

  // Filter categories based on search and filters
  const filteredCategories = categories.filter((category) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !category.nameEn.toLowerCase().includes(query) &&
        !category.nameAr.includes(query) &&
        !category.code.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Level filter
    if (filters.level && category.level !== filters.level) {
      return false;
    }

    // Active status filter
    if (filters.isActive !== undefined && category.isActive !== filters.isActive) {
      return false;
    }

    // System category filter
    if (filters.isSystemCategory !== undefined && category.isSystemCategory !== filters.isSystemCategory) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({});
  };

  const hasActiveFilters = searchQuery || Object.keys(filters).length > 0;

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('expenseCategory.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2 items-center">
          {/* Level Filter */}
          <Select
            value={filters.level?.toString() || ''}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                level: value ? parseInt(value) as 1 | 2 | 3 : undefined,
              }))
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t('expenseCategory.allLevels')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('expenseCategory.allLevels')}</SelectItem>
              <SelectItem value="1">{t('expenseCategory.level')} 1</SelectItem>
              <SelectItem value="2">{t('expenseCategory.level')} 2</SelectItem>
              <SelectItem value="3">{t('expenseCategory.level')} 3</SelectItem>
            </SelectContent>
          </Select>

          {/* Active Status Filter */}
          <Select
            value={filters.isActive?.toString() || ''}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                isActive: value === '' ? undefined : value === 'true',
              }))
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t('common.allStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('common.allStatus')}</SelectItem>
              <SelectItem value="true">{t('common.active')}</SelectItem>
              <SelectItem value="false">{t('common.inactive')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              {t('common.clearFilters')}
            </Button>
          )}

          {/* Add Category */}
          {onAdd && (
            <Button onClick={onAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t('expenseCategory.addCategory')}
            </Button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        {t('common.showing')} {filteredCategories.length} {t('common.of')} {categories.length} {t('expenseCategory.categories')}
        {hasActiveFilters && (
          <span className="ml-2 text-blue-600">({t('common.filtered')})</span>
        )}
      </div>

      {/* Categories Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">{t('expenseCategory.code')}</TableHead>
              <TableHead>{t('expenseCategory.nameEn')}</TableHead>
              <TableHead className="text-right">{t('expenseCategory.nameAr')}</TableHead>
              <TableHead className="w-20">{t('expenseCategory.level')}</TableHead>
              <TableHead className="w-24">{t('common.status')}</TableHead>
              <TableHead className="w-32">{t('expenseCategory.accounts')}</TableHead>
              <TableHead className="w-24">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {hasActiveFilters ? t('expenseCategory.noMatchingCategories') : t('expenseCategory.noCategories')}
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category.id} className="hover:bg-gray-50">
                  <TableCell>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {category.code}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{category.nameEn}</span>
                      {category.isSystemCategory && (
                        <Badge variant="secondary" className="text-xs">
                          {t('expenseCategory.system')}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right" dir="rtl">
                    {category.nameAr}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {category.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={category.isActive ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {category.isActive ? t('common.active') : t('common.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {category.accountAssignments?.length || 0} {t('expenseCategory.accounts')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">{t('common.actions')}</span>
                          <div className="h-4 w-4 flex items-center justify-center">
                            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-600 rounded-full mx-1"></div>
                            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(category)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                        )}

                        {!category.isSystemCategory && (
                          <DropdownMenuItem onClick={() => handleToggleStatus(category)}>
                            {category.isActive ? (
                              <>
                                <ToggleLeft className="mr-2 h-4 w-4" />
                                {t('common.deactivate')}
                              </>
                            ) : (
                              <>
                                <ToggleRight className="mr-2 h-4 w-4" />
                                {t('common.activate')}
                              </>
                            )}
                          </DropdownMenuItem>
                        )}

                        {onDelete && !category.isSystemCategory && (!category.children || category.children.length === 0) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(category)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}