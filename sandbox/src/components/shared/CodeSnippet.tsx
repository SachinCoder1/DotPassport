import { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { Copy, Check } from 'lucide-react';

interface CodeSnippetProps {
  code: string;
  language?: string;
  title?: string;
}

export const CodeSnippet = ({
  code,
  language = 'typescript',
  title,
}: CodeSnippetProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {title && (
        <div className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-t-lg mb-2 border-b border-gray-200 dark:border-gray-700">
          {title}
        </div>
      )}
      <button
        onClick={handleCopy}
        className={`absolute ${
          title ? 'top-12' : 'top-4'
        } right-4 px-3 py-2 text-xs ${
          copied ? 'bg-green-600' : 'bg-gray-700 dark:bg-gray-600'
        } text-white rounded-md cursor-pointer z-10 flex items-center gap-1.5 transition-all hover:shadow-md`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>
      <Highlight
        theme={themes.vsDark}
        code={code.trim()}
        language={language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} p-4 m-0 overflow-auto text-sm leading-relaxed ${
              title ? 'rounded-b-lg' : 'rounded-lg'
            }`}
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
  );
};
