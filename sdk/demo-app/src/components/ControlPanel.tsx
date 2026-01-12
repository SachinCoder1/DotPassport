import { useSDKClient } from '../hooks/useSDKClient';
import { TEST_ADDRESSES } from '../utils/constants';

export const ControlPanel = () => {
  const { apiKey, setApiKey, address, setAddress, client } = useSDKClient();

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h3>Control Panel</h3>

      <div className="grid grid-2" style={{ marginTop: '1rem' }}>
        <div>
          <label htmlFor="api-key" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            API Key {!apiKey && <span style={{ color: 'var(--error)' }}>*Required</span>}
          </label>
          <input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your DotPassport API key"
          />
          {!apiKey && (
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--error)' }}>
              Please enter your API key to use the SDK.{' '}
              <a href="https://dotpassport.com/developers" target="_blank" rel="noopener noreferrer">
                Get API key
              </a>
            </p>
          )}
          {client && (
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--success)' }}>
              ✓ SDK Client initialized
            </p>
          )}
        </div>

        <div>
          <label htmlFor="address" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Polkadot Address
          </label>
          <select
            id="address-select"
            value={address}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setAddress('');
              } else {
                setAddress(e.target.value);
              }
            }}
            style={{ marginBottom: '0.5rem' }}
          >
            {TEST_ADDRESSES.map((addr) => (
              <option key={addr.label} value={addr.address}>
                {addr.label}
              </option>
            ))}
            <option value="custom">Custom Address...</option>
          </select>

          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter Polkadot address"
          />
        </div>
      </div>

      <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--code-bg)', borderRadius: '4px', fontSize: '0.85rem' }}>
        <strong>Current Configuration:</strong>
        <div style={{ marginTop: '0.5rem' }}>
          API Key: {apiKey ? `${'*'.repeat(20)}${apiKey.slice(-4)}` : 'Not set'}
        </div>
        <div>
          Address: {address || 'Not set'}
        </div>
      </div>
    </div>
  );
};
