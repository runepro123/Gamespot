import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  AreaChart,
  Legend,
  LineChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart
} from "recharts";
import { Analytics } from "@shared/schema";

const dummyUserActivity = [
  { day: "Mon", activeUsers: 1250, newUsers: 350 },
  { day: "Tue", activeUsers: 1420, newUsers: 420 },
  { day: "Wed", activeUsers: 1800, newUsers: 380 },
  { day: "Thu", activeUsers: 1650, newUsers: 450 },
  { day: "Fri", activeUsers: 1950, newUsers: 550 },
  { day: "Sat", activeUsers: 2200, newUsers: 600 },
  { day: "Sun", activeUsers: 2400, newUsers: 700 },
];

const dummyGameCategories = [
  { name: "Action", value: 35, color: "#6d28d9" },
  { name: "RPG", value: 25, color: "#4f46e5" },
  { name: "Adventure", value: 20, color: "#f97316" },
  { name: "Sports", value: 10, color: "#22c55e" },
  { name: "Strategy", value: 7, color: "#f59e0b" },
  { name: "Others", value: 3, color: "#94a3b8" },
];

export default function ChartsSection() {
  const [timeRange, setTimeRange] = useState("7");
  const [categoryRange, setCategoryRange] = useState("all");
  
  const { data: analyticsData, isLoading } = useQuery<Analytics[]>({
    queryKey: ["/api/analytics", { days: parseInt(timeRange) }],
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* User Activity Chart */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">User Activity</h3>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] bg-gray-100 dark:bg-gray-800 border-0">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dummyUserActivity}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6d28d9" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6d28d9" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="activeUsers"
                    stroke="#6d28d9"
                    fillOpacity={1}
                    fill="url(#colorActiveUsers)"
                    name="Active Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="newUsers"
                    stroke="#4f46e5"
                    fillOpacity={1}
                    fill="url(#colorNewUsers)"
                    name="New Users"
                  />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Categories Chart */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Top Game Categories</h3>
            <Select value={categoryRange} onValueChange={setCategoryRange}>
              <SelectTrigger className="w-[180px] bg-gray-100 dark:bg-gray-800 border-0">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dummyGameCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label
                  >
                    {dummyGameCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
