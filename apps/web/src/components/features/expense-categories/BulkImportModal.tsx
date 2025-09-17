'use client';

import { useState } from 'react';
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { useTranslation } from 'next-i18next';
import { api } from '@/lib/trpc/client';
import { toast } from '@/hooks/use-toast';
import { DefaultCategoryTemplate } from '@packages/shared/src/types/expenseCategory';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const { t } = useTranslation('common');
  const [importData, setImportData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const bulkImportMutation = api.expenseCategory.bulkImportCategories.useMutation({
    onSuccess: (result) => {
      setImportResult(result);
      if (result.success) {
        toast({
          title: t('expenseCategory.importSuccess'),
          description: t('expenseCategory.importSuccessDescription', {
            count: result.createdCount,
          }),
        });
        onSuccess?.();
      }
    },
    onError: (error) => {
      toast({
        title: t('error.title'),
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsImporting(false);
    },
  });

  const createDefaultCategoriesMutation = api.expenseCategory.bulkImportCategories.useMutation({
    onSuccess: (result) => {
      setImportResult(result);
      toast({
        title: t('expenseCategory.defaultCategoriesCreated'),
        description: t('expenseCategory.defaultCategoriesDescription', {
          count: result.createdCount,
        }),
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
      setIsImporting(false);
    },
  });

  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: t('error.title'),
        description: t('expenseCategory.importDataRequired'),
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      // Parse the JSON data
      const categories = JSON.parse(importData);

      // Validate the structure
      if (!Array.isArray(categories)) {
        throw new Error('Data must be an array of categories');
      }

      await bulkImportMutation.mutateAsync({
        categories,
        shopId: '', // This will be set by the API from session
      });
    } catch (error) {
      setIsImporting(false);
      toast({
        title: t('error.title'),
        description: error instanceof Error ? error.message : t('expenseCategory.invalidImportData'),
        variant: 'destructive',
      });
    }
  };

  const handleCreateDefaults = async () => {
    setIsImporting(true);
    setImportResult(null);

    const defaultCategories: DefaultCategoryTemplate[] = [
      {
        nameAr: 'المرتبات والأجور',
        nameEn: 'Salaries and Wages',
        code: 'SALARIES',
        level: 1,
        isSystemCategory: true,
      },
      {
        nameAr: 'المرافق العامة',
        nameEn: 'Utilities',
        code: 'UTILITIES',
        level: 1,
        isSystemCategory: true,
      },
      {
        nameAr: 'الكهرباء',
        nameEn: 'Electricity',
        code: 'UTILITIES_ELECTRIC',
        parentCode: 'UTILITIES',
        level: 2,
        isSystemCategory: true,
      },
      {
        nameAr: 'المياه',
        nameEn: 'Water',
        code: 'UTILITIES_WATER',
        parentCode: 'UTILITIES',
        level: 2,
        isSystemCategory: true,
      },
      {
        nameAr: 'اللوازم المكتبية',
        nameEn: 'Office Supplies',
        code: 'SUPPLIES',
        level: 1,
        isSystemCategory: true,
      },
      {
        nameAr: 'النقل والمواصلات',
        nameEn: 'Transportation',
        code: 'TRANSPORT',
        level: 1,
        isSystemCategory: true,
      },
      {
        nameAr: 'الوقود',
        nameEn: 'Fuel',
        code: 'TRANSPORT_FUEL',
        parentCode: 'TRANSPORT',
        level: 2,
        isSystemCategory: true,
      },
      {
        nameAr: 'صيانة المركبات',
        nameEn: 'Vehicle Maintenance',
        code: 'TRANSPORT_MAINTENANCE',
        parentCode: 'TRANSPORT',
        level: 2,
        isSystemCategory: true,
      },
      {
        nameAr: 'أخرى',
        nameEn: 'Other',
        code: 'OTHER',
        level: 1,
        isSystemCategory: true,
      },
    ];

    await createDefaultCategoriesMutation.mutateAsync({
      categories: defaultCategories,
      shopId: '', // This will be set by the API from session
    });
  };

  const downloadTemplate = () => {
    const template = [
      {
        nameAr: 'اسم التصنيف بالعربية',
        nameEn: 'Category Name in English',
        code: 'CATEGORY_CODE',
        parentCode: 'PARENT_CODE', // optional
        level: 1,
      },
      {
        nameAr: 'تصنيف فرعي',
        nameEn: 'Subcategory',
        code: 'SUB_CATEGORY',
        parentCode: 'CATEGORY_CODE',
        level: 2,
      },
    ];

    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'expense-categories-template.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleClose = () => {
    setImportData('');
    setImportResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('expenseCategory.bulkImport')}</DialogTitle>
          <DialogDescription>
            {t('expenseCategory.bulkImportDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {t('expenseCategory.downloadTemplate')}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateDefaults}
              disabled={isImporting}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {t('expenseCategory.createDefaults')}
            </Button>
          </div>

          {/* Import Data Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('expenseCategory.importData')}
            </label>
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder={t('expenseCategory.importDataPlaceholder')}
              className="h-48 font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              {t('expenseCategory.importDataNote')}
            </p>
          </div>

          {/* Import Result */}
          {importResult && (
            <div className="space-y-4">
              <Alert className={importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-center gap-2">
                  {importResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertTitle>
                    {importResult.success ? t('expenseCategory.importSuccessful') : t('expenseCategory.importFailed')}
                  </AlertTitle>
                </div>
                <AlertDescription className="mt-2">
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600">
                      {t('expenseCategory.created')}: {importResult.createdCount}
                    </span>
                    <span className="text-yellow-600">
                      {t('expenseCategory.skipped')}: {importResult.skippedCount}
                    </span>
                    <span className="text-red-600">
                      {t('expenseCategory.errors')}: {importResult.errorCount}
                    </span>
                  </div>
                </AlertDescription>
              </Alert>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-600">
                    {t('expenseCategory.importErrors')}:
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {importResult.errors.map((error: any, index: number) => (
                      <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Format Example */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('expenseCategory.formatExample')}:</h4>
            <div className="bg-gray-50 p-3 rounded border">
              <pre className="text-xs text-gray-700 overflow-x-auto">
{`[
  {
    "nameAr": "المرتبات والأجور",
    "nameEn": "Salaries and Wages",
    "code": "SALARIES",
    "level": 1
  },
  {
    "nameAr": "المرتبات الأساسية",
    "nameEn": "Base Salaries",
    "code": "SALARIES_BASE",
    "parentCode": "SALARIES",
    "level": 2
  }
]`}
              </pre>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleImport}
            disabled={isImporting || !importData.trim()}
          >
            {isImporting ? t('common.importing') : t('expenseCategory.import')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}