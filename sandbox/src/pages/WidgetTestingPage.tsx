import { useState, useEffect, useRef, useCallback } from 'react';
import { Palette, Sparkles, Settings, BookOpen, RefreshCw, Play, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useWalletStore } from '~/store/walletStore';
import { useSandboxStore } from '~/store/sandboxStore';
import { Select } from '~/components/ui';
import { AddressSelector } from '~/components/shared/AddressSelector';
import type { BadgeDefinition, CategoryDefinition } from '@dotpassport/sdk';
import { PageHeader } from '~/components/shared/PageHeader';
import { IntegrationGuidePanel } from '~/components/widget-testing/IntegrationGuidePanel';

// Fallback categories in case API fails or is slow to load
// These match the actual category keys from the database
// Using Partial<CategoryDefinition> since we only need key/displayName/short_description for dropdowns
const FALLBACK_CATEGORIES: Partial<CategoryDefinition>[] = [
  { key: 'longevity', displayName: 'Account Longevity', short_description: 'Measures the age of your account, rewarding long-term commitment.' },
  { key: 'txCount', displayName: 'Transaction Count', short_description: 'Rewards the frequency of your on-chain activity.' },
  { key: 'txVolume', displayName: 'Transaction Volume', short_description: 'Measures the total value of DOT transferred.' },
  { key: 'governance', displayName: 'Governance Participation', short_description: 'Rewards your active involvement in shaping the network\'s future.' },
  { key: 'stakingRewards', displayName: 'Staking Rewards', short_description: 'Measures the total rewards earned from staking.' },
  { key: 'stakingNominators', displayName: 'Staking Nominators', short_description: 'Rewards the diversity of your nominations.' },
  { key: 'stakingSlash', displayName: 'Staking Slashes', short_description: 'Penalizes for being slashed due to validator misbehavior.' },
  { key: 'nftHoldings', displayName: 'NFT Holdings', short_description: 'Measures the size of your NFT collection.' },
  { key: 'tokenDiversity', displayName: 'Token Diversity', short_description: 'Rewards holding a variety of different tokens.' },
  { key: 'nftActivity', displayName: 'NFT Activity', short_description: 'Measures your interaction with NFTs, such as buys or sells.' },
  { key: 'extrinsicDepth', displayName: 'Extrinsic Depth', short_description: 'Measures the total number of all on-chain calls you have made.' },
  { key: 'modules', displayName: 'Module Diversity', short_description: 'Rewards interaction with different on-chain modules (pallets).' },
];

// Fallback badges in case API fails or is slow to load
// These match the actual badge keys from the database
// Using Partial<BadgeDefinition> since we only need key/title/shortDescription for dropdowns
const FALLBACK_BADGES: Partial<BadgeDefinition>[] = [
  { key: 'RelayChainInitiate', title: 'Relay Chain Initiate', shortDescription: 'Marks your first active participation on the Polkadot Relay Chain.' },
  { key: 'PolkadotRegular', title: 'Polkadot Regular', shortDescription: 'Recognizes your sustained presence and long-term commitment.' },
  { key: 'ExtrinsicEngine', title: 'Extrinsic Engine', shortDescription: 'Measures your overall activity level on the network.' },
  { key: 'ParachainTraveler', title: 'Parachain Traveler', shortDescription: 'Highlights your exploration of Polkadot\'s multi-chain ecosystem.' },
  { key: 'ReferendumVoter', title: 'Referendum Voter', shortDescription: 'Recognizes your participation in Polkadot\'s on-chain governance.' },
  { key: 'TreasuryContributor', title: 'Treasury Contributor', shortDescription: 'Awarded for directly influencing the allocation of the on-chain Treasury.' },
  { key: 'NposGuardian', title: 'NPoS Guardian', shortDescription: 'For contributing to the security of Polkadot\'s NPoS system.' },
  { key: 'TrustedNominator', title: 'Trusted Nominator', shortDescription: 'Rewards your skill in selecting reliable validators.' },
  { key: 'PolkadotCollector', title: 'Polkadot Collector', shortDescription: 'Measures the scale of your collection of NFTs.' },
  { key: 'CrossChainHolder', title: 'Cross-Chain Holder', shortDescription: 'Showcases your engagement with Polkadot\'s interoperability.' },
  { key: 'IdentityConfirmed', title: 'Identity Confirmed', shortDescription: 'For cryptographically verifying your account details on-chain.' },
  { key: 'UtilityMaximizer', title: 'Utility Maximizer', shortDescription: 'Recognizes your expertise in using advanced features.' },
];

