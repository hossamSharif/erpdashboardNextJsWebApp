'use client';

import { useState } from 'react';
import { useAuthStore } from '../../../stores/auth-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { TransactionType } from '@multi-shop/shared';
import { SalesTransactionForm } from './SalesTransactionForm';

interface TransactionEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TransactionEntryModal({
  isOpen,
  onClose,
  onSuccess
}: TransactionEntryModalProps) {
  const { language } = useAuthStore();
  const isRTL = language === 'ar';

  const [selectedType, setSelectedType] = useState<TransactionType | ''>('');

  const transactionTypes = [
    {
      value: TransactionType.SALE,
      labelEn: 'Sales',
      labelAr: 'مبيعات',
      color: 'text-green-600'
    },
    {
      value: TransactionType.PURCHASE,
      labelEn: 'Purchase',
      labelAr: 'مشتريات',
      color: 'text-red-600'
    },
    {
      value: TransactionType.PAYMENT,
      labelEn: 'Expense',
      labelAr: 'مصروفات',
      color: 'text-orange-600'
    },
    {
      value: TransactionType.TRANSFER,
      labelEn: 'Transfer',
      labelAr: 'تحويل',
      color: 'text-blue-600'
    }
  ];

  const handleClose = () => {
    setSelectedType('');
    onClose();
  };

  const handleSuccess = () => {
    setSelectedType('');
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`sm:max-w-[600px] ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {isRTL ? 'إضافة معاملة جديدة' : 'Add New Transaction'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Type Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isRTL ? 'نوع المعاملة' : 'Transaction Type'}
            </Label>
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as TransactionType)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isRTL ? 'اختر نوع المعاملة' : 'Select transaction type'} />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="cursor-pointer">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className={`w-3 h-3 rounded-full bg-current ${type.color}`} />
                      <span>
                        {isRTL ? type.labelAr : type.labelEn}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Form Content Based on Selected Type */}
          {selectedType === TransactionType.SALE && (
            <SalesTransactionForm
              onCancel={handleClose}
              onSuccess={handleSuccess}
            />
          )}

          {selectedType === TransactionType.PURCHASE && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {isRTL
                  ? 'نموذج المشتريات قيد التطوير'
                  : 'Purchase form is under development'
                }
              </p>
            </div>
          )}

          {selectedType === TransactionType.PAYMENT && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {isRTL
                  ? 'نموذج المصروفات قيد التطوير'
                  : 'Expense form is under development'
                }
              </p>
            </div>
          )}

          {selectedType === TransactionType.TRANSFER && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {isRTL
                  ? 'نموذج التحويل قيد التطوير'
                  : 'Transfer form is under development'
                }
              </p>
            </div>
          )}

          {/* Instructions when no type selected */}
          {!selectedType && (
            <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="text-gray-400 dark:text-gray-500">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isRTL
                    ? 'اختر نوع المعاملة أعلاه للبدء'
                    : 'Select a transaction type above to get started'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Footer Actions (only show cancel when no form is displayed) */}
          {!selectedType && (
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={handleClose}
                className="min-w-[100px]"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}