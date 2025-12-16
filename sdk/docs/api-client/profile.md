# Profile Methods

Retrieve user profile information.

## getProfile()

Get a user's complete profile.

```typescript
async getProfile(address: string): Promise<UserProfile>
```

### Parameters

- **address** (string): Polkadot address of the user

### Returns

`UserProfile` object containing:

```typescript
interface UserProfile {
  address: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  identities: Identity[];
  socials: {
    twitter?: string;
    github?: string;
    discord?: string;
    telegram?: string;
    email?: string;
    website?: string;
  };
  joinedAt: string;
  updatedAt: string;
}
```

### Example

```typescript
const profile = await client.getProfile(
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
);

console.log(profile.displayName);  // "Alice"
console.log(profile.bio);          // "Polkadot enthusiast"
console.log(profile.socials.twitter); // "@alice_dot"
```

### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 404 | User not found | Address has no profile |
| 401 | Invalid API key | API key is invalid |

## Identity Type

```typescript
interface Identity {
  chain: string;      // "polkadot", "kusama", etc.
  address: string;
  displayName?: string;
  verified: boolean;
}
```

## Complete Example

```typescript
import { DotPassportClient, DotPassportError } from '@dotpassport/sdk';

const client = new DotPassportClient({
  apiKey: process.env.DOTPASSPORT_API_KEY!
});

async function displayUserProfile(address: string) {
  try {
    const profile = await client.getProfile(address);

    console.log(`👤 ${profile.displayName}`);
    console.log(`📍 ${profile.address}`);

    if (profile.bio) {
      console.log(`📝 ${profile.bio}`);
    }

    if (profile.socials.twitter) {
      console.log(`🐦 ${profile.socials.twitter}`);
    }

    console.log(`✅ Verified identities: ${profile.identities.filter(i => i.verified).length}`);

  } catch (error) {
    if (error instanceof DotPassportError) {
      console.error(`Error ${error.statusCode}: ${error.message}`);
    }
  }
}
```

## Next Steps

- [Scores Methods](./scores.md)
- [Badges Methods](./badges.md)
- [Error Handling](./error-handling.md)
