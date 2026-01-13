import { useState, useEffect } from 'react';
import {
  FlaskConical,
  Copy,
  Play,
  Loader2,
  Target,
  BookOpen,
  Code2,
  History,
  StopCircle,
  User,
  BarChart3,
  Award,
  Database,
  FileText,
} from 'lucide-react';
import { useSandboxStore } from '~/store/sandboxStore';
import { useWalletStore } from '~/store/walletStore';
import { Select } from '~/components/ui';
import { AddressSelector } from '~/components/shared/AddressSelector';
import { toast } from 'sonner';
import type {
  CategoryDefinition,
  BadgeDefinition,
  UserProfile,
  UserScores,
  SpecificCategoryScore,
  UserBadges,
  SpecificUserBadge,
  CategoryDefinitions,
  BadgeDefinitions,
} from '@dotpassport/sdk';
import { SDK_METHODS } from '../types/api-schemas';
import { MethodDocumentation } from '../components/api-testing/MethodDocumentation';
import { CodeExamplesPanel } from '../components/api-testing/CodeExamplesPanel';
import {
  RequestHistory,
  addToRequestHistory,
} from '../components/api-testing/RequestHistory';
import { PageHeader } from '~/components/shared/PageHeader';
import { Highlight, themes } from 'prism-react-renderer';

type ApiResult =
  | UserProfile
  | UserScores
  | SpecificCategoryScore
  | UserBadges
  | SpecificUserBadge
  | CategoryDefinitions
  | BadgeDefinitions
  | { error: boolean; message: string; details: unknown };

type TabType = 'test' | 'response' | 'docs' | 'code' | 'history';

