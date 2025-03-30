import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  GamepadIcon,
  Users,
  Star,
  BarChart2,
  Settings,
  History,
  Search,
  LogOut,
  UserCircle,
  ShieldAlert
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const isActive = (path: string) => {
    // Check if the path exactly matches or if it's a sub-path
    if (path === "/admin") {
      return location === "/admin";
    }
    return location.startsWith(path);
  };

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 mr-3" />
    },
    {
      href: "/admin/games",
      label: "Games",
      icon: <GamepadIcon className="w-5 mr-3" />
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: <Users className="w-5 mr-3" />
    },
    {
      href: "/admin/reviews",
      label: "Reviews",
      icon: <Star className="w-5 mr-3" />
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: <BarChart2 className="w-5 mr-3" />
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: <Settings className="w-5 mr-3" />
    },
    {
      href: "/admin/logs",
      label: "Logs",
      icon: <History className="w-5 mr-3" />
    }
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className={cn("w-full md:w-64 bg-white dark:bg-gray-900 rounded-xl shadow-md p-4 h-fit sticky top-24", className)}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center mb-4">
          <ShieldAlert className="mr-2 text-primary" />
          Admin Panel
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-gray-100 dark:bg-gray-800 pl-10 border-none"
          />
        </div>
      </div>
      
      <nav>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2.5 rounded-lg font-medium transition-colors",
                  isActive(item.href) 
                    ? "text-primary bg-purple-50 dark:bg-purple-900/20" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {user && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <UserCircle className="w-8 h-8 mr-3 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.isAdmin ? 'Administrator' : 'User'}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-500"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      )}
    </aside>
  );
}
