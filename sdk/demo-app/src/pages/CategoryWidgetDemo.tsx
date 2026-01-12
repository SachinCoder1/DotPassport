import { useEffect, useRef } from 'react';
import { useSDKClient } from '../hooks/useSDKClient';
import { ControlPanel } from '../components/ControlPanel';
import { createWidget } from '@dotpassport/sdk';

export const CategoryWidgetDemo = () => {
  const { apiKey, address } = useSDKClient();
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!apiKey || !address || !widgetRef.current) return;

    const widget = createWidget({
      type: 'category',
      apiKey,
      address,
      categoryKey: 'longevity',
      baseUrl: 'http://localhost:4000',
      theme: 'light',
      showBreakdown: true,
      showAdvice: true
    });

    widget.mount(widgetRef.current);

    return () => {
      widget.destroy();
    };
  }, [apiKey, address]);

  return (
    <div>
      <h1>Category Widget Demo</h1>
      <p>Demonstrates the Category Widget with detailed breakdown.</p>

      <ControlPanel />

      {apiKey && address && (
        <div className="card">
          <h3>Category Widget (Longevity)</h3>
          <div ref={widgetRef} className="widget-container"></div>
        </div>
      )}
    </div>
  );
};
