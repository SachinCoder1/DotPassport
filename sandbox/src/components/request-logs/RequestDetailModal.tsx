import { useState } from 'react';
import { X, Copy, Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Highlight, themes } from 'prism-react-renderer';

interface RequestLog {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  statusCode: number;
  requestHeaders?: Record<string, string>;
  requestBody?: unknown;
  responseHeaders?: Record<string, string>;
  responseBody?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

interface RequestDetailModalProps {
  log: RequestLog | null;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'request' | 'response';

export function RequestDetailModal({
  log,
  isOpen,
  onClose,
}: RequestDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!log) return null;

  const copyToClipboard = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getStatusColor = (status: number): string => {
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400';
    if (status >= 300 && status < 400) return 'text-blue-600 dark:text-blue-400';
    if (status >= 400 && status < 500) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusBgColor = (status: number): string => {
    if (status >= 200 && status < 300) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    if (status >= 300 && status < 400) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    if (status >= 400 && status < 500) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
  };

  const getMethodBgColor = (method: string): string => {
    if (method === 'GET') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    if (method === 'POST') return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    if (method === 'PUT') return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Info },
    { id: 'request' as const, label: 'Request' },
    { id: 'response' as const, label: 'Response' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-4">
                <div className={`text-3xl font-bold ${getStatusColor(log.statusCode)}`}>
                  {log.statusCode}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded ${getMethodBgColor(
                        log.method
                      )}`}
                    >
                      {log.method}
                    </span>
                    <code className="text-sm font-mono text-gray-900 dark:text-white">
                      {log.endpoint}
                    </code>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab.icon && <tab.icon className="w-4 h-4" />}
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Status</div>
                      <div className={`text-2xl font-bold ${getStatusColor(log.statusCode)}`}>
                        {log.statusCode}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {log.statusCode >= 200 && log.statusCode < 300
                          ? 'Success'
                          : log.statusCode >= 400 && log.statusCode < 500
                          ? 'Client Error'
                          : log.statusCode >= 500
                          ? 'Server Error'
                          : 'Redirect'}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Timestamp</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Request Summary */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      Request Summary
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Method</span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getStatusBgColor(log.statusCode)}`}>
                          {log.method}
                        </span>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Endpoint</span>
                        <code className="text-sm font-mono text-gray-900 dark:text-white text-right">
                          {log.endpoint}
                        </code>
                      </div>
                      {log.ipAddress && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">IP Address</span>
                          <code className="text-sm font-mono text-gray-900 dark:text-white">
                            {log.ipAddress}
                          </code>
                        </div>
                      )}
                      {log.userAgent && (
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">User Agent</span>
                          <span className="text-sm text-gray-900 dark:text-white text-right max-w-md">
                            {log.userAgent}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'request' && (
                <div className="space-y-6">
                  {/* Request Headers */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Request Headers</h3>
                      {log.requestHeaders && (
                        <button
                          onClick={() =>
                            copyToClipboard(JSON.stringify(log.requestHeaders, null, 2), 'request-headers')
                          }
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        >
                          {copiedSection === 'request-headers' ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {log.requestHeaders && Object.keys(log.requestHeaders).length > 0 ? (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2 border border-gray-200 dark:border-gray-700">
                        {Object.entries(log.requestHeaders).map(([key, value]) => (
                          <div key={key} className="flex items-start gap-4 text-sm">
                            <code className="font-mono text-purple-600 dark:text-purple-400 min-w-[200px]">
                              {key}:
                            </code>
                            <code className="font-mono text-gray-900 dark:text-white flex-1">
                              {value}
                            </code>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No headers available</p>
                    )}
                  </div>

                  {/* Request Body */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Request Body</h3>
                      {log.requestBody !== undefined && log.requestBody !== null && (
                        <button
                          onClick={() =>
                            copyToClipboard(JSON.stringify(log.requestBody, null, 2), 'request-body')
                          }
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        >
                          {copiedSection === 'request-body' ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {log.requestBody ? (
                      <Highlight
                        theme={themes.vsDark}
                        code={JSON.stringify(log.requestBody, null, 2)}
                        language="json"
                      >
                        {({ className, style, tokens, getLineProps, getTokenProps }) => (
                          <pre
                            className={`${className} p-4 rounded-lg text-sm overflow-auto`}
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
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No request body</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'response' && (
                <div className="space-y-6">
                  {/* Response Headers */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Response Headers</h3>
                      {log.responseHeaders && (
                        <button
                          onClick={() =>
                            copyToClipboard(JSON.stringify(log.responseHeaders, null, 2), 'response-headers')
                          }
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        >
                          {copiedSection === 'response-headers' ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {log.responseHeaders && Object.keys(log.responseHeaders).length > 0 ? (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2 border border-gray-200 dark:border-gray-700">
                        {Object.entries(log.responseHeaders).map(([key, value]) => (
                          <div key={key} className="flex items-start gap-4 text-sm">
                            <code className="font-mono text-purple-600 dark:text-purple-400 min-w-[200px]">
                              {key}:
                            </code>
                            <code className="font-mono text-gray-900 dark:text-white flex-1">
                              {value}
                            </code>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No headers available</p>
                    )}
                  </div>

                  {/* Response Body */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Response Body</h3>
                      {log.responseBody !== undefined && log.responseBody !== null && (
                        <button
                          onClick={() =>
                            copyToClipboard(JSON.stringify(log.responseBody, null, 2), 'response-body')
                          }
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        >
                          {copiedSection === 'response-body' ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {log.responseBody ? (
                      <Highlight
                        theme={themes.vsDark}
                        code={JSON.stringify(log.responseBody, null, 2)}
                        language="json"
                      >
                        {({ className, style, tokens, getLineProps, getTokenProps }) => (
                          <pre
                            className={`${className} p-4 rounded-lg text-sm overflow-auto`}
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
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No response body</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
