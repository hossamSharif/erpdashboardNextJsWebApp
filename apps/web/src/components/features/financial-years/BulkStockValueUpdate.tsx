'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, Download, Save, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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

const bulkUpdateSchema = z.object({
  updates: z.array(z.object({
    shopId: z.string().uuid(),
    financialYearId: z.string().uuid(),
    shopName: z.string(),
    financialYearName: z.string(),
    openingStockValue: z.number().nonnegative().optional(),
    closingStockValue: z.number().nonnegative().optional(),
  })).min(1, 'At least one update is required'),
});

type BulkUpdateFormData = z.infer<typeof bulkUpdateSchema>;

interface BulkStockValueUpdateProps {
  open: boolean;
  onClose: () => void;
  financialYears: FinancialYearWithCounts[];
  onUpdate?: () => void;
}

export function BulkStockValueUpdate({
  open,
  onClose,
  financialYears,
  onUpdate
}: BulkStockValueUpdateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BulkUpdateFormData>({
    resolver: zodResolver(bulkUpdateSchema),
    defaultValues: {
      updates: financialYears
        .filter(fy => !fy.isClosed) // Only include open financial years
        .map(fy => ({
          shopId: fy.shopId,
          financialYearId: fy.id,
          shopName: fy.shop?.nameAr || 'غير محدد',
          financialYearName: fy.name,
          openingStockValue: fy.openingStockValue,
          closingStockValue: fy.closingStockValue || undefined,
        })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'updates',
  });

  // tRPC mutation
  const bulkUpdateMutation = trpc.financialYear.bulkUpdateStockValues.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث قيم المخزون بنجاح');
      onUpdate?.();
      onClose();
    },
    onError: (error) => {
      toast.error(`فشل في تحديث قيم المخزون: ${error.message}`);
    },
  });

  const onSubmit = async (data: BulkUpdateFormData) => {
    setIsSubmitting(true);
    try {
      // Filter out updates with no changes
      const changedUpdates = data.updates.filter(update =>
        update.openingStockValue !== undefined || update.closingStockValue !== undefined
      );

      if (changedUpdates.length === 0) {
        toast.warning('لا توجد تغييرات للحفظ');
        return;
      }

      await bulkUpdateMutation.mutateAsync({
        updates: changedUpdates.map(({ shopName, financialYearName, ...update }) => update)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  const addNewUpdate = () => {
    append({
      shopId: '',
      financialYearId: '',
      shopName: '',
      financialYearName: '',
      openingStockValue: undefined,
      closingStockValue: undefined,
    });
  };

  const exportTemplate = () => {
    const csvData = [
      ['Shop ID', 'Financial Year ID', 'Shop Name', 'Financial Year', 'Current Opening Stock', 'Current Closing Stock', 'New Opening Stock', 'New Closing Stock'],
      ...fields.map(field => [
        field.shopId,
        field.financialYearId,
        field.shopName,
        field.financialYearName,
        field.openingStockValue || '',
        field.closingStockValue || '',
        '', // New opening stock - to be filled
        '', // New closing stock - to be filled
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stock_values_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const isLoading = bulkUpdateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>تحديث قيم المخزون بالجملة</DialogTitle>
          <DialogDescription>
            تحديث قيم المخزون الافتتاحي والختامي لعدة سنوات مالية في نفس الوقت
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNewUpdate}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                إضافة سطر
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={exportTemplate}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                تصدير قالب
              </Button>
              <div className="mr-auto flex items-center gap-2">
                <Badge variant="secondary">
                  {fields.length} سنة مالية
                </Badge>
              </div>
            </div>

            {/* Updates Table */}
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
                    {/* Shop and Year Info */}
                    <div className="md:col-span-2 space-y-1">
                      <p className="text-sm font-medium">{field.shopName}</p>
                      <p className="text-sm text-muted-foreground">{field.financialYearName}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          الافتتاحي: {new Intl.NumberFormat('ar-SA', {
                            style: 'currency',
                            currency: 'SAR',
                          }).format(field.openingStockValue || 0)}
                        </Badge>
                        {field.closingStockValue && (
                          <Badge variant="outline" className="text-xs">
                            الختامي: {new Intl.NumberFormat('ar-SA', {
                              style: 'currency',
                              currency: 'SAR',
                            }).format(field.closingStockValue)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Opening Stock Value */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">قيمة المخزون الافتتاحي الجديدة</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register(`updates.${index}.openingStockValue`, {
                          valueAsNumber: true
                        })}
                        placeholder="لا تغيير"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Closing Stock Value */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">قيمة المخزون الختامي الجديدة</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register(`updates.${index}.closingStockValue`, {
                          valueAsNumber: true
                        })}
                        placeholder="لا تغيير"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={isLoading || fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {fields.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">لا توجد سنوات مالية متاحة للتحديث</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addNewUpdate}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة سطر
                  </Button>
                </div>
              )}
            </div>

            {/* Form Errors */}
            {form.formState.errors.updates && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">
                  {form.formState.errors.updates.message}
                </p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <Button
                type="submit"
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}