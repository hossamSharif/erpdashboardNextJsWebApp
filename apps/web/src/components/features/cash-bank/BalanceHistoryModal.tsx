'use client';

import { AccountCategory } from '@packages/shared/src/types/cashBankAccount';
import { api } from '@/lib/trpc/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useTranslation } from 'next-i18next';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface BalanceHistoryModalProps {
  accountId: string;
  accountType: AccountCategory;
  onClose: () => void;
}

export function BalanceHistoryModal({ accountId, accountType, onClose }: BalanceHistoryModalProps) {
  const { t } = useTranslation('common');

  const { data: history, isLoading } = api.cashBank.getBalanceHistory.useQuery({
    accountId,
    accountType,
    limit: 50,
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('balance.historyTitle')}</DialogTitle>
          <DialogDescription>
            {t('balance.historyDescription')}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">{t('common.loading')}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('balance.date')}</TableHead>
                <TableHead>{t('balance.previousBalance')}</TableHead>
                <TableHead>{t('balance.change')}</TableHead>
                <TableHead>{t('balance.newBalance')}</TableHead>
                <TableHead>{t('balance.reason')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    {t('balance.noHistory')}
                  </TableCell>
                </TableRow>
              ) : (
                history?.map((entry) => {
                  const changeAmount = Number(entry.changeAmount);
                  const isPositive = changeAmount >= 0;

                  return (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.createdAt)}</TableCell>
                      <TableCell>{formatCurrency(entry.previousBalance)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {isPositive ? (
                            <ArrowUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-600" />
                          )}
                          <Badge variant={isPositive ? 'default' : 'destructive'}>
                            {formatCurrency(Math.abs(changeAmount))}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(entry.newBalance)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {entry.changeReason}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}