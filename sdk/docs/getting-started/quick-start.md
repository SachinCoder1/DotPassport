# Quick Start

Get started with DotPassport SDK in 5 minutes.

## Step 1: Install the SDK

```bash
npm install @dotpassport/sdk
```

## Step 2: Get Your API Key

1. Sign up at [dotpassport.com/developers](https://dotpassport.com/developers)
2. Navigate to the API Keys section
3. Generate a new API key
4. Copy your key (starts with `live_` or `test_`)

{% hint style="warning" %}
Never commit API keys to version control. Use environment variables instead.
{% endhint %}

## Step 3: Initialize the Client

```typescript
import { DotPassportClient } from '@dotpassport/sdk';

const client = new DotPassportClient({
  apiKey: process.env.DOTPASSPORT_API_KEY
});
```

## Step 4: Fetch User Data

```typescript
const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

// Get user scores
const scores = await client.getScores(address);
console.log(`Total Score: ${scores.totalScore}`);

// Get user badges
const badges = await client.getBadges(address);
console.log(`Badges Earned: ${badges.count}`);

// Get user profile
const profile = await client.getProfile(address);
console.log(`Display Name: ${profile.displayName}`);
```

## Step 5: Add a Widget (Optional)

Add a reputation widget to your web page:

```html
<div id="reputation-widget"></div>

<script type="module">
  import { createWidget } from '@dotpassport/sdk';

  createWidget({
    apiKey: 'your-api-key',
    address: 'polkadot-address'
  }).mount('#reputation-widget');
</script>
```

{% hint style="success" %}
Congratulations! You've successfully integrated DotPassport SDK.
{% endhint %}

## Next Steps

- [API Client Methods](../api-client/overview.md) - Explore all available methods
- [Widget Guide](../widgets/overview.md) - Learn about embeddable widgets
- [Framework Integration](../frameworks/react.md) - Integrate with your framework
- [Error Handling](../api-client/error-handling.md) - Handle errors gracefully

## Complete Example

Here's a complete example with error handling:

```typescript
import { DotPassportClient, DotPassportError } from '@dotpassport/sdk';

const client = new DotPassportClient({
  apiKey: process.env.DOTPASSPORT_API_KEY
});

async function fetchUserReputation(address: string) {
  try {
    const [scores, badges, profile] = await Promise.all([
      client.getScores(address),
      client.getBadges(address),
      client.getProfile(address)
    ]);

    console.log(`User: ${profile.displayName}`);
    console.log(`Reputation: ${scores.totalScore} points`);
    console.log(`Badges: ${badges.count} earned`);

    return { scores, badges, profile };
  } catch (error) {
    if (error instanceof DotPassportError) {
      console.error(`API Error ${error.statusCode}: ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

// Usage
fetchUserReputation('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY')
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Failed:', err));
```

## Common Issues

### API Key Not Working

Make sure your API key:
- Starts with `live_` or `test_`
- Is stored securely (environment variables)
- Has not expired
- Has the correct permissions

### User Not Found (404 Error)

The Polkadot address may:
- Not exist in the system
- Be formatted incorrectly
- Not have any reputation data yet

### Rate Limit Exceeded (429 Error)

You've hit your API rate limit. Consider:
- Caching responses
- Upgrading your API tier
- Implementing request throttling

See [Rate Limiting](../api-client/rate-limiting.md) for more information.
