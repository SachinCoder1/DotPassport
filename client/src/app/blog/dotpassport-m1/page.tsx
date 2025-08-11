import { Fragment } from "react";

export default function BlogDotPassportMilestone1() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <article className="mx-auto w-full max-w-3xl px-5 py-14">
        {/* Header */}
        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            DotPassport · Milestone 1
          </p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-slate-900">
            Building Polkadot’s On-Chain Identity & Reputation Layer
          </h1>
          <p className="mt-4 text-slate-600">
            A deep dive into the first milestone of DotPassport: architecture, badge
            engine, reputation scoring, and why we chose Subscan for data.
          </p>
        </header>

        {/* Key Outcomes */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Milestone 1 — Outcomes</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>
              <strong>Badge Engine:</strong> static badge catalog
              with clear metrics and levels; automatic evaluation from on-chain data.
            </li>
            <li>
              <strong>Reputation Scoring:</strong> category-based
              score (longevity, txs, governance, staking, token diversity, NFT
              activity, extrinsic depth) aggregated into a total.
            </li>
            <li>
              <strong>Subscan Integration:</strong> fast hosted API
              for extrinsics, referenda, staking rewards/slashes, token holdings,
              and events; local caching to cut latency and calls.
            </li>
            <li>
              <strong>REST API Skeleton:</strong> auth flow and
              documented endpoints to read badges and scores; OpenAPI spec included.
            </li>
            <li>
              <strong>Live Demo:</strong> basic UI at
              <a
                className="ml-1 underline decoration-slate-300 hover:decoration-slate-700"
                href="https://dotpassport.io"
                target="_blank"
                rel="noreferrer"
              >
                dotpassport.io
              </a>
              .
            </li>
          </ul>
        </section>

        {/* Why Subscan */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">Why Subscan, not Subsquid?</h2>
          <p className="mt-4 text-slate-700">
            For milestone speed and reliability, we chose Subscan’s hosted API. It
            gives low-latency access to Polkadot chain data without running our own
            indexer. That keeps ops lean and lets us focus on reputation logic. We
            added a simple in-memory cache with sensible TTLs to avoid redundant
            calls and smooth out bursty traffic.
          </p>
        </section>

        {/* Architecture */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">Architecture Overview</h2>
          <div className="mt-4 grid gap-5 rounded-2xl md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Data Layer</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
                <li>Subscan API: extrinsics, governance, staking, tokens</li>
                <li>Optional NFT fetchers for ecosystem coverage</li>
                <li>Per-function caching with 10-minute TTL</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Domain Layer</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
                <li>Badge catalog with metric keys and level thresholds</li>
                <li>Evaluators per badge (standard ≥ threshold model)</li>
                <li>Category scores + total weighted reputation</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
              <h3 className="text-base font-semibold text-slate-900">API Layer</h3>
              <p className="mt-3 text-slate-700">
                A REST API provides endpoints to interact with user profiles, badges, and scores. The authentication flow is wallet-based: users sign a one-time challenge to receive access and refresh tokens. All endpoints are fully documented with an OpenAPI specification.
              </p>
              <div className="mt-6">
                <h4 className="text-lg font-bold text-slate-800">Authentication & User APIs</h4>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 text-slate-100">
                  {`# User Authentication
POST /auth/challenge     -> Get a message to sign with your wallet
POST /auth/polkadot      -> Verify signature & issue JWT tokens
POST /auth/refresh       -> Get a new access token using a refresh token
POST /auth/logout        -> Invalidate the current session

# User Profiles
GET  /users/me            -> Get the authenticated user's detailed profile, score, and badges
GET  /users/public/{address} -> Get a public user's profile, score, and badges by address`}
                </pre>
              </div>
              <div className="mt-6">
                <h4 className="text-lg font-bold text-slate-800">Scores & Badges APIs</h4>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 text-slate-100">
                  {`# Scores
GET  /scores              -> Get the authenticated user's current reputation score
GET  /scores/categories   -> Get definitions for all score categories
POST /scores/refresh      -> Trigger a recalculation and update of the user's score

# Badges
GET  /badges              -> Get the authenticated user's earned badges
GET  /badges/definitions  -> Get definitions for all available badges
POST /badges/refresh      -> Check for new achievements & update user badges`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Badge Catalog */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">DotPassport Badge Catalog</h2>
          <p className="mt-4 text-slate-700">
            Badges are earned based on your on-chain activity, each with multiple levels that track your progress. Here are all the badges and their levels available in Milestone 1:
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Relay Chain Initiate</h3>
              <p className="mt-1 text-sm text-slate-600">Marks your first active participation on the Polkadot Relay Chain. This badge is awarded upon the successful confirmation of your very first transaction on the Polkadot network.</p>
              <ul className="mt-2 text-xs text-slate-500 list-disc space-y-1 pl-4">
                <li>Level 1: <strong>Complete 1 On-Chain Transaction</strong>. Achieved by executing a single transaction, which writes your presence onto the blockchain permanently.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Polkadot Regular</h3>
              <p className="mt-1 text-sm text-slate-600">Recognizes your sustained presence and long-term commitment to the ecosystem. Longevity is a key indicator of trust and commitment.</p>
              <ul className="mt-2 text-xs text-slate-500 list-disc space-y-1 pl-4">
                <li>Level 1: <strong>90+ Days Active</strong>. Achieved when your account's first transaction is at least 90 days in the past.</li>
                <li>Level 2: <strong>1+ Year Active</strong>. Awarded for maintaining an on-chain presence for over a year.</li>
                <li>Level 3: <strong>3+ Years Active</strong>. This elite level recognizes you as a true veteran of the network.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Extrinsic Engine</h3>
              <p className="mt-1 text-sm text-slate-600">Measures your overall activity level on the network. A high extrinsic count demonstrates deep and frequent engagement.</p>
              <ul className="mt-2 text-xs text-slate-500 list-disc space-y-1 pl-4">
                <li>Level 1: <strong>10+ Confirmed Extrinsics</strong>. Shows you are an active and engaged network participant.</li>
                <li>Level 2: <strong>50+ Confirmed Extrinsics</strong>. Demonstrates a strong pattern of interaction and marks you as a power user.</li>
                <li>Level 3: <strong>250+ Confirmed Extrinsics</strong>. Showcasing a deep and consistent integration with the Polkadot ecosystem.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Parachain Traveler</h3>
              <p className="mt-1 text-sm text-slate-600">Highlights your exploration of Polkadot's multi-chain ecosystem. It shows you are leveraging the true interoperable power of the network.</p>
              <ul className="mt-2 text-xs text-slate-500 list-disc space-y-1 pl-4">
                <li>Level 1: <strong>Interact with 1+ Parachain</strong>. Your first step into the cross-chain ecosystem.</li>
                <li>Level 2: <strong>Interact with 3+ Parachains</strong>. Shows a broad engagement with diverse applications.</li>
                <li>Level 3: <strong>Interact with 5+ Parachains</strong>. Marks you as a true cross-chain expert.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Referendum Voter</h3>
              <p className="mt-1 text-sm text-slate-600">Recognizes your participation in Polkadot's on-chain governance, signifying your commitment to the network's democratic process.</p>
              <ul className="mt-2 text-xs text-slate-500 list-disc space-y-1 pl-4">
                <li>Level 1: <strong>Cast Your First Vote</strong>. Making your voice heard in network decision-making.</li>
                <li>Level 2: <strong>Vote on 5+ Referenda</strong>. Demonstrates consistent commitment to governance.</li>
                <li>Level 3: <strong>Vote on 20+ Referenda</strong>. Places you in a dedicated group of governance participants.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Treasury Contributor</h3>
              <p className="mt-1 text-sm text-slate-600">Awarded for directly influencing the allocation of the on-chain Treasury by voting on funding proposals.</p>
              <ul className="mt-2 text-xs text-slate-500 list-disc space-y-1 pl-4">
                <li>Level 1: <strong>Vote on a Treasury Proposal</strong>. Directly influencing how community funds are allocated.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">NPoS Guardian</h3>
              <p className="mt-1 text-sm text-slate-600">For contributing to the security of Polkadot's Nominated Proof-of-Stake (NPoS) system by staking and nominating validators.</p>
              <ul className="mt-2 text-xs text-slate-500 list-disc space-y-1 pl-4">
                <li>Level 1: <strong>First-Time Nominator</strong>. Marks your entry as a contributor to network security.</li>
                <li>Level 2: <strong>3+ Months Active Nominator</strong>. Highlights your consistent support for validators.</li>
                <li>Level 3: <strong>1+ Year Active Nominator</strong>. Proving your long-term dedication to network security.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Trusted Nominator</h3>
              <p className="mt-1 text-sm text-slate-600">Rewards your skill in selecting reliable validators by maintaining a clean staking record without slashes.</p>
              <ul className="mt-2 text-xs text-slate-500 list-disc space-y-1 pl-4">
                <li>Level 1: <strong>6+ Months Slash-Free</strong>. Demonstrates prudent and effective decision-making.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Polkadot Collector</h3>
              <p className="mt-1 text-sm text-slate-600">Measures the scale of your collection of Non-Fungible Tokens (NFTs), reflecting your engagement with the ecosystem's creators.</p>
              <ul className="mt-2 text-xs text-slate-500 list-disc space-y-1 pl-4">
                <li>Level 1: <strong>Own 5+ NFTs</strong>. You've started a meaningful collection.</li>
                <li>Level 2: <strong>Own 25+ NFTs</strong>. Marks you as a serious collector.</li>
                <li>Level 3: <strong>Own 100+ NFTs</strong>. A remarkable achievement, signifying a deep commitment to the Polkadot art scene.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Cross-Chain Holder</h3>
              <p className="mt-1 text-sm text-slate-600">Showcases your engagement with Polkadot's interoperability by holding assets from different parachains.</p>
              <ul className="mt-2 text-xs text-slate-500 list-disc space-y-1 pl-4">
                <li>Level 1: <strong>Hold Assets from 2+ Parachains</strong>. Your initial exploration of the multi-chain ecosystem.</li>
                <li>Level 2: <strong>Hold Assets from 4+ Parachains</strong>. Demonstrates a deep and diversified investment.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Identity Confirmed</h3>
              <p className="mt-1 text-sm text-slate-600">For cryptographically verifying your account details on-chain. This signifies a higher level of trust within the ecosystem.</p>
              <ul className="mt-2 text-xs text-slate-500 list-disc space-y-1 pl-4">
                <li>Level 1: <strong>Identity Verified by Registrar</strong>. Your on-chain identity has been verified, marking your account with a check of trust.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Utility Maximizer</h3>
              <p className="mt-1 text-sm text-slate-600">Recognizes your expertise in using advanced features to optimize on-chain actions, such as batching transactions to save on fees.</p>
              <ul className="mt-2 text-xs text-slate-500 list-disc space-y-1 pl-4">
                <li>Level 1: <strong>Execute a Batch Transaction</strong>. Demonstrates a sophisticated understanding of network efficiency.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How Scoring Works */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">How Reputation Scoring Works</h2>
          <p className="mt-4 text-slate-700">
            Your total reputation score is a weighted sum of points from several categories. Each category rewards different types of on-chain activity.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Account Longevity</h3>
              <p className="mt-1 text-sm text-slate-600">Rewards how long an address has been active on-chain. Tiers include: <strong>New</strong> (under 7 days), <strong>One Week</strong>, <strong>One Month</strong>, <strong>Three Months</strong>, and <strong>Veteran</strong> (over 1 year), with points increasing from 0 to 10.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Transaction Count</h3>
              <p className="mt-1 text-sm text-slate-600">Tracks how many extrinsics you’ve submitted. Tiers start at <strong>First Steps</strong> (1-9 txs) and go up to <strong>Transaction Master</strong> (50+ txs), with points from 2 to 10.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Transaction Volume</h3>
              <p className="mt-1 text-sm text-slate-600">Measures the total DOT you’ve moved on-chain. Rewards range from <strong>Small Mover</strong> (1+ DOT) to <strong>High Roller</strong> (100+ DOT), with points from 2 to 10.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Module Diversity</h3>
              <p className="mt-1 text-sm text-slate-600">Rewards interacting with multiple Polkadot runtime modules. Tiers go from <strong>Module Explorer</strong> (1 module) to <strong>Polkadot Power User</strong> (5+ modules), with points from 1 to 5.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Governance Participation</h3>
              <p className="mt-1 text-sm text-slate-600">Rewards active engagement in on-chain referenda voting. Points increase from <strong>Partial Voter</strong> (under 50% of votes) to <strong>Governance Champion</strong> (100% of votes), with points from 2 to 20.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Staking Rewards</h3>
              <p className="mt-1 text-sm text-slate-600">Measures the total DOT you’ve earned through staking. Tiers range from <strong>Tiny Rewards</strong> (0.1+ DOT) to <strong>Reward Master</strong> (10+ DOT), with points from 2 to 10.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Staking Nominator Diversity</h3>
              <p className="mt-1 text-sm text-slate-600">Rewards you for nominating a variety of validators. Tiers go from <strong>Single Nominee</strong> (1+ validator) to <strong>Nomination Pro</strong> (10+ validators), with points from 1 to 5.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Staking Slash Penalties</h3>
              <p className="mt-1 text-sm text-slate-600">Tracks slash events on your nominations. Your reputation is negatively impacted, with penalties from -1 point for a <strong>Minor Penalty</strong> (1 slash) up to -5 points for a <strong>Major Penalty</strong> (5+ slashes).</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Token Diversity</h3>
              <p className="mt-1 text-sm text-slate-600">Rewards holding a variety of tokens beyond the native DOT. Tiers range from <strong>Diversifier</strong> (1+ token) to <strong>Token Connoisseur</strong> (5+ tokens), with points from 1 to 5.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">NFT Holdings</h3>
              <p className="mt-1 text-sm text-slate-600">Recognizes your participation in the NFT space. Tiers go from <strong>Collector</strong> (1+ NFT) to <strong>NFT Aficionado</strong> (10+ NFTs), with points from 1 to 5.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">NFT Activity</h3>
              <p className="mt-1 text-sm text-slate-600">Rewards how actively you interact with NFTs (buys, sells, transfers, etc.). Points are awarded for reaching tiers like <strong>Engaged</strong> (10+ events) and <strong>Active Collector</strong> (50+ events).</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Extrinsic Depth</h3>
              <p className="mt-1 text-sm text-slate-600">Measures how many on-chain calls you’ve submitted across different modules. Tiers range from <strong>Starter</strong> (1+ call) to <strong>Veteran Caller</strong> (100+ calls), with points from 1 to 10.</p>
            </div>
          </div>
        </section>

        {/* What’s Live */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">What’s Live Right Now</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>Backend services to fetch and cache on-chain data via Subscan</li>
            <li>Badge definitions and evaluation logic</li>
            <li>Reputation score calculation and persistence model</li>
            <li>Auth endpoints and a basic UI at dotpassport.io</li>
          </ul>
        </section>

        {/* Roadmap */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Roadmap — Next Milestone</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            <li>Public read endpoints for badges and scores</li>
            <li>Developer SDK (TypeScript) and examples</li>
            <li>Wallet integration and profile widgets</li>
            <li>Automated tests and improved documentation</li>
          </ul>
        </section>

        {/* Footer / Links */}
        <footer className="mt-14 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <p>
            Source:
            <a
              className="ml-1 underline decoration-slate-300 hover:decoration-slate-700"
              href="https://github.com/SachinCoder1/DotPassport"
              target="_blank"
              rel="noreferrer"
            >
              github.com/SachinCoder1/DotPassport
            </a>
          </p>
          <p className="mt-1">
            Application:
            <a
              className="ml-1 underline decoration-slate-300 hover:decoration-slate-700"
              href="https://github.com/Polkadot-Fast-Grants/apply/blob/master/applications/DotPassport.md"
              target="_blank"
              rel="noreferrer"
            >
              Polkadot Fast Grants / DotPassport
            </a>
          </p>
        </footer>
      </article>
    </main>
  );
}