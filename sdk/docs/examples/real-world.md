# Real World Examples

Complete integration examples for common use cases.

## DeFi Dashboard

A complete DeFi application with wallet connection and reputation display:

```tsx
// components/DeFiDashboard.tsx
import { useState, useEffect, useRef } from 'react';
import { createWidget, DotPassportClient } from '@dotpassport/sdk';

interface WalletState {
  address: string | null;
  isConnected: boolean;
}

export function DeFiDashboard() {
  const [wallet, setWallet] = useState<WalletState>({ address: null, isConnected: false });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [scores, setScores] = useState<any>(null);

  const reputationRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const widgetsRef = useRef<ReturnType<typeof createWidget>[]>([]);

  const client = useRef(new DotPassportClient({
    apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY
  }));

  // Connect wallet
  async function connectWallet() {
    try {
      // Using Polkadot.js extension
      const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
      const extensions = await web3Enable('My DeFi App');

      if (extensions.length === 0) {
        alert('Please install Polkadot.js extension');
        return;
      }

      const accounts = await web3Accounts();
      if (accounts.length > 0) {
        setWallet({ address: accounts[0].address, isConnected: true });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }

  // Fetch scores for eligibility check
  useEffect(() => {
    if (!wallet.address) return;

    async function fetchScores() {
      try {
        const data = await client.current.getScores(wallet.address!);
        setScores(data);
      } catch (error) {
        console.error('Failed to fetch scores:', error);
      }
    }

    fetchScores();
  }, [wallet.address]);

  // Create widgets
  useEffect(() => {
    if (!wallet.address) return;

    const apiKey = import.meta.env.VITE_DOTPASSPORT_API_KEY;

    if (reputationRef.current) {
      const w = createWidget({
        apiKey,
        address: wallet.address,
        type: 'reputation',
        theme,
        showCategories: true
      });
      w.mount(reputationRef.current);
      widgetsRef.current.push(w);
    }

    if (badgeRef.current) {
      const w = createWidget({
        apiKey,
        address: wallet.address,
        type: 'badge',
        theme,
        maxBadges: 6
      });
      w.mount(badgeRef.current);
      widgetsRef.current.push(w);
    }

    return () => {
      widgetsRef.current.forEach(w => w.destroy());
      widgetsRef.current = [];
    };
  }, [wallet.address]);

  // Update theme
  useEffect(() => {
    widgetsRef.current.forEach(w => w.update({ theme }));
  }, [theme]);

  // Eligibility check based on reputation
  const isEligibleForPremium = scores?.totalScore >= 500;
  const isEligibleForGovernance = scores?.categories?.governance?.score >= 50;

  if (!wallet.isConnected) {
    return (
      <div className="connect-prompt">
        <h1>Welcome to DeFi Dashboard</h1>
        <p>Connect your wallet to view your reputation and access features.</p>
        <button onClick={connectWallet}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div className={`dashboard ${theme}`}>
      <header>
        <h1>DeFi Dashboard</h1>
        <div className="header-controls">
          <span>{wallet.address?.slice(0, 8)}...{wallet.address?.slice(-6)}</span>
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <div className="grid">
        <section className="reputation-section">
          <h2>Your Reputation</h2>
          <div ref={reputationRef} />
        </section>

        <section className="badges-section">
          <h2>Achievements</h2>
          <div ref={badgeRef} />
        </section>

        <section className="features-section">
          <h2>Available Features</h2>

          <div className={`feature-card ${isEligibleForPremium ? 'enabled' : 'disabled'}`}>
            <h3>Premium Pools</h3>
            <p>Access high-yield liquidity pools</p>
            {isEligibleForPremium ? (
              <button>Enter Pool</button>
            ) : (
              <span>Requires 500+ reputation score</span>
            )}
          </div>

          <div className={`feature-card ${isEligibleForGovernance ? 'enabled' : 'disabled'}`}>
            <h3>Governance Voting</h3>
            <p>Participate in protocol decisions</p>
            {isEligibleForGovernance ? (
              <button>View Proposals</button>
            ) : (
              <span>Requires 50+ governance score</span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
```

---

## NFT Marketplace

Reputation-gated NFT marketplace:

