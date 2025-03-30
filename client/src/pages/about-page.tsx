import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  GamepadIcon, 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Shield, 
  BookOpen,
  ArrowRight 
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-purple-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <GamepadIcon className="h-16 w-16 mx-auto mb-4 opacity-75" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About TopBestGames</h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Your trusted source for gaming information, reviews, and community discussions.
            </p>
          </div>
        </div>
        
        {/* Mission Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Our Mission</h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  At TopBestGames, we're passionate about creating a platform where gamers can discover 
                  new games, share their experiences, and connect with other enthusiasts.
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  We believe that gaming is more than just entertainment – it's a form of art, a way to 
                  tell stories, and a means to bring people together across the world.
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  Our platform is designed to provide accurate, honest, and comprehensive information 
                  about games across all genres, helping you make informed decisions about your next gaming adventure.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">Discover</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Find new and exciting games across all genres
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <ThumbsUp className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">Review</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Share your opinions and experiences with the community
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">Connect</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Join a community of passionate gamers around the world
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">Trust</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Benefit from our rigorous review process and strong community standards
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Our Team</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Meet the passionate gamers and industry experts behind TopBestGames
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center">
                      <member.icon className="h-14 w-14 text-primary" />
                    </div>
                  </div>
                  <CardContent className="p-6 text-center">
                    <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                    <p className="text-primary font-medium text-sm mb-3">{member.role}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Join Our Community</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              Become a member today to rate games, write reviews, and connect with other gamers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/auth">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/games">Browse Games</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// Team members data
const teamMembers = [
  {
    name: "Alex Rodriguez",
    role: "Founder & Lead Developer",
    bio: "Gaming enthusiast with 15+ years of experience in game development and web technologies.",
    icon: GamepadIcon
  },
  {
    name: "Sarah Johnson",
    role: "Chief Content Officer",
    bio: "Former gaming journalist with a passion for discovering and sharing unique gaming experiences.",
    icon: BookOpen
  },
  {
    name: "Michael Wong",
    role: "Community Manager",
    bio: "Lifelong gamer focused on building positive communities and fostering meaningful discussions.",
    icon: MessageSquare
  },
  {
    name: "Emily Chen",
    role: "UX/UI Designer",
    bio: "Creating beautiful and intuitive interfaces that enhance the gaming discovery experience.",
    icon: Users
  },
  {
    name: "David Park",
    role: "Reviews Coordinator",
    bio: "Ensures the accuracy and fairness of all game reviews across the platform.",
    icon: Shield
  },
  {
    name: "Olivia Martinez",
    role: "Marketing Specialist",
    bio: "Connecting gamers with the games they'll love through targeted outreach and partnerships.",
    icon: ThumbsUp
  }
];