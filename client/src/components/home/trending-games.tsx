import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Game } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRating, truncateText } from "@/lib/utils";

export default function TrendingGames() {
  const { data: games, isLoading, error } = useQuery<Game[]>({
    queryKey: ["/api/games/trending"],
  });

  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      setMaxScroll(carouselRef.current.scrollWidth - carouselRef.current.clientWidth);
    }
  }, [games]);

  const handleScroll = (direction: "prev" | "next") => {
    if (!carouselRef.current) return;

    const cardWidth = 288; // Card width (272) + gap (16)
    const newPosition = direction === "next" 
      ? Math.min(scrollPosition + cardWidth, maxScroll)
      : Math.max(scrollPosition - cardWidth, 0);
    
    setScrollPosition(newPosition);
    carouselRef.current.scrollTo({
      left: newPosition,
      behavior: "smooth"
    });
  };

  if (error) {
    return (
      <section className="mb-12">
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load trending games.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Games</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleScroll("prev")} 
            disabled={scrollPosition <= 0}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleScroll("next")} 
            disabled={scrollPosition >= maxScroll}
            className="rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="relative overflow-hidden">
        <div 
          ref={carouselRef} 
          className="flex space-x-6 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <GameCardSkeleton key={index} />
              ))
            : games?.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
        </div>
      </div>
    </section>
  );
}

function GameCard({ game }: { game: Game }) {
  return (
    <Card className="flex-shrink-0 w-[272px] overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={game.imageUrl} 
          className="w-full h-40 object-cover" 
          alt={game.title} 
        />
        {game.releaseDate && new Date(game.releaseDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            New Release
          </div>
        )}
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
          {truncateText(game.description, 100)}
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
    <Card className="flex-shrink-0 w-[272px] overflow-hidden">
      <Skeleton className="w-full h-40" />
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
