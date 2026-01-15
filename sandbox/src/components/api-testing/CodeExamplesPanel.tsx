import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { SDKMethod } from '../../types/api-schemas';

interface CodeExamplesPanelProps {
  method: SDKMethod;
  address?: string;
  category?: string;
  badgeName?: string;
}

type Language = 'typescript' | 'javascript' | 'curl' | 'python';

export function CodeExamplesPanel({
  method,
  address,
  category,
  badgeName,
}: CodeExamplesPanelProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('typescript');
  const [copied, setCopied] = useState(false);

  const languages: { id: Language; name: string }[] = [
    { id: 'typescript', name: 'TypeScript' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'curl', name: 'cURL' },
    { id: 'python', name: 'Python' },
  ];

  const getParamValue = (paramName: string): string | number | boolean | undefined => {
    if (paramName === 'address' && address) return address;
    if (paramName === 'categoryId' && category) return category;
    if (paramName === 'badgeId' && badgeName) return badgeName;

    const param = method.parameters.find((p) => p.name === paramName);
    return param?.example || param?.default;
  };

  const generateCode = (language: Language): string => {
    const baseUrl = 'https://api.dotpassport.io';
    let endpoint = method.endpoint;

    // Replace path parameters in endpoint (e.g., :address, :badgeKey)
    const pathParams = method.parameters.filter((p) => p.description.includes('path parameter'));
    pathParams.forEach((param) => {
      const value = getParamValue(param.name);
      if (value !== undefined) {
        endpoint = endpoint.replace(`:${param.name}`, String(value));
      }
    });

    // Build query parameters (non-path parameters)
    const queryParams = method.parameters
      .filter((p) => !p.description.includes('path parameter') && getParamValue(p.name) !== undefined)
      .map(
        (p) => `${p.name}=${encodeURIComponent(String(getParamValue(p.name)))}`
      )
      .join('&');

    const fullUrl = queryParams
      ? `${baseUrl}${endpoint}?${queryParams}`
      : `${baseUrl}${endpoint}`;

    switch (language) {
      case 'typescript':
        return generateTypeScript(true);
      case 'javascript':
        return generateTypeScript(false);
      case 'curl':
        return generateCurl(fullUrl);
      case 'python':
        return generatePython(fullUrl);
      default:
        return '';
    }
  };

  const generateTypeScript = (withTypes: boolean): string => {
    const imports = withTypes
      ? `import { DotPassportClient } from '@dotpassport/sdk';\nimport type { ${method.responseSchema} } from '@dotpassport/sdk';\n\n`
      : `import { DotPassportClient } from '@dotpassport/sdk';\n\n`;

    // Build method arguments based on parameter order
    // Path parameters come first, then optional query parameters
    const pathParams = method.parameters.filter((p) => p.description.includes('path parameter'));
    const queryParams = method.parameters.filter((p) => !p.description.includes('path parameter'));

    const args: string[] = [];

    // Add path parameter values
    pathParams.forEach((p) => {
      const value = getParamValue(p.name);
      if (value !== undefined) {
        args.push(typeof value === 'string' ? `'${value}'` : String(value));
      }
    });

    // Add optional parameters as comments if they have non-default values
    const optionalArgs = queryParams
      .filter((p) => getParamValue(p.name) !== undefined && getParamValue(p.name) !== p.default)
      .map((p) => {
        const value = getParamValue(p.name);
        return typeof value === 'string' ? `'${value}'` : String(value);
      });

    if (optionalArgs.length > 0) {
      args.push(...optionalArgs);
    }

    const methodCall = args.length > 0 ? `client.${method.name}(${args.join(', ')})` : `client.${method.name}()`;
    const typeAnnotation = withTypes ? `: Promise<${method.responseSchema}>` : '';

    return `${imports}// Initialize the SDK client
const client = new DotPassportClient({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://api.dotpassport.io'
});

// Call the ${method.displayName} method
async function example()${typeAnnotation} {
  try {
    const response = await ${methodCall};
    console.log('Response:', response);
    return response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Execute
example();`;
  };

  const generateCurl = (url: string): string => {
    return `# Make a ${method.method} request to ${method.name}
curl -X ${method.method} '${url}' \\
  -H 'Authorization: Bearer your-api-key-here' \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: application/json'`;
  };

  const generatePython = (url: string): string => {
    const paramsDict = method.parameters
      .filter((p) => getParamValue(p.name) !== undefined)
      .map((p) => {
        const value = getParamValue(p.name);
        const formattedValue =
          typeof value === 'string' ? `'${value}'` : value;
        return `    '${p.name}': ${formattedValue}`;
      })
      .join(',\n');

    const hasParams = paramsDict.length > 0;

    return `import requests
import json

# API Configuration
API_KEY = 'your-api-key-here'
API_URL = '${url}'

# Make the request
def ${method.name}():
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

${hasParams ? `    params = {\n${paramsDict}\n    }\n` : '    params = {}\n'}
    response = requests.${method.method.toLowerCase()}(
        API_URL,
        headers=headers,
        params=params
    )

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f'API Error: {response.status_code} - {response.text}')

# Execute
try:
    result = ${method.name}()
    print(json.dumps(result, indent=2))
except Exception as e:
    print(f'Error: {e}')`;
  };

  const currentCode = generateCode(selectedLanguage);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Code Examples
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            Ready-to-use code snippets in multiple languages
          </p>
        </div>
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
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Language Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setSelectedLanguage(lang.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              selectedLanguage === lang.id
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {lang.name}
            {selectedLanguage === lang.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400" />
            )}
          </button>
        ))}
      </div>

      {/* Code Display */}
      <div className="relative">
        <SyntaxHighlighter
          language={selectedLanguage === 'curl' ? 'bash' : selectedLanguage}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            borderRadius: 0,
            background: '#1a1a1a',
          }}
          showLineNumbers={true}
          wrapLines={true}
          lineNumberStyle={{ color: '#6b7280', minWidth: '2.5em' }}
        >
          {currentCode}
        </SyntaxHighlighter>
      </div>

      {/* Footer Note */}
      <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-700">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <span className="font-semibold">Note:</span> Replace{' '}
          <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded">
            your-api-key-here
          </code>{' '}
          with your actual API key from the Settings page.
        </p>
      </div>
    </div>
  );
}
