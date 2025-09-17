'use client';

import { useState } from 'react';
import { Plus, Download, Upload, List, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from 'next-i18next';
import { api } from '@/lib/trpc/client';
import { toast } from '@/hooks/use-toast';
import { ExpenseCategory, ExpenseCategoryTreeNode } from '@packages/shared/src/types/expenseCategory';

import { ExpenseCategoryForm } from './ExpenseCategoryForm';
import { CategoryTree } from './CategoryTree';
import { CategoryList } from './CategoryList';
import { BulkImportModal } from './BulkImportModal';

export function ExpenseCategoryManagement() {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<'tree' | 'list'>('tree');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [parentCategory, setParentCategory] = useState<ExpenseCategory | null>(null);

  // Fetch categories data
  const {
    data: categories,
    isLoading,
    refetch: refetchCategories,
  } = api.expenseCategory.getExpenseCategories.useQuery();

  const {
    data: categoryTree,
    isLoading: isLoadingTree,
    refetch: refetchTree,
  } = api.expenseCategory.getCategoryTree.useQuery();

  // Delete mutation
  const deleteCategoryMutation = api.expenseCategory.deleteExpenseCategory.useMutation({
    onSuccess: () => {
      toast({
        title: t('expenseCategory.deleted'),
        description: t('expenseCategory.deletedDescription'),
      });
      refetchCategories();
      refetchTree();
    },
    onError: (error) => {
      toast({
        title: t('error.title'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (category: ExpenseCategory | ExpenseCategoryTreeNode) => {
    setSelectedCategory(category as ExpenseCategory);
    setShowEditModal(true);
  };

  const handleDelete = async (category: ExpenseCategory | ExpenseCategoryTreeNode) => {
    if (confirm(t('expenseCategory.confirmDelete', { name: category.nameEn }))) {
      await deleteCategoryMutation.mutateAsync({ id: category.id });
    }
  };

  const handleAddChild = (parent: ExpenseCategoryTreeNode) => {
    setParentCategory(parent as ExpenseCategory);
    setShowCreateModal(true);
  };

  const handleAdd = () => {
    setParentCategory(null);
    setShowCreateModal(true);
  };

  const handleSuccess = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedCategory(null);
    setParentCategory(null);
    refetchCategories();
    refetchTree();
  };

  const handleCancel = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedCategory(null);
    setParentCategory(null);
  };

  const handleBulkImportSuccess = () => {
    setShowBulkImportModal(false);
    refetchCategories();
    refetchTree();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('expenseCategory.management')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('expenseCategory.managementDescription')}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkImportModal(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {t('expenseCategory.bulkImport')}
          </Button>

          <Button
            onClick={handleAdd}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('expenseCategory.addCategory')}
          </Button>
        </div>
      </div>

      {/* Category Views */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'tree' | 'list')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tree" className="flex items-center gap-2">
            <TreePine className="h-4 w-4" />
            {t('expenseCategory.treeView')}
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            {t('expenseCategory.listView')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tree" className="space-y-4">
          {isLoadingTree ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">{t('common.loading')}</div>
            </div>
          ) : (
            <CategoryTree
              categories={categoryTree || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddChild={handleAddChild}
              showActions={true}
            />
          )}
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <CategoryList
            categories={categories || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Create Category Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {parentCategory
                ? t('expenseCategory.addSubcategory')
                : t('expenseCategory.addCategory')
              }
            </DialogTitle>
            <DialogDescription>
              {parentCategory
                ? t('expenseCategory.addSubcategoryDescription', { parent: parentCategory.nameEn })
                : t('expenseCategory.addCategoryDescription')
              }
            </DialogDescription>
          </DialogHeader>

          <ExpenseCategoryForm
            parentCategory={parentCategory}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('expenseCategory.editCategory')}</DialogTitle>
            <DialogDescription>
              {t('expenseCategory.editCategoryDescription')}
            </DialogDescription>
          </DialogHeader>

          {selectedCategory && (
            <ExpenseCategoryForm
              category={selectedCategory}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        onSuccess={handleBulkImportSuccess}
      />
    </div>
  );
}