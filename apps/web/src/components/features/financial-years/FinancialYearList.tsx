'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  CalendarDays,
  Check,
  DollarSign,
  Edit,
  Lock,
  MoreHorizontal,
  Star,
  Trash2,
  Unlock,
  Users
} from 'lucide-react';
import type { FinancialYearWithCounts } from '@erpdesk/shared';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FinancialYearListProps {
  financialYears: FinancialYearWithCounts[];
  onEdit: (financialYear: FinancialYearWithCounts) => void;
  onSetCurrent: (id: string) => Promise<void>;
  onClose: (id: string, closingStockValue: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onManageStockValues?: (financialYear: FinancialYearWithCounts) => void;
  isLoading?: boolean;
  userRole: 'ADMIN' | 'USER';
}

export function FinancialYearList({
  financialYears,
  onEdit,
  onSetCurrent,
  onClose,
  onDelete,
  onManageStockValues,
  isLoading = false,
  userRole
}: FinancialYearListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<FinancialYearWithCounts | null>(null);

  const handleDeleteClick = (financialYear: FinancialYearWithCounts) => {
    setSelectedYear(financialYear);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedYear) {
      await onDelete(selectedYear.id);
      setDeleteDialogOpen(false);
      setSelectedYear(null);
    }
  };

  const getStatusBadge = (financialYear: FinancialYearWithCounts) => {
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
        <Unlock className="mr-1 h-3 w-3" />
        مفتوحة
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SD', {
      style: 'currency',
      currency: 'SDG',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (financialYears.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد سنوات مالية</h3>
          <p className="text-muted-foreground text-center mb-4">
            لم يتم إنشاء أي سنوات مالية بعد. ابدأ بإنشاء سنة مالية جديدة.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {financialYears.map((financialYear) => (
        <Card key={financialYear.id} className="transition-colors hover:bg-muted/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-lg">{financialYear.name}</CardTitle>
                  <CardDescription>
                    {format(new Date(financialYear.startDate), 'dd MMMM yyyy', { locale: ar })} - {' '}
                    {format(new Date(financialYear.endDate), 'dd MMMM yyyy', { locale: ar })}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(financialYear)}
                {userRole === 'ADMIN' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!financialYear.isClosed && (
                        <>
                          <DropdownMenuItem onClick={() => onEdit(financialYear)}>
                            <Edit className="mr-2 h-4 w-4" />
                            تعديل
                          </DropdownMenuItem>
                          {onManageStockValues && (
                            <DropdownMenuItem onClick={() => onManageStockValues(financialYear)}>
                              <DollarSign className="mr-2 h-4 w-4" />
                              إدارة قيم المخزون
                            </DropdownMenuItem>
                          )}
                          {!financialYear.isCurrent && (
                            <DropdownMenuItem onClick={() => onSetCurrent(financialYear.id)}>
                              <Star className="mr-2 h-4 w-4" />
                              تعيين كسنة حالية
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                      {!financialYear.isCurrent && !financialYear.isClosed && financialYear._count.transactions === 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(financialYear)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            حذف
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Opening Stock Value */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">المخزون الافتتاحي</div>
                  <div className="font-semibold">
                    {formatCurrency(financialYear.openingStockValue)}
                  </div>
                </div>
              </div>

              {/* Closing Stock Value */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">المخزون الختامي</div>
                  <div className="font-semibold">
                    {financialYear.closingStockValue !== null
                      ? formatCurrency(financialYear.closingStockValue)
                      : 'غير محدد'
                    }
                  </div>
                </div>
              </div>

              {/* Transaction Count */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">عدد المعاملات</div>
                  <div className="font-semibold flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {financialYear._count.transactions}
                  </div>
                </div>
              </div>
            </div>

            {/* Year End Warning */}
            {financialYear.isCurrent && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-yellow-800">
                  <CalendarDays className="h-4 w-4" />
                  هذه هي السنة المالية الحالية
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف السنة المالية</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف السنة المالية "{selectedYear?.name}"؟
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}