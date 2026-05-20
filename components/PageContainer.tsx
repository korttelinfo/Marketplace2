import type { ReactNode } from 'react';

type PageContainerProps = {
  children: ReactNode;
  contentClassName?: string;
  className?: string;
};

export default function PageContainer({
  children,
  contentClassName = 'max-w-6xl',
  className = '',
}: PageContainerProps) {
  return (
    <main className={`min-h-screen bg-slate-50 text-slate-900 ${className}`}>
      <div className={`mx-auto px-5 py-8 sm:px-6 lg:px-8 ${contentClassName}`}>
        {children}
      </div>
    </main>
  );
}
