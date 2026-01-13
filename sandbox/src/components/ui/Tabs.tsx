import { useState, createContext, useContext, useEffect } from 'react';
import type { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
  variant: 'line' | 'pills' | 'enclosed';
  syncWithUrl: boolean;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within Tabs');
  }
  return context;
};

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  variant?: 'line' | 'pills' | 'enclosed';
  syncWithUrl?: boolean;
  urlParam?: string;
}

export function Tabs({
  defaultValue,
  value,
  onChange,
  variant = 'line',
  syncWithUrl = false,
  urlParam = 'tab',
  className = '',
  children,
  ...props
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue || '');
  const isControlled = value !== undefined;
  const activeTab = isControlled ? value : internalActiveTab;

  useEffect(() => {
    if (syncWithUrl && !isControlled) {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get(urlParam);
      if (urlTab) {
        setInternalActiveTab(urlTab);
      }
    }
  }, [syncWithUrl, urlParam, isControlled]);

  const handleTabChange = (newValue: string) => {
    if (!isControlled) {
      setInternalActiveTab(newValue);
    }
    onChange?.(newValue);

    if (syncWithUrl) {
      const params = new URLSearchParams(window.location.search);
      params.set(urlParam, newValue);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, '', newUrl);
    }
  };

  return (
    <TabsContext.Provider
      value={{ activeTab, setActiveTab: handleTabChange, variant, syncWithUrl }}
    >
      <div className={`${className}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export type TabsListProps = HTMLAttributes<HTMLDivElement>;

export function TabsList({ className = '', children, ...props }: TabsListProps) {
  const { variant } = useTabsContext();

  const variants = {
    line: 'border-b border-gray-200 dark:border-gray-700',
    pills: 'bg-gray-100 dark:bg-gray-800 rounded-lg p-1',
    enclosed: 'border-b border-gray-200 dark:border-gray-700',
  };

  return (
    <div
      className={`flex items-center gap-1 ${variants[variant]} ${className}`}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> {
  value: string;
  disabled?: boolean;
}

export function TabsTrigger({
  value,
  disabled = false,
  className = '',
  children,
  ...props
}: TabsTriggerProps) {
  const { activeTab, setActiveTab, variant } = useTabsContext();
  const isActive = activeTab === value;

  const handleClick = () => {
    if (!disabled) {
      setActiveTab(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const baseStyles =
    'relative px-4 py-2 font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2';

  const variantStyles = {
    line: {
      base: 'border-b-2 -mb-[2px]',
      active: 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400',
      inactive:
        'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600',
    },
    pills: {
      base: 'rounded-md',
      active: 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm',
      inactive: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
    },
    enclosed: {
      base: 'border border-b-0 rounded-t-lg -mb-[1px]',
      active:
        'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400',
      inactive:
        'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
    },
  };

  const styles = variantStyles[variant];
  const combinedClassName = `${baseStyles} ${styles.base} ${
    isActive ? styles.active : styles.inactive
  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={combinedClassName}
      {...props}
    >
      {children}
      {variant === 'line' && isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  );
}

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  lazy?: boolean;
}

export function TabsContent({
  value,
  lazy = false,
  className = '',
  children,
  ...props
}: TabsContentProps) {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;
  const [hasBeenActive, setHasBeenActive] = useState(!lazy);

  if (isActive && !hasBeenActive) {
    setHasBeenActive(true);
  }

  if (!isActive && lazy && !hasBeenActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      aria-hidden={!isActive}
      className={`${isActive ? 'block' : 'hidden'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
