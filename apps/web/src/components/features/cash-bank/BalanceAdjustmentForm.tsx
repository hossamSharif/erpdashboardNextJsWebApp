'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateAccountBalanceSchema, type UpdateAccountBalanceInput } from '@packages/shared/src/validators/cashBankAccount';
import { AccountCategory } from '@packages/shared/src/types/cashBankAccount';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'next-i18next';

interface BalanceAdjustmentFormProps {
  accountId: string;
  accountType: AccountCategory;
  onClose: () => void;
}

export function BalanceAdjustmentForm({ accountId, accountType, onClose }: BalanceAdjustmentFormProps) {
  const { t } = useTranslation('common');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateAccountBalanceInput>({
    resolver: zodResolver(updateAccountBalanceSchema),
    defaultValues: {
      accountId,
      accountType,
    },
  });

  const updateBalanceMutation = api.cashBank.updateAccountBalance.useMutation({
    onSuccess: () => {
      toast({
        title: t('balance.updated'),
        description: t('balance.updatedDescription'),
      });
      onClose();
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

  const onSubmit = async (data: UpdateAccountBalanceInput) => {
    setIsSubmitting(true);
    await updateBalanceMutation.mutateAsync(data);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('balance.adjustTitle')}</DialogTitle>
          <DialogDescription>
            {t('balance.adjustDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newBalance">{t('balance.newBalance')}</Label>
            <Input
              id="newBalance"
              type="number"
              step="0.01"
              {...register('newBalance', { valueAsNumber: true })}
              placeholder={t('balance.newBalancePlaceholder')}
            />
            {errors.newBalance && (
              <p className="text-sm text-red-500">{errors.newBalance.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="changeReason">{t('balance.changeReason')}</Label>
            <Textarea
              id="changeReason"
              {...register('changeReason')}
              placeholder={t('balance.changeReasonPlaceholder')}
              rows={3}
            />
            {errors.changeReason && (
              <p className="text-sm text-red-500">{errors.changeReason.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.updating') : t('common.update')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}