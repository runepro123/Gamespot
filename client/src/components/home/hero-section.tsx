import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="mb-12">
      <div className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&h=400&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/50" />
        <div className="relative px-8 md:px-12 py-16 md:py-24 flex flex-col items-start">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Discover Your Next <span className="text-orange-500">Gaming Adventure</span>
          </h1>
          <p className="text-gray-200 text-lg md:text-xl max-w-lg mb-6">
            Explore top-rated games across all platforms, read reviews, and connect with other gamers.
          </p>
          <Button size="lg" asChild>
            <Link href="/games">Explore Games</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
