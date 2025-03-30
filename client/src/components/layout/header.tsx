import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  GamepadIcon, 
  Search, 
  Menu, 
  X, 
  User,
  LogOut,
  Settings,
  Shield
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${
      isScrolled ? "bg-white/95 dark:bg-gray-900/95 shadow-sm backdrop-blur-sm" : "bg-white dark:bg-gray-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <GamepadIcon className="h-6 w-6 text-primary mr-2" />
              <span className="font-bold text-xl text-primary">TopBestGames</span>
            </Link>
            
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
              }`}>
                Home
              </Link>
              <Link href="/games" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/games') 
                  ? 'text-primary' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
              }`}>
                Games
              </Link>
              <Link href="/about" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/about') 
                  ? 'text-primary' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
              }`}>
                About
              </Link>
              <Link href="/contact" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/contact') 
                  ? 'text-primary' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
              }`}>
                Contact
              </Link>
            </nav>
          </div>

          {/* Search and Auth */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Search games..." 
                className="pl-10 pr-4 py-2 w-60 bg-gray-100 dark:bg-gray-800 border-none"
              />
            </div>
            
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-3 py-2 rounded-md text-sm font-medium">
                    {user.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth" className="hidden md:block text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Button asChild className="hidden md:block">
                  <Link href="/auth?tab=register">Sign Up</Link>
                </Button>
              </>
            )}
            
            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <Link href="/" className="flex items-center">
                    <GamepadIcon className="h-6 w-6 text-primary mr-2" />
                    <span className="font-bold text-xl text-primary">TopBestGames</span>
                  </Link>
                </div>
                
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Search games..." 
                    className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-800 border-none"
                  />
                </div>
                
                <nav className="flex flex-col space-y-4">
                  <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
                  }`}>
                    Home
                  </Link>
                  <Link href="/games" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/games') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
                  }`}>
                    Games
                  </Link>
                  <Link href="/about" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/about') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
                  }`}>
                    About
                  </Link>
                  <Link href="/contact" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/contact') 
                      ? 'text-primary bg-primary/10' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
                  }`}>
                    Contact
                  </Link>
                </nav>
                
                <div className="mt-auto flex flex-col space-y-4">
                  {user ? (
                    <>
                      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <ThemeToggle />
                      </div>
                      {user.isAdmin && (
                        <Button variant="outline" className="justify-start" asChild>
                          <Link href="/admin">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        </Button>
                      )}
                      <Button variant="outline" className="justify-start" onClick={handleLogout} disabled={logoutMutation.isPending}>
                        <LogOut className="mr-2 h-4 w-4" />
                        {logoutMutation.isPending ? "Logging out..." : "Logout"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild>
                        <Link href="/auth">Login</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/auth?tab=register">Sign Up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
