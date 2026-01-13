import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Clock, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SchemaViewer } from './SchemaViewer';
import type { SDKMethod } from '../../types/api-schemas';

interface MethodDocumentationProps {
  method: SDKMethod;
}

export function MethodDocumentation({ method }: MethodDocumentationProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['parameters', 'response'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Profile':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'Scores':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'Badges':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300';
      case 'Definitions':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  };

  const getMethodColor = (methodType: string): string => {
    switch (methodType) {
      case 'GET':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'POST':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'PUT':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      case 'DELETE':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Method Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {method.name}
              </h2>
              <span
                className={`px-2.5 py-1 text-xs font-semibold rounded ${getCategoryColor(
                  method.category
                )}`}
              >
                {method.category}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {method.description}
            </p>
          </div>
        </div>

        {/* Endpoint */}
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono">
          <span
            className={`px-2 py-1 text-xs font-bold rounded ${getMethodColor(
              method.method
            )}`}
          >
            {method.method}
          </span>
          <code className="text-sm text-gray-900 dark:text-white">
            {method.endpoint}
          </code>
        </div>

        {/* Rate Limit Info */}
        <div className="flex items-center gap-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{method.rateLimitInfo}</span>
        </div>
      </motion.div>

      {/* Parameters Section */}
      <CollapsibleSection
        title="Parameters"
        icon={<Code2 className="w-4 h-4" />}
        isExpanded={expandedSections.has('parameters')}
        onToggle={() => toggleSection('parameters')}
        badge={method.parameters.length.toString()}
      >
        {method.parameters.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No parameters required.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Required
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Example
                  </th>
                </tr>
              </thead>
              <tbody>
                {method.parameters.map((param, index) => (
                  <tr
                    key={param.name}
                    className={`border-b border-gray-100 dark:border-gray-700 ${
                      index % 2 === 0
                        ? 'bg-gray-50/50 dark:bg-gray-900/50'
                        : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <code className="text-sm font-mono text-purple-600 dark:text-purple-400">
                        {param.name}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-sm font-mono text-blue-600 dark:text-blue-400">
                        {param.type}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          param.required
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            : 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {param.required ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {param.description}
                      {param.default !== undefined && (
                        <span className="block mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Default: <code>{String(param.default)}</code>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {param.example !== undefined && (
                        <code className="text-xs text-gray-600 dark:text-gray-400">
                          {typeof param.example === 'string'
                            ? `"${param.example}"`
                            : String(param.example)}
                        </code>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CollapsibleSection>

      {/* Response Schema Section */}
      <CollapsibleSection
        title="Response Schema"
        icon={<Code2 className="w-4 h-4" />}
        isExpanded={expandedSections.has('response')}
        onToggle={() => toggleSection('response')}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Returns:{' '}
            <code className="font-mono text-purple-600 dark:text-purple-400">
              {method.responseSchema}
            </code>
          </p>
          <SchemaViewer
            schema={convertExampleToSchema(method.exampleResponse)}
            title={method.responseSchema}
            showCopyButton={true}
          />
        </div>
      </CollapsibleSection>

      {/* Example Response Section */}
      <CollapsibleSection
        title="Example Response"
        icon={<Code2 className="w-4 h-4" />}
        isExpanded={expandedSections.has('example')}
        onToggle={() => toggleSection('example')}
      >
        <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-100 font-mono">
            {JSON.stringify(method.exampleResponse, null, 2)}
          </pre>
        </div>
      </CollapsibleSection>

      {/* Error Codes Section */}
      {method.errors && method.errors.length > 0 && (
        <CollapsibleSection
          title="Possible Errors"
          icon={<AlertCircle className="w-4 h-4" />}
          isExpanded={expandedSections.has('errors')}
          onToggle={() => toggleSection('errors')}
          badge={method.errors.length.toString()}
        >
          <div className="space-y-3">
            {method.errors.map((error) => (
              <div
                key={error.code}
                className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-12 h-8 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-mono text-sm font-bold rounded">
                    {error.code}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                    {error.message}
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  badge?: string;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  icon,
  isExpanded,
  onToggle,
  badge,
  children,
}: CollapsibleSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-600 dark:text-gray-400">{icon}</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
              {badge}
            </span>
          )}
        </div>
        <div className="text-gray-400">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Section Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-700">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Helper function to convert example response to schema format for SchemaViewer
function convertExampleToSchema(example: unknown): unknown {
  if (typeof example !== 'object' || example === null) {
    return { type: typeof example, example };
  }

  if (Array.isArray(example)) {
    return {
      type: 'array',
      items:
        example.length > 0
          ? convertExampleToSchema(example[0])
          : { type: 'any' },
    };
  }

  const schema: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(example)) {
    schema[key] = convertExampleToSchema(value);
  }
  return schema;
}
