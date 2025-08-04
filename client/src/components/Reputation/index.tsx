"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronRight,
  Calendar,
  Zap,
  Shield,
  User,
  Coins,
  Star,
  Users,
  Lightbulb,
  Clock,
  TrendingDown,
  Gift,
  Wallet,
  Vote,
  Image,
  Layers,
  Code,
  History,
} from "lucide-react";

// Import your actual API services
import {
  getUserScore,
  getScoreCategories,
  refreshUserScore,
} from "@/service/scoreService";

// Import your actual types
import {
  UserScore,
  ScoreCategory,
  CategoryScore,
  ReasonDetail,
  RefreshScoreResponse,
} from "@/types/api";
import { formatAgo } from "@/lib/formatAgo";

// Component Props Interfaces
interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  change?: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  onClick?: () => void;
}

interface CategoryDetailProps {
  category: ScoreCategory;
  userScore: CategoryScore;
  maxScore: number;
  isSelected: boolean;
  onClick: () => void;
}

interface ScoreInsightProps {
  category: ScoreCategory;
  userScore: CategoryScore;
  maxScore: number;
}

// Utility functions
const getCategoryIcon = (
  categoryKey: string
): React.ComponentType<{ className?: string }> => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    longevity: Clock,
    txCount: Activity,
    txVolume: Wallet,
    governance: Vote,
    stakingRewards: Coins,
    stakingNominators: Users,
    stakingSlash: Shield,
    nftHoldings: Image,
    tokenDiversity: Layers,
    nftActivity: Gift,
    extrinsicDepth: Code,
    modules: Target,
  };

  return iconMap[categoryKey] || Target;
};

const getCategoryGradient = (categoryKey: string): string => {
  const gradientMap: Record<string, string> = {
    longevity: "from-blue-500 to-indigo-600",
    txCount: "from-green-500 to-emerald-600",
    txVolume: "from-purple-500 to-pink-600",
    governance: "from-orange-500 to-red-600",
    stakingRewards: "from-yellow-400 to-orange-500",
    stakingNominators: "from-cyan-500 to-blue-600",
    stakingSlash: "from-red-500 to-pink-600",
    nftHoldings: "from-pink-500 to-rose-600",
    tokenDiversity: "from-indigo-500 to-purple-600",
    nftActivity: "from-green-400 to-blue-500",
    extrinsicDepth: "from-gray-600 to-gray-800",
    modules: "from-teal-500 to-cyan-600",
  };

  return gradientMap[categoryKey] || "from-gray-500 to-gray-600";
};

// Helper function to get max points for a category
const getCategoryMaxPoints = (category: ScoreCategory): number => {
  return Math.max(...category.reasons.map((reason) => reason.points));
};

// Helper function to find current reason for user using the reason key from API
const getCurrentReason = (
  category: ScoreCategory,
  userScore: CategoryScore
): ReasonDetail | null => {
  return (
    category.reasons.find((reason) => reason.key === userScore.reason) || null
  );
};

