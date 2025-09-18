'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '../../../stores/auth-store';
import { trpc } from '../../../utils/trpc';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import {
  SalesTransactionFormInput,
  salesTransactionFormSchema,
  PaymentMethod,
  TransactionType
} from '@multi-shop/shared';

interface SalesTransactionFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

interface Customer {
  id: string;
  nameAr: string;
  nameEn: string;
  balance: number;
}

export function SalesTransactionForm({
  onCancel,
  onSuccess
}: SalesTransactionFormProps) {
  const { data: session } = useSession();
  const { language } = useAuthStore();
  const isRTL = language === 'ar';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cashBankAccounts, setCashBankAccounts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<SalesTransactionFormInput>({
    resolver: zodResolver(salesTransactionFormSchema),
    defaultValues: {
      totalAmount: 0,
      customerId: '',
      amountPaid: 0,
      change: 0,
      paymentMethod: PaymentMethod.CASH,
      invoiceComment: ''
    }
  });

  // Watch values for real-time calculation
  const totalAmount = watch('totalAmount') || 0;
  const amountPaid = watch('amountPaid') || 0;

  // Auto-calculate change
  useEffect(() => {
    const changeAmount = amountPaid > totalAmount ? amountPaid - totalAmount : 0;
    setValue('change', changeAmount);
  }, [totalAmount, amountPaid, setValue]);

  // Load customers
  const { data: accountsData } = trpc.accounts.getCustomers.useQuery(
    { shopId: session?.user?.shopId || '' },
    {
      enabled: !!session?.user?.shopId,
      onSuccess: (data) => {
        // Ensure default customer exists
        const defaultCustomerId = `direct-sales-${session?.user?.shopId}`;
        const hasDefault = data.some(customer => customer.id === defaultCustomerId);

        if (!hasDefault) {
          // Add default customer to list
          const defaultCustomer: Customer = {
            id: defaultCustomerId,
            nameAr: `مبيعات مباشرة - ${session?.user?.shop?.nameAr || 'المتجر'}`,
            nameEn: `Direct Sales - ${session?.user?.shop?.nameEn || 'Shop'}`,
            balance: 0
          };
          setCustomers([defaultCustomer, ...data]);
          setValue('customerId', defaultCustomerId);
        } else {
          setCustomers(data);
          setValue('customerId', defaultCustomerId);
        }
      }
    }
  );

  // Load cash/bank accounts
  const { data: cashBankData } = trpc.accounts.getCashBankAccounts.useQuery(
    { shopId: session?.user?.shopId || '' },
    {
      enabled: !!session?.user?.shopId,
      onSuccess: (data) => {
        setCashBankAccounts(data);
      }
    }
  );

  // Create transaction mutation
  const createTransactionMutation = trpc.transactions.create.useMutation({
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error('Failed to create transaction:', error);
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = async (data: SalesTransactionFormInput) => {
    if (!session?.user?.shopId) return;

    setIsSubmitting(true);

    // Find appropriate cash/bank account based on payment method
    const counterAccount = cashBankAccounts.find(account => {
      const nameEn = account.nameEn.toLowerCase();
      const nameAr = account.nameAr.toLowerCase();

      if (data.paymentMethod === PaymentMethod.CASH) {
        return nameEn.includes('cash') || nameAr.includes('نقدية');
      } else {
        return nameEn.includes('bank') || nameAr.includes('بنك');
      }
    });

    if (!counterAccount) {
      console.error(`No ${data.paymentMethod.toLowerCase()} account found`);
      setIsSubmitting(false);
      return;
    }

    createTransactionMutation.mutate({
      transactionType: TransactionType.SALE,
      amount: data.totalAmount,
      amountPaid: data.amountPaid,
      change: data.change,
      description: data.invoiceComment || `Sales transaction ${new Date().toLocaleDateString()}`,
      accountId: data.customerId,
      counterAccountId: counterAccount.id,
      paymentMethod: data.paymentMethod,
      shopId: session.user.shopId
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Total Amount */}
      <div className="space-y-2">
        <Label htmlFor="totalAmount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isRTL ? 'المبلغ الإجمالي' : 'Total Amount'} *
        </Label>
        <Input
          id="totalAmount"
          type="number"
          step="0.01"
          min="0"
          {...register('totalAmount', { valueAsNumber: true })}
          className={`${errors.totalAmount ? 'border-red-500 focus:ring-red-500' : ''}`}
          placeholder={isRTL ? 'أدخل المبلغ الإجمالي' : 'Enter total amount'}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        {errors.totalAmount && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.totalAmount.message}
          </p>
        )}
      </div>

      {/* Customer Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isRTL ? 'العميل' : 'Customer'} *
        </Label>
        <Select
          value={watch('customerId')}
          onValueChange={(value) => setValue('customerId', value)}
        >
          <SelectTrigger className={`w-full ${errors.customerId ? 'border-red-500 focus:ring-red-500' : ''}`}>
            <SelectValue placeholder={isRTL ? 'اختر العميل' : 'Select customer'} />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id} className="cursor-pointer">
                <div className="flex items-center justify-between w-full">
                  <span>{isRTL ? customer.nameAr : customer.nameEn}</span>
                  {customer.balance !== 0 && (
                    <span className={`text-xs ${customer.balance > 0 ? 'text-green-600' : 'text-red-600'} ${isRTL ? 'mr-2' : 'ml-2'}`}>
                      {formatCurrency(customer.balance)}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.customerId && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.customerId.message}
          </p>
        )}
      </div>

      {/* Payment Fields */}
      <div className="grid grid-cols-2 gap-4">
        {/* Amount Paid */}
        <div className="space-y-2">
          <Label htmlFor="amountPaid" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isRTL ? 'المبلغ المدفوع' : 'Amount Paid'} *
          </Label>
          <Input
            id="amountPaid"
            type="number"
            step="0.01"
            min="0"
            {...register('amountPaid', { valueAsNumber: true })}
            className={`${errors.amountPaid ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder={isRTL ? 'المبلغ المدفوع' : 'Amount paid'}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          {errors.amountPaid && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.amountPaid.message}
            </p>
          )}
        </div>

        {/* Change (Read-only, auto-calculated) */}
        <div className="space-y-2">
          <Label htmlFor="change" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isRTL ? 'الباقي' : 'Change'}
          </Label>
          <Input
            id="change"
            type="number"
            {...register('change', { valueAsNumber: true })}
            readOnly
            className="bg-gray-50 dark:bg-gray-800"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isRTL ? 'طريقة الدفع' : 'Payment Method'} *
        </Label>
        <Select
          value={watch('paymentMethod')}
          onValueChange={(value) => setValue('paymentMethod', value as PaymentMethod)}
        >
          <SelectTrigger className={`w-full ${errors.paymentMethod ? 'border-red-500 focus:ring-red-500' : ''}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PaymentMethod.CASH} className="cursor-pointer">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>{isRTL ? 'نقداً' : 'Cash'}</span>
              </div>
            </SelectItem>
            <SelectItem value={PaymentMethod.BANK} className="cursor-pointer">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{isRTL ? 'بنك' : 'Bank'}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {errors.paymentMethod && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.paymentMethod.message}
          </p>
        )}
      </div>

      {/* Invoice Comment */}
      <div className="space-y-2">
        <Label htmlFor="invoiceComment" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isRTL ? 'تعليق الفاتورة' : 'Invoice Comment'}
        </Label>
        <Textarea
          id="invoiceComment"
          {...register('invoiceComment')}
          rows={2}
          placeholder={isRTL ? 'تعليق اختياري على الفاتورة' : 'Optional invoice comment'}
          className="resize-none"
        />
      </div>

      {/* Payment Status Summary */}
      {totalAmount > 0 && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>{isRTL ? 'المبلغ الإجمالي:' : 'Total Amount:'}</span>
              <span className="font-medium">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>{isRTL ? 'المبلغ المدفوع:' : 'Amount Paid:'}</span>
              <span className="font-medium">{formatCurrency(amountPaid)}</span>
            </div>
            {amountPaid !== totalAmount && (
              <div className="flex justify-between">
                <span>
                  {amountPaid > totalAmount
                    ? (isRTL ? 'الباقي:' : 'Change:')
                    : (isRTL ? 'الباقي مطلوب:' : 'Remaining:')
                  }
                </span>
                <span className={`font-medium ${
                  amountPaid > totalAmount ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {formatCurrency(Math.abs(amountPaid - totalAmount))}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="min-w-[100px]"
        >
          {isRTL ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || amountPaid > totalAmount}
          className="min-w-[100px] bg-green-600 hover:bg-green-700 text-white"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isRTL ? 'جاري الحفظ...' : 'Saving...'}
            </>
          ) : (
            <>
              <svg className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isRTL ? 'حفظ المبيعات' : 'Save Sale'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}