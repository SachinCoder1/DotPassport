import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Copy,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Download,
  Code,
  Webhook,
  MapPin,
  Star,
  Trash2,
  Edit2,
  Plus,
} from 'lucide-react';
import { useWalletStore } from '~/store/walletStore';
import { useSandboxStore, isValidPolkadotAddress } from '~/store/sandboxStore';
import { regenerateApiKey, requestChallenge, getOrigins, updateOrigins } from '~/service/authService';
import { maskApiKey } from '~/service/apiKeyService';
import { stringToHex } from '@polkadot/util';
import { toast } from 'sonner';
import { PageHeader } from '~/components/shared/PageHeader';

export function SettingsPage() {
  const { user, selectedAccount } = useWalletStore();
  const {
    customAddresses,
    defaultAddress,
    addCustomAddress,
    removeCustomAddress,
    updateCustomAddress,
    setDefaultAddress,
    clearCustomAddresses,
  } = useSandboxStore();

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  // Custom address form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newAddressName, setNewAddressName] = useState('');
  const [addressError, setAddressError] = useState('');
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Allowed origins state
  const [origins, setOrigins] = useState<string[]>([]);
  const [maxOrigins, setMaxOrigins] = useState(3);
  const [isLoadingOrigins, setIsLoadingOrigins] = useState(true);
  const [isSavingOrigins, setIsSavingOrigins] = useState(false);
  const [newOrigin, setNewOrigin] = useState('');
  const [originError, setOriginError] = useState('');

  // Load origins on mount
  useEffect(() => {
    const loadOrigins = async () => {
      try {
        const response = await getOrigins();
        setOrigins(response.origins);
        setMaxOrigins(response.maxOrigins);
      } catch (error) {
        console.error('Failed to load origins:', error);
      } finally {
        setIsLoadingOrigins(false);
      }
    };
    if (user) {
      loadOrigins();
    }
  }, [user]);

  const handleAddOrigin = () => {
    setOriginError('');
    if (!newOrigin.trim()) {
      setOriginError('Please enter an origin URL');
      return;
    }
    try {
      const url = new URL(newOrigin);
      if (!['http:', 'https:'].includes(url.protocol)) {
        setOriginError('Only http and https protocols are allowed');
        return;
      }
    } catch {
      setOriginError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }
    if (origins.includes(newOrigin)) {
      setOriginError('This origin is already added');
      return;
    }
    if (origins.length >= maxOrigins) {
      setOriginError(`Maximum ${maxOrigins} origins allowed`);
      return;
    }
    setOrigins([...origins, newOrigin]);
    setNewOrigin('');
  };

  const handleRemoveOrigin = (originToRemove: string) => {
    setOrigins(origins.filter((o) => o !== originToRemove));
  };

  const handleSaveOrigins = async () => {
    setIsSavingOrigins(true);
    try {
      await updateOrigins(origins);
      toast.success('Allowed origins saved successfully!');
    } catch (error) {
      console.error('Failed to save origins:', error);
      const message = error instanceof Error ? error.message : 'Failed to save origins';
      toast.error(message);
    } finally {
      setIsSavingOrigins(false);
    }
  };

  const handleRegenerateKey = async () => {
    if (!user || !selectedAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to regenerate your API key? Your old key will stop working immediately.'
    );

    if (!confirmed) return;

    setIsRegenerating(true);
    try {
      // Request challenge
      const { message } = await requestChallenge(user.polkadotAddress);

      // Sign message
      const { web3FromSource } = await import('@polkadot/extension-dapp');
      const injector = await web3FromSource(selectedAccount.meta.source);

      if (!injector.signer.signRaw) {
        throw new Error('Wallet does not support signing');
      }

      const { signature } = await injector.signer.signRaw({
        address: selectedAccount.address,
        data: stringToHex(message),
        type: 'bytes',
      });

      // Regenerate key
      const response = await regenerateApiKey({
        polkadotAddress: user.polkadotAddress,
        message,
        signature,
      });

      setNewApiKey(response.apiKey);
      toast.success('API key regenerated successfully!');
    } catch (error) {
      console.error('Failed to regenerate key:', error);
      const message = error instanceof Error ? error.message : 'Failed to regenerate API key';
      toast.error(message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard!');
  };

  const handleAddAddress = () => {
    setAddressError('');

    if (!newAddress.trim()) {
      setAddressError('Address is required');
      return;
    }

    if (!isValidPolkadotAddress(newAddress.trim())) {
      setAddressError('Invalid Polkadot address format (SS58)');
      return;
    }

    const success = addCustomAddress(newAddress.trim(), newAddressName.trim() || 'Custom Address');
    if (success) {
      setNewAddress('');
      setNewAddressName('');
      setShowAddForm(false);
      toast.success('Custom address added successfully!');
    } else {
      setAddressError('Address already exists');
    }
  };

  const handleRemoveAddress = (address: string) => {
    const confirmed = window.confirm('Are you sure you want to remove this custom address?');
    if (confirmed) {
      removeCustomAddress(address);
      toast.success('Address removed');
    }
  };

  const handleSetDefault = (address: string) => {
    if (defaultAddress === address) {
      setDefaultAddress(null);
      toast.info('Default address cleared');
    } else {
      setDefaultAddress(address);
      toast.success('Default address set');
    }
  };

  const handleStartEdit = (address: string, name: string) => {
    setEditingAddress(address);
    setEditingName(name);
  };

  const handleSaveEdit = (address: string) => {
    if (editingName.trim()) {
      updateCustomAddress(address, editingName.trim());
      toast.success('Address name updated');
    }
    setEditingAddress(null);
    setEditingName('');
  };

  const handleClearAllAddresses = () => {
    if (customAddresses.length === 0) {
      toast.info('No custom addresses to clear');
      return;
    }
    const confirmed = window.confirm('Are you sure you want to remove all custom addresses? This cannot be undone.');
    if (confirmed) {
      clearCustomAddresses();
      toast.success('All custom addresses cleared');
    }
  };

  if (!user) return null;

  const getRateLimitPercentage = (used: number, limit: number) =>
    (used / limit) * 100;

  const getRateLimitColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 75) return 'bg-yellow-600';
    return 'bg-purple-600';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Manage your API keys, appearance, and account settings"
      />

      {/* Account Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Account Information
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              Polkadot Address
            </span>
            <code className="text-sm font-mono text-gray-900 dark:text-white">
              {user.polkadotAddress.slice(0, 12)}...
              {user.polkadotAddress.slice(-12)}
            </code>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Email</span>
            <span className="text-gray-900 dark:text-white">
              {user.contactEmail}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Tier</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 uppercase">
              {user.tier}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              Member Since
            </span>
            <span className="text-gray-900 dark:text-white">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-gray-600 dark:text-gray-400">Status</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.isActive
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
              }`}
            >
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* API Key Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          API Key Management
        </h3>

        {newApiKey ? (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-8 border border-green-200 dark:border-green-700">
              <div className="flex items-center gap-2 text-green-900 dark:text-green-100 mb-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">New API Key Generated!</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 border border-green-200 dark:border-green-700">
                <code className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all block">
                  {newApiKey}
                </code>
              </div>
              <button
                onClick={() => handleCopyKey(newApiKey)}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors inline-flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy New API Key
              </button>
              <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300 mt-3">
                <AlertTriangle className="w-3 h-3" />
                <p>Save this key securely! You won't be able to see it again.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current API Key
            </label>
            <div className="flex items-center gap-3">
              <code className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm text-gray-900 dark:text-white">
                {user.apiKey
                  ? maskApiKey(user.apiKey)
                  : '••••••••••••••••'}
              </code>
              <button
                onClick={() =>
                  user.apiKey && handleCopyKey(user.apiKey)
                }
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-2 text-gray-700 dark:text-gray-300"
                title="Copy API Key"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-5 mb-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                Warning: Regenerating Your API Key
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Regenerating your API key will immediately invalidate your
                current key. Any applications using the old key will stop
                working. Make sure to update all your integrations with the new
                key.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRegenerateKey}
          disabled={isRegenerating}
          className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {isRegenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Regenerating...</span>
            </>
          ) : (
            <>
              <RotateCw className="w-4 h-4" />
              Regenerate API Key
            </>
          )}
        </button>
      </div>

      {/* Allowed Origins */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Allowed Origins
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure which domains can use your API key (max {maxOrigins})
            </p>
          </div>
        </div>

        {isLoadingOrigins ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <>
            {/* Current Origins List */}
            {origins.length > 0 ? (
              <div className="space-y-3 mb-6">
                {origins.map((origin) => (
                  <div
                    key={origin}
                    className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <code className="text-sm font-mono text-gray-800 dark:text-gray-200 truncate flex-1 mr-4">
                      {origin}
                    </code>
                    <button
                      onClick={() => handleRemoveOrigin(origin)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Remove origin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No custom origins configured yet.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Add origins to restrict where your API key can be used.
                </p>
              </div>
            )}

            {/* Add New Origin */}
            {origins.length < maxOrigins && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add New Origin
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={newOrigin}
                    onChange={(e) => {
                      setNewOrigin(e.target.value);
                      setOriginError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddOrigin()}
                    placeholder="https://example.com"
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddOrigin}
                    className="px-6 py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                {originError && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    {originError}
                  </p>
                )}
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSaveOrigins}
              disabled={isSavingOrigins}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {isSavingOrigins ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Allowed Origins
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              Only requests from these origins will be allowed. Leave empty to allow requests from any origin.
            </p>
          </>
        )}
      </div>

      {/* Rate Limits */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Rate Limits ({user.tier} Tier)
        </h3>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                Hourly Limit
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {user.usage.hourly} /{' '}
                {user.rateLimits.hourly}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getRateLimitColor(
                  getRateLimitPercentage(
                    user.usage.hourly,
                    user.rateLimits.hourly
                  )
                )}`}
                style={{
                  width: `${getRateLimitPercentage(
                    user.usage.hourly,
                    user.rateLimits.hourly
                  )}%`,
                }}
              ></div>
            </div>
            {getRateLimitPercentage(
              user.usage.hourly,
              user.rateLimits.hourly
            ) >= 75 && (
              <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                ⚠️ You've used{' '}
                {getRateLimitPercentage(
                  user.usage.hourly,
                  user.rateLimits.hourly
                ).toFixed(0)}
                % of your hourly limit
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                Daily Limit
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {user.usage.daily} /{' '}
                {user.rateLimits.daily}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getRateLimitColor(
                  getRateLimitPercentage(
                    user.usage.daily,
                    user.rateLimits.daily
                  )
                )}`}
                style={{
                  width: `${getRateLimitPercentage(
                    user.usage.daily,
                    user.rateLimits.daily
                  )}%`,
                }}
              ></div>
            </div>
            {getRateLimitPercentage(
              user.usage.daily,
              user.rateLimits.daily
            ) >= 75 && (
              <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                ⚠️ You've used{' '}
                {getRateLimitPercentage(
                  user.usage.daily,
                  user.rateLimits.daily
                ).toFixed(0)}
                % of your daily limit
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                Monthly Limit
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {user.usage.monthly} /{' '}
                {user.rateLimits.monthly}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getRateLimitColor(
                  getRateLimitPercentage(
                    user.usage.monthly,
                    user.rateLimits.monthly
                  )
                )}`}
                style={{
                  width: `${getRateLimitPercentage(
                    user.usage.monthly,
                    user.rateLimits.monthly
                  )}%`,
                }}
              ></div>
            </div>
            {getRateLimitPercentage(
              user.usage.monthly,
              user.rateLimits.monthly
            ) >= 75 && (
              <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                ⚠️ You've used{' '}
                {getRateLimitPercentage(
                  user.usage.monthly,
                  user.rateLimits.monthly
                ).toFixed(0)}
                % of your monthly limit
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Addresses */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Custom Addresses
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {customAddresses.length > 0 && (
              <button
                onClick={handleClearAllAddresses}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline"
              >
                Clear All
              </button>
            )}
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Address
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Add custom Polkadot addresses to test with in the API Testing and Widget Playground pages.
          You can set a default address that will be pre-selected when testing.
        </p>

        {/* Add Address Form */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Add New Custom Address
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Polkadot Address (SS58) *
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => {
                    setNewAddress(e.target.value);
                    setAddressError('');
                  }}
                  placeholder="e.g., 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                  className={`w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg font-mono text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
                    addressError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {addressError && (
                  <p className="mt-1 text-xs text-red-500">{addressError}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={newAddressName}
                  onChange={(e) => setNewAddressName(e.target.value)}
                  placeholder="e.g., My Test Wallet"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddAddress}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Address
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewAddress('');
                    setNewAddressName('');
                    setAddressError('');
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Address List */}
        {customAddresses.length > 0 ? (
          <div className="space-y-2">
            {customAddresses.map((addr) => (
              <div
                key={addr.address}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  defaultAddress === addr.address
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex-1 min-w-0">
                  {editingAddress === addr.address ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(addr.address);
                          if (e.key === 'Escape') {
                            setEditingAddress(null);
                            setEditingName('');
                          }
                        }}
                        className="px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(addr.address)}
                        className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingAddress(null);
                          setEditingName('');
                        }}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {addr.name}
                      </span>
                      {defaultAddress === addr.address && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                          <Star className="w-3 h-3 fill-current" />
                          Default
                        </span>
                      )}
                    </div>
                  )}
                  <code className="text-xs text-gray-500 dark:text-gray-400 font-mono block mt-1 truncate">
                    {addr.address}
                  </code>
                  <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">
                    Added {new Date(addr.addedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => handleSetDefault(addr.address)}
                    className={`p-2 rounded-lg transition-colors ${
                      defaultAddress === addr.address
                        ? 'text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                        : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={defaultAddress === addr.address ? 'Remove as default' : 'Set as default'}
                  >
                    <Star className={`w-4 h-4 ${defaultAddress === addr.address ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleStartEdit(addr.address, addr.name)}
                    className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Edit name"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(addr.address);
                      toast.success('Address copied to clipboard');
                    }}
                    className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Copy address"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveAddress(addr.address)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    title="Remove address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No custom addresses added yet.</p>
            <p className="text-xs mt-1">Click "Add Address" to add your first custom address.</p>
          </div>
        )}
      </div>

      {/* Security & Audit */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Security & Audit
          </h3>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Account Security
                </p>
                <p className="text-blue-800 dark:text-blue-200">
                  Your API key is secured with industry-standard encryption. All
                  requests are logged and monitored for suspicious activity.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Recent Security Events
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>API key last used</span>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Just now
                </span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Wallet connected</span>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Today
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Tools */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Developer Tools
          </h3>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3">
            <button className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    Export Postman Collection
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Download ready-to-use API collection
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-gray-400" />
            </button>

            <button className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
              <div className="flex items-center gap-3">
                <Webhook className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    Webhook Configuration
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Set up webhooks for events (Coming soon)
                  </div>
                </div>
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                Soon
              </span>
            </button>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Code className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-purple-900 dark:text-purple-100 mb-1">
                  SDK Version
                </p>
                <p className="text-purple-800 dark:text-purple-200">
                  Current:{' '}
                  <code className="bg-purple-100 dark:bg-purple-900 px-1 rounded">
                    @dotpassport/sdk@1.0.0
                  </code>
                  <br />
                  <a
                    href="https://npmjs.com/package/@dotpassport/sdk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    Check for updates →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
