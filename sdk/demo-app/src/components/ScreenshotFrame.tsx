import { type ReactNode, useState } from 'react';
import { downloadScreenshot } from '../utils/helpers';

interface ScreenshotFrameProps {
  children: ReactNode;
  title: string;
  id: string;
  background?: 'white' | 'dark' | 'transparent';
  padding?: number;
}

export const ScreenshotFrame = ({
  children,
  title,
  id,
  background = 'white',
  padding = 24
}: ScreenshotFrameProps) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const filename = title.toLowerCase().replace(/\s+/g, '-');
      await downloadScreenshot(id, filename);
    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('Failed to download screenshot. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const backgroundColors = {
    white: '#ffffff',
    dark: '#1a1a1a',
    transparent: 'transparent'
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: 0 }}>{title}</h4>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
        >
          {downloading ? 'Downloading...' : '📷 Download PNG'}
        </button>
      </div>

      <div
        id={id}
        style={{
          backgroundColor: backgroundColors[background],
          padding: `${padding}px`,
          borderRadius: '4px',
          border: '1px solid var(--border-color)',
          display: 'inline-block',
          minWidth: '400px'
        }}
      >
        {children}
      </div>

      <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
        Click the button above to download this as a PNG image for documentation.
      </p>
    </div>
  );
};
