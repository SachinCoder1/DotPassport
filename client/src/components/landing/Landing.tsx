"use client";

import {
  ArrowRight,
  Award,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Code,
  Copy,
  Check,
  Database,
  ExternalLink,
  Fingerprint,
  Github,
  Globe,
  Layers,
  Linkedin,
  Lock,
  Network,
  Package,
  Rocket,
  Shield,
  Star,
  Target,
  Terminal,
  Trophy,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// External links
const LINKS = {
  docs: "https://docs.dotpassport.io",
  github: "https://github.com/dotpassport/dotpassport-sdk",
  githubOrg: "https://github.com/dotpassport",
  npm: "https://www.npmjs.com/package/@dotpassport/sdk",
  website: "https://dotpassport.io",
  linkedin: "https://linkedin.com/company/dotpassport",
  sandbox: "https://sandbox.dotpassport.io",
  fastGrants:
    "https://github.com/Polkadot-Fast-Grants/apply/blob/master/applications/DotPassport.md",
};

// Score categories data
const SCORE_CATEGORIES = [
  {
    key: "governance",
    name: "Governance",
    icon: "🏛️",
    description: "Voting & proposal activity",
  },
  {
    key: "staking",
    name: "Staking",
    icon: "💰",
    description: "DOT staking & nominations",
  },
  {
    key: "defi",
    name: "DeFi",
    icon: "🔄",
    description: "DeFi protocol interactions",
  },
  {
    key: "nft",
    name: "NFT",
    icon: "🎨",
    description: "NFT collection & trading",
  },
  {
    key: "network",
    name: "Network",
    icon: "🌐",
    description: "Cross-chain transfers",
  },
  {
    key: "developer",
    name: "Developer",
    icon: "👨‍💻",
    description: "Smart contract activity",
  },
  {
    key: "community",
    name: "Community",
    icon: "🏆",
    description: "Community contributions",
  },
  {
    key: "experience",
    name: "Experience",
    icon: "🕐",
    description: "Account age & history",
  },
  {
    key: "treasury",
    name: "Treasury",
    icon: "💎",
    description: "Treasury proposals",
  },
  {
    key: "identity",
    name: "Identity",
    icon: "🔗",
    description: "On-chain verification",
  },
  {
    key: "activity",
    name: "Activity",
    icon: "📊",
    description: "Transaction frequency",
  },
  {
    key: "overall",
    name: "Overall",
    icon: "⭐",
    description: "Combined reputation",
  },
];

// Badge showcase data
const FEATURED_BADGES = [
  { name: "Governance Guru", icon: "🏛️", color: "from-purple-500 to-indigo-600" },
  { name: "Staking Champion", icon: "💰", color: "from-yellow-500 to-orange-600" },
  { name: "DeFi Explorer", icon: "🔄", color: "from-blue-500 to-cyan-600" },
  { name: "NFT Collector", icon: "🎨", color: "from-pink-500 to-rose-600" },
  { name: "Identity Verified", icon: "✓", color: "from-green-500 to-emerald-600" },
  { name: "Network Pioneer", icon: "🌐", color: "from-violet-500 to-purple-600" },
];

// FAQ data
const FAQ_ITEMS = [
  {
    question: "What is DotPassport?",
    answer:
      "DotPassport is an on-chain identity and reputation layer for the Polkadot ecosystem. It aggregates your on-chain activity into a portable profile with reputation scores and achievement badges.",
  },
  {
    question: "How do I get started?",
    answer:
      "Simply connect your Polkadot wallet to the app. Your on-chain activity will be automatically analyzed to generate your reputation profile, scores, and eligible badges.",
  },
  {
    question: "Is DotPassport free to use?",
    answer:
      "Yes! DotPassport is completely free for end users. Developers can access the API with a free tier of 100 requests per hour, with premium plans available for higher usage.",
  },
  {
    question: "How is my reputation score calculated?",
    answer:
      "Your reputation score is calculated from 12 different categories including governance participation, staking activity, DeFi interactions, NFT ownership, and more. Each category is weighted based on the significance of the activity.",
  },
  {
    question: "Can I use DotPassport in my dApp?",
    answer:
      "Absolutely! DotPassport provides an easy-to-use SDK with pre-built widgets and a comprehensive API. Visit our documentation or sandbox to get started integrating.",
  },
  {
    question: "What wallets are supported?",
    answer:
      "DotPassport supports all major Polkadot wallets including Polkadot.js, Talisman, SubWallet, Nova Wallet, and any wallet compatible with the Polkadot ecosystem.",
  },
];

const LandingPage = () => {
  const navigation = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Section 1: Hero Section */}
      <section className="relative pt-8 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div
            className={`text-center transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            {/* Grant Badge */}
            <a
              href={LINKS.fastGrants}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-6 hover:bg-purple-200 transition-colors cursor-pointer">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">
                  10k USD Grant Received from Polkadot Fast Grants
                </span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </a>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Your On-Chain
              <span className="block bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Identity Layer
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              Build a portable, verifiable profile of your Polkadot ecosystem
              contributions. Earn badges, build reputation, and unlock
              personalized Web3 experiences.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={() => navigation.push("/app")}
                className="cursor-pointer flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#how-it-works"
                className="flex items-center space-x-2 bg-white text-gray-700 px-8 py-4 rounded-full font-semibold text-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
              >
                <Globe className="w-5 h-5" />
                <span>Learn More</span>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-gray-900 mb-2">12+</div>
                <div className="text-gray-600">Achievement Badges</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  50K+
                </div>
                <div className="text-gray-600">Verified Profiles</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  10K+
                </div>
                <div className="text-gray-600">Badges Issued</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Built For Polkadot */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-6">
              Built for the Polkadot Ecosystem
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="font-semibold text-gray-700">Polkadot</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <span className="font-semibold text-gray-700">Kusama</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="font-semibold text-gray-700">Substrate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It <span className="text-purple-600">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your on-chain reputation in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-8 rounded-2xl border border-purple-100 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm font-medium text-purple-600 mb-2">
                  Step 1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Connect Wallet
                </h3>
                <p className="text-gray-600">
                  Link your Polkadot wallet securely. We support all major
                  wallets in the ecosystem.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-purple-300">
                <ArrowRight className="w-8 h-8" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm font-medium text-blue-600 mb-2">
                  Step 2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Build Profile
                </h3>
                <p className="text-gray-600">
                  Your on-chain activity is automatically analyzed to create
                  your reputation profile.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-blue-300">
                <ArrowRight className="w-8 h-8" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="group">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm font-medium text-green-600 mb-2">
                  Step 3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Unlock Benefits
                </h3>
                <p className="text-gray-600">
                  Access exclusive dApps, airdrops, and opportunities based on
                  your reputation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-purple-600">DotPassport</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The complete identity and reputation layer for the Polkadot
              ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-pink-50 to-purple-50 p-8 rounded-2xl border border-purple-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Reputation Scores
              </h3>
              <p className="text-gray-600 leading-relaxed">
                12 scoring categories measuring your on-chain credibility across
                governance, staking, DeFi, NFTs, and more.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-2xl border border-yellow-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Achievement Badges
              </h3>
              <p className="text-gray-600 leading-relaxed">
                12+ collectible badges showcasing your verified accomplishments
                and ecosystem contributions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Fingerprint className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Identity Profiles
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Unified identity combining on-chain data with registrar
                verification for a complete profile.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-gradient-to-br from-red-50 to-rose-50 p-8 rounded-2xl border border-red-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Sybil Resistance
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced algorithms detect and prevent fake accounts, ensuring
                authentic reputation scores.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-gradient-to-br from-violet-50 to-purple-50 p-8 rounded-2xl border border-violet-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Network className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Cross-Chain Ready
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Works seamlessly across Polkadot parachains, aggregating your
                activity from the entire ecosystem.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Privacy First
              </h3>
              <p className="text-gray-600 leading-relaxed">
                You control what data to share. Your private information stays
                private, always.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Score Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              12 Score <span className="text-purple-600">Categories</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your reputation is measured across multiple dimensions of on-chain
              activity
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SCORE_CATEGORIES.map((category) => (
              <div
                key={category.key}
                className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300 text-center"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Badge Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Earn <span className="text-purple-600">Badges</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Showcase your achievements with collectible on-chain badges
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {FEATURED_BADGES.map((badge) => (
              <div
                key={badge.name}
                className="group text-center"
              >
                <div
                  className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${badge.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}
                >
                  {badge.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {badge.name}
                </h3>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigation.push("/app/badges")}
              className="inline-flex items-center space-x-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
            >
              <span>Explore All Badges</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Section 7: Use Cases */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built for <span className="text-purple-300">Everyone</span>
            </h2>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Whether you're a user or builder, DotPassport adds value to your
              Web3 experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Use Case 1 */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-300" />
              </div>
              <h3 className="text-lg font-bold mb-2">Everyday Users</h3>
              <p className="text-purple-200 text-sm">
                Build your reputation, unlock airdrops, and prove your
                authenticity across dApps.
              </p>
            </div>

            {/* Use Case 2 */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-300" />
              </div>
              <h3 className="text-lg font-bold mb-2">DeFi Platforms</h3>
              <p className="text-purple-200 text-sm">
                Risk assessment, trust scores, and under-collateralized lending
                based on reputation.
              </p>
            </div>

            {/* Use Case 3 */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-green-300" />
              </div>
              <h3 className="text-lg font-bold mb-2">DAOs</h3>
              <p className="text-purple-200 text-sm">
                Governance weight, voting power, and contributor recognition
                based on activity.
              </p>
            </div>

            {/* Use Case 4 */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-pink-500/30 rounded-xl flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-pink-300" />
              </div>
              <h3 className="text-lg font-bold mb-2">dApp Builders</h3>
              <p className="text-purple-200 text-sm">
                User verification, spam prevention, and personalized experiences
                with our SDK.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: For Developers */}
      <section
        id="developers"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-6">
                <Terminal className="w-4 h-4" />
                <span className="text-sm font-medium">For Developers</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Build with{" "}
                <span className="text-purple-600">DotPassport SDK</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Integrate reputation and identity into your dApp in minutes.
                TypeScript support, pre-built widgets, and comprehensive API.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">TypeScript</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">4 Widgets</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">7 API Endpoints</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href={LINKS.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <span>View Documentation</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={LINKS.sandbox}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-white text-gray-700 px-6 py-3 rounded-full font-semibold border-2 border-gray-200 hover:border-purple-300 transition-all duration-300"
                >
                  <span>Try Sandbox</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Code Preview */}
            <div className="min-w-0">
              {/* NPM Install */}
              <div className="bg-gray-900 rounded-t-xl p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <code className="text-green-400 text-sm sm:text-base font-mono">
                    npm install @dotpassport/sdk
                  </code>
                  <button
                    onClick={() => copyToClipboard("npm install @dotpassport/sdk")}
                    className="text-gray-400 hover:text-white transition-colors p-2"
                  >
                    {copiedCode ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Code Snippet */}
              <div className="bg-gray-800 rounded-b-xl p-4 sm:p-6 overflow-x-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap sm:whitespace-pre">
                  <code>
                    <span className="text-purple-400">import</span>
                    <span className="text-gray-300">{" { DotPassport } "}</span>
                    <span className="text-purple-400">from</span>
                    <span className="text-green-400">
                      {" '@dotpassport/sdk'"}
                    </span>
                    <span className="text-gray-300">;</span>
                    {"\n\n"}
                    <span className="text-gray-500">
                      {"// Initialize client"}
                    </span>
                    {"\n"}
                    <span className="text-purple-400">const</span>
                    <span className="text-gray-300"> client = </span>
                    <span className="text-purple-400">new</span>
                    <span className="text-blue-400"> DotPassport</span>
                    <span className="text-gray-300">{"({"}</span>
                    {"\n"}
                    <span className="text-gray-300">{"  apiKey: "}</span>
                    <span className="text-green-400">{"'your-api-key'"}</span>
                    {"\n"}
                    <span className="text-gray-300">{"});"}</span>
                    {"\n\n"}
                    <span className="text-gray-500">{"// Get user profile"}</span>
                    {"\n"}
                    <span className="text-purple-400">const</span>
                    <span className="text-gray-300"> profile = </span>
                    <span className="text-purple-400">await</span>
                    <span className="text-gray-300"> client.</span>
                    <span className="text-blue-400">getProfile</span>
                    <span className="text-gray-300">(address);</span>
                    {"\n\n"}
                    <span className="text-gray-500">
                      {"// Get reputation scores"}
                    </span>
                    {"\n"}
                    <span className="text-purple-400">const</span>
                    <span className="text-gray-300"> scores = </span>
                    <span className="text-purple-400">await</span>
                    <span className="text-gray-300"> client.</span>
                    <span className="text-blue-400">getScores</span>
                    <span className="text-gray-300">(address);</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
                12
              </div>
              <div className="text-gray-600 font-medium">Score Categories</div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="text-4xl md:text-5xl font-bold text-pink-600 mb-2">
                12+
              </div>
              <div className="text-gray-600 font-medium">Achievement Badges</div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                7
              </div>
              <div className="text-gray-600 font-medium">API Endpoints</div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">
                100%
              </div>
              <div className="text-gray-600 font-medium">Free to Start</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 10: Ecosystem */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powering the{" "}
            <span className="text-purple-600">Polkadot Ecosystem</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Built with funding from Polkadot Fast Grants and integrated with
            leading ecosystem infrastructure
          </p>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-pink-600">P</span>
              </div>
              <span className="text-gray-600 font-medium">Polkadot</span>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Database className="w-10 h-10 text-blue-600" />
              </div>
              <span className="text-gray-600 font-medium">Subscan</span>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Layers className="w-10 h-10 text-purple-600" />
              </div>
              <span className="text-gray-600 font-medium">KodaDot</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 11: FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked <span className="text-purple-600">Questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFaqIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-5 text-gray-600">{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 12: Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Build Your{" "}
            <span className="text-purple-300">On-Chain Identity</span>?
          </h2>
          <p className="text-xl text-purple-100 mb-10 max-w-3xl mx-auto">
            Join thousands of users building their Polkadot reputation. Get
            started for free today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigation.push("/app")}
              className="cursor-pointer inline-flex items-center justify-center space-x-2 bg-white text-purple-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-purple-50 hover:scale-105 transition-all duration-300 group"
            >
              <span>Launch App</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href={LINKS.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 bg-transparent text-white px-8 py-4 rounded-full font-semibold text-lg border-2 border-white/30 hover:bg-white/10 transition-all duration-300"
            >
              <span>Read Documentation</span>
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Section 13: Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Logo Column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">DotPassport</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your on-chain identity layer for the Polkadot ecosystem.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-white transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => navigation.push("/app/badges")}
                    className="hover:text-white transition-colors"
                  >
                    Badges
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigation.push("/app/reputation")}
                    className="hover:text-white transition-colors"
                  >
                    Reputation
                  </button>
                </li>
                <li>
                  <a
                    href={LINKS.sandbox}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Sandbox
                  </a>
                </li>
              </ul>
            </div>

            {/* Developers */}
            <div>
              <h3 className="font-semibold mb-4">Developers</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href={LINKS.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href={LINKS.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href={LINKS.npm}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    NPM Package
                  </a>
                </li>
                <li>
                  <a
                    href={`${LINKS.docs}/api-reference`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    API Reference
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href={LINKS.fastGrants}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Grant Application
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href={LINKS.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Website
                  </a>
                </li>
                <li>
                  <a
                    href={LINKS.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href={LINKS.githubOrg}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    GitHub Org
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              2026 DotPassport. Built for Polkadot.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href={LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href={LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