// Reusable Components
const ScoreCard: React.FC<ScoreCardProps> = ({
  title,
  score,
  maxScore = 1000,
  change,
  description,
  icon: Icon,
  gradient,
  onClick,
}) => {
  const percentage = Math.min((score / maxScore) * 100, 100);

  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} group-hover:scale-110 transition-transform duration-200`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center space-x-1 text-sm font-medium ${
              change > 0
                ? "text-green-600"
                : change < 0
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {change > 0 && <ArrowUp className="w-4 h-4" />}
            {change < 0 && <ArrowDown className="w-4 h-4" />}
            <span>
              {change > 0 ? "+" : ""}
              {change}
            </span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          {score.toLocaleString()}
        </h3>
        <p className="text-gray-600 text-sm mb-3">{title}</p>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {percentage >= 100 ? "100" : percentage.toFixed(1)}% complete
          </span>
          <span>{maxScore.toLocaleString()} max</span>
        </div>
      </div>

      <p className="text-sm text-gray-600">{description}</p>

      {onClick && (
        <div className="mt-3 flex items-center text-purple-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          <span>View Details</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      )}
    </div>
  );
};

const CategoryDetail: React.FC<CategoryDetailProps> = ({
  category,
  userScore,
  maxScore,
  isSelected,
  onClick,
}) => {
  const Icon = getCategoryIcon(category.key);
  const gradient = getCategoryGradient(category.key);

  // Calculate percentage properly for categories with negative points
  let percentage = 0;
  if (maxScore > 0) {
    percentage = Math.min((userScore.score / maxScore) * 100, 100);
  } else if (maxScore === 0) {
    // For categories like staking slashes where max is 0
    const minScore = Math.min(...category.reasons.map((r) => r.points));
    if (minScore < 0) {
      // Progress from worst (minScore) to best (0)
      percentage = ((userScore.score - minScore) / (0 - minScore)) * 100;
    } else {
      percentage = userScore.score === 0 ? 100 : 0;
    }
  }

  const currentReason = getCurrentReason(category, userScore);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-lg border transition-all duration-300 cursor-pointer group ${
        isSelected
          ? "border-purple-300 ring-2 ring-purple-200 shadow-xl"
          : "border-gray-100 hover:border-purple-200 hover:shadow-xl"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} group-hover:scale-110 transition-transform duration-200`}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
              {category.displayName}
            </h3>
            <p className="text-sm text-gray-600">
              {category.short_description}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {userScore.score}
          </div>
          <div className="text-sm text-gray-500">of {maxScore}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Progress</span>
          <span className="text-gray-500">
            {percentage >= 100 ? "100" : percentage.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {currentReason?.title || "No Achievement"}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {currentReason?.description || userScore.reason}
          </p>
        </div>
        <ChevronRight
          className={`w-5 h-5 transition-all duration-200 ${
            isSelected
              ? "text-purple-600 rotate-90"
              : "text-gray-400 group-hover:text-purple-600"
          }`}
        />
      </div>
    </div>
  );
};

