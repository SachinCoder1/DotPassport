import { useEffect, useRef } from 'react';
import { useSDKClient } from '../hooks/useSDKClient';
import { ControlPanel } from '../components/ControlPanel';
import { createWidget } from '@dotpassport/sdk';

export const ProfileWidgetDemo = () => {
  const { apiKey, address } = useSDKClient();
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!apiKey || !address || !widgetRef.current) return;

    const widget = createWidget({
      type: 'profile',
      apiKey,
      address,
      baseUrl: 'http://localhost:4000',
      theme: 'light',
      showIdentities: true,
      showSocials: true,
      showBio: true
    });

    widget.mount(widgetRef.current);

    return () => {
      widget.destroy();
    };
  }, [apiKey, address]);

  return (
    <div>
      <h1>Profile Widget Demo</h1>
      <p>Demonstrates the Profile Widget.</p>

      <ControlPanel />

      {apiKey && address && (
        <div className="card">
          <h3>Profile Widget</h3>
          <div ref={widgetRef} className="widget-container"></div>
        </div>
      )}
    </div>
  );
};
