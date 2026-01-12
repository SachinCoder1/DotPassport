import { useEffect, useRef } from 'react';
import { useSDKClient } from '../hooks/useSDKClient';
import { ControlPanel } from '../components/ControlPanel';
import { ScreenshotFrame } from '../components/ScreenshotFrame';
import { createWidget } from '@dotpassport/sdk';

export const ScreenshotGallery = () => {
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
      <h1>Screenshot Gallery</h1>
      <p>Download high-quality screenshots of all widgets for documentation.</p>

      <ControlPanel />

      {apiKey && address && (
        <div>
          <ScreenshotFrame title="Reputation Widget - Light Theme" id="reputation-screenshot">
            <div ref={reputationRef}></div>
          </ScreenshotFrame>

          <ScreenshotFrame title="Badge Widget - Light Theme" id="badge-screenshot">
            <div ref={badgeRef}></div>
          </ScreenshotFrame>

          <ScreenshotFrame title="Profile Widget - Light Theme" id="profile-screenshot">
            <div ref={profileRef}></div>
          </ScreenshotFrame>

          <ScreenshotFrame title="Category Widget - Light Theme" id="category-screenshot">
            <div ref={categoryRef}></div>
          </ScreenshotFrame>
        </div>
      )}
    </div>
  );
};
