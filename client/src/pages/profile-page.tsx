import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Game, Review, Favorite } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatRating } from "@/lib/utils";
import { useLocation } from "wouter";
import { UserCircle, Heart, Star, Eye, Edit, Trash2, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: ""
  });

  // Redirect if not logged in
  if (!user) {
    navigate("/auth");
    return null;
  }

  // Fetch user favorites
  const { data: favorites, isLoading: isLoadingFavorites } = useQuery<(Favorite & { game?: Game })[]>({
    queryKey: ["/api/favorites"],
  });

  // Fetch user reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<(Review & { game?: Game })[]>({
    queryKey: ["/api/reviews/user"],
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const res = await apiRequest("PATCH", `/api/users/${user.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle starting edit mode
  const handleEdit = () => {
    setFormData({
      fullName: user.fullName || "",
      email: user.email || ""
    });
    setIsEditing(true);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle account logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - User Profile */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCircle className="h-16 w-16 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl">{user.username}</CardTitle>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Member since {formatDate(user.createdAt)}
                </div>
                {user.isAdmin && (
                  <Badge className="mt-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                    Admin
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Full Name</label>
                      <Input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? "Saving..." : "Save"}
                        <Save className="ml-2 h-4 w-4" />
                      </Button>
                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</div>
                      <div>{user.fullName || "Not provided"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</div>
                      <div>{user.email || "Not provided"}</div>
                    </div>
                    <div className="pt-2">
                      <Button onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="border-t border-gray-200 dark:border-gray-800 mt-6 pt-6">
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="favorites">
                <TabsList className="mb-6">
                  <TabsTrigger value="favorites" className="flex items-center">
                    <Heart className="mr-2 h-4 w-4" />
                    Favorites
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="flex items-center">
                    <Star className="mr-2 h-4 w-4" />
                    Reviews
                  </TabsTrigger>
                </TabsList>
                
                {/* Favorites Tab */}
                <TabsContent value="favorites">
                  <h2 className="text-2xl font-bold mb-4">Your Favorite Games</h2>
                  {isLoadingFavorites ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <FavoriteGameSkeleton key={i} />
                      ))}
                    </div>
                  ) : favorites && favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {favorites.map(favorite => (
                        <FavoriteGameCard 
                          key={favorite.id} 
                          favorite={favorite} 
                          game={favorite.game} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <Heart className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Favorites Yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        You haven't added any games to your favorites list.
                      </p>
                      <Button asChild>
                        <a href="/games">Browse Games</a>
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                {/* Reviews Tab */}
                <TabsContent value="reviews">
                  <h2 className="text-2xl font-bold mb-4">Your Reviews</h2>
                  {isLoadingReviews ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <ReviewItemSkeleton key={i} />
                      ))}
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map(review => (
                        <ReviewItem 
                          key={review.id} 
                          review={review} 
                          game={review.game}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <Star className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        You haven't written any reviews yet.
                      </p>
                      <Button asChild>
                        <a href="/games">Review Games</a>
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

interface FavoriteGameCardProps {
  favorite: Favorite;
  game?: Game;
}

function FavoriteGameCard({ favorite, game }: FavoriteGameCardProps) {
  const { toast } = useToast();
  
  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/favorites/${favorite.gameId}`);
    },
    onSuccess: () => {
      toast({
        title: "Removed from favorites",
        description: "The game has been removed from your favorites.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  if (!game) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex h-full">
        <div className="w-1/3">
          <img 
            src={game.imageUrl} 
            alt={game.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-2/3 p-4 flex flex-col">
          <div>
            <h3 className="font-bold text-lg mb-2">{game.title}</h3>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
              <div className="flex mr-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= (game.rating || 0)
                        ? "text-yellow-500 fill-current"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span>{formatRating(game.rating)}</span>
            </div>
          </div>
          <div className="mt-auto flex justify-between items-center">
            <Button variant="link" className="p-0 h-auto" asChild>
              <a href={`/game/${game.id}`}>
                <Eye className="mr-1 h-4 w-4" />
                View
              </a>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-500 hover:text-red-500"
              onClick={() => removeFavoriteMutation.mutate()}
              disabled={removeFavoriteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function FavoriteGameSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex h-full">
        <div className="w-1/3">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="w-2/3 p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-24 mb-4" />
          <div className="mt-auto">
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </Card>
  );
}

interface ReviewItemProps {
  review: Review;
  game?: Game;
}

function ReviewItem({ review, game }: ReviewItemProps) {
  if (!game) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="w-16 h-16 rounded mr-4 overflow-hidden flex-shrink-0">
            <img 
              src={game.imageUrl} 
              alt={game.title} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <a href={`/game/${game.id}`} className="font-bold hover:underline">
                {game.title}
              </a>
              <div className="flex">
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
            <p className="text-sm text-gray-700 dark:text-gray-300 my-2">
              {review.content}
            </p>
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>Posted on {formatDate(review.createdAt)}</span>
              {!review.isApproved && (
                <Badge variant="outline" className="text-amber-500 border-amber-500">
                  Pending Approval
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewItemSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start">
          <Skeleton className="w-16 h-16 mr-4 rounded flex-shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}