"use client";

import React, { useState, useEffect } from 'react';
import { 
  Award,
  Trophy,
  Star,
  Crown,
  Shield,
  RefreshCw,
  Search,
  Calendar,
  TrendingUp,
  Target,
  CheckCircle,
  Lock,
  Medal,
  Users,
  Activity,
  BarChart3,
  Coins,
  Clock,
  Plus,
  AlertCircle,
  Eye,
  Bell,
  X,
  Vote,
  Wallet,
  Globe,
  User,
  Layers,
  ChevronRight
} from 'lucide-react';

// Import API functions
import { getUserBadges, refreshUserBadges, getBadgeDefinitions } from '@/service/badgeService';


// Import types
import { 
  UserBadge, 
  BadgeDefinition, 
  RefreshBadgesResponse,
  BadgeLevelDefinition 
} from '@/types/api';
import { formatAgo } from '@/lib/formatAgo';



// Simplified category detection
const getCategoryInfo = (metric: string): {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
} => {
  const categoryMap: Record<string, any> = {
    extrinsiccount: { key: 'activity', label: 'Activity', icon: Activity },
    accountagedays: { key: 'longevity', label: 'Longevity', icon: Clock },
    parachaininteractioncount: { key: 'parachain', label: 'Cross-Chain', icon: Globe },
    referendavotecount: { key: 'governance', label: 'Governance', icon: Vote },
    treasuryvotecount: { key: 'treasury', label: 'Treasury', icon: Coins },
    nominatoractivemonths: { key: 'staking', label: 'Staking', icon: Shield },
    nominatoractivemonthswithoutslashes: { key: 'staking', label: 'Staking', icon: Shield },
    nftcount: { key: 'nft', label: 'NFTs', icon: Star },
    parachainassetcount: { key: 'assets', label: 'Assets', icon: Wallet },
    identitystatus: { key: 'identity', label: 'Identity', icon: User },
    batchtxcount: { key: 'utility', label: 'Utility', icon: Layers },
  };
  
  const key = metric.toLowerCase().replace(/[^a-z]/g, '');
  return categoryMap[key] || { key: 'other', label: 'Other', icon: Award };
};

// Interface for enhanced badge data
interface EnhancedBadge extends BadgeDefinition {
  userBadge?: UserBadge;
  isEarned: boolean;
  isFullyCompleted: boolean;
  currentLevel: number;
  maxLevel: number;
  progress: number;
  nextLevel?: BadgeLevelDefinition;
  category: ReturnType<typeof getCategoryInfo>;
}

