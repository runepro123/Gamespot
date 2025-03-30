import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityLog } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { ArrowRight, MoreHorizontal } from "lucide-react";

export default function ActivitiesSection() {
  const { data: activities, isLoading, error } = useQuery<(ActivityLog & { user?: { username: string } })[]>({
    queryKey: ["/api/activities"],
  });

  // Helper functions
  const getStatusClass = (action: string) => {
    if (action.includes("Banned") || action.includes("Deleted") || action.includes("Rejected")) {
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
    } else if (action.includes("Pending")) {
      return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300";
    } else {
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
    }
  };

  const getStatus = (action: string) => {
    if (action.includes("Banned") || action.includes("Deleted") || action.includes("Rejected")) {
      return "Rejected";
    } else if (action.includes("Pending")) {
      return "Pending Review";
    } else {
      return "Completed";
    }
  };

  if (error) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="text-center py-4">
            <p className="text-red-500">Failed to load activity logs.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white">Recent Activities</h3>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4">
        {/* Mobile view for activities (cards) */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </Card>
            ))
          ) : (
            activities?.map((activity) => (
              <Card key={activity.id} className="p-3">
                <div className="space-y-2">
                  <h3 className="text-gray-900 dark:text-white font-medium">{activity.action}</h3>
                  <div className="flex justify-between">
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {activity.user ? activity.user.username : 'System'}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      activity.action.includes("Banned") || activity.action.includes("Deleted") || activity.action.includes("Rejected")
                        ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                        : activity.action.includes("Pending")
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                          : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                    }`}>
                      {activity.action.includes("Banned") || activity.action.includes("Deleted") || activity.action.includes("Rejected")
                        ? "Rejected"
                        : activity.action.includes("Pending")
                          ? "Pending Review"
                          : "Completed"}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{activity.details}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{formatDate(activity.createdAt)}</p>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Desktop view for activities (table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 text-sm">
                <th className="pb-3 font-medium">Action</th>
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Content</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <ActivityRowSkeleton key={i} />
                ))
              ) : (
                activities?.map((activity) => (
                  <ActivityRow key={activity.id} activity={activity} />
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="pt-4 flex justify-center">
          <Button variant="link" className="text-primary hover:text-primary/80">
            View All Activities <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface ActivityRowProps {
  activity: ActivityLog & {
    user?: {
      username: string;
    };
  };
}

function ActivityRow({ activity }: ActivityRowProps) {
  const getStatusClass = (action: string) => {
    if (action.includes("Banned") || action.includes("Deleted") || action.includes("Rejected")) {
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
    } else if (action.includes("Pending")) {
      return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300";
    } else {
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
    }
  };

  const getStatus = (action: string) => {
    if (action.includes("Banned") || action.includes("Deleted") || action.includes("Rejected")) {
      return "Rejected";
    } else if (action.includes("Pending")) {
      return "Pending Review";
    } else {
      return "Completed";
    }
  };

  return (
    <tr className="border-t border-gray-100 dark:border-gray-800 text-sm">
      <td className="py-3 text-gray-900 dark:text-white font-medium">{activity.action}</td>
      <td className="py-3 text-gray-600 dark:text-gray-300">
        {activity.user ? activity.user.username : 'System'}
      </td>
      <td className="py-3 text-gray-600 dark:text-gray-300">{activity.details}</td>
      <td className="py-3 text-gray-600 dark:text-gray-300">{formatDate(activity.createdAt)}</td>
      <td className="py-3 text-right">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusClass(activity.action)}`}>
          {getStatus(activity.action)}
        </span>
      </td>
    </tr>
  );
}

function ActivityRowSkeleton() {
  return (
    <tr className="border-t border-gray-100 dark:border-gray-800 text-sm">
      <td className="py-3"><Skeleton className="h-4 w-24" /></td>
      <td className="py-3"><Skeleton className="h-4 w-20" /></td>
      <td className="py-3"><Skeleton className="h-4 w-32" /></td>
      <td className="py-3"><Skeleton className="h-4 w-24" /></td>
      <td className="py-3 text-right"><Skeleton className="h-6 w-16 ml-auto" /></td>
    </tr>
  );
}
