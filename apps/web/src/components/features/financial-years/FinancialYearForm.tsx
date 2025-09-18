'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar, CalendarDays, DollarSign, Loader2 } from 'lucide-react';
import {
  createFinancialYearSchema,
  updateFinancialYearSchema,
  type CreateFinancialYearInput,
  type UpdateFinancialYearInput,
  type FinancialYear
} from '@multi-shop/shared';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';

interface FinancialYearFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFinancialYearInput | UpdateFinancialYearInput) => Promise<void>;
  financialYear?: FinancialYear;
  shopId: string;
  isLoading?: boolean;
}

export function FinancialYearForm({
  open,
  onClose,
  onSubmit,
  financialYear,
  shopId,
  isLoading = false
}: FinancialYearFormProps) {
  const isEditing = !!financialYear;
  const schema = isEditing ? updateFinancialYearSchema : createFinancialYearSchema;

  const form = useForm<CreateFinancialYearInput | UpdateFinancialYearInput>({
    resolver: zodResolver(schema),
    defaultValues: isEditing
      ? {
          id: financialYear.id,
          name: financialYear.name,
          startDate: new Date(financialYear.startDate),
          endDate: new Date(financialYear.endDate),
          openingStockValue: financialYear.openingStockValue
        }
      : {
          name: '',
          startDate: new Date(),
          endDate: new Date(),
          openingStockValue: 0,
          shopId
        }
  });

  const handleSubmit = async (data: CreateFinancialYearInput | UpdateFinancialYearInput) => {
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {isEditing ? 'تعديل السنة المالية' : 'إضافة سنة مالية جديدة'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'قم بتعديل معلومات السنة المالية'
              : 'قم بإنشاء سنة مالية جديدة لمتجرك'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid gap-4">
              {/* Financial Year Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم السنة المالية</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="مثال: السنة المالية 2024"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      اسم وصفي للسنة المالية
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ البداية</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          onDateChange={(date) => field.onChange(date)}
                          placeholder="اختر تاريخ البداية"
                          disabled={isLoading || (isEditing && financialYear?.isClosed)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ النهاية</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          onDateChange={(date) => field.onChange(date)}
                          placeholder="اختر تاريخ النهاية"
                          disabled={isLoading || (isEditing && financialYear?.isClosed)}
                          minDate={startDate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Opening Stock Value */}
              <FormField
                control={form.control}
                name="openingStockValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>قيمة المخزون الافتتاحي</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-10"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      قيمة البضائع في المخزون في بداية السنة المالية
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Range Summary */}
              {startDate && endDate && endDate > startDate && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">ملخص السنة المالية</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">من</div>
                        <div className="font-medium">
                          {format(startDate, 'dd MMM yyyy', { locale: { localize: { month: () => 'ar' } } })}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">إلى</div>
                        <div className="font-medium">
                          {format(endDate, 'dd MMM yyyy', { locale: { localize: { month: () => 'ar' } } })}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      المدة: {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} يوم
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Closed Year Warning */}
              {isEditing && financialYear?.isClosed && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-sm text-yellow-800">
                      <Calendar className="h-4 w-4" />
                      هذه السنة المالية مُغلقة. لا يمكن تعديل التواريخ.
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'حفظ التغييرات' : 'إنشاء السنة المالية'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}