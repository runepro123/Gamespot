import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Game } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ArrowLeft } from "lucide-react";
import { formatRating, truncateText, capitalizeFirstLetter } from "@/lib/utils";
import { Link } from "wouter";

export default function GenrePage() {
  const [, params] = useRoute('/genres/:genreName');
  const genreName = params?.genreName || '';
  
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });
  
  // Filter games by genre
  const genreGames = games?.filter(game => game.genre === genreName);
  
  // Get genre image for the header
  const genreImage = getGenreImage(genreName);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Header with Genre Image */}
        <div 
          className="relative h-64 bg-cover bg-center" 
          style={{ backgroundImage: `url(${genreImage})` }}
        >
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">{capitalizeFirstLetter(genreName)} Games</h1>
              <p className="text-lg max-w-lg mx-auto">
                Explore the best {genreName} games with stunning graphics and engaging gameplay.
              </p>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Back */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="pl-0 hover:pl-0">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          
          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <GameCardSkeleton key={index} />
              ))
            ) : genreGames && genreGames.length > 0 ? (
              genreGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No {genreName} games found.
                </p>
                <Button asChild>
                  <Link href="/games">Browse All Games</Link>
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
        {game.isFeatured && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
            Featured
          </div>
        )}
      </div>
      <CardContent className="p-4 flex flex-col justify-between h-[calc(100%-12rem)]">
        <div>
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

// Helper function to get genre image
function getGenreImage(genre: string): string {
  const genreImages: Record<string, string> = {
    action: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1400&h=350&q=80",
    rpg: "https://images.unsplash.com/photo-1605899435973-ca2d1a8431cf?auto=format&fit=crop&w=1400&h=350&q=80",
    strategy: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?auto=format&fit=crop&w=1400&h=350&q=80",
    sports: "https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?auto=format&fit=crop&w=1400&h=350&q=80",
    adventure: "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?auto=format&fit=crop&w=1400&h=350&q=80",
    simulation: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&h=350&q=80",
    puzzle: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=1400&h=350&q=80",
    racing: "https://images.unsplash.com/photo-1547643221-53130c6e6fb9?auto=format&fit=crop&w=1400&h=350&q=80",
  };
  
  return genreImages[genre] || "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&h=350&q=80";
}