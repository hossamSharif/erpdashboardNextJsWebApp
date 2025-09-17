'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'next-i18next';
import { AccountCategory } from '@packages/shared/src/types/cashBankAccount';
import { formatCurrency } from '@/lib/utils';
import { Trash2, Edit, Star, History } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BalanceAdjustmentForm } from './BalanceAdjustmentForm';
import { BalanceHistoryModal } from './BalanceHistoryModal';

export function AccountList() {
  const { t } = useTranslation('common');
  const [selectedAccount, setSelectedAccount] = useState<{ id: string; type: AccountCategory } | null>(null);
  const [showBalanceForm, setShowBalanceForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { data: cashAccounts, refetch: refetchCash } = api.cashBank.getCashAccounts.useQuery();
  const { data: bankAccounts, refetch: refetchBank } = api.cashBank.getBankAccounts.useQuery();

  const deleteCashMutation = api.cashBank.deleteCashAccount.useMutation({
    onSuccess: () => {
      toast({ title: t('cashAccount.deleted') });
      refetchCash();
    },
  });

  const deleteBankMutation = api.cashBank.deleteBankAccount.useMutation({
    onSuccess: () => {
      toast({ title: t('bankAccount.deleted') });
      refetchBank();
    },
  });

  const setDefaultMutation = api.cashBank.setDefaultPaymentAccount.useMutation({
    onSuccess: () => {
      toast({ title: t('account.defaultSet') });
      refetchCash();
      refetchBank();
    },
  });

  const handleDelete = async (id: string, type: AccountCategory) => {
    if (confirm(t('account.confirmDelete'))) {
      if (type === AccountCategory.CASH) {
        await deleteCashMutation.mutateAsync({ id });
      } else {
        await deleteBankMutation.mutateAsync({ id });
      }
    }
  };

  const handleSetDefault = async (id: string, type: AccountCategory) => {
    await setDefaultMutation.mutateAsync({ accountId: id, accountType: type });
  };

  const handleAdjustBalance = (id: string, type: AccountCategory) => {
    setSelectedAccount({ id, type });
    setShowBalanceForm(true);
  };

  const handleShowHistory = (id: string, type: AccountCategory) => {
    setSelectedAccount({ id, type });
    setShowHistory(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('cashAccount.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cashAccounts?.map((account) => (
              <Card key={account.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{account.nameEn}</span>
                    {account.isDefault && (
                      <Badge variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        {t('account.default')}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{account.nameAr}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('account.currentBalance')}</span>
                      <span className="font-medium">{formatCurrency(account.currentBalance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('account.openingBalance')}</span>
                      <span className="text-sm">{formatCurrency(account.openingBalance)}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAdjustBalance(account.id, AccountCategory.CASH)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShowHistory(account.id, AccountCategory.CASH)}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      {!account.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefault(account.id, AccountCategory.CASH)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(account.id, AccountCategory.CASH)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">{t('bankAccount.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccounts?.map((account) => (
              <Card key={account.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{account.nameEn}</span>
                    {account.isDefault && (
                      <Badge variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        {t('account.default')}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{account.nameAr}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('bankAccount.accountNumber')}</span>
                      <span className="text-sm font-mono">{account.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('bankAccount.bankName')}</span>
                      <span className="text-sm">{account.bankName}</span>
                    </div>
                    {account.iban && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t('bankAccount.iban')}</span>
                        <span className="text-sm font-mono">{account.iban}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('account.currentBalance')}</span>
                      <span className="font-medium">{formatCurrency(account.currentBalance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('account.openingBalance')}</span>
                      <span className="text-sm">{formatCurrency(account.openingBalance)}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAdjustBalance(account.id, AccountCategory.BANK)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShowHistory(account.id, AccountCategory.BANK)}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      {!account.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefault(account.id, AccountCategory.BANK)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(account.id, AccountCategory.BANK)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {showBalanceForm && selectedAccount && (
        <BalanceAdjustmentForm
          accountId={selectedAccount.id}
          accountType={selectedAccount.type}
          onClose={() => {
            setShowBalanceForm(false);
            setSelectedAccount(null);
            refetchCash();
            refetchBank();
          }}
        />
      )}

      {showHistory && selectedAccount && (
        <BalanceHistoryModal
          accountId={selectedAccount.id}
          accountType={selectedAccount.type}
          onClose={() => {
            setShowHistory(false);
            setSelectedAccount(null);
          }}
        />
      )}
    </>
  );
}