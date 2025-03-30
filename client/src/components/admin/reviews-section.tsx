import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Review, User, Game } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowRight } from "lucide-react";

export default function ReviewsSection() {
  const { toast } = useToast();
  const { data: pendingReviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews/pending"],
  });

  // Get all users for displaying usernames
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Get all games for displaying game titles
  const { data: games } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const approveReviewMutation = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const res = await apiRequest("PATCH", `/api/reviews/${id}`, { isApproved: true });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review approved",
        description: "The review has been approved and published.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/pending"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to approve review: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const rejectReviewMutation = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const res = await apiRequest("DELETE", `/api/reviews/${id}`);
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Review rejected",
        description: "The review has been rejected and removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/pending"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to reject review: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const getUserName = (userId: number) => {
    const user = users?.find(u => u.id === userId);
    return user ? user.username : "Unknown User";
  };

  const getGameTitle = (gameId: number) => {
    const game = games?.find(g => g.id === gameId);
    return game ? game.title : "Unknown Game";
  };

  return (
    <Card>
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white">Pending Reviews</h3>
        <Button variant="link" className="text-primary hover:text-primary/80 text-sm">
          View All
        </Button>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <ReviewItemSkeleton key={i} />
            ))
          ) : pendingReviews && pendingReviews.length > 0 ? (
            pendingReviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                userName={getUserName(review.userId)}
                gameTitle={getGameTitle(review.gameId)}
                onApprove={() => approveReviewMutation.mutate({ id: review.id })}
                onReject={() => rejectReviewMutation.mutate({ id: review.id })}
                isLoading={approveReviewMutation.isPending || rejectReviewMutation.isPending}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No pending reviews available
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

interface ReviewItemProps {
  review: Review;
  userName: string;
  gameTitle: string;
  onApprove: () => void;
  onReject: () => void;
  isLoading: boolean;
}

function ReviewItem({ review, userName, gameTitle, onApprove, onReject, isLoading }: ReviewItemProps) {
  return (
    <div className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        {userName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{userName}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">on {gameTitle}</p>
          </div>
          <div className="flex items-center">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-yellow-500">
                  {i < review.rating ? "★" : "☆"}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{review.content}</p>
        <div className="flex space-x-2 mt-2">
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50"
            onClick={onApprove}
            disabled={isLoading}
          >
            Approve
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50"
            onClick={onReject}
            disabled={isLoading}
          >
            Reject
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReviewItemSkeleton() {
  return (
    <div className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-3 w-full mt-2" />
        <Skeleton className="h-3 w-full mt-1" />
        <div className="flex space-x-2 mt-3">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}
