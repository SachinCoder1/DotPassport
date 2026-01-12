import { useEffect, useRef } from 'react';
import { useSDKClient } from '../hooks/useSDKClient';
import { ControlPanel } from '../components/ControlPanel';
import { createWidget } from '@dotpassport/sdk';

export const ReputationWidgetDemo = () => {
  const { apiKey, address } = useSDKClient();
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!apiKey || !address || !widgetRef.current) return;

    const widget = createWidget({
      type: 'reputation',
      apiKey,
      address,
      baseUrl: 'http://localhost:4000',
      theme: 'light',
      showCategories: true,
      maxCategories: 6
    });

    widget.mount(widgetRef.current);
    widgetInstanceRef.current = widget;

    return () => {
      widget.destroy();
    };
  }, [apiKey, address]);

  return (
    <div>
      <h1>Reputation Widget Demo</h1>
      <p>Demonstrates the Reputation Widget with various configurations.</p>

      <ControlPanel />

      {!apiKey && (
        <div className="error-message">
          Please enter an API key to view widgets.
        </div>
      )}

      {apiKey && address && (
        <div className="card">
          <h3>Default Reputation Widget</h3>
          <div ref={widgetRef} className="widget-container"></div>
        </div>
      )}
    </div>
  );
};
