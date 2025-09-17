'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { CashAccountForm } from './CashAccountForm';
import { BankAccountForm } from './BankAccountForm';
import { AccountList } from './AccountList';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function CashBankManagement() {
  const { t } = useTranslation('common');
  const [showCashForm, setShowCashForm] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAccountCreated = () => {
    setShowCashForm(false);
    setShowBankForm(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t('cashBank.title')}</h2>
          <p className="text-muted-foreground">{t('cashBank.description')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCashForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('cashAccount.add')}
          </Button>
          <Button onClick={() => setShowBankForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('bankAccount.add')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">{t('cashBank.accountsTab')}</TabsTrigger>
          <TabsTrigger value="overview">{t('cashBank.overviewTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <AccountList key={refreshKey} />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <OverviewSection />
        </TabsContent>
      </Tabs>

      <Dialog open={showCashForm} onOpenChange={setShowCashForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('cashAccount.addTitle')}</DialogTitle>
            <DialogDescription>
              {t('cashAccount.addDescription')}
            </DialogDescription>
          </DialogHeader>
          <CashAccountForm
            onSuccess={handleAccountCreated}
            onCancel={() => setShowCashForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showBankForm} onOpenChange={setShowBankForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('bankAccount.addTitle')}</DialogTitle>
            <DialogDescription>
              {t('bankAccount.addDescription')}
            </DialogDescription>
          </DialogHeader>
          <BankAccountForm
            onSuccess={handleAccountCreated}
            onCancel={() => setShowBankForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OverviewSection() {
  const { t } = useTranslation('common');
  const { data: cashAccounts } = api.cashBank.getCashAccounts.useQuery();
  const { data: bankAccounts } = api.cashBank.getBankAccounts.useQuery();

  const totalCashBalance = cashAccounts?.reduce((sum, acc) => sum + Number(acc.currentBalance), 0) || 0;
  const totalBankBalance = bankAccounts?.reduce((sum, acc) => sum + Number(acc.currentBalance), 0) || 0;
  const totalBalance = totalCashBalance + totalBankBalance;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('cashBank.totalCash')}</CardTitle>
          <CardDescription>{t('cashBank.allCashAccounts')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalCashBalance)}</div>
          <p className="text-sm text-muted-foreground">
            {cashAccounts?.length || 0} {t('cashBank.accounts')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('cashBank.totalBank')}</CardTitle>
          <CardDescription>{t('cashBank.allBankAccounts')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBankBalance)}</div>
          <p className="text-sm text-muted-foreground">
            {bankAccounts?.length || 0} {t('cashBank.accounts')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('cashBank.totalBalance')}</CardTitle>
          <CardDescription>{t('cashBank.combinedBalance')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
          <p className="text-sm text-muted-foreground">
            {(cashAccounts?.length || 0) + (bankAccounts?.length || 0)} {t('cashBank.totalAccounts')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function formatCurrency(amount: string | number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount));
}