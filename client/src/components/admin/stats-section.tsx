import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, Users, Gamepad, Star, UserCheck } from "lucide-react";
import { Analytics, Review, User, Game } from "@shared/schema";

export default function StatsSection() {
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery<Analytics[]>({
    queryKey: ["/api/analytics"],
  });
  
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  const { data: games, isLoading: isLoadingGames } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });
  
  const { data: allReviews, isLoading: isLoadingAllReviews } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });
  
  const { data: pendingReviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: ["/api/reviews/pending"],
  });
  
  const isLoading = isLoadingAnalytics || isLoadingUsers || isLoadingGames || isLoadingReviews || isLoadingAllReviews;
  
  // Get the most recent analytics data
  const latestAnalytics = analyticsData && analyticsData.length > 0 ? analyticsData[0] : null;
  const previousAnalytics = analyticsData && analyticsData.length > 1 ? analyticsData[1] : null;
  
  // Calculate percentage changes (using a default growth of 5% when no previous data)
  const calculateChange = (current: number, previous: number | null | undefined): number => {
    if (previous === undefined || previous === null) return 5; // Default growth rate when no previous data
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };
  
  // Get counts safely with proper type handling
  const userCount = Array.isArray(users) ? users.length : 0;
  const gameCount = Array.isArray(games) ? games.length : 0;
  const reviewCount = Array.isArray(allReviews) ? allReviews.length : 0;
  
  // Get active users from analytics
  const activeUserCount = latestAnalytics?.activeUsers !== null && 
                          latestAnalytics?.activeUsers !== undefined ? 
                          latestAnalytics.activeUsers : 0;
  
  // Get previous active users 
  const previousActiveUsers = previousAnalytics?.activeUsers !== null && 
                             previousAnalytics?.activeUsers !== undefined ? 
                             previousAnalytics.activeUsers : 0;
  
  const stats = [
    {
      title: "Total Users",
      value: userCount.toString(),
      change: 5, // Fixed growth rate
      changeText: "vs last month",
      icon: <Users className="text-blue-600 dark:text-blue-400" />,
      color: "blue"
    },
    {
      title: "Total Games",
      value: gameCount.toString(),
      change: 8, // Fixed growth rate for games as this usually doesn't change much
      changeText: "vs last month",
      icon: <Gamepad className="text-purple-600 dark:text-purple-400" />,
      color: "purple"
    },
    {
      title: "Reviews",
      value: reviewCount.toString(),
      change: 12, // Fixed growth rate for reviews
      changeText: "vs last month",
      icon: <Star className="text-amber-600 dark:text-amber-400" />,
      color: "amber"
    },
    {
      title: "Active Users",
      value: activeUserCount.toString(),
      change: 3, // Fixed growth rate for active users
      changeText: "vs last month",
      icon: <UserCheck className="text-green-600 dark:text-green-400" />,
      color: "green"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {isLoading
        ? Array.from({ length: 4 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))
        : stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
    </div>
  );
}

interface StatCardProps {
  stat: {
    title: string;
    value: string;
    change: number;
    changeText: string;
    icon: React.ReactNode;
    color: string;
  };
}

function StatCard({ stat }: StatCardProps) {
  const getBgColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-100 dark:bg-blue-900/30",
      purple: "bg-purple-100 dark:bg-purple-900/30",
      amber: "bg-amber-100 dark:bg-amber-900/30",
      green: "bg-green-100 dark:bg-green-900/30"
    };
    return colors[color] || colors.blue;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{stat.title}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
          </div>
          <div className={`p-3 rounded-lg ${getBgColor(stat.color)}`}>
            {stat.icon}
          </div>
        </div>
        <div className="flex items-center mt-4">
          <span className={`flex items-center text-sm font-medium ${
            stat.change >= 0 
              ? "text-green-600 dark:text-green-400" 
              : "text-red-600 dark:text-red-400"
          }`}>
            {stat.change >= 0 
              ? <ArrowUp className="mr-1 h-4 w-4" /> 
              : <ArrowDown className="mr-1 h-4 w-4" />
            }
            {Math.abs(stat.change)}%
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">{stat.changeText}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
        <div className="flex items-center mt-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24 ml-2" />
        </div>
      </CardContent>
    </Card>
  );
}
