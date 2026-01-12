import { useState, useRef, useEffect } from 'react';
import type { ReactNode, HTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: 'instant' | 'short' | 'long';
  disabled?: boolean;
  showArrow?: boolean;
  children: ReactNode;
}

export function Tooltip({
  content,
  position = 'top',
  delay = 'short',
  disabled = false,
  showArrow = true,
  className = '',
  children,
  ...props
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const delays = {
    instant: 0,
    short: 300,
    long: 700,
  };

  const delayMs = delays[delay];

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8;
    const arrowSize = showArrow ? 6 : 0;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - gap - arrowSize;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + gap + arrowSize;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - gap - arrowSize;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + gap + arrowSize;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
    }

    const padding = 8;
    x = Math.max(padding, Math.min(x, window.innerWidth - tooltipRect.width - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - tooltipRect.height - padding));

    setCoords({ x, y });
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsVisible(true);
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const arrowPositions = {
    top: 'bottom-[-6px] left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700',
    bottom: 'top-[-6px] left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700',
    left: 'right-[-6px] top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700',
    right: 'left-[-6px] top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700',
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="inline-block"
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && !disabled && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`fixed z-50 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg max-w-xs pointer-events-none ${className}`}
            style={{
              left: `${coords.x}px`,
              top: `${coords.y}px`,
            }}
            role="tooltip"
            {...props}
          >
            {content}
            {showArrow && (
              <div
                className={`absolute w-0 h-0 border-[6px] border-transparent ${arrowPositions[position]}`}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
