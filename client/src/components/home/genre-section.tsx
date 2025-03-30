import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Game } from "@shared/schema";
import { capitalizeFirstLetter } from "@/lib/utils";

type Genre = {
  name: string;
  imageUrl: string;
};

const genres: Genre[] = [
  { name: "action", imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=300&h=150&q=80" },
  { name: "rpg", imageUrl: "https://images.unsplash.com/photo-1605899435973-ca2d1a8431cf?auto=format&fit=crop&w=300&h=150&q=80" },
  { name: "strategy", imageUrl: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?auto=format&fit=crop&w=300&h=150&q=80" },
  { name: "sports", imageUrl: "https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?auto=format&fit=crop&w=300&h=150&q=80" },
  { name: "adventure", imageUrl: "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?auto=format&fit=crop&w=300&h=150&q=80" },
  { name: "simulation", imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=300&h=150&q=80" },
  { name: "puzzle", imageUrl: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=300&h=150&q=80" },
  { name: "racing", imageUrl: "https://images.unsplash.com/photo-1547643221-53130c6e6fb9?auto=format&fit=crop&w=300&h=150&q=80" },
];

export default function GenreSection() {
  // We're fetching all games to determine which genres actually have games
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  // Filter genres that have at least one game
  const activeGenres = genres.filter(genre => 
    !games || games.some(game => game.genre === genre.name)
  );

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Browse by Genre</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <GenreSkeleton key={index} />
            ))
          : activeGenres.map((genre) => (
              <GenreCard key={genre.name} genre={genre} />
            ))}
      </div>
    </section>
  );
}

function GenreCard({ genre }: { genre: Genre }) {
  return (
    <Link href={`/genres/${genre.name}`}>
      <div className="relative rounded-lg overflow-hidden group cursor-pointer">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
        <img 
          src={genre.imageUrl} 
          alt={`${genre.name} games`} 
          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
          <h3 className="text-white font-semibold text-lg">
            {capitalizeFirstLetter(genre.name)}
          </h3>
        </div>
      </div>
    </Link>
  );
}

function GenreSkeleton() {
  return (
    <div className="relative rounded-lg overflow-hidden">
      <Skeleton className="w-full h-32" />
    </div>
  );
}
