import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GamepadIcon, Send } from "lucide-react";
import { FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaDiscord } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <GamepadIcon className="h-6 w-6 text-primary mr-2" />
              <span className="font-bold text-xl text-white">TopBestGames</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Your trusted source for gaming information, reviews, and community.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaFacebook />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaInstagram />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaYoutube />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaDiscord />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/games" className="hover:text-primary transition-colors">
                  Games
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-primary transition-colors">
                  Reviews
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-primary transition-colors">
                  News
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Game Categories</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/genres/action" className="hover:text-primary transition-colors">
                  Action
                </Link>
              </li>
              <li>
                <Link href="/genres/adventure" className="hover:text-primary transition-colors">
                  Adventure
                </Link>
              </li>
              <li>
                <Link href="/genres/rpg" className="hover:text-primary transition-colors">
                  RPG
                </Link>
              </li>
              <li>
                <Link href="/genres/strategy" className="hover:text-primary transition-colors">
                  Strategy
                </Link>
              </li>
              <li>
                <Link href="/genres/sports" className="hover:text-primary transition-colors">
                  Sports
                </Link>
              </li>
              <li>
                <Link href="/genres/simulation" className="hover:text-primary transition-colors">
                  Simulation
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to get updates on new games and features.
            </p>
            <form className="mb-4" onSubmit={(e) => e.preventDefault()}>
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-gray-700 text-white rounded-r-none border-r-0 focus:ring-primary"
                />
                <Button type="submit" className="rounded-l-none">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
            <p className="text-gray-500 text-xs">
              By subscribing, you agree to our Privacy Policy and Terms of Service.
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} TopBestGames. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
