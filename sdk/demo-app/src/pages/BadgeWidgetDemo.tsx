import { useEffect, useRef } from 'react';
import { useSDKClient } from '../hooks/useSDKClient';
import { ControlPanel } from '../components/ControlPanel';
import { createWidget } from '@dotpassport/sdk';

export const BadgeWidgetDemo = () => {
  const { apiKey, address } = useSDKClient();
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!apiKey || !address || !widgetRef.current) return;

    const widget = createWidget({
      type: 'badges',
      apiKey,
      address,
      baseUrl: 'http://localhost:4000',
      theme: 'light',
      maxBadges: 6
    });

    widget.mount(widgetRef.current);

    return () => {
      widget.destroy();
    };
  }, [apiKey, address]);

  return (
    <div>
      <h1>Badge Widget Demo</h1>
      <p>Demonstrates the Badge Widget.</p>

      <ControlPanel />

      {apiKey && address && (
        <div className="card">
          <h3>Badges Widget</h3>
          <div ref={widgetRef} className="widget-container"></div>
        </div>
      )}
    </div>
  );
};
