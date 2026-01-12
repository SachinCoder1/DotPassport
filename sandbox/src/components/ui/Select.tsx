import { useState, useRef, useEffect } from 'react';
import type { HTMLAttributes } from 'react';
import { ChevronDown, X, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  multiSelect?: boolean;
  loading?: boolean;
  error?: string;
  renderOption?: (option: SelectOption) => React.ReactNode;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  searchable = false,
  clearable = false,
  multiSelect = false,
  loading = false,
  error,
  renderOption,
  className = '',
  ...props
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const filteredOptions = searchQuery
    ? options.filter((option) => {
        const searchText = `${option.label} ${option.description || ''}`.toLowerCase();
        return searchText.includes(searchQuery.toLowerCase());
      })
    : options;

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (multiSelect) {
      return selectedValues.length === 1
        ? options.find((o) => o.value === selectedValues[0])?.label
        : `${selectedValues.length} selected`;
    }
    return options.find((o) => o.value === selectedValues[0])?.label || placeholder;
  };

  const handleOptionClick = (option: SelectOption) => {
    if (option.disabled) return;

    if (multiSelect) {
      const newValues = selectedValues.includes(option.value)
        ? selectedValues.filter((v) => v !== option.value)
        : [...selectedValues, option.value];
      onChange?.(newValues);
    } else {
      onChange?.(option.value);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(multiSelect ? [] : '');
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (isOpen && filteredOptions[highlightedIndex]) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        } else {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case ' ':
        if (!searchable || !isOpen) {
          e.preventDefault();
          setIsOpen(!isOpen);
        }
        break;
    }
  };

  useEffect(() => {
    if (isOpen && optionsRef.current) {
      const highlightedElement = optionsRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // When dropdown opens, highlight the currently selected option (or first option if none selected)
  useEffect(() => {
    if (isOpen) {
      const selectedIndex = selectedValues.length > 0
        ? filteredOptions.findIndex((o) => o.value === selectedValues[0])
        : -1;
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen]);

  // Reset highlighted index when search query changes
  useEffect(() => {
    if (searchQuery) {
      setHighlightedIndex(0);
    }
  }, [searchQuery]);

  const isSelected = (option: SelectOption) => selectedValues.includes(option.value);

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
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={`flex-1 truncate ${
            selectedValues.length === 0
              ? 'text-gray-500 dark:text-gray-400'
              : 'text-gray-900 dark:text-white'
          }`}
        >
          {getDisplayText()}
        </span>
        <div className="flex items-center gap-1">
          {clearable && selectedValues.length > 0 && !disabled && (
            <X
              className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-hidden flex flex-col"
          >
            {searchable && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>
            )}

            <div ref={optionsRef} className="overflow-y-auto" role="listbox">
              {loading ? (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Loading...
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const selected = isSelected(option);
                  const highlighted = index === highlightedIndex;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleOptionClick(option)}
                      disabled={option.disabled}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between gap-2 transition-colors ${
                        highlighted
                          ? 'bg-purple-50 dark:bg-purple-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      } ${
                        option.disabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                      } ${
                        selected
                          ? 'text-purple-600 dark:text-purple-400 font-medium'
                          : 'text-gray-900 dark:text-white'
                      }`}
                      role="option"
                      aria-selected={selected}
                    >
                      {renderOption ? (
                        renderOption(option)
                      ) : (
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="truncate">{option.label}</span>
                          {option.description && (
                            <span className={`text-xs truncate mt-0.5 ${
                              highlighted
                                ? 'text-purple-600 dark:text-purple-300'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {option.description}
                            </span>
                          )}
                        </div>
                      )}
                      {selected && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
