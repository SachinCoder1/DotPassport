import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '🏠 Home' },
    { path: '/api-client', label: 'API Client Demo' },
    { path: '/widgets-overview', label: 'Widgets Overview' },
    { path: '/reputation-widget', label: 'Reputation Widget' },
    { path: '/badge-widget', label: 'Badge Widget' },
    { path: '/profile-widget', label: 'Profile Widget' },
    { path: '/category-widget', label: 'Category Widget' },
    { path: '/theme-comparison', label: 'Theme Comparison' },
    { path: '/screenshot-gallery', label: '📸 Screenshot Gallery' }
  ];

  return (
    <div className="app-container">
      <nav
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          backgroundColor: '#2d2d2d',
          color: 'white',
          padding: '1.5rem',
          overflowY: 'auto'
        }}
      >
        <h2 style={{ margin: '0 0 2rem 0', color: 'white', fontSize: '1.25rem' }}>
          DotPassport SDK
          <br />
          <span style={{ fontSize: '0.75rem', color: '#aaa' }}>Demo Application</span>
        </h2>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {navItems.map((item) => (
            <li key={item.path} style={{ marginBottom: '0.5rem' }}>
              <Link
                to={item.path}
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  color: location.pathname === item.path ? 'white' : '#ccc',
                  backgroundColor:
                    location.pathname === item.path ? 'var(--primary-color)' : 'transparent',
                  transition: 'all 0.2s',
                  fontSize: '0.9rem'
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== item.path) {
                    e.currentTarget.style.backgroundColor = '#444';
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== item.path) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            fontSize: '0.8rem',
            color: '#aaa'
          }}
        >
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#666' }}>
            SDK Version
          </p>
          <p style={{ margin: 0, color: 'white' }}>v0.1.0</p>
        </div>
      </nav>

      <main className="main-content">{children}</main>
    </div>
  );
};
