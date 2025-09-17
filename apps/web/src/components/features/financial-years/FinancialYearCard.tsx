'use client';

import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarDays, DollarSign, Lock, Star, TrendingUp, Users } from 'lucide-react';
import type { FinancialYearWithCounts } from '@erpdesk/shared';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface FinancialYearCardProps {
  financialYear: FinancialYearWithCounts;
  onClick?: () => void;
  className?: string;
}

export function FinancialYearCard({
  financialYear,
  onClick,
  className
}: FinancialYearCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SD', {
      style: 'currency',
      currency: 'SDG',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = () => {
    if (financialYear.isCurrent) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          <Star className="mr-1 h-3 w-3" />
          السنة الحالية
        </Badge>
      );
    }
    if (financialYear.isClosed) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          <Lock className="mr-1 h-3 w-3" />
          مُغلقة
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        مفتوحة
      </Badge>
    );
  };

  // Calculate year progress
  const now = new Date();
  const startDate = new Date(financialYear.startDate);
  const endDate = new Date(financialYear.endDate);
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const elapsedDays = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

  const isActive = now >= startDate && now <= endDate;

  return (
    <Card
      className={`transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : ''} ${className || ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{financialYear.name}</CardTitle>
              <CardDescription className="text-sm">
                {format(startDate, 'dd MMMM yyyy', { locale: ar })} - {' '}
                {format(endDate, 'dd MMMM yyyy', { locale: ar })}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar for Active Year */}
        {isActive && !financialYear.isClosed && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">تقدم السنة المالية</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {elapsedDays} من {totalDays} يوم
            </div>
          </div>
        )}

        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">المخزون الافتتاحي</span>
            </div>
            <div className="font-semibold text-sm">
              {formatCurrency(financialYear.openingStockValue)}
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">المخزون الختامي</span>
            </div>
            <div className="font-semibold text-sm">
              {financialYear.closingStockValue !== null
                ? formatCurrency(financialYear.closingStockValue)
                : 'غير محدد'
              }
            </div>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">عدد المعاملات</span>
          </div>
          <div className="font-semibold">
            {financialYear._count.transactions.toLocaleString('ar')}
          </div>
        </div>

        {/* Status Messages */}
        {financialYear.isCurrent && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <Star className="h-4 w-4" />
              هذه هي السنة المالية الحالية
            </div>
          </div>
        )}

        {financialYear.isClosed && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-800">
              <Lock className="h-4 w-4" />
              تم إغلاق هذه السنة المالية
            </div>
          </div>
        )}

        {/* Year End Warning */}
        {isActive && !financialYear.isClosed && progress > 90 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-yellow-800">
              <CalendarDays className="h-4 w-4" />
              تقترب السنة المالية من النهاية
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}