import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Game } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRating, truncateText } from "@/lib/utils";

export default function TopRatedGames() {
  const { data: games, isLoading, error } = useQuery<Game[]>({
    queryKey: ["/api/games/featured"],
  });

  if (error) {
    return (
      <section className="mb-12">
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load top rated games.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Rated Games</h2>
        <Link href="/games" className="text-primary hover:text-primary/80 font-medium text-sm flex items-center">
          View all <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <GameCardSkeleton key={index} />
            ))
          : games?.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
      </div>
    </section>
  );
}

function GameCard({ game }: { game: Game }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={game.imageUrl} 
          className="w-full h-48 object-cover" 
          alt={game.title} 
        />
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {game.genre}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{game.title}</h3>
          <div className="flex items-center bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded">
            <Star className="text-yellow-500 mr-1 h-3 w-3 fill-current" />
            <span className="text-green-800 dark:text-green-300 text-sm font-medium">
              {formatRating(game.rating)}
            </span>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
          {truncateText(game.description, 120)}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {game.developer}
          </span>
          <Button variant="link" className="p-0 h-auto" asChild>
            <Link href={`/game/${game.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function GameCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="w-full h-48" />
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-10" />
        </div>
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}