export function ApiTestingPage() {
  const { sdkClient, defaultAddress, lastUsedAddress } = useSandboxStore();
  const { user } = useWalletStore();

  const methodKeys = Object.keys(SDK_METHODS) as Array<
    keyof typeof SDK_METHODS
  >;
  const [selectedMethodKey, setSelectedMethodKey] = useState<
    keyof typeof SDK_METHODS
  >(methodKeys[0]);
  // Use default address from settings, last used address, or empty string
  const [address, setAddress] = useState(defaultAddress || lastUsedAddress || '');
  const [category, setCategory] = useState('longevity');
  const [badgeName, setBadgeName] = useState('');
  const [result, setResult] = useState<ApiResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryDefinitions, setCategoryDefinitions] = useState<
    CategoryDefinition[]
  >([]);
  const [badgeDefinitions, setBadgeDefinitions] = useState<BadgeDefinition[]>(
    []
  );
  const [isLoadingDefinitions, setIsLoadingDefinitions] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('test');
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const selectedMethod = SDK_METHODS[selectedMethodKey];

  // Load metadata (categories and badges) once on mount
  useEffect(() => {
    async function loadMetadata() {
      if (!sdkClient) return;

      setIsLoadingDefinitions(true);
      try {
        const [categoriesResult, badgesResult] = await Promise.all([
          sdkClient.getCategoryDefinitions(),
          sdkClient.getBadgeDefinitions(),
        ]);
        setCategoryDefinitions(categoriesResult.categories);
        setBadgeDefinitions(badgesResult.badges);

        // Set default category and badge if available
        if (categoriesResult.categories.length > 0) {
          setCategory(categoriesResult.categories[0].key);
        }
        if (badgesResult.badges.length > 0) {
          setBadgeName(badgesResult.badges[0].key);
        }
      } catch (error) {
        console.error('Failed to load metadata:', error);
      } finally {
        setIsLoadingDefinitions(false);
      }
    }

    loadMetadata();
  }, [sdkClient]);

  async function handleExecute() {
    if (!sdkClient) {
      toast.error('SDK client not initialized');
      return;
    }

    setIsLoading(true);
    setResult(null);

    // Create abort controller for cancellation
    const controller = new AbortController();
    setAbortController(controller);

    try {
      let response;

      // Call the appropriate SDK method
      switch (selectedMethodKey) {
        case 'getProfile':
          response = await sdkClient.getProfile(address);
          break;
        case 'getScores':
          response = await sdkClient.getScores(address);
          break;
        case 'getCategoryScore':
          response = await sdkClient.getCategoryScore(address, category);
          break;
        case 'getBadges':
          response = await sdkClient.getBadges(address);
          break;
        case 'getBadge':
          response = await sdkClient.getBadge(address, badgeName);
          break;
        case 'getCategoryDefinitions':
          response = await sdkClient.getCategoryDefinitions();
          break;
        case 'getBadgeDefinitions':
          response = await sdkClient.getBadgeDefinitions();
          break;
        default:
          throw new Error('Unknown method');
      }

      setResult(response);
      setActiveTab('response');

      // Add to request history with user isolation
      if (user?.polkadotAddress) {
        const params: Record<string, string> = {};
        if (selectedMethodKey !== 'getCategoryDefinitions' && selectedMethodKey !== 'getBadgeDefinitions') {
          params.address = address;
        }
        if (selectedMethodKey === 'getCategoryScore') {
          params.category = category;
        }
        if (selectedMethodKey === 'getBadge') {
          params.badgeName = badgeName;
        }

        addToRequestHistory(
          user.polkadotAddress,
          selectedMethod.name,
          params,
          {
            status: 200,
            success: true,
          }
        );
      }

      toast.success(`${selectedMethod.displayName} executed successfully`);
    } catch (error) {
      console.error('API call failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Request failed';
      const axiosError = error as { response?: { data?: unknown; status?: number } };
      setResult({
        error: true,
        message: errorMessage,
        details: axiosError.response?.data || error,
      });

      // Add error to request history
      if (user?.polkadotAddress) {
        const params: Record<string, string> = {};
        if (selectedMethodKey !== 'getCategoryDefinitions' && selectedMethodKey !== 'getBadgeDefinitions') {
          params.address = address;
        }
        if (selectedMethodKey === 'getCategoryScore') {
          params.category = category;
        }
        if (selectedMethodKey === 'getBadge') {
          params.badgeName = badgeName;
        }

        addToRequestHistory(
          user.polkadotAddress,
          selectedMethod.name,
          params,
          {
            status: axiosError.response?.status || 500,
            success: false,
          }
        );
      }

      toast.error(errorMessage);
      setActiveTab('response');
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }

  function handleCancel() {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      toast.info('Request cancelled');
    }
  }

  function handleCopyResult() {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      toast.success('Result copied to clipboard');
    }
  }

  function handleLoadHistoryParams(params: Record<string, unknown>) {
    if (typeof params.address === 'string') setAddress(params.address);
    if (typeof params.category === 'string') setCategory(params.category);
    if (typeof params.badgeName === 'string') setBadgeName(params.badgeName);
    setActiveTab('test');
  }

  const categoryOptions = categoryDefinitions.map((cat) => ({
    value: cat.key,
    label: cat.displayName,
    description: cat.short_description?.substring(0, 50),
  }));

  const badgeOptions = badgeDefinitions.map((badge) => ({
    value: badge.key,
    label: badge.title,
    description: badge.shortDescription,
  }));

  const getMethodIcon = (method: string) => {
    if (method.includes('Profile')) return User;
    if (method.includes('Score')) return BarChart3;
    if (method.includes('Badge')) return Award;
    if (method.includes('Categor')) return Database;
    return FileText;
  };

  const MethodIcon = getMethodIcon(selectedMethod.displayName);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        icon={FlaskConical}
        title="API Testing Playground"
        description="Test all SDK methods with live data and explore API responses"
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar - Method Selection */}
        <div className="col-span-3 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Select Method
            </h3>

            <div className="space-y-2">
              {methodKeys.map((key) => {
                const method = SDK_METHODS[key];
                const Icon = getMethodIcon(method.displayName);
                const isSelected = key === selectedMethodKey;

                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedMethodKey(key);
                      setResult(null);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-purple-900 dark:text-purple-100'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">
                        {method.displayName}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {method.category}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-9 space-y-4">
          {/* Method Header */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <MethodIcon className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {selectedMethod.displayName}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {selectedMethod.description}
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                    <span className="font-mono text-purple-600 dark:text-purple-400 font-semibold">
                      {selectedMethod.method}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {selectedMethod.endpoint}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex">
                {[
                  { id: 'test' as TabType, label: 'Test', icon: Play },
                  { id: 'response' as TabType, label: 'Response', icon: Code2 },
                  { id: 'docs' as TabType, label: 'Documentation', icon: BookOpen },
                  { id: 'code' as TabType, label: 'Code Examples', icon: FileText },
                  { id: 'history' as TabType, label: 'History', icon: History },
                ].map((tab) => {
                  const isDisabled = tab.id === 'response' && isLoading;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => !isDisabled && setActiveTab(tab.id)}
                      disabled={isDisabled}
                      className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                        isDisabled
                          ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                          : activeTab === tab.id
                          ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-900/20'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {tab.id === 'response' && isLoading && (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6">
              {/* Test Tab */}
              {activeTab === 'test' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configure parameters and execute the API method
                  </p>

                  {/* Address Input (for most methods except metadata endpoints) */}
                  {selectedMethodKey !== 'getCategoryDefinitions' && selectedMethodKey !== 'getBadgeDefinitions' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Polkadot Address *
                      </label>
                      <AddressSelector
                        value={address}
                        onChange={setAddress}
                        placeholder="Select or enter address"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        The Polkadot SS58 address to query. You can add custom addresses.
                      </p>
                    </div>
                  )}

                  {/* Category Selector (for getCategoryScore and getCategory) */}
                  {(selectedMethodKey === 'getCategoryScore' ||
                    selectedMethodKey === 'getCategory') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                      </label>
                      {isLoadingDefinitions ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading categories...
                        </div>
                      ) : categoryOptions.length > 0 ? (
                        <Select
                          options={categoryOptions}
                          value={category}
                          onChange={(value) => setCategory(value as string)}
                          placeholder="Select category"
                          searchable
                        />
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No categories available
                        </p>
                      )}
                    </div>
                  )}

                  {/* Badge Selector (for getBadge) */}
                  {selectedMethodKey === 'getBadge' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Badge *
                      </label>
                      {isLoadingDefinitions ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading badges...
                        </div>
                      ) : badgeOptions.length > 0 ? (
                        <Select
                          options={badgeOptions}
                          value={badgeName}
                          onChange={(value) => setBadgeName(value as string)}
                          placeholder="Select badge"
                          searchable
                        />
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No badges available
                        </p>
                      )}
                    </div>
                  )}

                  {/* Execute Button */}
                  <div className="pt-4">
                    {isLoading ? (
                      <div className="space-y-3">
                        {/* Loading Progress Bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-purple-600 h-1.5 rounded-full animate-pulse w-2/3"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Fetching response...
                          </span>
                          <button
                            onClick={handleCancel}
                            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Stop request"
                          >
                            <StopCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleExecute}
                        disabled={!sdkClient}
                        className="w-full btn btn-primary inline-flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Execute Method
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Response Tab */}
              {activeTab === 'response' && (
                <div className="space-y-4">
                  {result ? (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Response
                        </h3>
                        <button
                          onClick={handleCopyResult}
                          className="btn btn-outline text-xs py-1.5 px-3"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </button>
                      </div>
                      <Highlight
                        theme={themes.vsDark}
                        code={JSON.stringify(result, null, 2)}
                        language="json"
                      >
                        {({ className, style, tokens, getLineProps, getTokenProps }) => (
                          <pre
                            className={`${className} rounded-lg p-4 overflow-x-auto text-sm`}
                            style={{ ...style, margin: 0 }}
                          >
                            {tokens.map((line, i) => (
                              <div key={i} {...getLineProps({ line })}>
                                {line.map((token, key) => (
                                  <span key={key} {...getTokenProps({ token })} />
                                ))}
                              </div>
                            ))}
                          </pre>
                        )}
                      </Highlight>
                    </>
                  ) : (
                    <div className="space-y-4">
                      {/* Example Response Preview */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 bg-white/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Example Response
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                              Preview
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                JSON.stringify(selectedMethod.exampleResponse, null, 2)
                              );
                              toast.success('Example copied to clipboard');
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </button>
                        </div>
                        <div className="p-4 max-h-80 overflow-auto">
                          <Highlight
                            theme={themes.vsDark}
                            code={JSON.stringify(selectedMethod.exampleResponse, null, 2)}
                            language="json"
                          >
                            {({ className, style, tokens, getLineProps, getTokenProps }) => (
                              <pre
                                className={`${className} rounded-lg p-3 text-xs opacity-75`}
                                style={{ ...style, margin: 0, background: 'transparent' }}
                              >
                                {tokens.map((line, i) => (
                                  <div key={i} {...getLineProps({ line })}>
                                    {line.map((token, key) => (
                                      <span key={key} {...getTokenProps({ token })} />
                                    ))}
                                  </div>
                                ))}
                              </pre>
                            )}
                          </Highlight>
                        </div>
                      </div>

                      {/* Call to Action */}
                      <div className="flex flex-col items-center py-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          This is an example of what the response will look like.
                          <br />
                          Execute the method to get real data.
                        </p>
                        <button
                          onClick={() => {
                            setActiveTab('test');
                            setTimeout(() => handleExecute(), 100);
                          }}
                          disabled={!sdkClient || isLoading}
                          className="btn btn-primary inline-flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Execute {selectedMethod.displayName}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Documentation Tab */}
              {activeTab === 'docs' && (
                <MethodDocumentation method={selectedMethod} />
              )}

              {/* Code Examples Tab */}
              {activeTab === 'code' && (
                <CodeExamplesPanel
                  method={selectedMethod}
                  address={address}
                  category={category}
                  badgeName={badgeName}
                />
              )}

              {/* History Tab */}
              {activeTab === 'history' && user?.polkadotAddress && (
                <RequestHistory
                  methodName={selectedMethod.name}
                  polkadotAddress={user.polkadotAddress}
                  onLoadParameters={handleLoadHistoryParams}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