const ScoreInsight: React.FC<ScoreInsightProps> = ({
  category,
  userScore,
  maxScore,
}) => {
  // Calculate percentage properly for categories with negative points
  let percentage = 0;
  if (maxScore > 0) {
    percentage = (userScore.score / maxScore) * 100;
  } else if (maxScore === 0) {
    // For categories like staking slashes where max is 0
    const minScore = Math.min(...category.reasons.map((r) => r.points));
    if (minScore < 0) {
      // Progress from worst (minScore) to best (0)
      percentage = ((userScore.score - minScore) / (0 - minScore)) * 100;
    } else {
      percentage = userScore.score === 0 ? 100 : 0;
    }
  }

  const currentReason = getCurrentReason(category, userScore);

  // Sort reasons by points ascending to show progression
  const sortedReasons = [...category.reasons].sort(
    (a, b) => a.points - b.points
  );

  // Find next achievable level
  const nextReason = sortedReasons.find(
    (reason) => reason.points > userScore.score
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-16 max-h-[calc(100vh-90px)] overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${getCategoryGradient(
              category.key
            )}`}
          >
            {React.createElement(getCategoryIcon(category.key), {
              className: "w-6 h-6 text-white",
            })}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {category.displayName}
            </h3>
            <p className="text-sm text-gray-600">
              {userScore.score} / {maxScore} points
            </p>
          </div>
        </div>

        <p className="text-gray-700 mb-4">{category.long_description}</p>

        {/* Current Status */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-900">
              Current Achievement
            </span>
            <span className="text-sm text-gray-600">
              {percentage >= 100 ? "100" : percentage.toFixed(1)}% complete
            </span>
          </div>

          {currentReason ? (
            <div className="mb-3">
              <h4 className="font-medium text-gray-900 mb-1">
                {currentReason.title}
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                {currentReason.description}
              </p>

              {/* Thresholds */}
              {currentReason.thresholds &&
                currentReason.thresholds.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {currentReason.thresholds.map(
                      (threshold: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-xs"
                        >
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="font-medium text-green-700">
                            {threshold.label}:
                          </span>
                          <span className="text-gray-600">
                            {threshold.description}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}

              {/* Current Advice */}
              {currentReason.advices && currentReason.advices.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900 text-sm">
                      Tips for your level
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {currentReason.advices.map(
                      (advice: string, index: number) => (
                        <li key={index} className="text-sm text-blue-800">
                          • {advice}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-700 mb-3">{userScore.reason}</p>
          )}

          {/* Next Level Preview */}
          {nextReason && (
            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-900 text-sm">
                  Next Achievement
                </span>
              </div>
              <h5 className="font-medium text-purple-900 text-sm">
                {nextReason.title}
              </h5>
              <p className="text-xs text-purple-700 mb-2">
                {nextReason.description}
              </p>
              <div className="flex items-center space-x-2 text-xs text-purple-600">
                <span className="font-medium">
                  +{nextReason.points - userScore.score} points needed
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scoring Breakdown */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <BarChart3 className="w-4 h-4" />
          <span>Achievement Levels</span>
        </h4>

        <div className="space-y-3">
          {sortedReasons.map((reason, index) => {
            const isCurrentLevel = currentReason?.key === reason.key;
            // For categories with negative points, only the current level should be marked as "achieved"
            // For positive point categories, all levels up to current score are "achieved"
            const isAchieved =
              maxScore <= 0 ? isCurrentLevel : reason.points <= userScore.score;

            return (
              <div
                key={reason.key}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  isCurrentLevel
                    ? "bg-purple-50 border-purple-300"
                    : isAchieved
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {isAchieved ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                    <h5
                      className={`font-semibold ${
                        isCurrentLevel
                          ? "text-purple-900"
                          : isAchieved
                          ? "text-green-900"
                          : "text-gray-700"
                      }`}
                    >
                      {reason.title}
                    </h5>
                  </div>
                  <span
                    className={`text-sm font-bold px-2 py-1 rounded-full ${
                      isCurrentLevel
                        ? "bg-purple-100 text-purple-700"
                        : isAchieved
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {reason.points} pts
                  </span>
                </div>

                <p
                  className={`text-sm mb-3 ${
                    isCurrentLevel
                      ? "text-purple-800"
                      : isAchieved
                      ? "text-green-800"
                      : "text-gray-600"
                  }`}
                >
                  {reason.description}
                </p>

                {/* Thresholds for this level */}
                {reason.thresholds && reason.thresholds.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      Requirements:
                    </p>
                    <div className="space-y-1">
                      {reason.thresholds.map(
                        (threshold: any, thresholdIndex: number) => (
                          <div
                            key={thresholdIndex}
                            className="flex items-start space-x-2 text-xs"
                          >
                            <span className="font-medium text-gray-600 min-w-0 flex-shrink-0">
                              {threshold.label}:
                            </span>
                            <span className="text-gray-500">
                              {threshold.description}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Advice for achieving this level */}
                {reason.advices && reason.advices.length > 0 && !isAchieved && (
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      How to achieve:
                    </p>
                    <ul className="space-y-1">
                      {reason.advices
                        .slice(0, 2)
                        .map((advice: string, adviceIndex: number) => (
                          <li
                            key={adviceIndex}
                            className="text-xs text-gray-600"
                          >
                            • {advice}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Progress bar for this level */}
                <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCurrentLevel
                        ? "bg-gradient-to-r from-purple-500 to-purple-600"
                        : isAchieved
                        ? "bg-gradient-to-r from-green-500 to-green-600"
                        : "bg-gray-300"
                    }`}
                    style={{
                      width: isAchieved
                        ? "100%"
                        : maxScore <= 0
                        ? "0%" // For negative point categories, don't show partial progress
                        : userScore.score > 0
                        ? `${Math.min(
                            (userScore.score / reason.points) * 100,
                            100
                          )}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Reputation: React.FC = () => {
  // State management
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Data state
  const [userScore, setUserScore] = useState<UserScore | null>(null);
  const [scoreCategories, setScoreCategories] = useState<ScoreCategory[]>([]);

  // Load data
  const loadReputationData = async (): Promise<void> => {
    try {
      setError(null);

      const [scoreData, categoriesData] = await Promise.all([
        getUserScore().catch(() => null),
        getScoreCategories(),
      ]);

      setUserScore(scoreData);
      setScoreCategories(
        categoriesData.categories.sort((a, b) => a.order - b.order)
      );

      // Auto-select first category if none selected
      if (!selectedCategory && categoriesData.categories.length > 0) {
        setSelectedCategory(categoriesData.categories[0].key);
      }
    } catch (err) {
      console.error("Failed to load reputation data:", err);
      setError("Failed to load reputation data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh score
  const handleRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      const refreshResult: RefreshScoreResponse = await refreshUserScore();
      console.log("Score refresh result:", refreshResult);

      // Reload data after refresh
      await loadReputationData();
    } catch (err) {
      console.error("Failed to refresh score:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadReputationData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 px-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Loading Reputation Data
              </h2>
              <p className="text-gray-500">
                Analyzing your on-chain activity...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 px-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-500 mb-6">{error}</p>
              <button
                onClick={loadReputationData}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No score data state
  if (!userScore || !userScore.score_exists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 px-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Reputation Score
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your reputation score is being calculated based on your on-chain
              activities in the Polkadot ecosystem.
            </p>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-70 mx-auto"
            >
              <RefreshCw
                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>
                {isRefreshing ? "Calculating Score..." : "Calculate My Score"}
              </span>
            </button>

            {/* Available Categories Preview */}
            <div className="mt-12 max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Score Categories
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {scoreCategories.slice(0, 8).map((category) => {
                  const Icon = getCategoryIcon(category.key);
                  const gradient = getCategoryGradient(category.key);

                  return (
                    <div
                      key={category.key}
                      className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${gradient} mb-3 mx-auto`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm text-center">
                        {category.displayName}
                      </h4>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get categories with proper max scores
  const categoriesWithScores = scoreCategories
    .filter((cat) => userScore.categories[cat.key])
    .map((cat) => ({
      category: cat,
      userScore: userScore.categories[cat.key],
      maxScore: getCategoryMaxPoints(cat),
    }))
    .sort((a, b) => b.userScore.score - a.userScore.score);

  const selectedCategoryData = categoriesWithScores.find(
    (item) => item.category.key === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 px-4">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Reputation Score
              </h1>
              <p className="text-gray-600">
                Your comprehensive on-chain reputation across the Polkadot
                ecosystem
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-70"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>{isRefreshing ? "Refreshing..." : "Refresh Score"}</span>
            </button>
          </div>
        </div>

        {/* Total Score Hero Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-purple-600/10 rounded-full translate-x-16 -translate-y-16"></div>
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-gray-900">
                      {userScore.totalScore.toLocaleString()}
                    </h2>
                    <p className="text-gray-600">Total Reputation Points</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Active Categories
                    </p>
                    <p className="text-xl font-semibold text-gray-900">
                      {Object.keys(userScore.categories).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                    <p className="text-lg font-semibold text-gray-900 flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {userScore.calculatedAt
                          ? formatAgo(userScore.calculatedAt)
                          : "Recently"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center lg:text-right">
                <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Score Active</span>
                </div>
                <p className="text-sm text-gray-600">
                  Your reputation is being tracked across{" "}
                  {Object.keys(userScore.categories).length} activity categories
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories List - Scrollable */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Score Categories
            </h3>

            <div className="space-y-4 overflow-y-auto pr-2">
              {categoriesWithScores.map(
                ({ category, userScore: categoryScore, maxScore }) => (
                  <CategoryDetail
                    key={category.key}
                    category={category}
                    userScore={categoryScore}
                    maxScore={maxScore}
                    isSelected={selectedCategory === category.key}
                    onClick={() => setSelectedCategory(category.key)}
                  />
                )
              )}
            </div>
          </div>

          {/* Category Details Sidebar - Sticky */}
          <div className="space-y-6 mt-12">
            {selectedCategoryData ? (
              <ScoreInsight
                category={selectedCategoryData.category}
                userScore={selectedCategoryData.userScore}
                maxScore={selectedCategoryData.maxScore}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 text-center py-8 sticky top-6">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Select a Category
                </h3>
                <p className="text-gray-500">
                  Click on any category to see detailed scoring breakdown and
                  improvement tips
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reputation;
