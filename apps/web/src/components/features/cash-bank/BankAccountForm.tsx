'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBankAccountSchema, type CreateBankAccountInput } from '@packages/shared/src/validators/cashBankAccount';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'next-i18next';

interface BankAccountFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BankAccountForm({ onSuccess, onCancel }: BankAccountFormProps) {
  const { t } = useTranslation('common');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateBankAccountInput>({
    resolver: zodResolver(createBankAccountSchema),
    defaultValues: {
      openingBalance: 0,
      isDefault: false,
    },
  });

  const isDefault = watch('isDefault');

  const createBankAccountMutation = api.cashBank.createBankAccount.useMutation({
    onSuccess: () => {
      toast({
        title: t('bankAccount.created'),
        description: t('bankAccount.createdDescription'),
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: t('error.title'),
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: CreateBankAccountInput) => {
    setIsSubmitting(true);
    await createBankAccountMutation.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nameAr">{t('bankAccount.nameAr')}</Label>
          <Input
            id="nameAr"
            {...register('nameAr')}
            placeholder={t('bankAccount.nameArPlaceholder')}
            className="text-right"
            dir="rtl"
          />
          {errors.nameAr && (
            <p className="text-sm text-red-500">{errors.nameAr.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nameEn">{t('bankAccount.nameEn')}</Label>
          <Input
            id="nameEn"
            {...register('nameEn')}
            placeholder={t('bankAccount.nameEnPlaceholder')}
          />
          {errors.nameEn && (
            <p className="text-sm text-red-500">{errors.nameEn.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accountNumber">{t('bankAccount.accountNumber')}</Label>
          <Input
            id="accountNumber"
            {...register('accountNumber')}
            placeholder={t('bankAccount.accountNumberPlaceholder')}
          />
          {errors.accountNumber && (
            <p className="text-sm text-red-500">{errors.accountNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bankName">{t('bankAccount.bankName')}</Label>
          <Input
            id="bankName"
            {...register('bankName')}
            placeholder={t('bankAccount.bankNamePlaceholder')}
          />
          {errors.bankName && (
            <p className="text-sm text-red-500">{errors.bankName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="iban">{t('bankAccount.iban')}</Label>
        <Input
          id="iban"
          {...register('iban')}
          placeholder={t('bankAccount.ibanPlaceholder')}
        />
        {errors.iban && (
          <p className="text-sm text-red-500">{errors.iban.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="openingBalance">{t('bankAccount.openingBalance')}</Label>
        <Input
          id="openingBalance"
          type="number"
          step="0.01"
          {...register('openingBalance', { valueAsNumber: true })}
          placeholder={t('bankAccount.openingBalancePlaceholder')}
        />
        {errors.openingBalance && (
          <p className="text-sm text-red-500">{errors.openingBalance.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isDefault"
          checked={isDefault}
          onCheckedChange={(checked) => setValue('isDefault', checked)}
        />
        <Label htmlFor="isDefault">{t('bankAccount.setAsDefault')}</Label>
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </form>
  );
}