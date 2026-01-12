import { useState } from 'react';
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
} from 'lucide-react';
import { useWalletStore } from '~/store/walletStore';
import { regenerateApiKey, requestChallenge } from '~/service/authService';
import { maskApiKey } from '~/service/apiKeyService';
import { stringToHex } from '@polkadot/util';
import { toast } from 'sonner';
import { PageHeader } from '~/components/shared/PageHeader';

export function SettingsPage() {
  const { user, selectedAccount } = useWalletStore();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

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
