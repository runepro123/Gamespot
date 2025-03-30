import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import GamePage from "@/pages/game-page";
import GamesPage from "@/pages/games-page";
import GenrePage from "@/pages/genre-page";
import ProfilePage from "@/pages/profile-page";
import AboutPage from "@/pages/about-page";
import ContactPage from "@/pages/contact-page";
import AdminPage from "@/pages/admin-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/ui/theme-provider";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/game/:id" component={GamePage} />
      <Route path="/games" component={GamesPage} />
      <Route path="/genres/:genreName" component={GenrePage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      {/* Admin routes */}
      <ProtectedRoute path="/admin" component={AdminPage} requireAdmin={true} />
      <ProtectedRoute path="/admin/games" component={AdminPage} requireAdmin={true} />
      <ProtectedRoute path="/admin/users" component={AdminPage} requireAdmin={true} />
      <ProtectedRoute path="/admin/reviews" component={AdminPage} requireAdmin={true} />
      <ProtectedRoute path="/admin/analytics" component={AdminPage} requireAdmin={true} />
      <ProtectedRoute path="/admin/settings" component={AdminPage} requireAdmin={true} />
      <ProtectedRoute path="/admin/logs" component={AdminPage} requireAdmin={true} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="topbestgames-theme">
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
