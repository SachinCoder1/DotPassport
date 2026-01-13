"use client";

interface TierBadgeProps {
  tier: 'free' | 'pro' | 'enterprise';
}

export default function TierBadge({ tier }: TierBadgeProps) {
  const getBadgeStyles = () => {
    switch (tier) {
      case 'free':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'pro':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'enterprise':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeStyles()} uppercase`}>
      {tier}
    </span>
  );
}
