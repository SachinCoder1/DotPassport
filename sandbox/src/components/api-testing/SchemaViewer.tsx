import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SchemaViewerProps {
  schema: unknown;
  title?: string;
  showCopyButton?: boolean;
}

export function SchemaViewer({
  schema,
  title,
  showCopyButton = true,
}: SchemaViewerProps) {
  const [copied, setCopied] = useState(false);

  const generateTypeScriptInterface = (
    obj: unknown,
    interfaceName: string = 'Response'
  ): string => {
    const lines: string[] = [];

    const processObject = (
      object: Record<string, unknown>,
      name: string,
      indent: number = 0
    ) => {
      const indentation = '  '.repeat(indent);
      lines.push(`${indentation}export interface ${name} {`);

      Object.entries(object).forEach(([key, value]) => {
        const val = value as Record<string, unknown>;
        const optional = val?.required === false ? '?' : '';
        const description = val?.description ? ` // ${val.description}` : '';

        if (
          typeof value === 'object' &&
          !Array.isArray(value) &&
          value !== null
        ) {
          if (val.type === 'object' && val.properties) {
            lines.push(
              `${indentation}  ${key}${optional}: {${description}`
            );
            const props = val.properties as Record<string, unknown>;
            Object.entries(props).forEach(([subKey, subValue]) => {
              const subVal = subValue as Record<string, unknown>;
              const subOptional = subVal?.required === false ? '?' : '';
              const subType = getTypeString(subValue);
              const subDesc = subVal?.description
                ? ` // ${subVal.description}`
                : '';
              lines.push(
                `${indentation}    ${subKey}${subOptional}: ${subType};${subDesc}`
              );
            });
            lines.push(`${indentation}  };`);
          } else if (val.type === 'array') {
            const itemType = val.items ? getTypeString(val.items) : 'any';
            lines.push(
              `${indentation}  ${key}${optional}: ${itemType}[];${description}`
            );
          } else {
            const type = getTypeString(value);
            lines.push(
              `${indentation}  ${key}${optional}: ${type};${description}`
            );
          }
        }
      });

      lines.push(`${indentation}}`);
    };

    const getTypeString = (value: unknown): string => {
      const val = value as Record<string, unknown>;
      if (val?.enum) {
        return (val.enum as string[])
          .map((e: string) => `'${e}'`)
          .join(' | ');
      }

      if (val?.type === 'array') {
        const itemType = val.items ? getTypeString(val.items) : 'any';
        return `Array<${itemType}>`;
      }

      if (val?.type === 'object') {
        return 'Record<string, any>';
      }

      return (val?.type as string) || 'any';
    };

    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      processObject(obj as Record<string, unknown>, interfaceName);
    }

    return lines.join('\n');
  };

  const copyToClipboard = async () => {
    const tsInterface = generateTypeScriptInterface(
      schema,
      title || 'Response'
    );
    await navigator.clipboard.writeText(tsInterface);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {title || 'Response Schema'}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            TypeScript interface definition
          </p>
        </div>
        {showCopyButton && (
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Interface</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Schema Tree */}
      <div className="p-4">
        <SchemaTree data={schema} />
      </div>
    </div>
  );
}

interface SchemaTreeProps {
  data: unknown;
  level?: number;
}

function SchemaTree({ data, level = 0 }: SchemaTreeProps) {
  if (typeof data !== 'object' || data === null) {
    return <span className="text-gray-600 dark:text-gray-400">{String(data)}</span>;
  }

  return (
    <div className="space-y-1">
      {Object.entries(data as Record<string, unknown>).map(([key, value]) => (
        <SchemaTreeNode key={key} name={key} value={value} level={level} />
      ))}
    </div>
  );
}

interface SchemaTreeNodeProps {
  name: string;
  value: unknown;
  level: number;
}

function SchemaTreeNode({ name, value, level }: SchemaTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  const isObject =
    typeof value === 'object' && value !== null && !Array.isArray(value);
  const isArray = Array.isArray(value);

  const val = value as Record<string, unknown>;
  const isSchemaLeaf =
    isObject && val?.type && !val?.properties && !val?.items;

  const hasChildren =
    !isSchemaLeaf &&
    ((isObject && Object.keys(value as Record<string, unknown>).length > 0) ||
      (isArray && (value as unknown[]).length > 0));

  const getTypeColor = (type: string): string => {
    switch (type?.toLowerCase()) {
      case 'string':
        return 'text-blue-600 dark:text-blue-400';
      case 'number':
        return 'text-green-600 dark:text-green-400';
      case 'boolean':
        return 'text-orange-600 dark:text-orange-400';
      case 'object':
        return 'text-purple-600 dark:text-purple-400';
      case 'array':
        return 'text-pink-600 dark:text-pink-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getValueType = (v: unknown): string => {
    const value = v as Record<string, unknown>;
    if (value?.type) return value.type as string;
    if (Array.isArray(v)) return 'array';
    if (typeof v === 'object' && v !== null) return 'object';
    return typeof v;
  };

  const valueType = getValueType(value);
  const typeColor = getTypeColor(valueType);

  const isRequired = val?.required !== false;
  const description = val?.description as string | undefined;
  const example = val?.example;
  const enumValues = val?.enum as string[] | undefined;

  return (
    <div
      className="group"
      style={{ paddingLeft: `${level * 16}px` }}
    >
      {/* Node Header */}
      <div className="flex items-start gap-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 -ml-2 transition-colors">
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 mt-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}

        {/* Property Name */}
        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
          {name}
          {!isRequired && <span className="text-gray-400">?</span>}
        </span>

        {/* Colon */}
        <span className="text-gray-400">:</span>

        {/* Type */}
        <span className={`font-mono text-sm font-semibold ${typeColor}`}>
          {enumValues
            ? enumValues.map((e) => `'${e}'`).join(' | ')
            : valueType}
          {isArray && '[]'}
        </span>

        {/* Required/Optional Badge */}
        <span
          className={`px-1.5 py-0.5 text-xs font-medium rounded ${
            isRequired
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
              : 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
          }`}
        >
          {isRequired ? 'required' : 'optional'}
        </span>

        {/* Example Value */}
        {example !== undefined && (
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            e.g.,{' '}
            {typeof example === 'string' ? `"${example}"` : String(example)}
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <div className="text-xs text-gray-600 dark:text-gray-400 ml-6 mt-0.5 mb-1">
          {description}
        </div>
      )}

      {/* Children */}
      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {isObject && val?.properties !== undefined && val.properties !== null && (
              <SchemaTree data={val.properties} level={level + 1} />
            )}
            {isObject && !val?.properties && !isSchemaLeaf && (
              <SchemaTree data={value} level={level + 1} />
            )}
            {isArray && (value as unknown[]).length > 0 && (
              <div className="ml-4">
                <SchemaTree
                  data={(value as unknown[])[0]}
                  level={level + 1}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
