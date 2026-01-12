import { useEffect, useRef } from 'react';
import { useSDKClient } from '../hooks/useSDKClient';
import { ControlPanel } from '../components/ControlPanel';
import { createWidget } from '@dotpassport/sdk';

export const WidgetsOverview = () => {
  const { apiKey, address } = useSDKClient();
  const reputationRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!apiKey || !address) return;

    const widgets: any[] = [];

    if (reputationRef.current) {
      const w1 = createWidget({ type: 'reputation', apiKey, address, baseUrl: 'http://localhost:4000', theme: 'light' });
      w1.mount(reputationRef.current);
      widgets.push(w1);
    }

    if (badgeRef.current) {
      const w2 = createWidget({ type: 'badges', apiKey, address, baseUrl: 'http://localhost:4000', theme: 'light', maxBadges: 4 });
      w2.mount(badgeRef.current);
      widgets.push(w2);
    }

    if (profileRef.current) {
      const w3 = createWidget({ type: 'profile', apiKey, address, baseUrl: 'http://localhost:4000', theme: 'light' });
      w3.mount(profileRef.current);
      widgets.push(w3);
    }

    if (categoryRef.current) {
      const w4 = createWidget({ type: 'category', apiKey, address, categoryKey: 'longevity', baseUrl: 'http://localhost:4000', theme: 'light' });
      w4.mount(categoryRef.current);
      widgets.push(w4);
    }

    return () => {
      widgets.forEach(w => w.destroy());
    };
  }, [apiKey, address]);

  return (
    <div>
      <h1>Widgets Overview</h1>
      <p>All 4 widget types displayed side-by-side.</p>

      <ControlPanel />

      {apiKey && address && (
        <div className="grid grid-2">
          <div className="card">
            <h3>Reputation Widget</h3>
            <div ref={reputationRef} className="widget-container"></div>
          </div>

          <div className="card">
            <h3>Badge Widget</h3>
            <div ref={badgeRef} className="widget-container"></div>
          </div>

          <div className="card">
            <h3>Profile Widget</h3>
            <div ref={profileRef} className="widget-container"></div>
          </div>

          <div className="card">
            <h3>Category Widget</h3>
            <div ref={categoryRef} className="widget-container"></div>
          </div>
        </div>
      )}
    </div>
  );
};
