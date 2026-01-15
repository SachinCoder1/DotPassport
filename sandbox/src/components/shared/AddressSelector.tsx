import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Search, Plus, Trash2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSandboxStore, isValidPolkadotAddress } from '~/store/sandboxStore';
import { SUGGESTED_ADDRESSES } from '~/utils/constants';

export interface AddressSelectorProps {
  value: string;
  onChange: (address: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showDefaultOption?: boolean;
}

interface AddressOption {
  value: string;
  label: string;
  description: string;
  isCustom?: boolean;
  isDefault?: boolean;
}

export function AddressSelector({
  value,
  onChange,
  placeholder = 'Select an address...',
  disabled = false,
  className = '',
  showDefaultOption = false,
}: AddressSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const {
    customAddresses,
    defaultAddress,
    addCustomAddress,
    removeCustomAddress,
    setDefaultAddress,
    setLastUsedAddress,
  } = useSandboxStore();

  // Build combined options list
  const buildOptions = (): AddressOption[] => {
    const options: AddressOption[] = [];

    // Add suggested addresses
    SUGGESTED_ADDRESSES.forEach((addr) => {
      options.push({
        value: addr.address,
        label: addr.name,
        description: addr.address.substring(0, 12) + '...' + addr.address.slice(-6),
        isCustom: false,
        isDefault: defaultAddress === addr.address,
      });
    });

    // Add custom addresses
    customAddresses.forEach((addr) => {
      options.push({
        value: addr.address,
        label: addr.name,
        description: addr.address.substring(0, 12) + '...' + addr.address.slice(-6),
        isCustom: true,
        isDefault: defaultAddress === addr.address,
      });
    });

    return options;
  };

  const allOptions = buildOptions();

  const filteredOptions = searchQuery
    ? allOptions.filter((option) => {
        const searchText = `${option.label} ${option.value}`.toLowerCase();
        return searchText.includes(searchQuery.toLowerCase());
      })
    : allOptions;

  const selectedOption = allOptions.find((o) => o.value === value);

  const getDisplayText = () => {
    if (!value) return placeholder;
    return selectedOption?.label || value.substring(0, 12) + '...' + value.slice(-6);
  };

  const handleOptionClick = (option: AddressOption) => {
    onChange(option.value);
    setLastUsedAddress(option.value);
    setIsOpen(false);
    setSearchQuery('');
    setShowAddForm(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  const handleAddCustom = () => {
    setAddError('');

    if (!newAddress.trim()) {
      setAddError('Address is required');
      return;
    }

    if (!isValidPolkadotAddress(newAddress.trim())) {
      setAddError('Invalid Polkadot address format');
      return;
    }

    const success = addCustomAddress(newAddress.trim(), newName.trim() || 'Custom Address');
    if (success) {
      onChange(newAddress.trim());
      setLastUsedAddress(newAddress.trim());
      setNewAddress('');
      setNewName('');
      setShowAddForm(false);
      setIsOpen(false);
    } else {
      setAddError('Address already exists');
    }
  };

  const handleRemoveCustom = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    removeCustomAddress(address);
    if (value === address) {
      onChange('');
    }
  };

  const handleSetDefault = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    if (defaultAddress === address) {
      setDefaultAddress(null);
    } else {
      setDefaultAddress(address);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (showAddForm) {
          handleAddCustom();
        } else if (isOpen && filteredOptions[highlightedIndex]) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        } else {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (showAddForm) {
          setShowAddForm(false);
          setNewAddress('');
          setNewName('');
          setAddError('');
        } else {
          setIsOpen(false);
          setSearchQuery('');
        }
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
    }
  };

  useEffect(() => {
    if (isOpen && optionsRef.current) {
      const highlightedElement = optionsRef.current.children[highlightedIndex] as HTMLElement;
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
        setShowAddForm(false);
        setNewAddress('');
        setNewName('');
        setAddError('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (showAddForm && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [showAddForm]);

  useEffect(() => {
    if (isOpen) {
      const selectedIndex = value
        ? filteredOptions.findIndex((o) => o.value === value)
        : -1;
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery) {
      setHighlightedIndex(0);
    }
  }, [searchQuery]);

  // Separate suggested and custom for grouped display
  const suggestedOptions = filteredOptions.filter((o) => !o.isCustom);
  const customOptions = filteredOptions.filter((o) => o.isCustom);

  const renderOption = (option: AddressOption, _index: number, globalIndex: number) => {
    const selected = option.value === value;
    const highlighted = globalIndex === highlightedIndex;

    return (
      <button
        key={option.value}
        type="button"
        onClick={() => handleOptionClick(option)}
        className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors ${
          highlighted
            ? 'bg-purple-50 dark:bg-purple-900/20'
            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
        } ${
          selected
            ? 'text-purple-600 dark:text-purple-400 font-medium'
            : 'text-gray-900 dark:text-white'
        }`}
        role="option"
        aria-selected={selected}
      >
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate">{option.label}</span>
            {option.isDefault && (
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            )}
          </div>
          <span className={`text-xs truncate mt-0.5 font-mono ${
            highlighted
              ? 'text-purple-600 dark:text-purple-300'
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {option.description}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {showDefaultOption && (
            <button
              type="button"
              onClick={(e) => handleSetDefault(e, option.value)}
              className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                option.isDefault ? 'text-yellow-500' : 'text-gray-400'
              }`}
              title={option.isDefault ? 'Remove as default' : 'Set as default'}
            >
              <Star className={`w-3.5 h-3.5 ${option.isDefault ? 'fill-current' : ''}`} />
            </button>
          )}
          {option.isCustom && (
            <button
              type="button"
              onClick={(e) => handleRemoveCustom(e, option.value)}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500"
              title="Remove custom address"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {selected && <Check className="w-4 h-4 shrink-0" />}
        </div>
      </button>
    );
  };

  let globalIndex = 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 rounded-lg text-left text-sm flex items-center justify-between gap-2 transition-all border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
        } ${isOpen ? 'border-purple-500 ring-2 ring-purple-500/20' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={`flex-1 truncate ${
            !value
              ? 'text-gray-500 dark:text-gray-400'
              : 'text-gray-900 dark:text-white'
          }`}
        >
          {getDisplayText()}
        </span>
        <div className="flex items-center gap-1">
          {value && !disabled && (
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col"
          >
            {/* Search */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search addresses..."
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Options */}
            <div ref={optionsRef} className="overflow-y-auto flex-1" role="listbox">
              {/* Suggested Addresses */}
              {suggestedOptions.length > 0 && (
                <>
                  <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-900">
                    Suggested Addresses
                  </div>
                  {suggestedOptions.map((option, index) => {
                    const result = renderOption(option, index, globalIndex);
                    globalIndex++;
                    return result;
                  })}
                </>
              )}

              {/* Custom Addresses */}
              {customOptions.length > 0 && (
                <>
                  <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                    Custom Addresses
                  </div>
                  {customOptions.map((option, index) => {
                    const result = renderOption(option, index, globalIndex);
                    globalIndex++;
                    return result;
                  })}
                </>
              )}

              {filteredOptions.length === 0 && !showAddForm && (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No addresses found
                </div>
              )}
            </div>

            {/* Add Custom Address */}
            <div className="border-t border-gray-200 dark:border-gray-700">
              {!showAddForm ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(true);
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-3 text-left text-sm flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Custom Address</span>
                </button>
              ) : (
                <div className="p-3 space-y-2">
                  <input
                    ref={addInputRef}
                    type="text"
                    value={newAddress}
                    onChange={(e) => {
                      setNewAddress(e.target.value);
                      setAddError('');
                    }}
                    placeholder="Polkadot address (e.g., 5GrwvaEF...)"
                    className={`w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border rounded-md text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono ${
                      addError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Name (optional)"
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                  />
                  {addError && (
                    <p className="text-xs text-red-500">{addError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddCustom}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Add Address
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewAddress('');
                        setNewName('');
                        setAddError('');
                      }}
                      className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
