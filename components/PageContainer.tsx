import type { ReactNode } from 'react';
import NavBar from './NavBar';
import BottomNav from './BottomNav';

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
      <NavBar />
      <div className={`mx-auto px-5 py-8 pb-24 sm:pb-8 sm:px-6 lg:px-8 ${contentClassName}`}>
        {children}
      </div>
      <BottomNav />
    </main>
  );
}
