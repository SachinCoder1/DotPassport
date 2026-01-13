<div align="left">

  <div style="display: flex; align-items: center; justify-content: left; gap: 12px;">
    <img src="https://i.ibb.co/sdxrkW6F/dotpassport-logo.png"
      width="60px" alt="DotPassport Logo">
    <h1 style="margin: 0; padding: 0; border: none;">DotPassport.io</h1>
  </div>

  <p style="margin-top: 8px;"><strong>Your identity and reputation for the Polkadot ecosystem.</strong></p>

  <div style="margin: 0 15px">
    <a href="https://dotpassport.io">
      <img src="https://img.shields.io/website?url=https%3A%2F%2Fdotpassport.io" alt="Website">
    </a>
    <a href="LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
    </a>
  </div>

</div>

---

## 🌟 Project Overview

**DotPassport** is a Polkadot  identity and reputation platform that enables users to build their polkadot profile of their on-chain activity and ecosystem contributions. Users earn badges and trust signals by participating in staking, governance, DAOs, NFTs, liquidity pools, and more. dApps and parachains can integrate DotPassport soon to personalize experiences, gate access, or deliver targeted rewards based on robust Sybil-resistant reputation scores.

- **Live Demo:** [https://dotpassport.io](https://dotpassport.io)  
- **Grant Proposal:** [GitHub · dotpassport-grant](https://github.com/Polkadot-Fast-Grants/apply/blob/master/applications/DotPassport.md)  

---

## 🖼️ Platform Preview
| ![DotPassport platform preview](https://i.postimg.cc/5NrDhGCg/Screenshot-2025-08-11-200514.png) |
|:--:|
| *DotPassport platform preview* |


## 🔍 Why DotPassport?

Many ecosystems (e.g. Ethereum) rely on Gitcoin Passport, Sismo, or Proof of Humanity for reputation and identity signals. Polkadot lacks a unified, user-facing layer that aggregates on-chain activity across parachains. DotPassport fills this gap by:

1. **Usage-Based Reputation:** Badges and trust scores derive directly from real on-chain actions (governance votes, staking, LPing, NFT mints).  
2. **Sybil Resistance:** Built-in scoring to guard against identity manipulation.  
3. **Developer-First Design:** Lightweight SDK and REST API for seamless integration.  
---

## 🧩 Ecosystem Fit & Audience

- **Fits:** Polkadot parachains, dApps, wallets, explorers.  
- **Targets:**  
  - dApp developers wanting personalized UX or gated features  
  - Parachains running quests, events, mints  
  - Wallets/explorers seeking enriched profiles  
  - End-users building persistent Web3 identities  

**Similar Projects in other chains:** Gitcoin Passport, etc.

---

## 🔧 Tech Stack

| Layer                   | Technology                                |
| ----------------------- | ----------------------------------------- |
| On Chain Data           | SubScan API                               |
| Backend API             | Node.js, Express, MongoDB                 |
| Frontend                | Next.js, React, TypeScript, Polkadot.js   |
| SDK                     | TypeScript NPM package                    |
| Authentication          | JWT                                       |
| Styling                 | Tailwind CSS, Headless UI                 |

---

## ⚙️ Architecture

1. **On Chain Activity**  
   - Subscan API for onchain data
   - Populates MongoDB with user activity  

2. **Reputation Engine**  
   - Badge generator: rules for issuing badges & scores  
   - Sybil-resistance algorithm for trust scoring  

3. **REST API**  
   - Exposes endpoints for profile, badges, scores  
   - NPM package simplifies integration (coming soon)

4. **Frontend**  
   - User profile dashboard at dotpassport.io  
   - Badge explorer and exportable JSON credentials  

---

## 🚀 Installation

> **Prerequisites:** Node.js ≥16, Yarn or PNPM, Docker & Docker Compose (for MongoDB).

```git clone https://github.com/sachincoder1/dotpassport.git  
cd dotpassport
```

Backend  
```cd backend  
cp .env.example .env  
yarn install  
yarn dev
```

Frontend  
```cd frontend  
cp .env.example .env  
yarn install  
yarn dev
```

---

## 📑 Environment Variables

Copy `.env.example` to `.env` and fill in backend:

```PORT=4000  
MONGO_URI=mongodb://localhost:27017/dotpassport  
MONGO_URI_PROD=<your production URI>  
SUBSCAN_API_KEY=<your subscan API key>  
JWT_SECRET=<strong-secret>  
JWT_REFRESH_SECRET=<strong-refresh-secret>
```
Frontend
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## 🤝 Contributing

We welcome contributions! Please read our CONTRIBUTING.md and follow the code of conduct.

---

## 📄 License

MIT License – see LICENSE

> _DotPassport bridges the gap in Polkadot’s ecosystem by empowering users and developers with a standardized, trustable on-chain identity & reputation layer._
