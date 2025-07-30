import {
  ArrowRight,
  ChevronRight,
  Globe,
  Network,
  Shield,
  Star,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LandingPage = () => {
  const navigation = useRouter();

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-6 hover:bg-purple-200 transition-colors cursor-pointer">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">
                Built on Polkadot • Powered by XCM
              </span>
              <ChevronRight className="w-4 h-4" />
            </div>

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
                onClick={() => {
                  navigation.push("/app");
                }}
                className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="flex items-center space-x-2 bg-white text-gray-700 px-8 py-4 rounded-full font-semibold text-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300">
                <Globe className="w-5 h-5" />
                <span>View Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-gray-900 mb-2">15+</div>
                <div className="text-gray-600">Parachain Partners</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  50K+
                </div>
                <div className="text-gray-600">Verified Profiles</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-gray-900 mb-2">1M+</div>
                <div className="text-gray-600">Badges Issued</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-purple-600">DotPassport</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The missing identity and reputation layer for the Polkadot
              ecosystem, designed for seamless integration and maximum user
              value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-pink-50 to-purple-50 p-8 rounded-2xl border border-purple-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Sybil Resistance
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced algorithms detect and prevent fake accounts, ensuring
                authentic reputation scores and protecting dApps from
                manipulation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Network className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Cross-Chain Native
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Built on Polkadot's XCM protocol to aggregate activity across
                all parachains into a unified, portable identity profile.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Usage-Based Reputation
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Earn reputation through real ecosystem participation - staking,
                governance, DAOs, and meaningful on-chain activity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Build with{" "}
            <span className="text-purple-300">DotPassport</span>?
          </h2>
          <p className="text-xl text-purple-100 mb-10 max-w-3xl mx-auto">
            Join the growing ecosystem of dApps leveraging identity and
            reputation to create personalized, meaningful user experiences.
          </p>
          <button
            onClick={() => navigation.push("/app")}
            className="inline-flex items-center space-x-2 bg-white text-purple-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-purple-50 hover:scale-105 transition-all duration-300 group"
          >
            <span>Start Building</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
