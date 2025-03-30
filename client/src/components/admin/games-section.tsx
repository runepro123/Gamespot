import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Game } from "@shared/schema";
import { formatDate, formatRating } from "@/lib/utils";
import { Star, StarHalf, MoreVertical } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function GamesSection() {
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  // Get most recently added games
  const recentGames = games?.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 4);

  return (
    <Card>
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white">Recently Added Games</h3>
        <Button variant="link" className="text-primary hover:text-primary/80 text-sm">
          View All
        </Button>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <GameItemSkeleton key={i} />
            ))
          ) : recentGames && recentGames.length > 0 ? (
            recentGames.map((game) => (
              <GameItem key={game.id} game={game} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent games available
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

interface GameItemProps {
  game: Game;
}

function GameItem({ game }: GameItemProps) {
  const displayRating = (rating: number) => {
    if (rating === 0) return <span className="text-gray-400">Not rated</span>;
    
    return (
      <div className="flex items-center">
        <div className="flex mr-1">
          {[1, 2, 3, 4, 5].map((star) => {
            if (star <= Math.floor(rating)) {
              return <Star key={star} className="text-yellow-500 h-3 w-3 fill-current" />;
            } else if (star - 0.5 <= rating) {
              return <StarHalf key={star} className="text-yellow-500 h-3 w-3 fill-current" />;
            } else {
              return <Star key={star} className="text-gray-300 h-3 w-3" />;
            }
          })}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{formatRating(game.rating)}</span>
      </div>
    );
  };

  return (
    <div className="flex gap-4 items-center">
      <img 
        src={game.imageUrl} 
        alt={game.title} 
        className="w-16 h-16 rounded-lg object-cover"
      />
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{game.title}</h4>
        <div className="flex items-center mt-1">
          {displayRating(game.rating)}
        </div>
        <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{game.genre}</span>
          <span className="ml-2">Added {formatDate(game.createdAt)}</span>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Edit Game</DropdownMenuItem>
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem className="text-red-500">Delete Game</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function GameItemSkeleton() {
  return (
    <div className="flex gap-4 items-center">
      <Skeleton className="w-16 h-16 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  );
}