// Clean Badge Card Component
const BadgeCard: React.FC<{
  badge: EnhancedBadge;
  onClick: () => void;
}> = ({ badge, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative bg-white rounded-xl p-6 border cursor-pointer transition-all duration-200 hover:shadow-lg group ${
        badge.isEarned 
          ? badge.isFullyCompleted
            ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50'
            : 'border-green-200 bg-green-50/30'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Status indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          badge.isEarned 
            ? badge.isFullyCompleted
              ? 'bg-purple-100 text-purple-600'
              : 'bg-green-100 text-green-600'
            : 'bg-gray-100 text-gray-400'
        }`}>
          <badge.category.icon className="w-6 h-6" />
        </div>
        
        {badge.isEarned ? (
          <div className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${
            badge.isFullyCompleted
              ? 'bg-purple-100 text-purple-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {badge.isFullyCompleted ? (
              <>
                <Crown className="w-3 h-3" />
                <span>Mastered</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3" />
                <span>Level {badge.currentLevel}</span>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-xs text-gray-500 px-2 py-1 rounded-full bg-gray-50">
            <Lock className="w-3 h-3" />
            <span>Locked</span>
          </div>
        )}
      </div>
      
      {/* Badge info */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-2 overflow-hidden" style={{ 
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {badge.title}
        </h3>
        <p className="text-sm text-gray-600 overflow-hidden" style={{ 
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {badge.shortDescription}
        </p>
      </div>
      
      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>{badge.category.label}</span>
          <span>{badge.currentLevel}/{badge.maxLevel}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              badge.isEarned 
                ? badge.isFullyCompleted
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600'
                  : 'bg-green-400'
                : 'bg-gray-300'
            }`}
            style={{ width: `${badge.progress}%` }}
          />
        </div>
      </div>
      
      {/* Bottom info */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        {badge.isEarned && badge.userBadge ? (
          <span>{formatAgo(badge.userBadge.earnedAt)}</span>
        ) : (
          <span>{badge.levels.length} level{badge.levels.length > 1 ? 's' : ''}</span>
        )}
        
        <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
      </div>
      
      {/* Hover overlay for locked badges */}
      {!badge.isEarned && (
        <div className={`absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Eye className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-600">View Details</span>
        </div>
      )}
    </div>
  );
};

// Clean Badge Detail Modal
const BadgeDetailModal: React.FC<{
  badge: EnhancedBadge | null;
  onClose: () => void;
}> = ({ badge, onClose }) => {
  // Handle scroll lock
  useEffect(() => {
    if (badge) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [badge]);
  
  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  if (!badge) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideIn">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                badge.isEarned 
                  ? badge.isFullyCompleted
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <badge.category.icon className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">{badge.title}</h2>
                  {badge.isFullyCompleted && (
                    <Crown className="w-5 h-5 text-purple-500" />
                  )}
                </div>
                <p className="text-gray-600">{badge.shortDescription}</p>
                <p className="text-sm text-gray-500 mt-1">{badge.category.label} • {badge.levels.length} levels</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Description */}
          <div className="mb-8">
            <p className="text-gray-700 leading-relaxed">{badge.longDescription}</p>
          </div>
          
          {/* Current status */}
          {badge.isEarned && badge.userBadge && (
            <div className={`rounded-xl p-4 mb-8 border ${
              badge.isFullyCompleted
                ? 'bg-purple-50 border-purple-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    {badge.isFullyCompleted ? (
                      <Crown className="w-5 h-5 text-purple-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    <span className={`font-semibold ${
                      badge.isFullyCompleted ? 'text-purple-800' : 'text-green-800'
                    }`}>
                      {badge.isFullyCompleted ? 'Badge Mastered!' : 'Badge Earned!'}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    badge.isFullyCompleted ? 'text-purple-700' : 'text-green-700'
                  }`}>
                    Current Level: {badge.userBadge.achievedLevelTitle}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Earned {formatAgo(badge.userBadge.earnedAt)}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Badge levels */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Badge Levels</h3>
            <div className="space-y-3">
              {badge.levels.sort((a, b) => a.level - b.level).map((level) => {
                const isAchieved = badge.currentLevel >= level.level;
                const isCurrent = badge.currentLevel === level.level;
                const isCompleted = badge.isFullyCompleted && level.level === badge.maxLevel;
                
                return (
                  <div key={level.key} className={`p-4 rounded-xl border ${
                    isCompleted
                      ? 'bg-purple-50 border-purple-200'
                      : isCurrent 
                        ? 'bg-blue-50 border-blue-200' 
                        : isAchieved 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          isCompleted
                            ? 'bg-purple-500 text-white'
                            : isCurrent 
                              ? 'bg-blue-500 text-white' 
                              : isAchieved 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-300 text-gray-600'
                        }`}>
                          {isCompleted ? (
                            <Crown className="w-4 h-4" />
                          ) : isAchieved ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            level.level
                          )}
                        </div>
                        <div>
                          <h4 className={`font-semibold ${
                            isCompleted ? 'text-purple-800' :
                            isCurrent ? 'text-blue-900' : 
                            isAchieved ? 'text-green-900' : 'text-gray-700'
                          }`}>
                            {level.title}
                          </h4>
                          <p className="text-sm text-gray-600">{level.shortDescription}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {level.value.toLocaleString()}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600">{level.longDescription}</p>
                    
                    {/* Constraints */}
                    {level.constraints && level.constraints.length > 0 && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-gray-100">
                        <p className="text-xs font-medium text-gray-700 mb-2">Requirements:</p>
                        {level.constraints.map((constraint, index) => (
                          <p key={index} className="text-xs text-gray-600">
                            • {constraint.description}
                          </p>
                        ))}
                      </div>
                    )}
                    
                    {/* Advice */}
                    {level.advice && level.advice.length > 0 && (isCurrent || (!isAchieved && level.level === badge.currentLevel + 1)) && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-blue-700 mb-2">
                          {isCurrent ? 'Keep going!' : 'How to unlock:'}
                        </p>
                        {level.advice.map((tip, index) => (
                          <p key={index} className="text-xs text-blue-600">
                            • {tip}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Recent Achievement Component
const RecentAchievement: React.FC<{
  badge: EnhancedBadge;
  onDismiss: () => void;
  onClick: () => void;
}> = ({ badge, onDismiss, onClick }) => {
  return (
    <div className="bg-white border border-green-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 cursor-pointer" onClick={onClick}>
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <badge.category.icon className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Trophy className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">New Achievement!</span>
            </div>
            <h4 className="font-semibold text-gray-900">{badge.title}</h4>
            <p className="text-sm text-gray-600">
              {badge.userBadge?.achievedLevelTitle} • {formatAgo(badge.userBadge?.earnedAt)}
            </p>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

// Main component
const Badges: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<EnhancedBadge | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<EnhancedBadge[]>([]);
  
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [badgeDefinitions, setBadgeDefinitions] = useState<BadgeDefinition[]>([]);
  const [enhancedBadges, setEnhancedBadges] = useState<EnhancedBadge[]>([]);
  
  // Load data
  const loadBadgesData = async (): Promise<void> => {
    try {
      setError(null);
      
      const [userBadgesData, definitionsData] = await Promise.all([
        getUserBadges().catch(() => ({ badges: [] })),
        getBadgeDefinitions()
      ]);
      
      setUserBadges(userBadgesData.badges);
      setBadgeDefinitions(definitionsData.badges);
      
      // Enhance badges with user data
      const enhanced: EnhancedBadge[] = definitionsData.badges.map(badge => {
        const userBadge = userBadgesData.badges.find(ub => ub.badgeKey === badge.key);
        const isEarned = !!userBadge;
        const currentLevel = userBadge?.achievedLevel || 0;
        const maxLevel = Math.max(...badge.levels.map(l => l.level));
        const isFullyCompleted = isEarned && currentLevel >= maxLevel;
        const progress = (currentLevel / maxLevel) * 100;
        const nextLevel = badge.levels.find(l => l.level > currentLevel);
        const category = getCategoryInfo(badge.metric);
        
        return {
          ...badge,
          userBadge,
          isEarned,
          isFullyCompleted,
          currentLevel,
          maxLevel,
          progress,
          nextLevel,
          category
        };
      });
      
      setEnhancedBadges(enhanced.sort((a, b) => {
        if (a.isFullyCompleted !== b.isFullyCompleted) return a.isFullyCompleted ? -1 : 1;
        if (a.isEarned !== b.isEarned) return a.isEarned ? -1 : 1;
        return a.order - b.order;
      }));
      
      // Set recent notifications
      const recentBadges = enhanced.filter(badge => 
        badge.isEarned && badge.userBadge && 
        new Date(badge.userBadge.earnedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      setRecentNotifications(recentBadges);
      
    } catch (err) {
      console.error('Failed to load badges data:', err);
      setError('Failed to load badges. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh badges
  const handleRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      await refreshUserBadges();
      await loadBadgesData();
    } catch (err) {
      console.error('Failed to refresh badges:', err);
      setError('Failed to refresh badges. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    loadBadgesData();
  }, []);
  
  // Filter badges
  const filteredBadges = enhancedBadges.filter(badge => {
    const matchesSearch = badge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           selectedCategory === 'earned' && badge.isEarned ||
                           selectedCategory === 'unearned' && !badge.isEarned ||
                           selectedCategory === 'completed' && badge.isFullyCompleted ||
                           badge.category.key === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Statistics
  const stats = {
    total: enhancedBadges.length,
    earned: enhancedBadges.filter(b => b.isEarned).length,
    completed: enhancedBadges.filter(b => b.isFullyCompleted).length,
    recentlyEarned: recentNotifications.length
  };
  
  // Categories for filter
  const categories = [
    { key: 'all', label: 'All', icon: Award },
    { key: 'earned', label: 'Earned', icon: CheckCircle },
    { key: 'completed', label: 'Mastered', icon: Crown },
    { key: 'unearned', label: 'Available', icon: Target },
    { key: 'activity', label: 'Activity', icon: Activity },
    { key: 'staking', label: 'Staking', icon: Shield },
    { key: 'governance', label: 'Governance', icon: Vote },
    { key: 'parachain', label: 'Cross-Chain', icon: Globe },
  ];
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-6xl mx-auto py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Badges</h2>
              <p className="text-gray-500">Fetching your achievements...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-6xl mx-auto py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Something went wrong</h2>
              <p className="text-gray-500 mb-6">{error}</p>
              <button 
                onClick={loadBadgesData}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 px-4">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Badges</h1>
              <p className="text-gray-600">Track your achievements and unlock new badges</p>
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
        
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <CheckCircle className="w-8 h-8 text-blue-100" />
                <div className="text-3xl font-bold">{stats.earned}</div>
              </div>
              <div className="text-blue-100 font-medium mb-1">Badges Earned</div>
              <div className="text-blue-200 text-sm">of {stats.total} available</div>
            </div>
          </div>
          
          <div className="relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <Crown className="w-8 h-8 text-purple-100" />
                <div className="text-3xl font-bold">{stats.completed}</div>
              </div>
              <div className="text-purple-100 font-medium mb-1">Mastered</div>
              <div className="text-purple-200 text-sm">fully completed</div>
            </div>
          </div>
          
          <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <Target className="w-8 h-8 text-emerald-100" />
                <div className="text-3xl font-bold">{Math.round((stats.earned / stats.total) * 100)}%</div>
              </div>
              <div className="text-emerald-100 font-medium mb-1">Completion</div>
              <div className="text-emerald-200 text-sm">overall progress</div>
            </div>
          </div>
          
          <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <Bell className="w-8 h-8 text-orange-100" />
                <div className="text-3xl font-bold">{stats.recentlyEarned}</div>
              </div>
              <div className="text-orange-100 font-medium mb-1">This Week</div>
              <div className="text-orange-200 text-sm">newly earned</div>
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search badges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
          
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges.map((badge) => (
            <BadgeCard 
              key={badge.key} 
              badge={badge} 
              onClick={() => setSelectedBadge(badge)}
            />
          ))}
        </div>
        
        {/* Empty state */}
        {filteredBadges.length === 0 && (
          <div className="text-center py-12">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No badges found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}


                {/* Recent Achievements */}
        {recentNotifications.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Achievements</h2>
            </div>
            <div className="space-y-3">
              {recentNotifications.map((badge) => (
                <RecentAchievement
                  key={badge.key}
                  badge={badge}
                  onDismiss={() => setRecentNotifications(prev => prev.filter(b => b.key !== badge.key))}
                  onClick={() => setSelectedBadge(badge)}
                />
              ))}
            </div>
          </div>
        )}

        
        {/* Badge Detail Modal */}
        <BadgeDetailModal 
          badge={selectedBadge} 
          onClose={() => setSelectedBadge(null)} 
        />
      </div>
    </div>
  );
};

export default Badges;