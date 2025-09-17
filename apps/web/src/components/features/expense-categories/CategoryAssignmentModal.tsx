'use client';

import { useState, useEffect } from 'react';
import { Link, Unlink, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'next-i18next';
import { api } from '@/lib/trpc/client';
import { toast } from '@/hooks/use-toast';
import { ExpenseCategory } from '@packages/shared/src/types/expenseCategory';

interface CategoryAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: ExpenseCategory;
  onSuccess?: () => void;
}

interface Account {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
}

export function CategoryAssignmentModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryAssignmentModalProps) {
  const { t } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Get expense accounts that are not assigned to this category
  const { data: unassignedAccounts, isLoading: isLoadingUnassigned } =
    api.expenseCategory.getUnassignedExpenseAccounts?.useQuery(
      undefined,
      { enabled: isOpen }
    ) || { data: [], isLoading: false };

  // Get current assignments for this category
  const { data: assignments, isLoading: isLoadingAssignments, refetch: refetchAssignments } =
    api.expenseCategory.getCategoryAssignments?.useQuery(
      { categoryId: category?.id || '', shopId: '' },
      { enabled: isOpen && !!category }
    ) || { data: [], isLoading: false };

  const assignMutation = api.expenseCategory.assignCategoryToAccount.useMutation({
    onSuccess: () => {
      toast({
        title: t('expenseCategory.assignmentSuccess'),
        description: t('expenseCategory.assignmentSuccessDescription'),
      });
      refetchAssignments();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: t('error.title'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const removeMutation = api.expenseCategory.removeCategoryAssignment.useMutation({
    onSuccess: () => {
      toast({
        title: t('expenseCategory.assignmentRemoved'),
        description: t('expenseCategory.assignmentRemovedDescription'),
      });
      refetchAssignments();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: t('error.title'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedAccounts([]);
      setSelectedAssignments([]);
    }
  }, [isOpen]);

  const handleAssignAccounts = async () => {
    if (!category || selectedAccounts.length === 0) return;

    setIsAssigning(true);
    try {
      for (const accountId of selectedAccounts) {
        await assignMutation.mutateAsync({
          categoryId: category.id,
          accountId,
          shopId: '', // Will be set by API from session
        });
      }
      setSelectedAccounts([]);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveAssignments = async () => {
    if (!category || selectedAssignments.length === 0) return;

    setIsAssigning(true);
    try {
      for (const assignmentId of selectedAssignments) {
        const assignment = assignments?.find(a => a.id === assignmentId);
        if (assignment) {
          await removeMutation.mutateAsync({
            categoryId: category.id,
            accountId: assignment.account?.id || '',
          });
        }
      }
      setSelectedAssignments([]);
    } finally {
      setIsAssigning(false);
    }
  };

  // Filter accounts based on search
  const filteredUnassignedAccounts = (unassignedAccounts || []).filter((account: Account) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      account.code.toLowerCase().includes(query) ||
      account.nameEn.toLowerCase().includes(query) ||
      account.nameAr.includes(query)
    );
  });

  const filteredAssignments = (assignments || []).filter((assignment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const account = assignment.account;
    return (
      account?.code.toLowerCase().includes(query) ||
      account?.nameEn.toLowerCase().includes(query) ||
      account?.nameAr.includes(query)
    );
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('expenseCategory.manageAssignments')}</DialogTitle>
          <DialogDescription>
            {category && (
              <>
                {t('expenseCategory.manageAssignmentsDescription')}
                <span className="font-medium text-gray-900">
                  {category.nameEn} ({category.code})
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('expenseCategory.searchAccounts')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs defaultValue="assign" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assign" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                {t('expenseCategory.assignAccounts')}
              </TabsTrigger>
              <TabsTrigger value="current" className="flex items-center gap-2">
                <Unlink className="h-4 w-4" />
                {t('expenseCategory.currentAssignments')}
              </TabsTrigger>
            </TabsList>

            {/* Assign Accounts Tab */}
            <TabsContent value="assign" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {t('expenseCategory.availableAccounts')}: {filteredUnassignedAccounts.length}
                </p>
                <Button
                  onClick={handleAssignAccounts}
                  disabled={selectedAccounts.length === 0 || isAssigning}
                  size="sm"
                >
                  {t('expenseCategory.assignSelected')} ({selectedAccounts.length})
                </Button>
              </div>

              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedAccounts.length === filteredUnassignedAccounts.length && filteredUnassignedAccounts.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAccounts(filteredUnassignedAccounts.map(a => a.id));
                            } else {
                              setSelectedAccounts([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="w-24">{t('account.code')}</TableHead>
                      <TableHead>{t('account.nameEn')}</TableHead>
                      <TableHead className="text-right">{t('account.nameAr')}</TableHead>
                      <TableHead className="w-24">{t('common.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingUnassigned ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          {t('common.loading')}
                        </TableCell>
                      </TableRow>
                    ) : filteredUnassignedAccounts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          {t('expenseCategory.noAvailableAccounts')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUnassignedAccounts.map((account: Account) => (
                        <TableRow key={account.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedAccounts.includes(account.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAccounts(prev => [...prev, account.id]);
                                } else {
                                  setSelectedAccounts(prev => prev.filter(id => id !== account.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">{account.code}</span>
                          </TableCell>
                          <TableCell>{account.nameEn}</TableCell>
                          <TableCell className="text-right" dir="rtl">
                            {account.nameAr}
                          </TableCell>
                          <TableCell>
                            <Badge variant={account.isActive ? 'default' : 'destructive'} className="text-xs">
                              {account.isActive ? t('common.active') : t('common.inactive')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Current Assignments Tab */}
            <TabsContent value="current" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {t('expenseCategory.currentAssignments')}: {filteredAssignments.length}
                </p>
                <Button
                  onClick={handleRemoveAssignments}
                  disabled={selectedAssignments.length === 0 || isAssigning}
                  variant="destructive"
                  size="sm"
                >
                  {t('expenseCategory.removeSelected')} ({selectedAssignments.length})
                </Button>
              </div>

              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedAssignments.length === filteredAssignments.length && filteredAssignments.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAssignments(filteredAssignments.map(a => a.id));
                            } else {
                              setSelectedAssignments([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="w-24">{t('account.code')}</TableHead>
                      <TableHead>{t('account.nameEn')}</TableHead>
                      <TableHead className="text-right">{t('account.nameAr')}</TableHead>
                      <TableHead className="w-32">{t('expenseCategory.assignedDate')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingAssignments ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          {t('common.loading')}
                        </TableCell>
                      </TableRow>
                    ) : filteredAssignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          {t('expenseCategory.noAssignments')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedAssignments.includes(assignment.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAssignments(prev => [...prev, assignment.id]);
                                } else {
                                  setSelectedAssignments(prev => prev.filter(id => id !== assignment.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">{assignment.account?.code}</span>
                          </TableCell>
                          <TableCell>{assignment.account?.nameEn}</TableCell>
                          <TableCell className="text-right" dir="rtl">
                            {assignment.account?.nameAr}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {new Date(assignment.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}