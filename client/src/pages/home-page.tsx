import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import TrendingGames from "@/components/home/trending-games";
import GenreSection from "@/components/home/genre-section";
import TopRatedGames from "@/components/home/top-rated-games";
import NewsletterSection from "@/components/home/newsletter-section";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HeroSection />
          <TrendingGames />
          <GenreSection />
          <TopRatedGames />
          <NewsletterSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
