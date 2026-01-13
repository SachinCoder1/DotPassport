import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'rectangle' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  ...props
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  const variants = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    rectangle: 'rounded-lg',
    card: 'h-32 rounded-xl',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'circle' ? '40px' : '100%'),
    height: height || (variant === 'circle' ? '40px' : undefined),
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

  if (count === 1) {
    return <div className={combinedClassName} style={style} {...props} />;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={combinedClassName}
          style={style}
          {...props}
        />
      ))}
    </div>
  );
}
