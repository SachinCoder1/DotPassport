import { DotPassportClient, DotPassportError } from '../src';

// Initialize the client
const client = new DotPassportClient({
  apiKey: 'live_your_api_key_here',
  // baseUrl: 'http://localhost:3000', // Optional: Use for local development
});

async function main() {
  const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

  try {
    // Get user profile
    console.log('Fetching user profile...');
    const profile = await client.getProfile(address);
    console.log('Profile:', {
      displayName: profile.displayName,
      bio: profile.bio,
      socialLinks: profile.socialLinks,
    });
    console.log('');

    // Get all scores
    console.log('Fetching user scores...');
    const scores = await client.getScores(address);
    console.log('Total Score:', scores.totalScore);
    console.log('Categories:', Object.keys(scores.categories));
    console.log('');

    // Get specific category score
    console.log('Fetching longevity category score...');
    const categoryScore = await client.getCategoryScore(address, 'longevity');
    console.log('Longevity Score:', categoryScore.category.score.score);
    console.log('Reason:', categoryScore.category.score.reason);
    if (categoryScore.definition) {
      console.log('Category Name:', categoryScore.definition.displayName);
    }
    console.log('');

    // Get all badges
    console.log('Fetching user badges...');
    const badges = await client.getBadges(address);
    console.log('Total Badges:', badges.count);
    badges.badges.forEach((badge) => {
      console.log(`- ${badge.badgeKey}: Level ${badge.achievedLevel} (${badge.achievedLevelTitle})`);
    });
    console.log('');

    // Get specific badge
    if (badges.count > 0) {
      const firstBadgeKey = badges.badges[0].badgeKey;
      console.log(`Fetching specific badge: ${firstBadgeKey}...`);
      const badge = await client.getBadge(address, firstBadgeKey);
      console.log('Badge:', badge.badge);
      if (badge.definition) {
        console.log('Badge Title:', badge.definition.title);
        console.log('Badge Description:', badge.definition.shortDescription);
      }
      console.log('');
    }

    // Get badge definitions (metadata)
    console.log('Fetching badge definitions...');
    const badgeDefs = await client.getBadgeDefinitions();
    console.log(`Found ${badgeDefs.badges.length} badge definitions`);
    badgeDefs.badges.slice(0, 3).forEach((def) => {
      console.log(`- ${def.title}: ${def.shortDescription}`);
    });
    console.log('');

    // Get category definitions (metadata)
    console.log('Fetching category definitions...');
    const categoryDefs = await client.getCategoryDefinitions();
    console.log(`Found ${categoryDefs.categories.length} category definitions`);
    categoryDefs.categories.slice(0, 3).forEach((def) => {
      console.log(`- ${def.displayName}: ${def.short_description}`);
    });

  } catch (error) {
    if (error instanceof DotPassportError) {
      console.error('DotPassport API Error:');
      console.error('Status Code:', error.statusCode);
      console.error('Message:', error.message);
      console.error('Response:', error.response);
    } else {
      console.error('Unexpected Error:', error);
    }
  }
}

main();
