import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Sidebar from "@/components/admin/sidebar";
import StatsSection from "@/components/admin/stats-section";
import ChartsSection from "@/components/admin/charts-section";
import ActivitiesSection from "@/components/admin/activities-section";
import ReviewsSection from "@/components/admin/reviews-section";
import GamesSection from "@/components/admin/games-section";
import GamesManagement from "@/components/admin/games-management";
import UsersManagement from "@/components/admin/users-management";
import ReviewsManagement from "@/components/admin/reviews-management";
import SettingsSection from "@/components/admin/settings-section";
import { Plus } from "lucide-react";

export default function AdminPage() {
  const [route, params] = useRoute('/admin/:section?');
  const section = params?.section || 'dashboard';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex-grow w-full">
        {/* Mobile menu button */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
            <span className="ml-2">{mobileMenuOpen ? 'Close Menu' : 'Menu'}</span>
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - conditionally shown on mobile */}
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block`}>
            <Sidebar className="flex-shrink-0 w-full md:w-64 sticky top-4" />
          </div>
          
          {/* Main Content */}
          <main className="flex-1">
            {section === 'dashboard' && <DashboardView />}
            {section === 'games' && <GamesView />}
            {section === 'users' && <UsersView />}
            {section === 'reviews' && <ReviewsView />}
            {section === 'analytics' && <AnalyticsView />}
            {section === 'settings' && <SettingsView />}
            {section === 'logs' && <LogsView />}
          </main>
        </div>
      </div>
    </div>
  );
}

function DashboardView() {
  return (
    <>
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex w-full sm:w-auto gap-2 sm:space-x-3">
          <Button variant="outline" className="flex items-center text-xs sm:text-sm flex-1 sm:flex-initial justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1 sm:mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
              />
            </svg>
            Export
          </Button>
          <Button className="flex items-center text-xs sm:text-sm flex-1 sm:flex-initial justify-center">
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            Add Game
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsSection />

      {/* Charts Section */}
      <ChartsSection />

      {/* Recent Activities Table */}
      <div className="overflow-x-auto">
        <ActivitiesSection />
      </div>

      {/* Pending Reviews & Recently Added Games */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReviewsSection />
        <GamesSection />
      </div>
    </>
  );
}

function GamesView() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Games Management</h1>
      
      {/* Use the fully functional games management component */}
      <GamesManagement />
    </div>
  );
}

function UsersView() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">User Management</h1>
      
      {/* Use the fully functional users management component */}
      <UsersManagement />
    </div>
  );
}

function ReviewsView() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reviews Management</h1>
      
      {/* Use the fully functional reviews management component */}
      <ReviewsManagement />
    </div>
  );
}

function AnalyticsView() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analytics</h1>
      
      <ChartsSection />
    </div>
  );
}

function SettingsView() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Site Settings</h1>
      
      {/* Use the fully functional settings section component */}
      <SettingsSection />
    </div>
  );
}

function LogsView() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Activity Logs</h1>
      
      <ActivitiesSection />
    </div>
  );
}
