import { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { copyToClipboard } from '../utils/helpers';

interface CodeSnippetProps {
  code: string;
  language?: string;
  title?: string;
}

export const CodeSnippet = ({ code, language = 'typescript', title }: CodeSnippetProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="card" style={{ position: 'relative', backgroundColor: '#1e1e1e' }}>
      {title && (
        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#2d2d2d',
          color: '#ccc',
          fontSize: '0.85rem',
          fontWeight: 500,
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          marginBottom: '0.5rem'
        }}>
          {title}
        </div>
      )}

      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: title ? '3rem' : '1rem',
          right: '1rem',
          padding: '0.4rem 0.8rem',
          fontSize: '0.75rem',
          backgroundColor: copied ? 'var(--success)' : '#444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        {copied ? '✓ Copied!' : 'Copy'}
      </button>

      <Highlight theme={themes.vsDark} code={code.trim()} language={language as any}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={className}
            style={{
              ...style,
              padding: '1rem',
              margin: 0,
              overflow: 'auto',
              fontSize: '0.85rem',
              lineHeight: '1.5',
              borderRadius: title ? '0 0 8px 8px' : '8px'
            }}
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
