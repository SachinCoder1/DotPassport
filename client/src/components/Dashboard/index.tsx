"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Award,
  TrendingUp,
  User,
  RefreshCw,
  Calendar,
  Target,
  Star,
  Trophy,
  ChevronRight,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Sparkles,
  BarChart3,
  ExternalLink,
  Crown,
  Zap,
  Users,
  Coins,
  Vote,
  Globe,
  Wallet,
  TrendingDown,
  Plus,
  Bell,
  Gift,
  Layers,
  Eye,
  Brain,
  Flame,
  DollarSign,
  Medal,
} from "lucide-react";

// Import API services
import { getMe } from "@/service/profileService";
import {
  getUserScore,
  getScoreCategories,
  refreshUserScore,
} from "@/service/scoreService";
import {
  getUserBadges,
  getBadgeDefinitions,
  refreshUserBadges,
} from "@/service/badgeService";

// Import types
import {
  LoggedInUser,
  UserScore,
  ScoreCategory,
  UserBadge,
  BadgeDefinition,
} from "@/types/api";
import { toast } from "sonner";

// Temporary formatAgo function (replace with import when available)
const formatAgo = (date?: Date | string | number): string => {
  if (!date) return "just now";

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "just now";

  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "today";
  if (diffInDays === 1) return "yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

// Category mapping
// Category mapping
const getCategoryInfo = (key: string) => {
  const categoryMap: Record<string, any> = {
    longevity: {
      label: "Account Longevity",
      icon: Clock,
      iconColorClass: "text-blue-600",
      iconBgClass: "bg-blue-100",
      progressGradientClass: "bg-gradient-to-r from-blue-400 to-blue-500",
    },
    txCount: {
      label: "Transaction Count",
      icon: Activity,
      iconColorClass: "text-green-600",
      iconBgClass: "bg-green-100",
      progressGradientClass: "bg-gradient-to-r from-green-400 to-green-500",
    },
    txVolume: {
      label: "Transaction Volume",
      icon: Wallet,
      iconColorClass: "text-purple-600",
      iconBgClass: "bg-purple-100",
      progressGradientClass: "bg-gradient-to-r from-purple-400 to-purple-500",
    },
    governance: {
      label: "Governance",
      icon: Vote,
      iconColorClass: "text-orange-600",
      iconBgClass: "bg-orange-100",
      progressGradientClass: "bg-gradient-to-r from-orange-400 to-orange-500",
    },
    stakingRewards: {
      label: "Staking Rewards",
      icon: Coins,
      iconColorClass: "text-yellow-600",
      iconBgClass: "bg-yellow-100",
      progressGradientClass: "bg-gradient-to-r from-yellow-400 to-yellow-500",
    },
    stakingNominators: {
      label: "Staking Nominators",
      icon: Users,
      iconColorClass: "text-cyan-600",
      iconBgClass: "bg-cyan-100",
      progressGradientClass: "bg-gradient-to-r from-cyan-400 to-cyan-500",
    },
    stakingSlash: {
      label: "Staking Slashes",
      icon: Shield,
      iconColorClass: "text-red-600",
      iconBgClass: "bg-red-100",
      progressGradientClass: "bg-gradient-to-r from-red-400 to-red-500",
    },
    nftHoldings: {
      label: "NFT Holdings",
      icon: Sparkles,
      iconColorClass: "text-pink-600",
      iconBgClass: "bg-pink-100",
      progressGradientClass: "bg-gradient-to-r from-pink-400 to-pink-500",
    },
    tokenDiversity: {
      label: "Token Diversity",
      icon: Layers,
      iconColorClass: "text-indigo-600",
      iconBgClass: "bg-indigo-100",
      progressGradientClass: "bg-gradient-to-r from-indigo-400 to-indigo-500",
    },
    nftActivity: {
      label: "NFT Activity",
      icon: Star,
      iconColorClass: "text-emerald-600",
      iconBgClass: "bg-emerald-100",
      progressGradientClass: "bg-gradient-to-r from-emerald-400 to-emerald-500",
    },
    extrinsicDepth: {
      label: "Extrinsic Depth",
      icon: BarChart3,
      iconColorClass: "text-slate-600",
      iconBgClass: "bg-slate-100",
      progressGradientClass: "bg-gradient-to-r from-slate-400 to-slate-500",
    },
    modules: {
      label: "Module Diversity",
      icon: Target,
      iconColorClass: "text-violet-600",
      iconBgClass: "bg-violet-100",
      progressGradientClass: "bg-gradient-to-r from-violet-400 to-violet-500",
    },
    default: {
      label: key,
      icon: Award,
      iconColorClass: "text-gray-600",
      iconBgClass: "bg-gray-100",
      progressGradientClass: "bg-gradient-to-r from-gray-400 to-gray-500",
    },
  };

  return categoryMap[key] || categoryMap.default;
};
// Enhanced Components
interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  trend?: "up" | "down" | "neutral";
  change?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  trend,
  change,
  onClick,
}) => (
  <div
    className={`cursor-default relative bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group overflow-hidden`}
  >
    <div
      className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br opacity-10 rounded-full -translate-y-4 translate-x-4"
      style={{
        background: `linear-gradient(135deg, ${gradient.split(" ")[1]}, ${
          gradient.split(" ")[3]
        })`,
      }}
    ></div>

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} group-hover:scale-110 transition-transform duration-200`}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        {change && (
          <div
            className={`flex items-center space-x-1 text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${
              trend === "up"
                ? "text-green-700 bg-green-100"
                : trend === "down"
                ? "text-red-700 bg-red-100"
                : "text-gray-700 bg-gray-100"
            }`}
          >
            {trend === "up" && <ArrowUp className="w-3 h-3" />}
            {trend === "down" && <ArrowDown className="w-3 h-3" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      <div className="mb-2">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-gray-600 text-xs sm:text-sm font-medium">{title}</p>
        {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
      </div>

      {onClick && (
        <div
          onClick={onClick}
          className="cursor-pointer flex items-center text-purple-600 text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <span>View Details</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      )}
    </div>
  </div>
);

interface CategoryCardProps {
  category: ScoreCategory;
  userScore: { score: number; reason: string };
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  userScore,
  onClick,
}) => {
  const categoryInfo = getCategoryInfo(category.key);
  const maxScore = Math.max(...category.reasons.map((r) => r.points));
  const percentage = Math.min((userScore.score / maxScore) * 100, 100);
  const currentReason = category.reasons.find(
    (r) => r.key === userScore.reason
  );
  const isCompleted = percentage >= 100;
  const isHighPerformer = percentage >= 80 && !isCompleted;

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-xl overflow-hidden ${
        isCompleted
          ? "border-purple-300 ring-2 ring-purple-200 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50"
          : isHighPerformer
          ? "border-green-300 ring-1 ring-green-200 shadow-md bg-gradient-to-br from-green-50 to-emerald-50"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
      }`}
    >
      {/* Completion celebration effects */}
      {isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 to-indigo-200/20 animate-pulse pointer-events-none" />
      )}

      {/* High performer indicator */}
      {isHighPerformer && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>EXCELLENT</span>
          </div>
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isCompleted
                  ? "bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg scale-110"
                  : isHighPerformer
                  ? "bg-gradient-to-br from-green-400 to-emerald-500"
                  : categoryInfo.iconBgClass // <-- UPDATED
              }`}
            >
              {isCompleted ? (
                <Crown className="w-6 h-6 text-white" />
              ) : (
                <categoryInfo.icon
                  className={`w-6 h-6 ${
                    isHighPerformer ? "text-white" : categoryInfo.iconColorClass // <-- UPDATED
                  }`}
                />
              )}
            </div>
            <div>
              <h4
                className={`font-bold transition-colors ${
                  isCompleted
                    ? "text-purple-800"
                    : isHighPerformer
                    ? "text-green-800"
                    : "text-gray-900 group-hover:text-purple-700"
                }`}
              >
                {category.displayName}
              </h4>
              <p
                className={`text-xs ${
                  isCompleted
                    ? "text-purple-600"
                    : isHighPerformer
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {currentReason?.title || "Current Level"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`text-xl font-bold ${
                isCompleted
                  ? "text-purple-700"
                  : isHighPerformer
                  ? "text-green-700"
                  : "text-gray-900"
              }`}
            >
              {userScore.score}
            </div>
            <div className="text-xs text-gray-500">of {maxScore}</div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs mb-2">
            <span
              className={`font-medium ${
                isCompleted
                  ? "text-purple-700"
                  : isHighPerformer
                  ? "text-green-700"
                  : "text-gray-700"
              }`}
            >
              Progress
            </span>
            <span
              className={`font-bold ${
                isCompleted
                  ? "text-purple-700"
                  : isHighPerformer
                  ? "text-green-700"
                  : "text-gray-500"
              }`}
            >
              {percentage.toFixed(0)}%
            </span>
          </div>
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
            {percentage > 0 ? (
              isCompleted ? (
                <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 rounded-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
              ) : (
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHighPerformer
                      ? "bg-gradient-to-r from-green-400 to-emerald-500"
                      : categoryInfo.progressGradientClass
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              )
            ) : (
              <div className="h-full bg-gray-200 rounded-full" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
interface RecentBadgeProps {
  badge: UserBadge;
  definition?: BadgeDefinition;
  onClick: () => void;
}

const RecentBadge: React.FC<RecentBadgeProps> = ({
  badge,
  definition,
  onClick,
}) => {
  const isFullyCompleted =
    definition &&
    badge.achievedLevel >= Math.max(...definition.levels.map((l) => l.level));
  const isHighLevel =
    definition &&
    badge.achievedLevel >=
      Math.max(...definition.levels.map((l) => l.level)) * 0.8;

  return (
    <div
      onClick={onClick}
      className={`relative p-3 sm:p-4 rounded-2xl transition-all duration-300 cursor-pointer group hover:scale-105 overflow-hidden ${
        isFullyCompleted
          ? "bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 shadow-lg"
          : isHighLevel
          ? "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200"
          : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
      }`}
    >
      {/* Mastery celebration effect */}
      {isFullyCompleted && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 to-indigo-200/20 animate-pulse pointer-events-none" />
      )}

      <div className="flex items-center space-x-3 sm:space-x-4 relative z-10">
        <div
          className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isFullyCompleted
              ? "bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl scale-110"
              : isHighLevel
              ? "bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg"
              : "bg-gradient-to-br from-green-500 to-emerald-600"
          }`}
        >
          {isFullyCompleted ? (
            <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          ) : (
            <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          )}

          {/* Sparkle effects for mastered badges */}
          {isFullyCompleted && (
            <>
              <div className="absolute -top-1 -right-1 w-3 h-3">
                <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2">
                <Star className="w-2 h-2 text-yellow-400 fill-current animate-bounce" />
              </div>
            </>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className={`font-bold transition-colors mb-1 text-sm sm:text-base truncate ${
              isFullyCompleted
                ? "text-purple-800"
                : isHighLevel
                ? "text-blue-800"
                : "text-gray-900 group-hover:text-purple-700"
            }`}
          >
            {definition?.title || "Achievement"}
          </h4>
          <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm">
            <div
              className={`flex items-center space-x-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full ${
                isFullyCompleted
                  ? "bg-purple-100 text-purple-700"
                  : isHighLevel
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <Medal className="w-3 h-3" />
              <span className="font-semibold">Level {badge.achievedLevel}</span>
            </div>
            <span className="text-gray-500 text-xs">
              {formatAgo(badge.earnedAt)}
            </span>
          </div>

          {/* Badge level title */}
          <p
            className={`text-xs mt-1 font-medium truncate ${
              isFullyCompleted
                ? "text-purple-600"
                : isHighLevel
                ? "text-blue-600"
                : "text-gray-600"
            }`}
          >
            {badge.achievedLevelTitle}
          </p>
        </div>

        <div className="flex flex-col items-center space-y-1">
          <ChevronRight
            className={`w-5 h-5 transition-colors ${
              isFullyCompleted
                ? "text-purple-600"
                : isHighLevel
                ? "text-blue-600"
                : "text-gray-400 group-hover:text-purple-600"
            }`}
          />
          {isFullyCompleted && (
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-purple-500 fill-current" />
              <Star className="w-3 h-3 text-purple-500 fill-current" />
              <Star className="w-3 h-3 text-purple-500 fill-current" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ActivityItemProps {
  type: "badge" | "score" | "milestone";
  title: string;
  description: string;
  date: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  priority?: number;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  type,
  title,
  description,
  date,
  icon: Icon,
  gradient,
  priority = 1,
}) => {
  const isHighPriority = priority >= 3;
  const isMediumPriority = priority >= 2;

  return (
    <div
      className={`flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl transition-all duration-200 ${
        isHighPriority
          ? "bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 shadow-md"
          : isMediumPriority
          ? "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200"
          : "hover:bg-gray-50"
      }`}
    >
      {/* Icon column */}
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} flex-shrink-0 transition-all duration-200 ${
          isHighPriority
            ? "scale-110 shadow-lg"
            : isMediumPriority
            ? "shadow-md"
            : ""
        }`}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />

        {/* Special effects for high priority items */}
        {isHighPriority && (
          <>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -left-1">
              <Star className="w-2 h-2 sm:w-3 sm:h-3 text-yellow-400 fill-current" />
            </div>
          </>
        )}
      </div>

      {/* Content column */}
      <div className="flex-1 min-w-0">
        <h4
          className={`font-bold transition-colors text-sm sm:text-base truncate mb-1 ${
            isHighPriority
              ? "text-purple-800"
              : isMediumPriority
              ? "text-blue-800"
              : "text-gray-900"
          }`}
        >
          {title}
        </h4>

        <p
          className={`text-xs sm:text-sm mb-2 ${
            isHighPriority
              ? "text-purple-600"
              : isMediumPriority
              ? "text-blue-600"
              : "text-gray-600"
          }`}
        >
          {description}
        </p>

        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-xs ${
              isHighPriority
                ? "text-purple-500"
                : isMediumPriority
                ? "text-blue-500"
                : "text-gray-500"
            }`}
          >
            {formatAgo(date)}
          </p>

          {/* Achievement indicator for high priority items */}
          {isHighPriority && (
            <div className="flex items-center space-x-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold flex-shrink-0">
              <Crown className="w-3 h-3" />
              <span>MASTERY</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const router = useRouter();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [userScore, setUserScore] = useState<UserScore | null>(null);
  const [scoreCategories, setScoreCategories] = useState<ScoreCategory[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [badgeDefinitions, setBadgeDefinitions] = useState<BadgeDefinition[]>(
    []
  );

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setError(null);

      const [userData, scoreData, categoriesData, badgesData, definitionsData] =
        await Promise.all([
          getMe(),
          getUserScore().catch(() => null),
          getScoreCategories(),
          getUserBadges().catch(() => ({ badges: [] })),
          getBadgeDefinitions(),
        ]);

      setUser(userData);
      setUserScore(scoreData);
      setScoreCategories(
        categoriesData.categories.sort((a, b) => a.order - b.order)
      );
      setUserBadges(badgesData.badges || []);
      setBadgeDefinitions(definitionsData.badges);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);

    // Define the entire asynchronous process as a promise
    const refreshProcess = new Promise(async (resolve, reject) => {
      try {
        // 1. Trigger the backend refresh processes
        await Promise.all([
          refreshUserScore().catch((e) =>
            console.error("Score refresh trigger failed", e)
          ),
          refreshUserBadges().catch((e) =>
            console.error("Badge refresh trigger failed", e)
          ),
        ]);

        // 2. Fetch the new data
        const [newScoreData, newBadgesData] = await Promise.all([
          getUserScore().catch(() => null),
          getUserBadges().catch(() => ({ badges: [] })),
        ]);

        // 3. Update the component's state with the new data
        if (newScoreData) {
          setUserScore(newScoreData);
        }
        if (newBadgesData) {
          setUserBadges(newBadgesData.badges || []);
        }

        // 4. Check if the score actually changed and resolve the promise with a message
        const scoreChanged = newScoreData &&
          newScoreData.totalScore !== userScore?.totalScore;

        if (scoreChanged) {
          resolve("Dashboard synced successfully!");
        } else {
          resolve("Data refreshed - already up-to-date!");
        }
      } catch (error) {
        console.error("Failed to refresh data:", error);
        reject("Failed to sync data. Please try again.");
      }
    });

    // Use sonner's toast.promise to handle the UI feedback
    toast.promise(refreshProcess, {
      loading: "Syncing your on-chain data...",
      success: (message) => `${message}`, // Displays the success message from resolve()
      error: (errorMessage) => `${errorMessage}`, // Displays the error message from reject()
    });

    // Ensure the button's "isRefreshing" state is reset after the process completes
    refreshProcess.finally(() => {
      setIsRefreshing(false);
    });
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-700 mb-3">
                Loading Dashboard
              </h2>
              <p className="text-gray-500">
                Preparing your personalized overview...
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
      <div className="min-h-screen bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-700 mb-3">
                Something went wrong
              </h2>
              <p className="text-gray-500 mb-8">{error}</p>
              <button
                onClick={loadDashboardData}
                className="cursor-pointer bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  const topCategories = Object.entries(userScore?.categories || {})
    .map(([key, data]) => {
      const category = scoreCategories.find((cat) => cat.key === key);
      if (!category) return null;

      const maxScore = Math.max(...category.reasons.map((r) => r.points));
      const percentage = Math.min((data.score / maxScore) * 100, 100);
      const isCompleted = percentage >= 100;
      const isHighPerformer = percentage >= 80;

      return {
        key,
        category,
        score: data.score,
        reason: data.reason,
        percentage,
        isCompleted,
        isHighPerformer,
        maxScore,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Sort by completion first, then high performers, then by score
      if (a!.isCompleted !== b!.isCompleted) return a!.isCompleted ? -1 : 1;
      if (a!.isHighPerformer !== b!.isHighPerformer)
        return a!.isHighPerformer ? -1 : 1;
      return b!.score - a!.score;
    })
    .slice(0, 6);

  // Calculate mastered counts
  const masteredCategories = topCategories.filter(
    (item) => item?.isCompleted
  ).length;
  const stats = {
    totalScore: userScore?.totalScore || 0,
    badgesEarned: userBadges.length,
    categoriesActive: Object.keys(userScore?.categories || {}).length,
    totalCategories: scoreCategories.length,
    completionRate:
      scoreCategories.length > 0
        ? Math.round(
            (Object.keys(userScore?.categories || {}).length /
              scoreCategories.length) *
              100
          )
        : 0,
    recentBadges: userBadges
      .map((badge) => {
        const definition = badgeDefinitions.find(
          (def) => def.key === badge.badgeKey
        );
        const isFullyCompleted =
          definition &&
          badge.achievedLevel >=
            Math.max(...definition.levels.map((l) => l.level));
        const isHighLevel =
          definition &&
          badge.achievedLevel >=
            Math.max(...definition.levels.map((l) => l.level)) * 0.8;

        return {
          ...badge,
          definition,
          isFullyCompleted,
          isHighLevel,
          earnedDate: new Date(badge.earnedAt).getTime(),
        };
      })
      .sort((a, b) => {
        // Sort by mastery first, then high level, then by recency
        if (a.isFullyCompleted !== b.isFullyCompleted)
          return a.isFullyCompleted ? -1 : 1;
        if (a.isHighLevel !== b.isHighLevel) return a.isHighLevel ? -1 : 1;
        return b.earnedDate - a.earnedDate;
      })
      .slice(0, 6),
    fullyMasteredBadges: userBadges.filter((badge) => {
      const definition = badgeDefinitions.find(
        (def) => def.key === badge.badgeKey
      );
      return (
        definition &&
        badge.achievedLevel >=
          Math.max(...definition.levels.map((l) => l.level))
      );
    }).length,
  };

  const masteredBadges = stats.fullyMasteredBadges;

  // Top performing categories (sorted by completion, then by score)

  // Recent activity items (sorted by importance and recency)
  const recentActivities = [
    ...stats.recentBadges.slice(0, 4).map((badgeData) => ({
      type: "badge" as const,
      title: `${badgeData.isFullyCompleted ? "Mastered" : "Earned"} ${
        badgeData.definition?.title || "Badge"
      }`,
      description: `Level ${badgeData.achievedLevel}: ${badgeData.achievedLevelTitle}`,
      date: badgeData.earnedAt,
      icon: badgeData.isFullyCompleted ? Crown : Trophy,
      gradient: badgeData.isFullyCompleted
        ? "from-purple-500 to-indigo-600"
        : "from-yellow-500 to-orange-600",
      priority: badgeData.isFullyCompleted ? 3 : badgeData.isHighLevel ? 2 : 1,
    })),
    ...(userScore?.calculatedAt
      ? [
          {
            type: "score" as const,
            title: "Reputation Score Updated",
            description: `Total score: ${userScore.totalScore.toLocaleString()} points`,
            date: userScore.calculatedAt,
            icon: TrendingUp,
            gradient: "from-blue-500 to-purple-600",
            priority: 1,
          },
        ]
      : []),
  ]
    .sort((a, b) => {
      // Sort by priority first, then by date
      if (a.priority !== b.priority) return b.priority - a.priority;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, 8);

  // loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-shimmer">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-700 mb-3">
                Loading Dashboard
              </h2>
              <p className="text-gray-500">
                Preparing your personalized overview...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-14 px-4">
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: 200px 0;
          }
        }

        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 5px rgba(147, 51, 234, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(147, 51, 234, 0.8),
              0 0 30px rgba(147, 51, 234, 0.4);
          }
        }

        .animate-shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          background-size: 200px 100%;
          animation: shimmer 2s infinite;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
      <div className="max-w-7xl mx-auto py-8">
        {/* Welcome Header with Achievement Celebration */}
        <div className="mb-6 sm:mb-10">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
            <div className="relative">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                Welcome back, {user?.name || "Polkadot Pioneer"}!{" "}
              </h1>
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-6 text-gray-600">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base">
                    {user?.wallet
                      ? `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}`
                      : "Connected"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base">
                    Score updated{" "}
                    {userScore?.calculatedAt
                      ? formatAgo(userScore.calculatedAt)
                      : "recently"}
                  </span>
                </div>
                {stats.totalScore > 0 && (
                  <div className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold w-fit">
                    <TrendingUp className="w-4 h-4 flex-shrink-0" />
                    <span>{stats.totalScore.toLocaleString()} pts</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="cursor-pointer flex items-center justify-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 sm:px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-70 w-full sm:w-auto"
            >
              <RefreshCw
                className={`w-5 h-5 flex-shrink-0 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              <span className="text-sm sm:text-base">
                {isRefreshing ? "Syncing..." : "Sync Data"}
              </span>
            </button>
          </div>
        </div>
        {/* Hero Reputation Score Display */}
        <div className="mb-10">
          <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 shadow-2xl overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>

            {/* Sparkle effects */}
            <div className="absolute top-4 right-16">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
            <div className="absolute bottom-8 right-8">
              <Star className="w-4 h-4 text-yellow-200 fill-current animate-bounce" />
            </div>
            <div className="absolute top-12 left-12">
              <Star className="w-3 h-3 text-white/70 fill-current animate-pulse" />
            </div>

            <div className="relative z-10 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-3 mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-3 sm:mb-0">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-white/80 text-sm sm:text-lg font-medium">
                    Your Reputation Score
                  </h2>
                  <div className="flex items-baseline space-x-2 justify-center">
                    <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
                      {stats.totalScore.toLocaleString()}
                    </span>
                    <span className="text-white/70 text-base sm:text-xl font-medium">
                      points
                    </span>
                  </div>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 md:space-x-6 mt-6">
                <div className="text-center">
                  <div className="text-white/90 text-xs sm:text-sm font-medium">
                    Categories Active
                  </div>
                  <div className="text-white text-base sm:text-lg font-bold">
                    {stats.categoriesActive}/{stats.totalCategories}
                  </div>
                </div>
                <div className="hidden sm:block w-px h-8 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-white/90 text-xs sm:text-sm font-medium">
                    Badges Earned
                  </div>
                  <div className="text-white text-base sm:text-lg font-bold">
                    {stats.badgesEarned}
                  </div>
                </div>
                <div className="hidden sm:block w-px h-8 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-white/90 text-xs sm:text-sm font-medium">
                    Completion Rate
                  </div>
                  <div className="text-white text-base sm:text-lg font-bold">
                    {stats.completionRate}%
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => router.push("/app/reputation")}
                className="cursor-pointer mt-6 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-semibold backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                View Detailed Breakdown
              </button>
            </div>
          </div>
        </div>

        {/* Other Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            title="Badges Earned"
            value={stats.badgesEarned.toString()}
            subtitle={`${stats.fullyMasteredBadges} fully mastered`}
            icon={Award}
            gradient="from-yellow-500 to-orange-600"
            onClick={() => router.push("/app/badges")}
          />
          <StatCard
            title="Profile Status"
            value={userScore?.score_exists ? "Active" : "Pending"}
            subtitle={
              userScore?.score_exists ? "Score calculated" : "Calculating..."
            }
            icon={CheckCircle}
            gradient="from-green-500 to-emerald-600"
            onClick={() => router.push("/app/profile")}
          />
          <StatCard
            title="Last Updated"
            value={
              userScore?.calculatedAt
                ? formatAgo(userScore.calculatedAt)
                : "Never"
            }
            subtitle="Score calculation"
            icon={Clock}
            gradient="from-purple-500 to-pink-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Category Performance */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
              <div className="mb-6">
                {/* Title and description */}
                <div className="mb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                    Category Performance
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Your progress across different areas
                  </p>
                </div>

                {/* View All and Mastered badge on same line */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => router.push("/app/reputation")}
                    className="cursor-pointer flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
                  >
                    <span>View All</span>
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  {masteredCategories > 0 && (
                    <div className="flex items-center space-x-1 bg-purple-100 text-purple-700 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full text-xs sm:text-sm font-bold">
                      <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{masteredCategories} Mastered</span>
                    </div>
                  )}
                </div>
              </div>

              {topCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {topCategories.map((item) => {
                    if(!item) return null;
                    return (
                      <CategoryCard
                        key={item.key}
                        category={item.category!}
                        userScore={{ score: item.score, reason: item.reason }}
                        onClick={() => router.push("/app/reputation")}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">
                    No Score Data
                  </h4>
                  <p className="text-gray-500 mb-6">
                    Your reputation score is being calculated
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Calculate Score
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="mb-6">
              {/* Title and description */}
              <div className="mb-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                  Recent Achievements
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Latest badges earned
                </p>
              </div>

              {/* View All and Mastered badge on same line */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => router.push("/app/badges")}
                  className="cursor-pointer flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
                >
                  <span>View All</span>
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                {masteredBadges > 0 && (
                  <div className="flex items-center space-x-1 bg-purple-100 text-purple-700 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full text-xs sm:text-sm font-bold">
                    <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{masteredBadges} Mastered</span>
                  </div>
                )}
              </div>
            </div>

            {stats.recentBadges.length > 0 ? (
              <div className="space-y-4">
                {stats.recentBadges.map((badgeData) => (
                  <RecentBadge
                    key={badgeData._id}
                    badge={badgeData}
                    definition={badgeData.definition}
                    onClick={() => router.push("/app/badges")}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-600 mb-2">
                  No Badges Yet
                </h4>
                <p className="text-gray-500 text-sm mb-4">
                  Start participating to earn your first badge!
                </p>
                <button
                  onClick={() => router.push("/app/badges")}
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Explore Available Badges
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
              <p className="text-gray-600">Common tasks and next steps</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push("/app/reputation")}
              className="cursor-pointer flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                  View Reputation
                </h4>
                <p className="text-gray-600 text-sm">
                  Detailed score breakdown
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-blue-600 transition-colors" />
            </button>

            <button
              onClick={() => router.push("/app/badges")}
              className="cursor-pointer flex items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100 hover:border-yellow-200 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 group-hover:text-yellow-700 transition-colors">
                  Explore Badges
                </h4>
                <p className="text-gray-600 text-sm">Discover achievements</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-yellow-600 transition-colors" />
            </button>

            <button
              onClick={() => router.push("/app/profile")}
              className="cursor-pointer flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:border-purple-200 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                  Edit Profile
                </h4>
                <p className="text-gray-600 text-sm">Update your settings</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-purple-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Recent Activity
              </h3>
              <p className="text-gray-600">
                Your latest ecosystem interactions
              </p>
            </div>
          </div>

          {recentActivities.length > 0 ? (
            <div className="space-y-2">
              {recentActivities.map((activity, index) => (
                <ActivityItem
                  key={index}
                  type={activity.type}
                  title={activity.title}
                  description={activity.description}
                  date={activity.date}
                  icon={activity.icon}
                  gradient={activity.gradient}
                  priority={activity.priority}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-600 mb-2">
                No Recent Activity
              </h4>
              <p className="text-gray-500">
                Your ecosystem activities will appear here as you participate
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
