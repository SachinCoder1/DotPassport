import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: ReactNode;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl md:mt-14 p-6 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
