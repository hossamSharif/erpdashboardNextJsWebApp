'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, Edit3, History, Save, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { trpc } from '@/lib/trpc';
import type { FinancialYearWithCounts } from '@erpdesk/shared';

const stockValueSchema = z.object({
  openingStockValue: z.number().nonnegative('Opening stock value must be non-negative'),
  closingStockValue: z.number().nonnegative('Closing stock value must be non-negative').optional(),
});

type StockValueFormData = z.infer<typeof stockValueSchema>;

interface StockValueManagementProps {
  financialYear: FinancialYearWithCounts;
  shopId: string;
  onUpdate?: () => void;
}

export function StockValueManagement({
  financialYear,
  shopId,
  onUpdate
}: StockValueManagementProps) {
  const [editMode, setEditMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const form = useForm<StockValueFormData>({
    resolver: zodResolver(stockValueSchema),
    defaultValues: {
      openingStockValue: financialYear.openingStockValue,
      closingStockValue: financialYear.closingStockValue || undefined,
    },
  });

  // tRPC mutations
  const updateOpeningStockMutation = trpc.financialYear.updateOpeningStockValue.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث قيمة المخزون الافتتاحي بنجاح');
      setEditMode(false);
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(`فشل في تحديث قيمة المخزون الافتتاحي: ${error.message}`);
    },
  });

  const updateClosingStockMutation = trpc.financialYear.updateClosingStockValue.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث قيمة المخزون الختامي بنجاح');
      setEditMode(false);
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(`فشل في تحديث قيمة المخزون الختامي: ${error.message}`);
    },
  });

  const onSubmit = async (data: StockValueFormData) => {
    try {
      // Update opening stock value if changed
      if (data.openingStockValue !== financialYear.openingStockValue) {
        await updateOpeningStockMutation.mutateAsync({
          shopId,
          financialYearId: financialYear.id,
          openingStockValue: data.openingStockValue,
        });
      }

      // Update closing stock value if provided and changed
      if (data.closingStockValue !== undefined &&
          data.closingStockValue !== financialYear.closingStockValue) {
        await updateClosingStockMutation.mutateAsync({
          shopId,
          financialYearId: financialYear.id,
          closingStockValue: data.closingStockValue,
        });
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
    }
  };

  const handleCancel = () => {
    form.reset({
      openingStockValue: financialYear.openingStockValue,
      closingStockValue: financialYear.closingStockValue || undefined,
    });
    setEditMode(false);
  };

  const isLoading = updateOpeningStockMutation.isPending || updateClosingStockMutation.isPending;
  const canEdit = !financialYear.isClosed;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">إدارة قيم المخزون</h3>
          <p className="text-sm text-muted-foreground">
            قيم المخزون الافتتاحي والختامي للسنة المالية {financialYear.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(true)}
          >
            <History className="h-4 w-4 mr-2" />
            السجل
          </Button>
          {canEdit && !editMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(true)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              تعديل
            </Button>
          )}
        </div>
      </div>

      <Separator className="mb-4" />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Opening Stock Value */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              قيمة المخزون الافتتاحي
              <Badge variant="secondary" className="mr-2">مطلوب</Badge>
            </label>
            {editMode ? (
              <Input
                type="number"
                step="0.01"
                min="0"
                {...form.register('openingStockValue', { valueAsNumber: true })}
                className={form.formState.errors.openingStockValue ? 'border-destructive' : ''}
                disabled={isLoading}
              />
            ) : (
              <div className="p-3 bg-muted rounded-md">
                {new Intl.NumberFormat('ar-SA', {
                  style: 'currency',
                  currency: 'SAR',
                }).format(financialYear.openingStockValue)}
              </div>
            )}
            {form.formState.errors.openingStockValue && (
              <p className="text-sm text-destructive">
                {form.formState.errors.openingStockValue.message}
              </p>
            )}
          </div>

          {/* Closing Stock Value */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              قيمة المخزون الختامي
              <Badge variant="outline" className="mr-2">اختياري</Badge>
            </label>
            {editMode ? (
              <Input
                type="number"
                step="0.01"
                min="0"
                {...form.register('closingStockValue', { valueAsNumber: true })}
                className={form.formState.errors.closingStockValue ? 'border-destructive' : ''}
                disabled={isLoading}
                placeholder="غير محدد"
              />
            ) : (
              <div className="p-3 bg-muted rounded-md">
                {financialYear.closingStockValue !== null
                  ? new Intl.NumberFormat('ar-SA', {
                      style: 'currency',
                      currency: 'SAR',
                    }).format(financialYear.closingStockValue)
                  : 'غير محدد'
                }
              </div>
            )}
            {form.formState.errors.closingStockValue && (
              <p className="text-sm text-destructive">
                {form.formState.errors.closingStockValue.message}
              </p>
            )}
          </div>
        </div>

        {/* Status Information */}
        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">حالة السنة المالية:</span>
            <Badge variant={financialYear.isCurrent ? 'default' : 'secondary'}>
              {financialYear.isCurrent ? 'حالية' : 'غير حالية'}
            </Badge>
            <Badge variant={financialYear.isClosed ? 'destructive' : 'outline'}>
              {financialYear.isClosed ? 'مغلقة' : 'مفتوحة'}
            </Badge>
          </div>
        </div>

        {editMode && (
          <div className="flex items-center gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              إلغاء
            </Button>
          </div>
        )}

        {!canEdit && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              لا يمكن تعديل قيم المخزون للسنوات المالية المغلقة
            </p>
          </div>
        )}
      </form>

      {/* Stock Value History Dialog */}
      <StockValueHistoryDialog
        open={showHistory}
        onClose={() => setShowHistory(false)}
        financialYearId={financialYear.id}
        financialYearName={financialYear.name}
      />
    </Card>
  );
}

interface StockValueHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  financialYearId: string;
  financialYearName: string;
}

function StockValueHistoryDialog({
  open,
  onClose,
  financialYearId,
  financialYearName,
}: StockValueHistoryDialogProps) {
  // TODO: Implement stock value history query when the endpoint is available
  // const historyQuery = trpc.financialYear.getStockValueHistory.useQuery(
  //   { financialYearId },
  //   { enabled: open }
  // );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>سجل تغييرات قيم المخزون</DialogTitle>
          <DialogDescription>
            جميع التغييرات المسجلة لقيم المخزون للسنة المالية {financialYearName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* TODO: Replace with actual history data */}
          <div className="text-center py-8">
            <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد سجلات متاحة</h3>
            <p className="text-muted-foreground">
              سيتم عرض سجل التغييرات هنا عند توفر البيانات
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}