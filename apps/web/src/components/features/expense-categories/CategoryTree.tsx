'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'next-i18next';
import { ExpenseCategoryTreeNode } from '@packages/shared/src/types/expenseCategory';
import { api } from '@/lib/trpc/client';
import { toast } from '@/hooks/use-toast';

interface CategoryTreeProps {
  categories: ExpenseCategoryTreeNode[];
  onEdit?: (category: ExpenseCategoryTreeNode) => void;
  onDelete?: (category: ExpenseCategoryTreeNode) => void;
  onAddChild?: (parent: ExpenseCategoryTreeNode) => void;
  showActions?: boolean;
  expandAll?: boolean;
}

interface CategoryNodeProps {
  category: ExpenseCategoryTreeNode;
  onEdit?: (category: ExpenseCategoryTreeNode) => void;
  onDelete?: (category: ExpenseCategoryTreeNode) => void;
  onAddChild?: (parent: ExpenseCategoryTreeNode) => void;
  onToggleStatus?: (category: ExpenseCategoryTreeNode) => void;
  showActions?: boolean;
  level?: number;
}

function CategoryNode({
  category,
  onEdit,
  onDelete,
  onAddChild,
  onToggleStatus,
  showActions = true,
  level = 0,
}: CategoryNodeProps) {
  const { t } = useTranslation('common');
  const [isExpanded, setIsExpanded] = useState(category.isExpanded || false);

  const hasChildren = category.children && category.children.length > 0;
  const indentWidth = level * 24;

  return (
    <div className="w-full">
      <div
        className="flex items-center justify-between p-2 hover:bg-gray-50 border-b border-gray-100"
        style={{ paddingLeft: `${indentWidth + 8}px` }}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={!hasChildren}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <div className="h-4 w-4" />
            )}
          </Button>

          {/* Category Info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {category.code}
                </span>
                <span className="font-medium text-gray-900 truncate">
                  {category.nameEn}
                </span>
                <span className="text-gray-600 truncate" dir="rtl">
                  {category.nameAr}
                </span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">
                {t('expenseCategory.level')} {category.level}
              </Badge>

              {category.isSystemCategory && (
                <Badge variant="secondary" className="text-xs">
                  {t('expenseCategory.system')}
                </Badge>
              )}

              {!category.isActive && (
                <Badge variant="destructive" className="text-xs">
                  {t('common.inactive')}
                </Badge>
              )}

              {category.assignedAccountsCount > 0 && (
                <Badge variant="default" className="text-xs">
                  {category.assignedAccountsCount} {t('expenseCategory.accounts')}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        {showActions && (
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

              {onAddChild && category.level < 3 && (
                <DropdownMenuItem onClick={() => onAddChild(category)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('expenseCategory.addSubcategory')}
                </DropdownMenuItem>
              )}

              {onToggleStatus && !category.isSystemCategory && (
                <DropdownMenuItem onClick={() => onToggleStatus(category)}>
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

              {onDelete && !category.isSystemCategory && !hasChildren && (
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
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-0">
          {category.children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onToggleStatus={onToggleStatus}
              showActions={showActions}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree({
  categories,
  onEdit,
  onDelete,
  onAddChild,
  showActions = true,
  expandAll = false,
}: CategoryTreeProps) {
  const { t } = useTranslation('common');

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

  const handleToggleStatus = async (category: ExpenseCategoryTreeNode) => {
    await toggleCategoryStatusMutation.mutateAsync({
      id: category.id,
      isActive: !category.isActive,
    });
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{t('expenseCategory.noCategories')}</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-medium text-gray-900">{t('expenseCategory.categoryHierarchy')}</h3>
      </div>

      <div className="divide-y divide-gray-100">
        {categories.map((category) => (
          <CategoryNode
            key={category.id}
            category={category}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            onToggleStatus={handleToggleStatus}
            showActions={showActions}
            level={0}
          />
        ))}
      </div>
    </div>
  );
}