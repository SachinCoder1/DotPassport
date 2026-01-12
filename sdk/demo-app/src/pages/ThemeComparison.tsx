import { useEffect, useRef } from 'react';
import { useSDKClient } from '../hooks/useSDKClient';
import { ControlPanel } from '../components/ControlPanel';
import { createWidget } from '@dotpassport/sdk';

export const ThemeComparison = () => {
  const { apiKey, address } = useSDKClient();
  const lightRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!apiKey || !address) return;

    const widgets: any[] = [];

    if (lightRef.current) {
      const w1 = createWidget({ type: 'reputation', apiKey, address, baseUrl: 'http://localhost:4000', theme: 'light' });
      w1.mount(lightRef.current);
      widgets.push(w1);
    }

    if (darkRef.current) {
      const w2 = createWidget({ type: 'reputation', apiKey, address, baseUrl: 'http://localhost:4000', theme: 'dark' });
      w2.mount(darkRef.current);
      widgets.push(w2);
    }

    return () => {
      widgets.forEach(w => w.destroy());
    };
  }, [apiKey, address]);

  return (
    <div>
      <h1>Theme Comparison</h1>
      <p>Compare light and dark themes side-by-side.</p>

      <ControlPanel />

      {apiKey && address && (
        <div className="grid grid-2">
          <div className="card">
            <h3>Light Theme</h3>
            <div ref={lightRef} className="widget-container" style={{ backgroundColor: 'white' }}></div>
          </div>

          <div className="card" style={{ backgroundColor: '#1a1a1a' }}>
            <h3 style={{ color: 'white' }}>Dark Theme</h3>
            <div ref={darkRef} className="widget-container" style={{ backgroundColor: '#1a1a1a' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};
