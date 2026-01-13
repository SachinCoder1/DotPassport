import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './Button';
import type { ButtonProps } from './Button';

export interface CopyButtonProps extends Omit<ButtonProps, 'onClick'> {
  text: string;
  successDuration?: number;
  showText?: boolean;
  onCopy?: () => void;
}

export function CopyButton({
  text,
  successDuration = 2000,
  showText = false,
  onCopy,
  ...buttonProps
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();

      setTimeout(() => {
        setCopied(false);
      }, successDuration);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <Button
      variant={buttonProps.variant || 'ghost'}
      size={buttonProps.size || 'sm'}
      onClick={handleCopy}
      icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {...buttonProps}
    >
      {showText && (copied ? 'Copied!' : 'Copy')}
    </Button>
  );
}
