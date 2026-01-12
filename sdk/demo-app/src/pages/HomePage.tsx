import { Link } from 'react-router-dom';
import { useSDKClient } from '../hooks/useSDKClient';
import { ControlPanel } from '../components/ControlPanel';
import { CodeSnippet } from '../components/CodeSnippet';

export const HomePage = () => {
  const { client } = useSDKClient();

  const installCode = `npm install @dotpassport/sdk`;

  const clientCode = `import { DotPassportClient } from '@dotpassport/sdk';

const client = new DotPassportClient({
  apiKey: 'your-api-key-here'
});

// Fetch user profile
const profile = await client.getProfile('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');`;

  const widgetCode = `import { createWidget } from '@dotpassport/sdk';

// Create a reputation widget
const widget = createWidget({
  type: 'reputation',
  apiKey: 'your-api-key-here',
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  theme: 'light'
});

// Mount to DOM
widget.mount(document.getElementById('widget-container'));`;

  return (
    <div>
      <h1>DotPassport SDK Demo Application</h1>

      <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
        Welcome to the comprehensive demo and testing application for the DotPassport SDK.
        This application demonstrates all features, widgets, and API methods available in the SDK.
      </p>

      <ControlPanel />

      {!client && (
        <div className="card" style={{ backgroundColor: '#fff3cd', borderColor: '#ffc107' }}>
          <h3 style={{ color: '#856404' }}>⚠️ API Key Required</h3>
          <p style={{ color: '#856404' }}>
            Please enter your DotPassport API key in the Control Panel above to start using the demo application.
          </p>
          <h4 style={{ marginTop: '1rem', color: '#856404' }}>How to Get an API Key:</h4>
          <ol style={{ color: '#856404', marginLeft: '1.5rem' }}>
            <li>Visit the <a href="https://dotpassport.com/developers" target="_blank" rel="noopener noreferrer" style={{ color: '#856404', textDecoration: 'underline' }}>DotPassport Developer Portal</a></li>
            <li>Sign up or log in to your account</li>
            <li>Navigate to API Keys section</li>
            <li>Create a new API key</li>
            <li>Copy and paste it into the Control Panel above</li>
          </ol>
        </div>
      )}

      <div className="card">
        <h2>About DotPassport SDK</h2>
        <p>
          The DotPassport SDK is a TypeScript-first library that provides both programmatic API access
          and embeddable UI widgets for displaying user reputation, badges, and profile information
          from the DotPassport platform.
        </p>

        <h3>Key Features:</h3>
        <div className="grid grid-2">
          <div className="card" style={{ backgroundColor: 'var(--surface)' }}>
            <h4>📡 API Client</h4>
            <p>Complete access to 7 API methods:</p>
            <ul style={{ marginLeft: '1.5rem', color: 'var(--text-secondary)' }}>
              <li>getProfile() - User profiles</li>
              <li>getScores() - Reputation scores</li>
              <li>getCategoryScore() - Specific categories</li>
              <li>getBadges() - User badges</li>
              <li>getBadge() - Specific badge</li>
              <li>getBadgeDefinitions() - Badge metadata</li>
              <li>getCategoryDefinitions() - Category metadata</li>
            </ul>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--surface)' }}>
            <h4>🎨 UI Widgets</h4>
            <p>4 framework-agnostic widgets:</p>
            <ul style={{ marginLeft: '1.5rem', color: 'var(--text-secondary)' }}>
              <li>ReputationWidget - Display scores</li>
              <li>BadgeWidget - Show achievements</li>
              <li>ProfileWidget - User profiles</li>
              <li>CategoryWidget - Detailed breakdown</li>
            </ul>
            <p style={{ marginTop: '0.5rem' }}>
              All widgets support light/dark/auto themes and extensive configuration.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Quick Start</h2>

        <h3>Installation</h3>
        <CodeSnippet code={installCode} language="bash" title="Install via npm" />

        <h3>Using the API Client</h3>
        <CodeSnippet code={clientCode} title="TypeScript Example" />

        <h3>Using Widgets</h3>
        <CodeSnippet code={widgetCode} title="Widget Example" />
      </div>

      <div className="card">
        <h2>Demo Navigation</h2>
        <p>Explore different sections of the SDK:</p>

        <div className="grid grid-3" style={{ marginTop: '1rem' }}>
          <Link to="/api-client" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s', backgroundColor: 'var(--surface)' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <h4 style={{ color: 'var(--primary-color)' }}>📡 API Client Demo</h4>
              <p style={{ fontSize: '0.9rem' }}>Test all 7 API methods with live data</p>
            </div>
          </Link>

          <Link to="/widgets-overview" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s', backgroundColor: 'var(--surface)' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <h4 style={{ color: 'var(--primary-color)' }}>🎨 Widgets Overview</h4>
              <p style={{ fontSize: '0.9rem' }}>See all 4 widgets side-by-side</p>
            </div>
          </Link>

          <Link to="/theme-comparison" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s', backgroundColor: 'var(--surface)' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <h4 style={{ color: 'var(--primary-color)' }}>🌓 Theme Comparison</h4>
              <p style={{ fontSize: '0.9rem' }}>Compare light/dark/auto themes</p>
            </div>
          </Link>

          <Link to="/screenshot-gallery" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s', backgroundColor: 'var(--surface)' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <h4 style={{ color: 'var(--primary-color)' }}>📸 Screenshot Gallery</h4>
              <p style={{ fontSize: '0.9rem' }}>Download screenshots for documentation</p>
            </div>
          </Link>

          <Link to="/reputation-widget" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s', backgroundColor: 'var(--surface)' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <h4 style={{ color: 'var(--primary-color)' }}>⭐ Reputation Widget</h4>
              <p style={{ fontSize: '0.9rem' }}>Detailed reputation widget demos</p>
            </div>
          </Link>

          <Link to="/badge-widget" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s', backgroundColor: 'var(--surface)' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <h4 style={{ color: 'var(--primary-color)' }}>🏆 Badge Widget</h4>
              <p style={{ fontSize: '0.9rem' }}>Explore badge widget configurations</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="card">
        <h2>Test Address</h2>
        <p>The primary test address used throughout these demos:</p>
        <div className="code-block">
          <code>5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY</code>
        </div>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          You can change the address in the Control Panel to test with different accounts.
        </p>
      </div>
    </div>
  );
};
