import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Review, Game } from "@shared/schema";
import { formatDate, formatRating } from "@/lib/utils";
import { 
  Search, 
  MoreVertical, 
  CheckCircle, 
  XCircle,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  AlertTriangle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReviewsManagement() {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTab, setCurrentTab] = useState<'all' | 'pending' | 'approved'>('all');
  const itemsPerPage = 10;

  const { toast } = useToast();
  
  // Fetch all reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: ["/api/reviews/all"],
    queryFn: async () => {
      const allGames = await fetch('/api/games').then(res => res.json());
      const pendingReviews = await fetch('/api/reviews/pending').then(res => res.json());
      
      const allReviews = [];
      
      // For each game, get its reviews
      for (const game of allGames) {
        const gameReviews = await fetch(`/api/games/${game.id}/reviews`).then(res => res.json());
        // Add game info to each review
        const reviewsWithGame = gameReviews.map((review: Review) => ({
          ...review,
          game
        }));
        allReviews.push(...reviewsWithGame);
      }
      
      // Add pending reviews (that might not be associated with a game yet)
      const pendingWithGames = await Promise.all(
        pendingReviews.map(async (review: Review) => {
          const game = allGames.find((g: Game) => g.id === review.gameId);
          return {
            ...review,
            game
          };
        })
      );
      
      allReviews.push(...pendingWithGames.filter(
        (review: any) => !allReviews.some((r: any) => r.id === review.id)
      ));
      
      return allReviews;
    }
  });

  // Fetch pending reviews
  const { data: pendingReviews, isLoading: isLoadingPending } = useQuery<Review[]>({
    queryKey: ["/api/reviews/pending"],
  });

  // Get the reviews to display based on the current tab
  const getFilteredReviews = () => {
    if (!reviews) return [];
    
    let filteredByTab = reviews;
    
    if (currentTab === 'pending') {
      filteredByTab = reviews.filter(review => !review.isApproved);
    } else if (currentTab === 'approved') {
      filteredByTab = reviews.filter(review => review.isApproved);
    }
    
    // Apply search filter
    return filteredByTab.filter(review => 
      review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.game?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredReviews = getFilteredReviews();

  // Paginate reviews
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  // Approve review mutation
  const approveReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const res = await apiRequest("PATCH", `/api/reviews/${reviewId}`, { isApproved: true });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Approved",
        description: "The review has been approved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject review mutation
  const rejectReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const res = await apiRequest("PATCH", `/api/reviews/${reviewId}`, { isApproved: false });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Rejected",
        description: "The review has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/pending"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      await apiRequest("DELETE", `/api/reviews/${reviewId}`);
    },
    onSuccess: () => {
      toast({
        title: "Review Deleted",
        description: "The review has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Function to approve a review
  const handleApproveClick = (review: Review) => {
    approveReviewMutation.mutate(review.id);
  };

  // Function to reject a review
  const handleRejectClick = (review: Review) => {
    rejectReviewMutation.mutate(review.id);
  };

  // Function to view review details
  const handleViewClick = (review: Review) => {
    setSelectedReview(review);
    setIsViewDialogOpen(true);
  };

  // Function to delete a review
  const handleDeleteClick = (review: Review) => {
    setSelectedReview(review);
    setIsDeleteDialogOpen(true);
  };

  // Function to confirm deletion
  const onDeleteConfirm = () => {
    if (selectedReview) {
      deleteReviewMutation.mutate(selectedReview.id);
    }
  };

  // Display stars for rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < rating 
              ? "text-yellow-500 fill-current" 
              : "text-gray-300"}`} 
          />
        ))}
      </div>
    );
  };

  const isLoading = isLoadingReviews || isLoadingPending;

  return (
    <div className="space-y-6">
      {/* Header with search and tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search reviews..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>
          <div className="flex items-center space-x-2">
            {pendingReviews && pendingReviews.length > 0 && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {pendingReviews.length} pending
              </Badge>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="all" onValueChange={(value) => {
          setCurrentTab(value as 'all' | 'pending' | 'approved');
          setCurrentPage(1);
        }}>
          <TabsList className="grid w-full grid-cols-3 sm:w-[400px]">
            <TabsTrigger value="all">All Reviews</TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {pendingReviews && pendingReviews.length > 0 && (
                <Badge className="ml-2 bg-amber-500 text-white hover:bg-amber-600">
                  {pendingReviews.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews Management</CardTitle>
          <CardDescription>
            Approve, reject, or delete user reviews.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedReviews.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Game</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="font-medium">
                          {review.game?.title || `Game #${review.gameId}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm text-gray-500">
                            {review.rating}/5
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-gray-500">
                          {review.content}
                        </div>
                      </TableCell>
                      <TableCell>
                        {review.isApproved ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewClick(review)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {!review.isApproved && (
                              <DropdownMenuItem onClick={() => handleApproveClick(review)} className="text-green-600">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            {review.isApproved && (
                              <DropdownMenuItem onClick={() => handleRejectClick(review)} className="text-amber-600">
                                <XCircle className="mr-2 h-4 w-4" />
                                Unapprove
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDeleteClick(review)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? (
                <>
                  <p>No reviews found matching "{searchQuery}"</p>
                  <Button variant="link" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                </>
              ) : (
                <p>No reviews available{currentTab === 'pending' ? ' for approval' : ''}.</p>
              )}
            </div>
          )}
        </CardContent>
        {filteredReviews.length > 0 && (
          <CardFooter className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {Math.min(itemsPerPage, filteredReviews.length)} of {filteredReviews.length} reviews
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => 
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* View Review Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              Detailed view of the review.
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Game</h4>
                  <p className="text-lg font-medium">{selectedReview.game?.title || `Game #${selectedReview.gameId}`}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Rating</h4>
                  <div className="flex items-center mt-1">
                    {renderStars(selectedReview.rating)}
                    <span className="ml-2 text-lg font-medium">{selectedReview.rating}/5</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Review Content</h4>
                <p className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-md whitespace-pre-wrap">
                  {selectedReview.content}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date Submitted</h4>
                  <p>{formatDate(selectedReview.createdAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  {selectedReview.isApproved ? (
                    <Badge className="bg-green-100 text-green-800">Approved</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800">Pending</Badge>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <div className="space-x-2">
              {selectedReview && !selectedReview.isApproved && (
                <Button
                  onClick={() => {
                    handleApproveClick(selectedReview);
                    setIsViewDialogOpen(false);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              )}
              {selectedReview && selectedReview.isApproved && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleRejectClick(selectedReview);
                    setIsViewDialogOpen(false);
                  }}
                  className="text-amber-600 border-amber-600 hover:bg-amber-50"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Unapprove
                </Button>
              )}
            </div>
            <Button type="button" variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onDeleteConfirm}
              disabled={deleteReviewMutation.isPending}
            >
              {deleteReviewMutation.isPending ? "Deleting..." : "Delete Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}