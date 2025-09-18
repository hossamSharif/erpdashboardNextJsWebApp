'use client';

import { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { AlertTriangle, Calendar, Clock, X } from 'lucide-react';
import type { FinancialYear } from '@multi-shop/shared';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface YearEndWarningProps {
  currentFinancialYear: FinancialYear | null;
  onDismiss?: () => void;
  className?: string;
}

export function YearEndWarning({
  currentFinancialYear,
  onDismiss,
  className
}: YearEndWarningProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [currentFinancialYear?.id]);

  if (!currentFinancialYear || dismissed || currentFinancialYear.isClosed) {
    return null;
  }

  const now = new Date();
  const endDate = new Date(currentFinancialYear.endDate);
  const daysRemaining = differenceInDays(endDate, now);

  // Show warning if less than 30 days remaining
  if (daysRemaining > 30) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const getAlertVariant = () => {
    if (daysRemaining <= 0) return 'destructive';
    if (daysRemaining <= 7) return 'destructive';
    if (daysRemaining <= 30) return 'default';
    return 'default';
  };

  const getAlertIcon = () => {
    if (daysRemaining <= 0) return <AlertTriangle className="h-4 w-4" />;
    if (daysRemaining <= 7) return <AlertTriangle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const getAlertTitle = () => {
    if (daysRemaining <= 0) return 'انتهت السنة المالية!';
    if (daysRemaining <= 7) return 'تحذير: السنة المالية تنتهي قريباً';
    return 'تنبيه: اقتراب نهاية السنة المالية';
  };

  const getAlertMessage = () => {
    if (daysRemaining <= 0) {
      const daysOverdue = Math.abs(daysRemaining);
      return `انتهت السنة المالية "${currentFinancialYear.name}" منذ ${daysOverdue} ${daysOverdue === 1 ? 'يوم' : 'أيام'}. يجب إغلاق السنة المالية وإنشاء سنة جديدة.`;
    }
    return `ستنتهي السنة المالية "${currentFinancialYear.name}" خلال ${daysRemaining} ${daysRemaining === 1 ? 'يوم' : 'أيام'}. يُنصح بالتحضير لإغلاق السنة المالية.`;
  };

  return (
    <Card className={`border-yellow-200 bg-yellow-50 ${className || ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getAlertIcon()}
            <CardTitle className="text-sm text-yellow-800">
              {getAlertTitle()}
            </CardTitle>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-yellow-700 mb-3">
          {getAlertMessage()}
        </CardDescription>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-yellow-600" />
            <div>
              <div className="text-yellow-600">تاريخ النهاية</div>
              <div className="font-medium text-yellow-800">
                {format(endDate, 'dd MMMM yyyy', { locale: ar })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-600" />
            <div>
              <div className="text-yellow-600">الأيام المتبقية</div>
              <div className="font-medium text-yellow-800">
                {daysRemaining <= 0 ? 'انتهت' : `${daysRemaining} ${daysRemaining === 1 ? 'يوم' : 'أيام'}`}
              </div>
            </div>
          </div>
        </div>

        {daysRemaining <= 7 && (
          <Alert className="mt-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">إجراء مطلوب</AlertTitle>
            <AlertDescription className="text-red-700">
              يجب إغلاق السنة المالية الحالية وإنشاء سنة مالية جديدة لضمان استمرارية العمليات المالية.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}