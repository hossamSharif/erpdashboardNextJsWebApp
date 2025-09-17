'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  expenseCategoryCreateSchema,
  expenseCategoryUpdateSchema,
  type ExpenseCategoryCreateInput,
  type ExpenseCategoryUpdateInput
} from '@packages/shared/src/validators/expenseCategory';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'next-i18next';
import { ExpenseCategory } from '@packages/shared/src/types/expenseCategory';

interface ExpenseCategoryFormProps {
  category?: ExpenseCategory;
  parentCategory?: ExpenseCategory;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ExpenseCategoryForm({
  category,
  parentCategory,
  onSuccess,
  onCancel
}: ExpenseCategoryFormProps) {
  const { t } = useTranslation('common');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!category;
  const schema = isEditing ? expenseCategoryUpdateSchema : expenseCategoryCreateSchema;

  type FormInput = typeof isEditing extends true
    ? ExpenseCategoryUpdateInput
    : ExpenseCategoryCreateInput;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: isEditing ? {
      id: category.id,
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      code: category.code,
      parentId: category.parentId,
      isActive: category.isActive,
    } : {
      nameAr: '',
      nameEn: '',
      code: '',
      parentId: parentCategory?.id,
      isSystemCategory: false,
    },
  });

  const parentId = watch('parentId');

  // Get available parent categories
  const { data: categories } = api.expenseCategory.getExpenseCategories.useQuery({
    isActive: true,
  });

  // Filter potential parents (exclude self and descendants for editing)
  const availableParents = categories?.filter(cat => {
    if (cat.level >= 3) return false; // Can't be parent if already at max depth
    if (isEditing && (cat.id === category.id)) return false; // Can't be its own parent
    // TODO: Add logic to exclude descendants when editing
    return true;
  }) || [];

  const createCategoryMutation = api.expenseCategory.createExpenseCategory.useMutation({
    onSuccess: () => {
      toast({
        title: t('expenseCategory.created'),
        description: t('expenseCategory.createdDescription'),
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

  const updateCategoryMutation = api.expenseCategory.updateExpenseCategory.useMutation({
    onSuccess: () => {
      toast({
        title: t('expenseCategory.updated'),
        description: t('expenseCategory.updatedDescription'),
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

  const onSubmit = async (data: FormInput) => {
    setIsSubmitting(true);

    if (isEditing) {
      await updateCategoryMutation.mutateAsync(data as ExpenseCategoryUpdateInput);
    } else {
      await createCategoryMutation.mutateAsync(data as ExpenseCategoryCreateInput);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nameAr">{t('expenseCategory.nameAr')}</Label>
          <Input
            id="nameAr"
            {...register('nameAr')}
            placeholder={t('expenseCategory.nameArPlaceholder')}
            className="text-right"
            dir="rtl"
          />
          {errors.nameAr && (
            <p className="text-sm text-red-500">{errors.nameAr.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nameEn">{t('expenseCategory.nameEn')}</Label>
          <Input
            id="nameEn"
            {...register('nameEn')}
            placeholder={t('expenseCategory.nameEnPlaceholder')}
          />
          {errors.nameEn && (
            <p className="text-sm text-red-500">{errors.nameEn.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">{t('expenseCategory.code')}</Label>
        <Input
          id="code"
          {...register('code')}
          placeholder={t('expenseCategory.codePlaceholder')}
          className="uppercase"
          style={{ textTransform: 'uppercase' }}
        />
        {errors.code && (
          <p className="text-sm text-red-500">{errors.code.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentId">{t('expenseCategory.parentCategory')}</Label>
        <Select
          value={parentId || ''}
          onValueChange={(value) => setValue('parentId', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('expenseCategory.selectParent')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('expenseCategory.noParent')}</SelectItem>
            {availableParents.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {'  '.repeat(cat.level - 1) + `${cat.code} - ${cat.nameEn}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.parentId && (
          <p className="text-sm text-red-500">{errors.parentId.message}</p>
        )}
      </div>

      {isEditing && (
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={watch('isActive')}
            onCheckedChange={(checked) => setValue('isActive', checked)}
            disabled={category?.isSystemCategory}
          />
          <Label htmlFor="isActive">
            {t('expenseCategory.isActive')}
            {category?.isSystemCategory && (
              <span className="text-sm text-muted-foreground ml-2">
                ({t('expenseCategory.systemCategoryNote')})
              </span>
            )}
          </Label>
        </div>
      )}

      {!isEditing && (
        <div className="flex items-center space-x-2">
          <Switch
            id="isSystemCategory"
            checked={watch('isSystemCategory')}
            onCheckedChange={(checked) => setValue('isSystemCategory', checked)}
          />
          <Label htmlFor="isSystemCategory">{t('expenseCategory.isSystemCategory')}</Label>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t('common.saving')
            : isEditing
              ? t('common.update')
              : t('common.create')
          }
        </Button>
      </div>
    </form>
  );
}