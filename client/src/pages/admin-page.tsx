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
import { Plus } from "lucide-react";

export default function AdminPage() {
  const [route] = useRoute('/admin/:section?');
  const section = route?.section || 'dashboard';
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <Sidebar className="flex-shrink-0" />
          
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-2" 
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
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Game
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsSection />

      {/* Charts Section */}
      <ChartsSection />

      {/* Recent Activities Table */}
      <ActivitiesSection />

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Games Management</h1>
        <Button className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Game
        </Button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <p className="text-center text-gray-500 dark:text-gray-400 py-20">
          Full games management interface would go here
        </p>
      </div>
    </div>
  );
}

function UsersView() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">User Management</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <p className="text-center text-gray-500 dark:text-gray-400 py-20">
          User management interface would go here
        </p>
      </div>
    </div>
  );
}

function ReviewsView() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reviews Management</h1>
      
      <ReviewsSection />
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
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <p className="text-center text-gray-500 dark:text-gray-400 py-20">
          Site settings interface would go here
        </p>
      </div>
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
