'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCashAccountSchema, type CreateCashAccountInput } from '@packages/shared/src/validators/cashBankAccount';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'next-i18next';

interface CashAccountFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CashAccountForm({ onSuccess, onCancel }: CashAccountFormProps) {
  const { t } = useTranslation('common');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateCashAccountInput>({
    resolver: zodResolver(createCashAccountSchema),
    defaultValues: {
      openingBalance: 0,
      isDefault: false,
    },
  });

  const isDefault = watch('isDefault');

  const createCashAccountMutation = api.cashBank.createCashAccount.useMutation({
    onSuccess: () => {
      toast({
        title: t('cashAccount.created'),
        description: t('cashAccount.createdDescription'),
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

  const onSubmit = async (data: CreateCashAccountInput) => {
    setIsSubmitting(true);
    await createCashAccountMutation.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nameAr">{t('cashAccount.nameAr')}</Label>
          <Input
            id="nameAr"
            {...register('nameAr')}
            placeholder={t('cashAccount.nameArPlaceholder')}
            className="text-right"
            dir="rtl"
          />
          {errors.nameAr && (
            <p className="text-sm text-red-500">{errors.nameAr.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nameEn">{t('cashAccount.nameEn')}</Label>
          <Input
            id="nameEn"
            {...register('nameEn')}
            placeholder={t('cashAccount.nameEnPlaceholder')}
          />
          {errors.nameEn && (
            <p className="text-sm text-red-500">{errors.nameEn.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="openingBalance">{t('cashAccount.openingBalance')}</Label>
        <Input
          id="openingBalance"
          type="number"
          step="0.01"
          {...register('openingBalance', { valueAsNumber: true })}
          placeholder={t('cashAccount.openingBalancePlaceholder')}
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
        <Label htmlFor="isDefault">{t('cashAccount.setAsDefault')}</Label>
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