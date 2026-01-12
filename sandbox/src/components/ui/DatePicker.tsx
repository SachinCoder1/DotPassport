import { useState, useRef, useEffect, useMemo } from 'react';
import type { HTMLAttributes } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isBefore,
  isAfter,
} from 'date-fns';
import { Button } from './Button';

export interface DatePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  presets?: Array<{ label: string; date: Date }>;
  error?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date...',
  disabled = false,
  clearable = true,
  minDate,
  maxDate,
  dateFormat = 'MMM d, yyyy',
  presets,
  error,
  className = '',
  ...props
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultPresets = useMemo(() => {
    const now = Date.now();
    return [
      { label: 'Today', date: new Date() },
      { label: 'Yesterday', date: new Date(now - 86400000) },
      { label: '7 days ago', date: new Date(now - 7 * 86400000) },
      { label: '30 days ago', date: new Date(now - 30 * 86400000) },
    ];
  }, []);

  const presetsToUse = presets || defaultPresets;

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const isDateDisabled = (date: Date) => {
    if (minDate && isBefore(date, minDate)) return true;
    if (maxDate && isAfter(date, maxDate)) return true;
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    onChange?.(date);
    setIsOpen(false);
  };

  const handlePresetClick = (date: Date) => {
    onChange?.(date);
    setViewDate(date);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const isInCurrentMonth = (date: Date) => {
    return date.getMonth() === viewDate.getMonth();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`} {...props}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 rounded-lg text-left text-sm flex items-center justify-between gap-2 transition-all ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
        } ${isOpen ? 'border-purple-500 ring-2 ring-purple-500/20' : ''}`}
      >
        <div className="flex items-center gap-2 flex-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
            {value ? format(value, dateFormat) : placeholder}
          </span>
        </div>
        {clearable && value && !disabled && (
          <X
            className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={handleClear}
          />
        )}
      </button>

      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4"
          >
            <div className="flex gap-4">
              {presetsToUse.length > 0 && (
                <div className="border-r border-gray-200 dark:border-gray-700 pr-4">
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Quick Select
                  </div>
                  <div className="space-y-1">
                    {presetsToUse.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePresetClick(preset.date)}
                        className="w-full px-3 py-1.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors whitespace-nowrap"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="min-w-[280px]">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewDate(subMonths(viewDate, 1))}
                    icon={<ChevronLeft className="w-4 h-4" />}
                    aria-label="Previous month"
                  />
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {format(viewDate, 'MMMM yyyy')}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewDate(addMonths(viewDate, 1))}
                    icon={<ChevronRight className="w-4 h-4" />}
                    aria-label="Next month"
                  />
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const isSelected = value && isSameDay(day, value);
                    const isTodayDate = isToday(day);
                    const inCurrentMonth = isInCurrentMonth(day);
                    const dateDisabled = isDateDisabled(day);

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDateClick(day)}
                        disabled={dateDisabled}
                        className={`w-9 h-9 flex items-center justify-center text-sm rounded-md transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white font-semibold'
                            : isTodayDate
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium'
                            : inCurrentMonth
                            ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                            : 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                        } ${
                          dateDisabled
                            ? 'opacity-30 cursor-not-allowed hover:bg-transparent'
                            : 'cursor-pointer'
                        }`}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
