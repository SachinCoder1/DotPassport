import { useState } from 'react';
import { useSDKClient } from '../hooks/useSDKClient';
import { ControlPanel } from '../components/ControlPanel';
import { CodeSnippet } from '../components/CodeSnippet';
import { formatJSON, downloadAsJSON, measureExecutionTime } from '../utils/helpers';

export const ApiClientDemo = () => {
  const { client, address } = useSDKClient();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [timings, setTimings] = useState<Record<string, number>>({});

  const runTest = async (methodName: string, fn: () => Promise<any>) => {
    if (!client) {
      setErrors({ ...errors, [methodName]: 'SDK client not initialized. Please enter an API key.' });
      return;
    }

    setLoading(true);
    setErrors({ ...errors, [methodName]: '' });

    try {
      const { result, executionTime } = await measureExecutionTime(fn);
      setResults({ ...results, [methodName]: result });
      setTimings({ ...timings, [methodName]: executionTime });
    } catch (error: any) {
      setErrors({ ...errors, [methodName]: error.message || 'Unknown error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    if (!client || !address) return;

    setLoading(true);
    const allResults: Record<string, any> = {};
    const allErrors: Record<string, string> = {};
    const allTimings: Record<string, number> = {};

    const tests = [
      { name: 'getProfile', fn: () => client.getProfile(address) },
      { name: 'getScores', fn: () => client.getScores(address) },
      { name: 'getBadges', fn: () => client.getBadges(address) },
      { name: 'getBadgeDefinitions', fn: () => client.getBadgeDefinitions() },
      { name: 'getCategoryDefinitions', fn: () => client.getCategoryDefinitions() }
    ];

    for (const test of tests) {
      try {
        const { result, executionTime } = await measureExecutionTime(test.fn as () => Promise<any>);
        allResults[test.name] = result;
        allTimings[test.name] = executionTime;
      } catch (error: any) {
        allErrors[test.name] = error.message || 'Unknown error';
      }
    }

    setResults(allResults);
    setErrors(allErrors);
    setTimings(allTimings);
    setLoading(false);
  };

  const renderResult = (methodName: string, data: any) => {
    if (errors[methodName]) {
      return (
        <div className="error-message">
          <strong>Error:</strong> {errors[methodName]}
        </div>
      );
    }

    if (!data) return null;

    return (
      <div>
        <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
          <span className="badge" style={{ backgroundColor: 'var(--success)' }}>
            ✓ Success {timings[methodName] && `(${timings[methodName].toFixed(2)}ms)`}
          </span>
          <button
            className="secondary"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
            onClick={() => downloadAsJSON(data, `${methodName}-result`)}
          >
            Download JSON
          </button>
        </div>
        <div className="json-viewer">
          <pre>{formatJSON(data)}</pre>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1>API Client Demo</h1>
      <p>Test all 7 API methods of the DotPassport SDK client.</p>

      <ControlPanel />

      {!client && (
        <div className="error-message">
          Please enter an API key in the Control Panel above to test the API client.
        </div>
      )}

      {client && (
        <>
          <div className="card">
            <div className="flex justify-between items-center">
              <h3>Quick Actions</h3>
              <div className="flex" style={{ gap: '0.5rem' }}>
                <button onClick={runAllTests} disabled={loading || !address}>
                  {loading ? 'Running...' : 'Run All Tests'}
                </button>
                <button
                  className="secondary"
                  onClick={() => {
                    setResults({});
                    setErrors({});
                    setTimings({});
                  }}
                >
                  Clear Results
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>1. getProfile(address)</h3>
            <p>Get user profile with social links and identities.</p>
            <CodeSnippet
              code={`const profile = await client.getProfile('${address}');`}
            />
            <button
              onClick={() => runTest('getProfile', () => client.getProfile(address))}
              disabled={loading || !address}
              style={{ marginTop: '0.5rem' }}
            >
              Test getProfile()
            </button>
            {(results.getProfile || errors.getProfile) && (
              <div style={{ marginTop: '1rem' }}>
                {renderResult('getProfile', results.getProfile)}
              </div>
            )}
          </div>

          <div className="card">
            <h3>2. getScores(address)</h3>
            <p>Get all reputation scores and category breakdown.</p>
            <CodeSnippet
              code={`const scores = await client.getScores('${address}');`}
            />
            <button
              onClick={() => runTest('getScores', () => client.getScores(address))}
              disabled={loading || !address}
              style={{ marginTop: '0.5rem' }}
            >
              Test getScores()
            </button>
            {(results.getScores || errors.getScores) && (
              <div style={{ marginTop: '1rem' }}>
                {renderResult('getScores', results.getScores)}
              </div>
            )}
          </div>

          <div className="card">
            <h3>3. getCategoryScore(address, categoryKey)</h3>
            <p>Get specific category score details.</p>
            <CodeSnippet
              code={`const categoryScore = await client.getCategoryScore('${address}', 'longevity');`}
            />
            <div className="flex" style={{ gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {['longevity', 'txCount', 'governance', 'staking'].map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    runTest(`getCategoryScore_${category}`, () =>
                      client.getCategoryScore(address, category)
                    )
                  }
                  disabled={loading || !address}
                  className="secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Test "{category}"
                </button>
              ))}
            </div>
            {Object.keys(results).filter(k => k.startsWith('getCategoryScore_')).map(key => {
              const category = key.replace('getCategoryScore_', '');
              return (
                <div key={key} style={{ marginTop: '1rem' }}>
                  <h4>Category: {category}</h4>
                  {renderResult(key, results[key])}
                </div>
              );
            })}
          </div>

          <div className="card">
            <h3>4. getBadges(address)</h3>
            <p>Get all badges earned by the user.</p>
            <CodeSnippet
              code={`const badges = await client.getBadges('${address}');`}
            />
            <button
              onClick={() => runTest('getBadges', () => client.getBadges(address))}
              disabled={loading || !address}
              style={{ marginTop: '0.5rem' }}
            >
              Test getBadges()
            </button>
            {(results.getBadges || errors.getBadges) && (
              <div style={{ marginTop: '1rem' }}>
                {renderResult('getBadges', results.getBadges)}
              </div>
            )}
          </div>

          <div className="card">
            <h3>5. getBadge(address, badgeKey)</h3>
            <p>Get specific badge details for a user.</p>
            <CodeSnippet
              code={`const badge = await client.getBadge('${address}', 'relay_chain_initiate');`}
            />
            <button
              onClick={() =>
                runTest('getBadge', () =>
                  client.getBadge(address, 'relay_chain_initiate')
                )
              }
              disabled={loading || !address}
              style={{ marginTop: '0.5rem' }}
            >
              Test getBadge()
            </button>
            {(results.getBadge || errors.getBadge) && (
              <div style={{ marginTop: '1rem' }}>
                {renderResult('getBadge', results.getBadge)}
              </div>
            )}
          </div>

          <div className="card">
            <h3>6. getBadgeDefinitions()</h3>
            <p>Get all badge metadata and definitions.</p>
            <CodeSnippet
              code={`const badgeDefinitions = await client.getBadgeDefinitions();`}
            />
            <button
              onClick={() => runTest('getBadgeDefinitions', () => client.getBadgeDefinitions())}
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              Test getBadgeDefinitions()
            </button>
            {(results.getBadgeDefinitions || errors.getBadgeDefinitions) && (
              <div style={{ marginTop: '1rem' }}>
                {renderResult('getBadgeDefinitions', results.getBadgeDefinitions)}
              </div>
            )}
          </div>

          <div className="card">
            <h3>7. getCategoryDefinitions()</h3>
            <p>Get all category metadata and definitions.</p>
            <CodeSnippet
              code={`const categoryDefinitions = await client.getCategoryDefinitions();`}
            />
            <button
              onClick={() => runTest('getCategoryDefinitions', () => client.getCategoryDefinitions())}
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              Test getCategoryDefinitions()
            </button>
            {(results.getCategoryDefinitions || errors.getCategoryDefinitions) && (
              <div style={{ marginTop: '1rem' }}>
                {renderResult('getCategoryDefinitions', results.getCategoryDefinitions)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
