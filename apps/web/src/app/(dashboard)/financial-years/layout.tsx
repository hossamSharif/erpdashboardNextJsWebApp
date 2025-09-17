import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'السنوات المالية | ERP Dashboard',
  description: 'إدارة السنوات المالية وفترات المحاسبة',
};

export default function FinancialYearsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {children}
    </div>
  );
}