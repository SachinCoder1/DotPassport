# Profile Methods

Retrieve user profile information.

## getProfile()

Get a user's complete profile including identities and social links.

### Usage

```typescript
const profile = await client.getProfile(address);
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | `string` | Yes | Polkadot address of the user |
| `signal` | `AbortSignal` | No | Optional abort signal for request cancellation |

### Response Type

```typescript
interface UserProfile {
  address: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
  polkadotIdentities?: PolkadotIdentity[];
  nftCount?: number;
  source?: 'app' | 'api';
}

interface PolkadotIdentity {
  address: string;
  display?: string;
  legal?: string;
  web?: string;
  email?: string;
  twitter?: string;
  github?: string;
  matrix?: string;
  discord?: string;
  riot?: string;
  judgements?: Array<{ index: number; judgement: string; _id?: string }>;
  role?: string;
  nonce?: number;
}
```

### Example

```typescript
import { DotPassportClient } from '@dotpassport/sdk';

const client = new DotPassportClient({ apiKey: 'your_api_key' });

const profile = await client.getProfile(
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
);

console.log(`Display Name: ${profile.displayName}`);
console.log(`Bio: ${profile.bio}`);

// Access social links
if (profile.socialLinks) {
  Object.entries(profile.socialLinks).forEach(([platform, handle]) => {
    console.log(`${platform}: ${handle}`);
  });
}

// Access Polkadot identities
if (profile.polkadotIdentities) {
  profile.polkadotIdentities.forEach(identity => {
    console.log(`Identity: ${identity.display || identity.address}`);
    if (identity.twitter) console.log(`  Twitter: ${identity.twitter}`);
    if (identity.github) console.log(`  GitHub: ${identity.github}`);
  });
}
```

### Example Response

```json
{
  "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "displayName": "Alice",
  "avatarUrl": "https://example.com/avatar.png",
  "bio": "Polkadot enthusiast and developer",
  "socialLinks": {
    "twitter": "alice_dot",
    "github": "alice"
  },
  "polkadotIdentities": [
    {
      "address": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      "display": "Alice",
      "twitter": "@alice_dot",
      "github": "alice",
      "judgements": [{ "index": 1, "judgement": "Reasonable" }]
    }
  ],
  "nftCount": 15,
  "source": "api"
}
```

---

## Working with Identities

### Check for Verified Identity

```typescript
const profile = await client.getProfile(address);

const hasVerifiedIdentity = profile.polkadotIdentities?.some(identity =>
  identity.judgements?.some(j =>
    j.judgement === 'Reasonable' || j.judgement === 'KnownGood'
  )
);

if (hasVerifiedIdentity) {
  console.log('User has verified on-chain identity');
}
```

### Get Primary Identity Display Name

```typescript
const profile = await client.getProfile(address);

const displayName = profile.displayName ||
  profile.polkadotIdentities?.[0]?.display ||
  `${profile.address.slice(0, 6)}...${profile.address.slice(-4)}`;

console.log(`Name: ${displayName}`);
```

### Aggregate Social Links

```typescript
const profile = await client.getProfile(address);

// Combine socialLinks and identity social fields
const allSocials: Record<string, string> = {
  ...(profile.socialLinks || {})
};

// Add socials from identities
profile.polkadotIdentities?.forEach(identity => {
  if (identity.twitter && !allSocials.twitter) {
    allSocials.twitter = identity.twitter;
  }
  if (identity.github && !allSocials.github) {
    allSocials.github = identity.github;
  }
  if (identity.discord && !allSocials.discord) {
    allSocials.discord = identity.discord;
  }
  if (identity.email && !allSocials.email) {
    allSocials.email = identity.email;
  }
  if (identity.web && !allSocials.website) {
    allSocials.website = identity.web;
  }
});

console.log('All social links:', allSocials);
```

---

## Error Handling

```typescript
import { DotPassportClient, DotPassportError } from '@dotpassport/sdk';

try {
  const profile = await client.getProfile(address);
} catch (error) {
  if (error instanceof DotPassportError) {
    switch (error.statusCode) {
      case 404:
        console.log('Profile not found - user may not have set up a profile');
        break;
      case 401:
        console.log('Invalid API key');
        break;
      default:
        console.log(`Error: ${error.message}`);
    }
  }
}
```

---

## Request Cancellation

```typescript
const controller = new AbortController();

// Cancel after timeout
const timeout = setTimeout(() => controller.abort(), 5000);

try {
  const profile = await client.getProfile(address, controller.signal);
  clearTimeout(timeout);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was cancelled');
  }
}
```

---

## Complete Example

```typescript
import { DotPassportClient, DotPassportError } from '@dotpassport/sdk';

const client = new DotPassportClient({
  apiKey: process.env.DOTPASSPORT_API_KEY!
});

async function displayUserProfile(address: string) {
  try {
    const profile = await client.getProfile(address);

    // Display name with fallback
    const name = profile.displayName ||
      profile.polkadotIdentities?.[0]?.display ||
      `${address.slice(0, 8)}...`;

    console.log(`👤 ${name}`);
    console.log(`📍 ${profile.address}`);

    if (profile.bio) {
      console.log(`📝 ${profile.bio}`);
    }

    if (profile.avatarUrl) {
      console.log(`🖼️ Avatar: ${profile.avatarUrl}`);
    }

    // Social links
    if (profile.socialLinks) {
      console.log('🔗 Social Links:');
      Object.entries(profile.socialLinks).forEach(([platform, handle]) => {
        console.log(`   ${platform}: ${handle}`);
      });
    }

    // Identities
    if (profile.polkadotIdentities && profile.polkadotIdentities.length > 0) {
      console.log(`✅ ${profile.polkadotIdentities.length} on-chain identities`);
    }

    if (profile.nftCount) {
      console.log(`🎨 ${profile.nftCount} NFTs`);
    }

  } catch (error) {
    if (error instanceof DotPassportError) {
      console.error(`Error ${error.statusCode}: ${error.message}`);
    }
  }
}
```

---

## Related

- [Scores Methods](./scores.md)
- [Badges Methods](./badges.md)
- [Error Handling](./error-handling.md)
- [Profile Widget](../widgets/profile.md)