```tsx
// components/NFTMarketplace.tsx
import { useState, useEffect } from 'react';
import { DotPassportClient, createWidget } from '@dotpassport/sdk';

interface NFT {
  id: string;
  name: string;
  image: string;
  price: number;
  minReputationRequired: number;
}

const FEATURED_NFTS: NFT[] = [
  { id: '1', name: 'Rare Collectible', image: '/nft1.png', price: 100, minReputationRequired: 0 },
  { id: '2', name: 'Exclusive Drop', image: '/nft2.png', price: 500, minReputationRequired: 300 },
  { id: '3', name: 'Legendary Item', image: '/nft3.png', price: 1000, minReputationRequired: 700 },
];

export function NFTMarketplace({ userAddress }: { userAddress: string }) {
  const [userScore, setUserScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const client = new DotPassportClient({
    apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY
  });

  useEffect(() => {
    async function fetchScore() {
      try {
        const scores = await client.getScores(userAddress);
        setUserScore(scores.totalScore);
      } catch (error) {
        console.error('Failed to fetch scores:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchScore();
  }, [userAddress]);

  function canPurchase(nft: NFT): boolean {
    return userScore >= nft.minReputationRequired;
  }

  return (
    <div className="marketplace">
      <header>
        <h1>NFT Marketplace</h1>
        <div className="user-reputation">
          Your Reputation: <strong>{userScore}</strong>
        </div>
      </header>

      <div className="nft-grid">
        {FEATURED_NFTS.map(nft => (
          <div key={nft.id} className="nft-card">
            <img src={nft.image} alt={nft.name} />
            <h3>{nft.name}</h3>
            <p className="price">{nft.price} DOT</p>

            {nft.minReputationRequired > 0 && (
              <p className="requirement">
                Min. Reputation: {nft.minReputationRequired}
              </p>
            )}

            {canPurchase(nft) ? (
              <button className="buy-btn">Buy Now</button>
            ) : (
              <button className="buy-btn disabled" disabled>
                Reputation Too Low
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## DAO Voting System

Reputation-weighted voting:

```tsx
// components/DAOVoting.tsx
import { useState, useEffect, useRef } from 'react';
import { DotPassportClient, createWidget } from '@dotpassport/sdk';

interface Proposal {
  id: string;
  title: string;
  description: string;
  votes: { for: number; against: number };
  deadline: Date;
}

