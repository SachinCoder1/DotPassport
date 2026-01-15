import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock,
  Shield,
  Zap,
  Code,
  ExternalLink,
  Github,
  Linkedin,
  ArrowRight,
  Copy,
  Trophy,
  Fingerprint,
  Layers,
  Moon,
  Terminal,
  BarChart3,
  Palette,
  FlaskConical,
  Check,
  Globe,
  Package,
  Menu,
  X,
} from 'lucide-react';
import { WalletConnectModal } from '~/components/PolkadotWalletConnect';
import { useWalletStore } from '~/store/walletStore';
import { LoadingScreen } from '~/components/shared/LoadingScreen';
import { toast } from 'sonner';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// External links
const LINKS = {
  docs: 'https://docs.dotpassport.io',
  github: 'https://github.com/dotpassport/dotpassport-sdk',
  githubOrg: 'https://github.com/dotpassport',
  npm: 'https://www.npmjs.com/package/@dotpassport/sdk',
  website: 'https://dotpassport.io',
  linkedin: 'https://linkedin.com/company/dotpassport',
};

export function LandingPage() {
  const { isAuthenticated, isInitializing } = useWalletStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (isInitializing) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <span className="text-white font-bold text-lg">DP</span>
              </div>
              <span className="font-bold text-xl text-gray-900">DotPassport</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('developers')}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Developers
              </button>
              <a
                href={LINKS.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors inline-flex items-center gap-1"
              >
                Docs
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors inline-flex items-center gap-1"
              >
                GitHub
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* CTA Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300"
              >
                <Lock className="w-4 h-4" />
                Connect Wallet
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg"
          >
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('developers')}
                className="block w-full text-left px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                Developers
              </button>
              <a
                href={LINKS.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                Documentation
              </a>
              <a
                href={LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                GitHub
              </a>
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl font-semibold"
              >
                Connect Wallet
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute top-20 -left-20 w-60 h-60 bg-pink-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-purple-300/20 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div variants={staggerItem} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100">
                <Globe className="w-4 h-4" />
                Built for the Polkadot Ecosystem
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={staggerItem}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Build Trust Into Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Polkadot dApps
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={staggerItem}
              className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              On-chain reputation scores, identity verification, and achievement badges -
              all through one simple SDK. Integrate trust into your dApp in minutes.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={staggerItem}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300"
              >
                <Zap className="w-5 h-5" />
                Get Started Free
              </button>
              <a
                href={LINKS.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 font-semibold text-lg transition-colors"
              >
                View Documentation
                <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: '12', label: 'Score Categories' },
              { value: '12+', label: 'Achievement Badges' },
              { value: '7', label: 'API Endpoints' },
              { value: '100%', label: 'Free to Start' },
            ].map((stat, index) => (
              <motion.div key={index} variants={staggerItem} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-600 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What is DotPassport Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What is DotPassport?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A comprehensive on-chain identity and reputation system for the Polkadot ecosystem
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: BarChart3,
                title: 'Reputation Scores',
                description: 'Quantify on-chain credibility with 12 scoring categories covering longevity, activity, governance, staking, and more.',
                color: 'purple',
              },
              {
                icon: Trophy,
                title: 'Achievement Badges',
                description: 'Showcase verified accomplishments with 12+ badges including Relay Chain Initiate, NPoS Guardian, and Treasury Contributor.',
                color: 'pink',
              },
              {
                icon: Fingerprint,
                title: 'Identity Profiles',
                description: 'Unified identity from on-chain data, registrar verification, and social connections in one comprehensive profile.',
                color: 'purple',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                    feature.color === 'purple'
                      ? 'bg-gradient-to-br from-purple-100 to-purple-200'
                      : 'bg-gradient-to-br from-pink-100 to-pink-200'
                  }`}
                >
                  <feature.icon
                    className={`w-7 h-7 ${
                      feature.color === 'purple' ? 'text-purple-600' : 'text-pink-600'
                    }`}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Widget Showcase Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Beautiful, Ready-to-Use{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Widgets
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Drop-in components that work out of the box. Light and dark themes included.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                title: 'Profile Widget',
                image: 'https://i.ibb.co/bMmjMXp2/dotpassport-profile-widget.png',
                description: 'Complete user identity',
              },
              {
                title: 'Reputation Widget',
                image: 'https://i.ibb.co/fVxDyQFJ/dotpassport-reputation-widget-light.png',
                description: 'Scores at a glance',
              },
              {
                title: 'Badge Widget',
                image: 'https://i.ibb.co/Wp7Q7408/dotpassport-badge-widget-light.png',
                description: 'Achievement showcase',
              },
              {
                title: 'Dark Mode',
                image: 'https://i.ibb.co/chgG04Ws/dotpassport-reputation-widget-dark.png',
                description: 'Fully themed',
              },
            ].map((widget, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
                  <img
                    src={widget.image}
                    alt={widget.title}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                  />
                </div>
                <div className="p-4 text-center">
                  <h4 className="font-semibold text-gray-900">{widget.title}</h4>
                  <p className="text-sm text-gray-500">{widget.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Developer Experience Section */}
      <section id="developers" className="py-20 md:py-32 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Developer Experience First
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Get up and running in minutes with our TypeScript SDK
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Code Example */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInUp}
              className="min-w-0 w-full"
            >
              {/* NPM Install */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm font-medium">Install via npm</span>
                  <button
                    onClick={() => copyToClipboard('npm install @dotpassport/sdk')}
                    className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <span className="text-gray-500">$</span>{' '}
                  <span className="text-green-400">npm install</span>{' '}
                  <span className="text-purple-400">@dotpassport/sdk</span>
                </div>
              </div>

              {/* Code Snippet */}
              <div className="min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm font-medium">Quick Start</span>
                  <button
                    onClick={() =>
                      copyToClipboard(`import { DotPassport } from '@dotpassport/sdk';

const client = new DotPassport({ apiKey: 'your-api-key' });
const profile = await client.getProfile(address);
const scores = await client.getScores(address);
const badges = await client.getBadges(address);`)
                    }
                    className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-x-auto max-w-full">
                  <pre className="text-gray-300 whitespace-pre-wrap sm:whitespace-pre">
                    <span className="text-purple-400">import</span>{' '}
                    <span className="text-gray-300">{'{ '}</span>
                    <span className="text-yellow-400">DotPassport</span>
                    <span className="text-gray-300">{' }'}</span>
                    <span className="text-purple-400"> from</span>{' '}
                    <span className="text-green-400">'@dotpassport/sdk'</span>
                    <span className="text-gray-300">;</span>
                    {'\n\n'}
                    <span className="text-purple-400">const</span>{' '}
                    <span className="text-blue-400">client</span>
                    <span className="text-gray-300"> = </span>
                    <span className="text-purple-400">new</span>{' '}
                    <span className="text-yellow-400">DotPassport</span>
                    <span className="text-gray-300">{'({ '}</span>
                    <span className="text-blue-400">apiKey</span>
                    <span className="text-gray-300">: </span>
                    <span className="text-green-400">'your-api-key'</span>
                    <span className="text-gray-300">{' });'}</span>
                    {'\n\n'}
                    <span className="text-purple-400">const</span>{' '}
                    <span className="text-blue-400">profile</span>
                    <span className="text-gray-300"> = </span>
                    <span className="text-purple-400">await</span>{' '}
                    <span className="text-blue-400">client</span>
                    <span className="text-gray-300">.</span>
                    <span className="text-yellow-400">getProfile</span>
                    <span className="text-gray-300">(</span>
                    <span className="text-blue-400">address</span>
                    <span className="text-gray-300">);</span>
                    {'\n'}
                    <span className="text-purple-400">const</span>{' '}
                    <span className="text-blue-400">scores</span>
                    <span className="text-gray-300"> = </span>
                    <span className="text-purple-400">await</span>{' '}
                    <span className="text-blue-400">client</span>
                    <span className="text-gray-300">.</span>
                    <span className="text-yellow-400">getScores</span>
                    <span className="text-gray-300">(</span>
                    <span className="text-blue-400">address</span>
                    <span className="text-gray-300">);</span>
                    {'\n'}
                    <span className="text-purple-400">const</span>{' '}
                    <span className="text-blue-400">badges</span>
                    <span className="text-gray-300"> = </span>
                    <span className="text-purple-400">await</span>{' '}
                    <span className="text-blue-400">client</span>
                    <span className="text-gray-300">.</span>
                    <span className="text-yellow-400">getBadges</span>
                    <span className="text-gray-300">(</span>
                    <span className="text-blue-400">address</span>
                    <span className="text-gray-300">);</span>
                  </pre>
                </div>
              </div>

              {/* Links */}
              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href={LINKS.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Full Documentation
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href={LINKS.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 font-medium transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
                <a
                  href={LINKS.npm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 font-medium transition-colors"
                >
                  <Package className="w-4 h-4" />
                  NPM Package
                </a>
              </div>
            </motion.div>

            {/* Features List */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="grid sm:grid-cols-2 gap-6"
            >
              {[
                { icon: Terminal, title: '7 API Endpoints', desc: 'Profile, scores, badges, and metadata' },
                { icon: Palette, title: '4 Ready-Made Widgets', desc: 'Customizable React components' },
                { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Track all your API usage' },
                { icon: Code, title: 'TypeScript Support', desc: 'Full type definitions included' },
                { icon: Moon, title: 'Dark Mode', desc: 'All widgets support themes' },
                { icon: Zap, title: 'Lightweight', desc: 'Zero heavy dependencies' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{feature.title}</h4>
                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Every Use Case
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From DeFi protocols to social platforms, DotPassport powers trust across the ecosystem
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                title: 'DeFi Platforms',
                description: 'Risk assessment with reputation scores for lending and liquidity protocols',
                icon: Shield,
              },
              {
                title: 'DAOs',
                description: 'Governance weight based on on-chain activity and participation history',
                icon: Layers,
              },
              {
                title: 'NFT Marketplaces',
                description: 'Verify collector authenticity and track trading reputation',
                icon: Trophy,
              },
              {
                title: 'Gaming & Social',
                description: 'Player profiles, achievement badges, and social credibility scores',
                icon: Fingerprint,
              },
            ].map((useCase, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-purple-100 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4">
                  <useCase.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{useCase.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Start Building in 3 Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get your API key and start integrating in minutes
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                step: '1',
                title: 'Connect Wallet',
                description: 'Sign in with your Polkadot wallet to get your free API key instantly',
                icon: Lock,
              },
              {
                step: '2',
                title: 'Install SDK',
                description: 'Add our TypeScript SDK to your project with a single npm install',
                icon: Terminal,
              },
              {
                step: '3',
                title: 'Start Building',
                description: 'Use our widgets and API methods to integrate reputation into your dApp',
                icon: Code,
              },
            ].map((item, index) => (
              <motion.div key={index} variants={staggerItem} className="relative">
                {/* Connector Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-200 to-pink-200" />
                )}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative">
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-6 mt-2">
                    <item.icon className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sandbox Features Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 lg:p-16 overflow-hidden relative"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500 rounded-full blur-3xl" />
            </div>

            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Try the Sandbox
                </h2>
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  Test all SDK features in our interactive sandbox environment. No setup required -
                  just connect your wallet and start exploring.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    'Test all 7 SDK methods with live data',
                    'Widget playground with live preview',
                    'Request tracking & analytics',
                    'Free tier: 100 requests/hour',
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-300">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                >
                  <FlaskConical className="w-5 h-5" />
                  Enter Sandbox
                </button>
              </div>

              <div className="space-y-4">
                {/* Sandbox Screenshots */}
                {[
                  {
                    title: 'Dashboard',
                    image: 'https://i.ibb.co/wZc8GRWG/dotpassport-sandbox-dashboard.png',
                    desc: 'Real-time analytics',
                  },
                  {
                    title: 'API Testing',
                    image: 'https://i.ibb.co/N61MmCDY/dotpassport-sandbox-api-testing-page.png',
                    desc: 'Test all endpoints',
                  },
                  {
                    title: 'Widget Playground',
                    image: 'https://i.ibb.co/B5PHBQfq/dotpassport-widget-testing-page.png',
                    desc: 'Live preview & customize',
                  },
                ].map((screenshot, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                        <img
                          src={screenshot.image}
                          alt={screenshot.title}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{screenshot.title}</h4>
                        <p className="text-gray-400 text-sm">{screenshot.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-300 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Build?
            </h2>
            <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
              No credit card required. Start with 100 free requests per hour and scale as you grow.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-3 bg-white text-purple-700 px-10 py-5 rounded-full font-bold text-lg hover:bg-purple-50 hover:scale-105 transition-all duration-300 shadow-xl shadow-purple-900/30"
            >
              <Lock className="w-6 h-6" />
              Connect Wallet to Get Started
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">DP</span>
                </div>
                <span className="font-bold text-xl text-white">DotPassport</span>
              </div>
              <p className="text-sm leading-relaxed">
                On-chain reputation and identity for the Polkadot ecosystem.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => scrollToSection('features')}
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <a
                    href={LINKS.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    Documentation
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href={`${LINKS.docs}/api-reference`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    API Reference
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Developers */}
            <div>
              <h4 className="text-white font-semibold mb-4">Developers</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href={LINKS.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    GitHub SDK
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href={LINKS.npm}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    NPM Package
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href={LINKS.githubOrg}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    GitHub Organization
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href={LINKS.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href={LINKS.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    LinkedIn
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} DotPassport. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href={LINKS.githubOrg}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href={LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
