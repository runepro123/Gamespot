import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Game } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Search, Filter } from "lucide-react";
import { formatRating, truncateText, capitalizeFirstLetter } from "@/lib/utils";
import { Link } from "wouter";

export default function GamesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });
  
  // Filter and sort games
  const filteredGames = games?.filter(game => {
    // Apply search filter
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply genre filter
    const matchesGenre = genreFilter === "all" || game.genre === genreFilter;
    
    return matchesSearch && matchesGenre;
  });
  
  // Sort games
  const sortedGames = filteredGames?.sort((a, b) => {
    if (sortBy === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    } else if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });
  
  // Get unique genres for filter
  const genresSet = new Set<string>();
  games?.forEach(game => {
    if (game.genre) genresSet.add(game.genre);
  });
  const genres = Array.from(genresSet);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Browse Games</h1>
          
          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search games..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Genre Filter */}
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by genre" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre}>
                      {capitalizeFirstLetter(genre)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="title">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 12 }).map((_, index) => (
                <GameCardSkeleton key={index} />
              ))
            ) : sortedGames && sortedGames.length > 0 ? (
              sortedGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No games found matching your filters.</p>
                <Button onClick={() => {
                  setSearchQuery("");
                  setGenreFilter("all");
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function GameCard({ game }: { game: Game }) {
  return (
    <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={game.imageUrl} 
          className="w-full h-48 object-cover" 
          alt={game.title} 
        />
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {capitalizeFirstLetter(game.genre)}
        </div>
      </div>
      <CardContent className="p-4 flex flex-col justify-between h-[calc(100%-12rem)]">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg">{game.title}</h3>
            <div className="flex items-center bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded">
              <Star className="text-yellow-500 mr-1 h-3 w-3 fill-current" />
              <span className="text-green-800 dark:text-green-300 text-sm font-medium">
                {formatRating(game.rating || 0)}
              </span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
            {truncateText(game.description, 100)}
          </p>
        </div>
        <div className="flex justify-between items-center mt-auto">
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