export function DAOVoting({ userAddress }: { userAddress: string }) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [userGovernanceScore, setUserGovernanceScore] = useState(0);
  const [votingPower, setVotingPower] = useState(0);

  const widgetRef = useRef<HTMLDivElement>(null);

  const client = new DotPassportClient({
    apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch governance score
        const result = await client.getCategoryScore(userAddress, 'governance');
        const governanceScore = result.category.score.score;
        setUserGovernanceScore(governanceScore);

        // Calculate voting power (governance score * multiplier)
        setVotingPower(Math.floor(governanceScore * 10));

        // Fetch proposals from your backend
        const res = await fetch('/api/proposals');
        const data = await res.json();
        setProposals(data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    }

    fetchData();
  }, [userAddress]);

  // Create governance widget
  useEffect(() => {
    if (!widgetRef.current) return;

    const widget = createWidget({
      apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
      address: userAddress,
      type: 'category',
      categoryKey: 'governance'
    });

    widget.mount(widgetRef.current);

    return () => widget.destroy();
  }, [userAddress]);

  async function vote(proposalId: string, support: boolean) {
    if (votingPower === 0) {
      alert('You need governance reputation to vote');
      return;
    }

    try {
      await fetch(`/api/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voter: userAddress,
          support,
          weight: votingPower
        })
      });

      // Refresh proposals
      const res = await fetch('/api/proposals');
      setProposals(await res.json());
    } catch (error) {
      console.error('Vote failed:', error);
    }
  }

  return (
    <div className="dao-voting">
      <aside className="voter-info">
        <h2>Your Governance Status</h2>
        <div ref={widgetRef} />
        <div className="voting-power">
          <strong>Voting Power:</strong> {votingPower}
        </div>
      </aside>

      <main className="proposals">
        <h1>Active Proposals</h1>

        {proposals.map(proposal => (
          <div key={proposal.id} className="proposal-card">
            <h3>{proposal.title}</h3>
            <p>{proposal.description}</p>

            <div className="vote-bar">
              <div
                className="for-bar"
                style={{ width: `${(proposal.votes.for / (proposal.votes.for + proposal.votes.against || 1)) * 100}%` }}
              />
            </div>

            <div className="vote-counts">
              <span>For: {proposal.votes.for}</span>
              <span>Against: {proposal.votes.against}</span>
            </div>

            <div className="vote-buttons">
              <button
                onClick={() => vote(proposal.id, true)}
                disabled={votingPower === 0}
              >
                Vote For (+{votingPower})
              </button>
              <button
                onClick={() => vote(proposal.id, false)}
                disabled={votingPower === 0}
              >
                Vote Against (+{votingPower})
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
```

---

## Social Profile Page

User profile with reputation display:

```tsx
// pages/profile/[address].tsx (Next.js)
import { GetServerSideProps } from 'next';
import { useEffect, useRef } from 'react';
import { DotPassportClient, createWidget } from '@dotpassport/sdk';

interface ProfilePageProps {
  address: string;
  profile: any;
  scores: any;
  badges: any;
}

export default function ProfilePage({ address, profile, scores, badges }: ProfilePageProps) {
  const reputationRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_DOTPASSPORT_API_KEY!;

    const widgets: ReturnType<typeof createWidget>[] = [];

    if (reputationRef.current) {
      const w = createWidget({
        apiKey,
        address,
        type: 'reputation',
        showCategories: true
      });
      w.mount(reputationRef.current);
      widgets.push(w);
    }

    if (badgeRef.current) {
      const w = createWidget({
        apiKey,
        address,
        type: 'badge',
        maxBadges: 12
      });
      w.mount(badgeRef.current);
      widgets.push(w);
    }

    return () => widgets.forEach(w => w.destroy());
  }, [address]);

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="avatar">
          {profile.displayName?.[0] || address[0]}
        </div>
        <div className="profile-info">
          <h1>{profile.displayName || 'Anonymous'}</h1>
          <p className="address">{address}</p>
          {profile.bio && <p className="bio">{profile.bio}</p>}
          {profile.polkadotIdentities?.length > 0 && <span className="verified-badge">✓ On-chain Identity</span>}
        </div>
      </header>

      <div className="profile-stats">
        <div className="stat">
          <span className="value">{scores.totalScore}</span>
          <span className="label">Reputation</span>
        </div>
        <div className="stat">
          <span className="value">{new Date(scores.calculatedAt).toLocaleDateString()}</span>
          <span className="label">Last Updated</span>
        </div>
        <div className="stat">
          <span className="value">{badges.count}</span>
          <span className="label">Badges Earned</span>
        </div>
      </div>

      <div className="profile-widgets">
        <section>
          <h2>Reputation Breakdown</h2>
          <div ref={reputationRef} />
        </section>

        <section>
          <h2>Achievements</h2>
          <div ref={badgeRef} />
        </section>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const address = params?.address as string;

  const client = new DotPassportClient({
    apiKey: process.env.DOTPASSPORT_API_KEY!
  });

  try {
    const [profile, scores, badges] = await Promise.all([
      client.getProfile(address),
      client.getScores(address),
      client.getBadges(address)
    ]);

    return {
      props: { address, profile, scores, badges }
    };
  } catch (error) {
    return {
      notFound: true
    };
  }
};
```

---

## Leaderboard

Display top reputation holders:

```tsx
// components/Leaderboard.tsx
import { useState, useEffect, useRef } from 'react';
import { createWidget } from '@dotpassport/sdk';

interface LeaderboardEntry {
  address: string;
  displayName?: string;
  score: number;
  rank: number;
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetInstanceRef = useRef<ReturnType<typeof createWidget>>();

  // Fetch leaderboard data from your backend
  useEffect(() => {
    async function fetchLeaderboard() {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setEntries(data);
    }

    fetchLeaderboard();
  }, []);

  // Show widget for selected address
  useEffect(() => {
    if (!selectedAddress || !widgetRef.current) return;

    // Destroy existing widget
    widgetInstanceRef.current?.destroy();

    // Create new widget
    widgetInstanceRef.current = createWidget({
      apiKey: import.meta.env.VITE_DOTPASSPORT_API_KEY,
      address: selectedAddress,
      type: 'profile'
    });

    widgetInstanceRef.current.mount(widgetRef.current);

    return () => {
      widgetInstanceRef.current?.destroy();
    };
  }, [selectedAddress]);

  return (
    <div className="leaderboard-page">
      <h1>Reputation Leaderboard</h1>

      <div className="leaderboard-layout">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Address</th>
              <th>Score</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr
                key={entry.address}
                className={selectedAddress === entry.address ? 'selected' : ''}
              >
                <td className="rank">#{entry.rank}</td>
                <td className="address">
                  {entry.displayName || `${entry.address.slice(0, 8)}...`}
                </td>
                <td className="score">{entry.score}</td>
                <td>
                  <button onClick={() => setSelectedAddress(entry.address)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedAddress && (
          <div className="profile-preview">
            <h3>Profile Preview</h3>
            <div ref={widgetRef} />
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Related

- [Basic Usage](./basic-usage.md)
- [Multiple Widgets](./multiple-widgets.md)
- [React Integration](../frameworks/react.md)
