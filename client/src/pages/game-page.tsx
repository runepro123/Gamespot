import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Game, Review, InsertReview } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDate, capitalizeFirstLetter } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Star, Heart, Calendar, Tag, Award, Share2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const reviewSchema = z.object({
  content: z.string().min(10, { message: "Review must be at least 10 characters" }),
  rating: z.number().min(1).max(5, { message: "Rating must be between 1 and 5" }),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function GamePage() {
  const [, params] = useRoute('/game/:id');
  const [, navigate] = useLocation();
  const gameId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedRating, setSelectedRating] = useState<number>(5);

  // Fetch game details
  const {
    data: game,
    isLoading: isLoadingGame,
    error: gameError,
  } = useQuery<Game>({
    queryKey: [`/api/games/${gameId}`],
    enabled: !!gameId,
  });

  // Fetch game reviews
  const {
    data: reviews,
    isLoading: isLoadingReviews,
  } = useQuery<Review[]>({
    queryKey: [`/api/games/${gameId}/reviews`],
    enabled: !!gameId,
  });

  // Fetch user favorites to check if already favorited
  const { data: favorites } = useQuery<{ gameId: number }[]>({
    queryKey: ['/api/favorites'],
    enabled: !!user,
  });

  const isFavorite = favorites?.some(fav => fav.gameId === gameId);

  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/favorites", { gameId });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Game added to favorites",
        description: "This game has been added to your favorites list.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/favorites/${gameId}`);
    },
    onSuccess: () => {
      toast({
        title: "Game removed from favorites",
        description: "This game has been removed from your favorites list.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const reviewData: Partial<InsertReview> = {
        content: data.content,
        rating: data.rating,
        gameId: gameId || 0,
        isApproved: false,
      };

      const res = await apiRequest("POST", "/api/reviews", reviewData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Your review has been submitted and is pending approval.",
      });
      form.reset();
      setSelectedRating(5);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Review form
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      content: "",
      rating: 5,
    },
  });

  const onSubmitReview = (data: ReviewFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to submit a review",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    submitReviewMutation.mutate(data);
  };

  const handleToggleFavorite = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to add favorites",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (isFavorite) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  // If game not found or error
  if (gameError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The game you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoadingGame ? (
            <GameDetailsSkeleton />
          ) : game ? (
            <>
              {/* Game Header */}
              <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-full md:w-1/3 lg:w-1/4">
                    <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
                      <img 
                        src={game.imageUrl} 
                        alt={game.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="w-full md:w-2/3 lg:w-3/4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                        {capitalizeFirstLetter(game.genre)}
                      </span>
                      {game.isFeatured && (
                        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full text-sm font-medium">
                          Featured
                        </span>
                      )}
                      {game.isTrending && (
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                          Trending
                        </span>
                      )}
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">{game.title}</h1>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Tag className="mr-1.5 h-4 w-4" />
                        <span>{game.developer}</span>
                      </div>
                      
                      {game.releaseDate && (
                        <div className="flex items-center">
                          <Calendar className="mr-1.5 h-4 w-4" />
                          <span>{formatDate(game.releaseDate)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <Award className="mr-1.5 h-4 w-4" />
                        <div className="flex items-center">
                          <div className="flex mr-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= game.rating
                                    ? "text-yellow-500 fill-current"
                                    : star - 0.5 <= game.rating
                                    ? "text-yellow-500 fill-current opacity-50"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                          <span>{game.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                      {game.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant={isFavorite ? "secondary" : "default"}
                        onClick={handleToggleFavorite}
                        disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                      >
                        <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                        {isFavorite ? "Favorited" : "Add to Favorites"}
                      </Button>
                      
                      <Button variant="outline">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-8" />
              
              {/* Game Content Tabs */}
              <Tabs defaultValue="reviews" className="w-full">
                <TabsList className="mb-8">
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
                  <TabsTrigger value="system">System Requirements</TabsTrigger>
                </TabsList>
                
                {/* Reviews Tab */}
                <TabsContent value="reviews" className="space-y-8">
                  {/* Write a Review Section */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4">Write a Review</h2>
                    
                    {user ? (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rating</FormLabel>
                                <FormControl>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                      <button
                                        key={rating}
                                        type="button"
                                        className="p-1"
                                        onClick={() => {
                                          setSelectedRating(rating);
                                          field.onChange(rating);
                                        }}
                                      >
                                        <Star
                                          className={`h-6 w-6 ${
                                            rating <= selectedRating
                                              ? "text-yellow-500 fill-current"
                                              : "text-gray-300 dark:text-gray-600"
                                          }`}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Your Review</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Share your thoughts about this game..."
                                    className="min-h-[120px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Your review will be visible after approval by our moderators.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            disabled={submitReviewMutation.isPending}
                          >
                            {submitReviewMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              "Submit Review"
                            )}
                          </Button>
                        </form>
                      </Form>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
                        <p className="mb-4 text-gray-600 dark:text-gray-400">
                          You need to be logged in to write a review.
                        </p>
                        <Button asChild>
                          <a href="/auth">Login or Register</a>
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Reviews List */}
                  <div>
                    <h2 className="text-xl font-bold mb-4">User Reviews</h2>
                    
                    {isLoadingReviews ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <ReviewSkeleton key={i} />
                        ))}
                      </div>
                    ) : reviews && reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <ReviewItem key={review.id} review={review} />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                          No reviews yet. Be the first to review this game!
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {/* Screenshots Tab */}
                <TabsContent value="screenshots">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      No screenshots available for this game.
                    </p>
                  </div>
                </TabsContent>
                
                {/* System Requirements Tab */}
                <TabsContent value="system">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      System requirements information not available.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="text-center py-12">
              <p>No game data available.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

interface ReviewItemProps {
  review: Review;
}

function ReviewItem({ review }: ReviewItemProps) {
  // In a real app, we'd fetch the user information for each review
  // For now, we'll just display the review content and rating
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            U
          </div>
          <div className="ml-3">
            <p className="font-medium">User #{review.userId}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= review.rating
                  ? "text-yellow-500 fill-current"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-300">{review.content}</p>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex justify-between mb-3">
        <div className="flex items-center">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="ml-3">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

function GameDetailsSkeleton() {
  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
              <Skeleton className="w-full h-full" />
            </div>
          </div>
          
          <div className="w-full md:w-2/3 lg:w-3/4">
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-10 w-3/4 mb-3" />
            
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-6" />
            
            <div className="flex gap-3">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
      
      <Skeleton className="h-0.5 w-full my-8" />
      
      <Skeleton className="h-10 w-72 mb-8" />
      
      <Skeleton className="h-64 w-full rounded-lg mb-8" />
      
      <Skeleton className="h-8 w-48 mb-4" />
      
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <ReviewSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
