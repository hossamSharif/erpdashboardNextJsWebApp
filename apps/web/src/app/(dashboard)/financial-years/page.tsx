'use client';

import { useState, useEffect } from 'react';
import { Plus, RefreshCw, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/ui/page-header';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import {
  FinancialYearForm,
  FinancialYearList,
  YearEndWarning,
  StockValueManagement,
  BulkStockValueUpdate
} from '@/components/features/financial-years';

import { useFinancialYearStore } from '@/stores/financialYear.store';
import { useShopStore } from '@/stores/shop.store';
import { trpc } from '@/lib/trpc';
import type {
  CreateFinancialYearInput,
  UpdateFinancialYearInput,
  FinancialYearWithCounts
} from '@multi-shop/shared';

export default function FinancialYearsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<FinancialYearWithCounts | null>(null);
  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false);
  const [stockValueYear, setStockValueYear] = useState<FinancialYearWithCounts | null>(null);

  const { currentShop } = useShopStore();
  const {
    financialYears,
    currentFinancialYear,
    setFinancialYears,
    setCurrentFinancialYear,
    addFinancialYear,
    updateFinancialYear,
    removeFinancialYear,
    setLoading,
    setError,
    isLoading
  } = useFinancialYearStore();

  // tRPC hooks
  const utils = trpc.useUtils();
  const listQuery = trpc.financialYear.list.useQuery(
    { shopId: currentShop?.id || '' },
    {
      enabled: !!currentShop?.id,
      onSuccess: (data) => {
        setFinancialYears(data);
        setLoading(false);
      },
      onError: (error) => {
        setError(error.message);
        setLoading(false);
      }
    }
  );

  const createMutation = trpc.financialYear.create.useMutation({
    onSuccess: (data) => {
      addFinancialYear(data);
      toast.success('تم إنشاء السنة المالية بنجاح');
      setFormOpen(false);
      setEditingYear(null);
    },
    onError: (error) => {
      toast.error(`فشل في إنشاء السنة المالية: ${error.message}`);
    }
  });

  const updateMutation = trpc.financialYear.update.useMutation({
    onSuccess: (data) => {
      updateFinancialYear(data);
      toast.success('تم تحديث السنة المالية بنجاح');
      setFormOpen(false);
      setEditingYear(null);
    },
    onError: (error) => {
      toast.error(`فشل في تحديث السنة المالية: ${error.message}`);
    }
  });

  const setCurrentMutation = trpc.financialYear.setCurrent.useMutation({
    onSuccess: (data) => {
      setCurrentFinancialYear(data);
      // Refresh the list to update all years
      utils.financialYear.list.invalidate();
      toast.success('تم تعيين السنة المالية الحالية بنجاح');
    },
    onError: (error) => {
      toast.error(`فشل في تعيين السنة المالية: ${error.message}`);
    }
  });

  const closeMutation = trpc.financialYear.close.useMutation({
    onSuccess: (data) => {
      updateFinancialYear(data);
      toast.success('تم إغلاق السنة المالية بنجاح');
    },
    onError: (error) => {
      toast.error(`فشل في إغلاق السنة المالية: ${error.message}`);
    }
  });

  const deleteMutation = trpc.financialYear.delete.useMutation({
    onSuccess: (_, variables) => {
      removeFinancialYear(variables.id);
      toast.success('تم حذف السنة المالية بنجاح');
    },
    onError: (error) => {
      toast.error(`فشل في حذف السنة المالية: ${error.message}`);
    }
  });

  useEffect(() => {
    if (currentShop?.id) {
      setLoading(true);
    }
  }, [currentShop?.id, setLoading]);

  const handleFormSubmit = async (data: CreateFinancialYearInput | UpdateFinancialYearInput) => {
    if ('id' in data) {
      // Update existing
      await updateMutation.mutateAsync(data);
    } else {
      // Create new
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (financialYear: FinancialYearWithCounts) => {
    setEditingYear(financialYear);
    setFormOpen(true);
  };

  const handleSetCurrent = async (id: string) => {
    await setCurrentMutation.mutateAsync({ id });
  };

  const handleClose = async (id: string, closingStockValue: number) => {
    await closeMutation.mutateAsync({ id, closingStockValue });
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ id });
  };

  const handleRefresh = () => {
    listQuery.refetch();
  };

  if (!currentShop) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">لم يتم اختيار متجر</h3>
          <p className="text-muted-foreground">يرجى اختيار متجر للمتابعة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader>
        <div className="flex items-center justify-between">
          <div>
            <PageHeaderHeading>السنوات المالية</PageHeaderHeading>
            <PageHeaderDescription>
              إدارة السنوات المالية وإعداد فترات المحاسبة لمتجر {currentShop.nameAr}
            </PageHeaderDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={listQuery.isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${listQuery.isLoading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkUpdateOpen(true)}
              disabled={isLoading || financialYears.length === 0}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              تحديث قيم المخزون بالجملة
            </Button>
            <Button
              onClick={() => {
                setEditingYear(null);
                setFormOpen(true);
              }}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              إضافة سنة مالية
            </Button>
          </div>
        </div>
      </PageHeader>

      <Separator />

      {/* Year End Warning */}
      <YearEndWarning currentFinancialYear={currentFinancialYear} />

      {/* Content */}
      <div className="space-y-6">
        {listQuery.isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[200px] w-full" />
              </div>
            ))}
          </div>
        ) : listQuery.error ? (
          <div className="flex h-[450px] items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive">خطأ في تحميل البيانات</h3>
              <p className="text-muted-foreground mb-4">{listQuery.error.message}</p>
              <Button onClick={handleRefresh} variant="outline">
                المحاولة مرة أخرى
              </Button>
            </div>
          </div>
        ) : (
          <FinancialYearList
            financialYears={financialYears}
            onEdit={handleEdit}
            onSetCurrent={handleSetCurrent}
            onClose={handleClose}
            onDelete={handleDelete}
            onManageStockValues={(financialYear) => setStockValueYear(financialYear)}
            isLoading={
              createMutation.isPending ||
              updateMutation.isPending ||
              setCurrentMutation.isPending ||
              closeMutation.isPending ||
              deleteMutation.isPending
            }
            userRole="ADMIN" // TODO: Get from auth context
          />
        )}
      </div>

      {/* Stock Value Management for selected financial year */}
      {stockValueYear && (
        <div className="mt-6">
          <StockValueManagement
            financialYear={stockValueYear}
            shopId={currentShop.id}
            onUpdate={() => {
              listQuery.refetch();
              setStockValueYear(null);
            }}
          />
        </div>
      )}

      {/* Form Dialog */}
      <FinancialYearForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingYear(null);
        }}
        onSubmit={handleFormSubmit}
        financialYear={editingYear}
        shopId={currentShop.id}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Bulk Stock Value Update Dialog */}
      <BulkStockValueUpdate
        open={bulkUpdateOpen}
        onClose={() => setBulkUpdateOpen(false)}
        financialYears={financialYears}
        onUpdate={() => {
          listQuery.refetch();
        }}
      />
    </div>
  );
}