// Widget imports
import {
  ReputationWidget,
  ProfileWidget,
  BadgeWidget,
  CategoryWidget,
} from '@dotpassport/sdk';

interface WidgetInstance {
  mount: (container: HTMLElement) => void;
  unmount?: () => void;
  update?: (config: Record<string, unknown>) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WidgetConstructor = new (config: any) => WidgetInstance;

type WidgetType = {
  id: string;
  name: string;
  codeName: string;
  description: string;
  component: WidgetConstructor;
  requiresBadge?: boolean;
  requiresCategory?: boolean;
};

const WIDGETS: WidgetType[] = [
  {
    id: 'reputation',
    name: 'Reputation',
    codeName: 'ReputationWidget',
    description: 'Display overall reputation score and rankings',
    component: ReputationWidget as WidgetConstructor,
  },
  {
    id: 'profile',
    name: 'Profile',
    codeName: 'ProfileWidget',
    description: 'Show user profile with identity and social links',
    component: ProfileWidget as WidgetConstructor,
  },
  {
    id: 'badge',
    name: 'Badge',
    codeName: 'BadgeWidget',
    description: 'Display earned badges and achievements',
    component: BadgeWidget as WidgetConstructor,
    requiresBadge: true,
  },
  {
    id: 'category',
    name: 'Category',
    codeName: 'CategoryWidget',
    description: 'Show detailed category score breakdown',
    component: CategoryWidget as WidgetConstructor,
    requiresCategory: true,
  },
];

export function WidgetTestingPage() {
  const { user } = useWalletStore();
  const { sdkClient, widgetCache, setWidgetCache, defaultAddress, lastUsedAddress } = useSandboxStore();

  const [selectedWidget, setSelectedWidget] = useState<WidgetType>(WIDGETS[0]);
  // Use default address from settings, last used address, or empty string
  const [address, setAddress] = useState(defaultAddress || lastUsedAddress || '');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [activeTab, setActiveTab] = useState<'preview' | 'integration'>(
    'preview'
  );

  // Badge and category selection
  const [badgeKey, setBadgeKey] = useState('');
  const [category, setCategory] = useState('');
  const [badges, setBadges] = useState<Partial<BadgeDefinition>[]>([]);
  const [categories, setCategories] = useState<Partial<CategoryDefinition>[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  // Reputation widget config options
  const [showCategories, setShowCategories] = useState(true);
  const [maxCategories, setMaxCategories] = useState(6);
  const [compactMode, setCompactMode] = useState(false);

  // Badge widget config options
  const [maxBadges, setBadgeMaxBadges] = useState(20); // High default to show all
  const [badgeShowProgress, setBadgeShowProgress] = useState(true);

  // Category widget config options
  const [categoryShowTitle, setCategoryShowTitle] = useState(true);
  const [categoryShowDescription, setCategoryShowDescription] = useState(true);
  const [categoryShowBreakdown, setCategoryShowBreakdown] = useState(true);
  const [categoryShowAdvice, setCategoryShowAdvice] = useState(true);
  const [categoryShowScoreOnly, setCategoryShowScoreOnly] = useState(false);
  const [categoryCompactMode, setCategoryCompactMode] = useState(false);

  // Widget loading state - manual load instead of auto-load
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
  const [isWidgetLoading, setIsWidgetLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const widgetInstanceRef = useRef<WidgetInstance | null>(null);

  // Download widget as PNG
  const downloadWidgetAsPng = async () => {
    const container = document.getElementById('widget-preview-container');
    if (!container || !isWidgetLoaded) return;

    setIsDownloading(true);
    try {
      // Find the actual widget element inside the container
      const widgetElement = container.querySelector('.dp-widget') as HTMLElement;
      const targetElement = widgetElement || container;

      const canvas = await html2canvas(targetElement, {
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      // Create download link
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      const widgetName = selectedWidget.name.toLowerCase();
      link.download = `dotpassport-${widgetName}-widget-${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download widget:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Track data config (requires API call) vs display config (can update locally)
  const lastDataConfigRef = useRef<string>('');
  const lastDisplayConfigRef = useRef<string>('');

  // Load badges and categories from API
  const loadMetadata = async () => {
    if (!sdkClient) {
      // Use fallback data if no SDK client
      setBadges(FALLBACK_BADGES);
      // Don't auto-select badge - let user choose or show all badges
      setCategories(FALLBACK_CATEGORIES);
      setCategory(FALLBACK_CATEGORIES[0].key || 'longevity');
      return;
    }

    setIsLoadingMetadata(true);
    setMetadataError(null);
    try {
      const [badgesResult, categoriesResult] = await Promise.all([
        sdkClient.getBadgeDefinitions(),
        sdkClient.getCategoryDefinitions(),
      ]);

      // Use API badges if available, otherwise use fallback
      const fetchedBadges = badgesResult.badges?.length > 0
        ? badgesResult.badges
        : FALLBACK_BADGES;
      setBadges(fetchedBadges);

      // Use API categories if available, otherwise use fallback
      const cats = categoriesResult.categories?.length > 0
        ? categoriesResult.categories
        : FALLBACK_CATEGORIES;
      setCategories(cats);

      // Set defaults - only auto-select category (required), not badge (optional)
      // Badge defaults to empty string which means "show all badges"
      if (cats.length > 0 && !category) {
        setCategory(cats[0].key || 'longevity');
      }
    } catch (error) {
      console.error('Failed to load metadata:', error);
      // Use fallback data on error
      setBadges(FALLBACK_BADGES);
      setCategories(FALLBACK_CATEGORIES);
      if (!category) {
        setCategory(FALLBACK_CATEGORIES[0].key || 'longevity');
      }
      setMetadataError(null); // Don't show error since we have fallback data
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, [sdkClient]);

  // Generate config keys - separate data config (requires API) from display config (local update)
  const getDataConfigKey = useCallback(() => {
    return JSON.stringify({
      widget: selectedWidget.id,
      address,
      badgeKey: selectedWidget.requiresBadge ? badgeKey : '',
      category: selectedWidget.requiresCategory ? category : '',
    });
  }, [selectedWidget, address, badgeKey, category]);

  const getDisplayConfigKey = useCallback(() => {
    return JSON.stringify({
      theme,
      // Reputation widget options
      showCategories: selectedWidget.id === 'reputation' ? showCategories : true,
      maxCategories: selectedWidget.id === 'reputation' ? maxCategories : 6,
      compactMode: selectedWidget.id === 'reputation' ? compactMode : false,
      // Badge widget options
      badgeMaxBadges: selectedWidget.id === 'badge' ? maxBadges : 20,
      badgeShowProgress: selectedWidget.id === 'badge' ? badgeShowProgress : true,
      // Category widget options
      categoryShowTitle: selectedWidget.id === 'category' ? categoryShowTitle : true,
      categoryShowDescription: selectedWidget.id === 'category' ? categoryShowDescription : true,
      categoryShowBreakdown: selectedWidget.id === 'category' ? categoryShowBreakdown : true,
      categoryShowAdvice: selectedWidget.id === 'category' ? categoryShowAdvice : true,
      categoryShowScoreOnly: selectedWidget.id === 'category' ? categoryShowScoreOnly : false,
      categoryCompactMode: selectedWidget.id === 'category' ? categoryCompactMode : false,
    });
  }, [selectedWidget.id, theme, showCategories, maxCategories, compactMode, maxBadges, badgeShowProgress, categoryShowTitle, categoryShowDescription, categoryShowBreakdown, categoryShowAdvice, categoryShowScoreOnly, categoryCompactMode]);

  // Check if data config changed (requires new API call)
  const hasDataConfigChanged = getDataConfigKey() !== lastDataConfigRef.current;
  // Check if display config changed (can update locally with cached data)
  const hasDisplayConfigChanged = getDisplayConfigKey() !== lastDisplayConfigRef.current;

  // Manual load widget function - only makes API call when explicitly triggered
  const loadWidget = useCallback((forceRefresh = false) => {
    const container = document.getElementById('widget-preview-container');
    if (!container || !user?.apiKey) return;

    // Guard: Don't mount category widget without a selected category
    if (selectedWidget.requiresCategory && !category) {
      container.innerHTML = '<div class="text-gray-500 text-center py-8">Please select a category to preview the widget</div>';
      return;
    }

    // Clear SDK cache if force refresh to ensure fresh data
    if (forceRefresh && sdkClient) {
      sdkClient.clearCache();
    }

    // Unmount previous widget
    if (widgetInstanceRef.current?.unmount) {
      widgetInstanceRef.current.unmount();
    }

    // Clear previous widget
    container.innerHTML = '';
    setIsWidgetLoading(true);

    try {
      const WidgetComponent = selectedWidget.component;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const props: Record<string, any> = {
        address,
        apiKey: user.apiKey,
        theme,
        onLoad: () => {
          setIsWidgetLoading(false);
          setIsWidgetLoaded(true);
        },
        onError: () => {
          setIsWidgetLoading(false);
        },
      };

      // Add specific props for certain widgets
      if (selectedWidget.requiresBadge) {
        if (badgeKey) {
          props.badgeKey = badgeKey;
        }
        props.maxBadges = maxBadges;
        props.showProgress = badgeShowProgress;
      }
      if (selectedWidget.requiresCategory && category) {
        props.categoryKey = category;
      }

      // Add reputation widget config options
      if (selectedWidget.id === 'reputation') {
        props.showCategories = showCategories;
        props.maxCategories = maxCategories;
        props.compact = compactMode;
      }

      // Add category widget config options
      if (selectedWidget.id === 'category') {
        props.showTitle = categoryShowTitle;
        props.showDescription = categoryShowDescription;
        props.showBreakdown = categoryShowBreakdown;
        props.showAdvice = categoryShowAdvice;
        props.showScoreOnly = categoryShowScoreOnly;
        props.compact = categoryCompactMode;
      }

      // Create and mount widget
      const widgetInstance = new WidgetComponent(props);
      widgetInstanceRef.current = widgetInstance;
      widgetInstance.mount(container);

      // Save both config keys to track what we loaded
      lastDataConfigRef.current = getDataConfigKey();
      lastDisplayConfigRef.current = getDisplayConfigKey();

      // Save to store cache for persistence across page navigation
      setWidgetCache({
        widgetType: selectedWidget.id,
        address,
        badgeKey: selectedWidget.requiresBadge ? badgeKey : undefined,
        categoryKey: selectedWidget.requiresCategory ? category : undefined,
        timestamp: Date.now(),
        theme,
        showCategories: selectedWidget.id === 'reputation' ? showCategories : undefined,
        maxCategories: selectedWidget.id === 'reputation' ? maxCategories : undefined,
        compactMode: selectedWidget.id === 'reputation' ? compactMode : undefined,
        // Badge widget options
        badgeMaxBadges: selectedWidget.id === 'badge' ? maxBadges : undefined,
        badgeShowProgress: selectedWidget.id === 'badge' ? badgeShowProgress : undefined,
        // Category widget options
        categoryShowTitle: selectedWidget.id === 'category' ? categoryShowTitle : undefined,
        categoryShowDescription: selectedWidget.id === 'category' ? categoryShowDescription : undefined,
        categoryShowBreakdown: selectedWidget.id === 'category' ? categoryShowBreakdown : undefined,
        categoryShowAdvice: selectedWidget.id === 'category' ? categoryShowAdvice : undefined,
        categoryShowScoreOnly: selectedWidget.id === 'category' ? categoryShowScoreOnly : undefined,
        categoryCompactMode: selectedWidget.id === 'category' ? categoryCompactMode : undefined,
      });
    } catch (error) {
      console.error('Failed to mount widget:', error);
      setIsWidgetLoading(false);
    }
  }, [selectedWidget, address, theme, badgeKey, category, user?.apiKey, sdkClient, showCategories, maxCategories, compactMode, maxBadges, badgeShowProgress, categoryShowTitle, categoryShowDescription, categoryShowBreakdown, categoryShowAdvice, categoryShowScoreOnly, categoryCompactMode, getDataConfigKey, getDisplayConfigKey, setWidgetCache]);

  // Auto-fetch when data config changes AFTER first load (widget type, address, badge, category)
  useEffect(() => {
    // Only auto-fetch if widget was previously loaded and data config changed
    if (!isWidgetLoaded || isWidgetLoading) return;
    if (!hasDataConfigChanged) return; // No data change

    // Auto-fetch the new widget
    loadWidget();
  }, [isWidgetLoaded, isWidgetLoading, hasDataConfigChanged, loadWidget]);

  // Auto-update widget when display config changes - re-mount to apply new config
  useEffect(() => {
    // Only auto-update if widget is loaded and only display config changed (not data config)
    if (!isWidgetLoaded || isWidgetLoading) return;
    if (hasDataConfigChanged) return; // Data changed - will be handled by auto-fetch above
    if (!hasDisplayConfigChanged) return; // Nothing changed

    // Re-mount the widget with new config for reliable updates
    loadWidget();
  }, [isWidgetLoaded, isWidgetLoading, hasDataConfigChanged, hasDisplayConfigChanged, loadWidget]);

  // Cleanup only on page unmount (not tab change)
  useEffect(() => {
    return () => {
      if (widgetInstanceRef.current?.unmount) {
        widgetInstanceRef.current.unmount();
      }
    };
  }, []);

  // Restore from cache on page mount
  useEffect(() => {
    if (widgetCache && !isWidgetLoaded && !isWidgetLoading) {
      // Restore state from cache
      const cachedWidget = WIDGETS.find(w => w.id === widgetCache.widgetType);
      if (cachedWidget) {
        setSelectedWidget(cachedWidget);
        setAddress(widgetCache.address);
        setTheme(widgetCache.theme);
        if (widgetCache.badgeKey) setBadgeKey(widgetCache.badgeKey);
        if (widgetCache.categoryKey) setCategory(widgetCache.categoryKey);
        // Reputation widget options
        if (widgetCache.showCategories !== undefined) setShowCategories(widgetCache.showCategories);
        if (widgetCache.maxCategories !== undefined) setMaxCategories(widgetCache.maxCategories);
        if (widgetCache.compactMode !== undefined) setCompactMode(widgetCache.compactMode);
        // Badge widget options
        if (widgetCache.badgeMaxBadges !== undefined) setBadgeMaxBadges(widgetCache.badgeMaxBadges);
        if (widgetCache.badgeShowProgress !== undefined) setBadgeShowProgress(widgetCache.badgeShowProgress);
        // Category widget options
        if (widgetCache.categoryShowTitle !== undefined) setCategoryShowTitle(widgetCache.categoryShowTitle);
        if (widgetCache.categoryShowDescription !== undefined) setCategoryShowDescription(widgetCache.categoryShowDescription);
        if (widgetCache.categoryShowBreakdown !== undefined) setCategoryShowBreakdown(widgetCache.categoryShowBreakdown);
        if (widgetCache.categoryShowAdvice !== undefined) setCategoryShowAdvice(widgetCache.categoryShowAdvice);
        if (widgetCache.categoryShowScoreOnly !== undefined) setCategoryShowScoreOnly(widgetCache.categoryShowScoreOnly);
        if (widgetCache.categoryCompactMode !== undefined) setCategoryCompactMode(widgetCache.categoryCompactMode);
      }
    }
  }, []); // Only run once on mount

  // Auto-load widget from cache after state is restored
  const hasRestoredFromCache = useRef(false);
  useEffect(() => {
    if (widgetCache && !hasRestoredFromCache.current && !isWidgetLoaded && !isWidgetLoading && user?.apiKey) {
      // Check if current state matches cache (meaning restoration happened)
      const stateMatchesCache =
        selectedWidget.id === widgetCache.widgetType &&
        address === widgetCache.address;

      if (stateMatchesCache) {
        hasRestoredFromCache.current = true;
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          loadWidget();
        }, 100);
      }
    }
  }, [selectedWidget.id, address, widgetCache, isWidgetLoaded, isWidgetLoading, user?.apiKey, loadWidget]);

  const themeOptions = [
    { value: 'light', label: 'Light', description: 'Light color scheme' },
    { value: 'dark', label: 'Dark', description: 'Dark color scheme' },
    { value: 'auto', label: 'Auto', description: 'Match system preference' },
  ];

  const badgeOptions = [
    { value: '', label: 'Show All Badges', description: 'Display all earned badges' },
    ...badges
      .filter((badge) => badge.key && badge.title)
      .map((badge) => ({
        value: badge.key!,
        label: badge.title!,
        description: badge.shortDescription || '',
      })),
  ];

  const categoryOptions = categories
    .filter((cat) => cat.key && cat.displayName)
    .map((cat) => ({
      value: cat.key!,
      label: cat.displayName!,
      description: cat.short_description?.substring(0, 50) || '',
    }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        icon={Palette}
        title="Widget Playground"
        description="Preview and customize all widget components with live data"
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar - Widget Selection (Sticky) */}
        <div className="col-span-3">
          <div className="sticky top-32 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Select Widget
            </h3>

            <div className="space-y-2">
              {WIDGETS.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => setSelectedWidget(widget)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    selectedWidget.id === widget.id
                      ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-purple-900 dark:text-purple-100'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{widget.name}</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      {widget.codeName}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {widget.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-9 space-y-4">
          {/* Widget Configuration */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Settings className="w-5 h-5" />
              <span>{selectedWidget.name} Widget Configuration</span>
              <span className="px-2 py-0.5 text-xs font-mono bg-white/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 rounded">
                {selectedWidget.codeName}
              </span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Address Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Polkadot Address
                </label>
                <AddressSelector
                  value={address}
                  onChange={setAddress}
                  placeholder="Select or add custom address"
                />
              </div>

              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <Select
                  options={themeOptions}
                  value={theme}
                  onChange={(value) =>
                    setTheme(value as 'light' | 'dark' | 'auto')
                  }
                  placeholder="Select theme"
                />
              </div>

              {/* Badge Selection (only for BadgeWidget) */}
              {selectedWidget.requiresBadge && (
                <>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Badge (Optional)
                    </label>
                    {metadataError ? (
                      <button
                        onClick={loadMetadata}
                        className="text-sm text-red-600 dark:text-red-400 hover:underline"
                      >
                        {metadataError}
                      </button>
                    ) : isLoadingMetadata ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Loading badges...
                      </p>
                    ) : badgeOptions.length > 0 ? (
                      <Select
                        options={badgeOptions}
                        value={badgeKey}
                        onChange={(value) => setBadgeKey(value as string)}
                        placeholder="Select badge (or leave empty for all)"
                        searchable
                      />
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No badges available
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Leave empty to show all badges, or select a specific badge
                    </p>
                  </div>

                  {/* Badge Widget Config Options */}
                  {!badgeKey && (
                    <div className="col-span-2 border-t border-gray-200 dark:border-gray-600 pt-4 mt-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Badge Widget Options
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Max Badges to Display
                          </label>
                          <Select
                            options={[
                              { value: '6', label: '6 badges' },
                              { value: '8', label: '8 badges' },
                              { value: '10', label: '10 badges' },
                              { value: '12', label: '12 badges' },
                              { value: '15', label: '15 badges' },
                              { value: '20', label: '20 badges (show all)' },
                            ]}
                            value={String(maxBadges)}
                            onChange={(value) => setBadgeMaxBadges(Number(value))}
                            placeholder="Select max badges"
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-3 cursor-pointer pb-2">
                            <input
                              type="checkbox"
                              checked={badgeShowProgress}
                              onChange={(e) => setBadgeShowProgress(e.target.checked)}
                              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Show earned date
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Category Selection (only for CategoryWidget) */}
              {selectedWidget.requiresCategory && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  {metadataError ? (
                    <button
                      onClick={loadMetadata}
                      className="text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      {metadataError}
                    </button>
                  ) : isLoadingMetadata ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Loading categories...
                    </p>
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

              {/* Reputation Widget Config Options */}
              {selectedWidget.id === 'reputation' && (
                <>
                  <div className="col-span-2 border-t border-gray-200 dark:border-gray-600 pt-4 mt-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Reputation Widget Options
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showCategories}
                          onChange={(e) => setShowCategories(e.target.checked)}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Show category breakdown
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={compactMode}
                          onChange={(e) => setCompactMode(e.target.checked)}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Compact mode
                        </span>
                      </label>
                    </div>
                  </div>
                  {showCategories && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Categories
                      </label>
                      <Select
                        options={[3, 4, 5, 6, 8, 10].map((n) => ({
                          value: String(n),
                          label: `${n} categories`,
                        }))}
                        value={String(maxCategories)}
                        onChange={(value) => setMaxCategories(Number(value))}
                        placeholder="Select max categories"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Category Widget Config Options */}
              {selectedWidget.id === 'category' && (
                <div className="col-span-2 border-t border-gray-200 dark:border-gray-600 pt-4 mt-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Category Widget Options
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categoryShowTitle}
                          onChange={(e) => setCategoryShowTitle(e.target.checked)}
                          disabled={categoryShowScoreOnly}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                        />
                        <span className={`text-sm ${categoryShowScoreOnly ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          Show title
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categoryShowDescription}
                          onChange={(e) => setCategoryShowDescription(e.target.checked)}
                          disabled={categoryShowScoreOnly}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                        />
                        <span className={`text-sm ${categoryShowScoreOnly ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          Show description
                        </span>
                      </label>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categoryShowBreakdown}
                          onChange={(e) => setCategoryShowBreakdown(e.target.checked)}
                          disabled={categoryShowScoreOnly}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                        />
                        <span className={`text-sm ${categoryShowScoreOnly ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          Show score breakdown
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categoryShowAdvice}
                          onChange={(e) => setCategoryShowAdvice(e.target.checked)}
                          disabled={categoryShowScoreOnly}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                        />
                        <span className={`text-sm ${categoryShowScoreOnly ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          Show tips for improvement
                        </span>
                      </label>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categoryShowScoreOnly}
                          onChange={(e) => setCategoryShowScoreOnly(e.target.checked)}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Show score only
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categoryCompactMode}
                          onChange={(e) => setCategoryCompactMode(e.target.checked)}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Compact mode
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'preview'
                      ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab('integration')}
                  className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'integration'
                      ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Integration Guide
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Preview Tab - Keep mounted, just hide when not active */}
              <div className={activeTab === 'preview' ? 'block' : 'hidden'}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Widget Preview
                    </h3>
                    <div className="flex items-center gap-2">
                      {/* Download Button - only show when widget is loaded */}
                      {isWidgetLoaded && (
                        <button
                          onClick={downloadWidgetAsPng}
                          disabled={isDownloading}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            isDownloading
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                          title="Save widget as PNG image"
                        >
                          {isDownloading ? (
                            <>
                              <Download className="w-4 h-4 animate-pulse" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Save PNG
                            </>
                          )}
                        </button>
                      )}
                      {/* Refresh/Load Button */}
                      <button
                        onClick={() => loadWidget(isWidgetLoaded)}
                        disabled={isWidgetLoading || !user?.apiKey || (selectedWidget.requiresCategory && !category)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isWidgetLoading
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        {isWidgetLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Loading...
                          </>
                        ) : isWidgetLoaded ? (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Load Preview
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Info message about manual loading */}
                  {!isWidgetLoaded && !isWidgetLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Click "Load Preview" to fetch widget data. Each load counts as 1 API request toward your quota.
                      </p>
                    </div>
                  )}

                  {/* Widget Preview Container */}
                  <div
                    className={`min-h-[400px] rounded-lg border-2 border-dashed p-6 ${
                      theme === 'dark'
                        ? 'bg-gray-900 dark:bg-black border-gray-700 dark:border-gray-600'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {/* Placeholder shown when no widget is loaded */}
                    {!isWidgetLoaded && !isWidgetLoading && (
                      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500 dark:text-gray-400">
                        <Palette className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No widget loaded</p>
                        <p className="text-sm text-center max-w-md">
                          Configure your widget settings above and click "Load Preview" to see it in action.
                        </p>
                      </div>
                    )}
                    {/* Widget container - always present for mounting */}
                    <div
                      id="widget-preview-container"
                      className={!isWidgetLoaded && !isWidgetLoading ? 'hidden' : ''}
                    ></div>
                  </div>

                  {!user?.apiKey && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        API key not found. Please check your dashboard to get
                        your API key.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Integration Guide Tab */}
              <div className={activeTab === 'integration' ? 'block' : 'hidden'}>
                <IntegrationGuidePanel
                  widgetName={selectedWidget.codeName}
                  address={address}
                  theme={theme}
                  badgeKey={selectedWidget.requiresBadge ? badgeKey : undefined}
                  categoryKey={
                    selectedWidget.requiresCategory ? category : undefined
                  }
                  showCategories={selectedWidget.id === 'reputation' ? showCategories : undefined}
                  maxCategories={selectedWidget.id === 'reputation' ? maxCategories : undefined}
                  compactMode={selectedWidget.id === 'reputation' ? compactMode : undefined}
                  badgeMaxBadges={selectedWidget.id === 'badge' ? maxBadges : undefined}
                  badgeShowProgress={selectedWidget.id === 'badge' ? badgeShowProgress : undefined}
                  categoryShowTitle={selectedWidget.id === 'category' ? categoryShowTitle : undefined}
                  categoryShowDescription={selectedWidget.id === 'category' ? categoryShowDescription : undefined}
                  categoryShowBreakdown={selectedWidget.id === 'category' ? categoryShowBreakdown : undefined}
                  categoryShowAdvice={selectedWidget.id === 'category' ? categoryShowAdvice : undefined}
                  categoryShowScoreOnly={selectedWidget.id === 'category' ? categoryShowScoreOnly : undefined}
                  categoryCompactMode={selectedWidget.id === 'category' ? categoryCompactMode : undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
