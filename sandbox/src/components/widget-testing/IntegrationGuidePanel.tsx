import { Book, Package, Code, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';

interface IntegrationGuidePanelProps {
  widgetName: string;
  address: string;
  theme: string;
  badgeKey?: string;
  categoryKey?: string;
  // Reputation widget options
  showCategories?: boolean;
  maxCategories?: number;
  compactMode?: boolean;
  // Badge widget options
  badgeMaxBadges?: number;
  badgeShowProgress?: boolean;
  // Category widget options
  categoryShowTitle?: boolean;
  categoryShowDescription?: boolean;
  categoryShowBreakdown?: boolean;
  categoryShowAdvice?: boolean;
  categoryShowScoreOnly?: boolean;
  categoryCompactMode?: boolean;
}

export function IntegrationGuidePanel({
  widgetName,
  address,
  theme,
  badgeKey,
  categoryKey,
  showCategories = true,
  maxCategories = 6,
  compactMode = false,
  badgeMaxBadges = 20,
  badgeShowProgress = true,
  categoryShowTitle = true,
  categoryShowDescription = true,
  categoryShowBreakdown = true,
  categoryShowAdvice = true,
  categoryShowScoreOnly = false,
  categoryCompactMode = false,
}: IntegrationGuidePanelProps) {
  const [activeSection, setActiveSection] = useState<
    'install' | 'import' | 'usage' | 'props' | 'troubleshoot'
  >('install');

  const getPropsTable = () => {
    const baseProps = [
      {
        name: 'address',
        type: 'string',
        required: true,
        description: 'Polkadot SS58 address to display data for',
      },
      {
        name: 'apiKey',
        type: 'string',
        required: true,
        description: 'Your DotPassport API key',
      },
      {
        name: 'theme',
        type: "'light' | 'dark' | 'auto'",
        required: false,
        description: 'Widget theme (default: auto)',
      },
      {
        name: 'baseUrl',
        type: 'string',
        required: false,
        description: 'Custom API base URL (default: production)',
      },
    ];

    if (widgetName === 'BadgeWidget') {
      baseProps.push(
        {
          name: 'badgeKey',
          type: 'string',
          required: false,
          description: 'Specific badge key to display (omit to show all badges)',
        },
        {
          name: 'maxBadges',
          type: 'number',
          required: false,
          description: 'Maximum badges to display (default: 6)',
        },
        {
          name: 'showProgress',
          type: 'boolean',
          required: false,
          description: 'Show earned date for badges (default: false)',
        }
      );
    }

    if (widgetName === 'CategoryWidget') {
      baseProps.push({
        name: 'categoryKey',
        type: 'string',
        required: true,
        description: 'Category key to display scores for',
      });
    }

    if (widgetName === 'ReputationWidget') {
      baseProps.push(
        {
          name: 'showCategories',
          type: 'boolean',
          required: false,
          description: 'Show category breakdown (default: true)',
        },
        {
          name: 'maxCategories',
          type: 'number',
          required: false,
          description: 'Maximum categories to display (default: 6)',
        },
        {
          name: 'compact',
          type: 'boolean',
          required: false,
          description: 'Use compact layout (default: false)',
        }
      );
    }

    if (widgetName === 'CategoryWidget') {
      baseProps.push(
        {
          name: 'showTitle',
          type: 'boolean',
          required: false,
          description: 'Show category title (default: true)',
        },
        {
          name: 'showDescription',
          type: 'boolean',
          required: false,
          description: 'Show category description (default: true)',
        },
        {
          name: 'showBreakdown',
          type: 'boolean',
          required: false,
          description: 'Show score breakdown details (default: true)',
        },
        {
          name: 'showAdvice',
          type: 'boolean',
          required: false,
          description: 'Show tips for improvement (default: true)',
        },
        {
          name: 'showScoreOnly',
          type: 'boolean',
          required: false,
          description: 'Show only the score and label (default: false)',
        },
        {
          name: 'compact',
          type: 'boolean',
          required: false,
          description: 'Use compact layout (default: false)',
        }
      );
    }

    return baseProps;
  };

  const getUsageCode = () => {
    let propsCode = `address="${address}"
      apiKey="your-api-key-here"
      theme="${theme}"`;

    if (widgetName === 'BadgeWidget') {
      if (badgeKey) {
        propsCode += `\n      badgeKey="${badgeKey}"`;
      } else {
        // Only show these options when showing all badges (not single badge)
        if (badgeMaxBadges !== 20) {
          propsCode += `\n      maxBadges={${badgeMaxBadges}}`;
        }
        if (badgeShowProgress) {
          propsCode += `\n      showProgress={true}`;
        }
      }
    }

    if (widgetName === 'CategoryWidget' && categoryKey) {
      propsCode += `\n      categoryKey="${categoryKey}"`;
    }

    if (widgetName === 'ReputationWidget') {
      propsCode += `\n      showCategories={${showCategories}}`;
      if (showCategories && maxCategories !== 6) {
        propsCode += `\n      maxCategories={${maxCategories}}`;
      }
      if (compactMode) {
        propsCode += `\n      compact={true}`;
      }
    }

    if (widgetName === 'CategoryWidget') {
      if (categoryShowScoreOnly) {
        propsCode += `\n      showScoreOnly={true}`;
      } else {
        if (!categoryShowTitle) {
          propsCode += `\n      showTitle={false}`;
        }
        if (!categoryShowDescription) {
          propsCode += `\n      showDescription={false}`;
        }
        if (!categoryShowBreakdown) {
          propsCode += `\n      showBreakdown={false}`;
        }
        if (!categoryShowAdvice) {
          propsCode += `\n      showAdvice={false}`;
        }
      }
      if (categoryCompactMode) {
        propsCode += `\n      compact={true}`;
      }
    }

    return `import { ${widgetName} } from '@dotpassport/sdk';

function MyApp() {
  return (
    <${widgetName}
      ${propsCode}
    />
  );
}`;
  };

  const sections = [
    { id: 'install' as const, label: 'Install', icon: Package },
    { id: 'import' as const, label: 'Import', icon: Code },
    { id: 'usage' as const, label: 'Usage', icon: Book },
    { id: 'props' as const, label: 'Props', icon: Code },
    { id: 'troubleshoot' as const, label: 'Troubleshoot', icon: AlertCircle },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex overflow-x-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeSection === section.id
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeSection === 'install' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Step 1: Install the SDK
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Add the DotPassport SDK to your project using npm or yarn:
              </p>
              <div className="bg-gray-900 rounded-lg p-4">
                <Highlight
                  theme={themes.vsDark}
                  code="npm install @dotpassport/sdk"
                  language="bash"
                >
                  {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre
                      className={`${className} m-0 bg-transparent p-0`}
                      style={style}
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

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Requirements</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Node.js 16+ or modern browser</li>
                    <li>React 16.8+ (for React widgets)</li>
                    <li>TypeScript 4.5+ (recommended)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'import' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Step 2: Import the Widget
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Import the {widgetName} from the SDK package:
              </p>
              <div className="bg-gray-900 rounded-lg p-4">
                <Highlight
                  theme={themes.vsDark}
                  code={`import { ${widgetName} } from '@dotpassport/sdk';`}
                  language="typescript"
                >
                  {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre
                      className={`${className} m-0 bg-transparent p-0`}
                      style={style}
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

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                TypeScript Support
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                The SDK includes full TypeScript definitions. Import types as needed:
              </p>
              <div className="bg-gray-900 rounded-lg p-4">
                <Highlight
                  theme={themes.vsDark}
                  code={`import { ${widgetName}, type ${widgetName}Props } from '@dotpassport/sdk';`}
                  language="typescript"
                >
                  {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre
                      className={`${className} m-0 bg-transparent p-0`}
                      style={style}
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
          </div>
        )}

        {activeSection === 'usage' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Step 3: Use in Your App
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Add the widget to your React component with the current configuration:
              </p>
              <div className="bg-gray-900 rounded-lg p-4">
                <Highlight
                  theme={themes.vsDark}
                  code={getUsageCode()}
                  language="tsx"
                >
                  {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre
                      className={`${className} m-0 bg-transparent p-0`}
                      style={style}
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

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Code className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div className="text-sm text-purple-800 dark:text-purple-200">
                  <p className="font-medium mb-1">Vanilla JavaScript</p>
                  <p>
                    The SDK also supports vanilla JavaScript. Import the widget class and call{' '}
                    <code className="bg-purple-100 dark:bg-purple-800 px-1 rounded">
                      mount(element)
                    </code>{' '}
                    to render.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'props' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Props Reference
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Complete list of props for {widgetName}:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                        Prop
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                        Type
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                        Required
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {getPropsTable().map((prop) => (
                      <tr key={prop.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">
                          {prop.name}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                          {prop.type}
                        </td>
                        <td className="px-4 py-3">
                          {prop.required ? (
                            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                              Required
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                              Optional
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {prop.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'troubleshoot' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Common Issues & Solutions
              </h3>
            </div>

            <div className="space-y-3">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Widget not loading or showing blank
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Verify your API key is correct and active</li>
                  <li>Check browser console for error messages</li>
                  <li>Ensure the address parameter is a valid Polkadot SS58 address</li>
                  <li>Check that CORS is properly configured if using custom baseUrl</li>
                </ul>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Styling conflicts with your app
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Widgets use shadow DOM to avoid style conflicts</li>
                  <li>Use the theme prop to match your app's theme</li>
                  <li>Custom CSS variables are respected within the widget</li>
                </ul>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Rate limit errors
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Check your rate limit usage in the Dashboard</li>
                  <li>Implement caching to reduce API calls</li>
                  <li>Consider upgrading your tier for higher limits</li>
                </ul>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  TypeScript errors
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Ensure @dotpassport/sdk is installed as a dependency</li>
                  <li>Check that your TypeScript version is 4.5 or higher</li>
                  <li>Import types explicitly: import type {'{WidgetName}Props}'} from '@dotpassport/sdk'</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium mb-1">Still having issues?</p>
                  <p>
                    Check the full documentation at{' '}
                    <a
                      href="https://docs.dotpassport.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      docs.dotpassport.com
                    </a>{' '}
                    or contact support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
