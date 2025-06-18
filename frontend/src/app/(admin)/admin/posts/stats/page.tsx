"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/Spinner";
import Show from "@/components/wrappers/Show";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Eye,
  Clock,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Heart,
  FileText,
} from "lucide-react";
import {
  getGeneralStats,
  getViews,
  getVisits,
  getAverageViewTime,
  getAverageVisitTime,
  getGlobalViews,
  getGlobalVisits,
} from "@/lib/api/requests/stats";

interface ChartData {
  date: string;
  views: number;
  visits: number;
  avgViewTime: number;
  avgVisitTime: number;
}

const chartConfig = {
  views: {
    label: "Views",
    color: "#3b82f6", // Bright blue
  },
  visits: {
    label: "Visits",
    color: "#10b981", // Bright emerald green
  },
  avgViewTime: {
    label: "Avg View Time (s)",
    color: "#f59e0b", // Bright amber
  },
  avgVisitTime: {
    label: "Avg Visit Time (s)",
    color: "#ef4444", // Bright red
  },
};

export default function StatsPage() {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);

  // Calculate date range
  const endDate = endOfDay(new Date());
  const startDate = startOfDay(subDays(endDate, timeRange));

  const startDateString = startDate.toISOString();
  const endDateString = endDate.toISOString();

  // Fetch general stats
  const generalStatsQuery = useQuery({
    queryKey: ["general-stats"],
    queryFn: getGeneralStats,
  });

  // Fetch global stats
  const globalViewsQuery = useQuery({
    queryKey: ["global-views", startDateString, endDateString],
    queryFn: () =>
      getGlobalViews({
        start: startDateString,
        end: endDateString,
      }),
  });

  const globalVisitsQuery = useQuery({
    queryKey: ["global-visits", startDateString, endDateString],
    queryFn: () =>
      getGlobalVisits({
        start: startDateString,
        end: endDateString,
      }),
  });

  // Fetch detailed time series data
  const viewsQuery = useQuery({
    queryKey: ["views", startDateString, endDateString],
    queryFn: () =>
      getViews({
        start: startDateString,
        end: endDateString,
      }),
  });

  const visitsQuery = useQuery({
    queryKey: ["visits", startDateString, endDateString],
    queryFn: () =>
      getVisits({
        start: startDateString,
        end: endDateString,
      }),
  });

  const avgViewTimeQuery = useQuery({
    queryKey: ["avg-view-time", startDateString, endDateString],
    queryFn: () =>
      getAverageViewTime({
        start: startDateString,
        end: endDateString,
      }),
  });

  const avgVisitTimeQuery = useQuery({
    queryKey: ["avg-visit-time", startDateString, endDateString],
    queryFn: () =>
      getAverageVisitTime({
        start: startDateString,
        end: endDateString,
      }),
  });

  // Process chart data
  const chartData: ChartData[] = [];
  if (
    viewsQuery.data &&
    visitsQuery.data &&
    avgViewTimeQuery.data &&
    avgVisitTimeQuery.data
  ) {
    const maxLength = Math.min(
      viewsQuery.data.length,
      visitsQuery.data.length,
      avgViewTimeQuery.data.length,
      avgVisitTimeQuery.data.length
    );

    for (let i = 0; i < maxLength; i++) {
      const date = subDays(endDate, maxLength - 1 - i);
      chartData.push({
        date: format(date, "MMM dd"),
        views: viewsQuery.data[i] || 0,
        visits: visitsQuery.data[i] || 0,
        avgViewTime: avgViewTimeQuery.data[i] || 0,
        avgVisitTime: avgVisitTimeQuery.data[i] || 0,
      });
    }
  }

  const isLoading =
    generalStatsQuery.isLoading ||
    globalViewsQuery.isLoading ||
    globalVisitsQuery.isLoading ||
    viewsQuery.isLoading ||
    visitsQuery.isLoading ||
    avgViewTimeQuery.isLoading ||
    avgVisitTimeQuery.isLoading;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Statistics</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Detailed analytics and insights for your blog
          </p>
        </div>
        
        <div className="flex items-center space-x-2 overflow-x-auto">
          <Button
            variant={timeRange === 7 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(7)}
            className="whitespace-nowrap"
          >
            7 days
          </Button>
          <Button
            variant={timeRange === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(30)}
            className="whitespace-nowrap"
          >
            30 days
          </Button>
          <Button
            variant={timeRange === 90 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(90)}
            className="whitespace-nowrap"
          >
            90 days
          </Button>
        </div>
      </div>

      <Show when={isLoading}>
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </Show>

      <Show when={!isLoading}>
        {/* Overview Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {generalStatsQuery.data?.total_articles || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Published posts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {generalStatsQuery.data?.total_comments || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                User interactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {generalStatsQuery.data?.total_likes || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Post likes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Views ({timeRange}d)
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {globalViewsQuery.data || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total page views
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts Grid */}
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
          {/* Views and Visits Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="truncate">Views & Visits Trend</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Daily views and visits over the last {timeRange} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] lg:h-[300px]">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={10}
                    className="sm:text-xs"
                    tickMargin={5}
                  />
                  <YAxis 
                    fontSize={10}
                    className="sm:text-xs"
                    tickMargin={5}
                    width={30}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Engagement Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="truncate">Average Time Metrics</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Average time spent viewing and visiting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] lg:h-[300px]">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={10}
                    className="sm:text-xs"
                    tickMargin={5}
                  />
                  <YAxis 
                    fontSize={10}
                    className="sm:text-xs"
                    tickMargin={5}
                    width={30}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [
                      formatTime(Number(value)),
                      name,
                    ]}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="avgViewTime"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#f59e0b" }}
                    className="sm:stroke-[2] sm:dot-r-4"
                  />
                  <Line
                    type="monotone"
                    dataKey="avgVisitTime"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#ef4444" }}
                    className="sm:stroke-[2] sm:dot-r-4"
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Full Width Views Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">Daily Views Breakdown</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Individual day performance over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] lg:h-[400px]">
              <BarChart 
                data={chartData} 
                margin={{ 
                  top: 20, 
                  right: 10, 
                  left: 0, 
                  bottom: 5 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={10}
                  className="sm:text-xs"
                  tickMargin={5}
                />
                <YAxis 
                  fontSize={10}
                  className="sm:text-xs"
                  tickMargin={5}
                  width={30}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar 
                  dataKey="views" 
                  fill="#3b82f6" 
                  radius={[2, 2, 0, 0]}
                  className="sm:radius-[4,4,0,0]"
                />
                <Bar 
                  dataKey="visits" 
                  fill="#10b981" 
                  radius={[2, 2, 0, 0]}
                  className="sm:radius-[4,4,0,0]"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Peak Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm text-muted-foreground">Best Day (Views)</span>
                <Badge variant="secondary" className="text-xs w-fit">
                  {chartData.length > 0 
                    ? chartData.reduce((max, day) => day.views > max.views ? day : max).date
                    : "N/A"
                  }
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm text-muted-foreground">Peak Views</span>
                <span className="font-semibold text-sm sm:text-base">
                  {chartData.length > 0 
                    ? Math.max(...chartData.map(d => d.views))
                    : 0
                  }
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm text-muted-foreground">Peak Visits</span>
                <span className="font-semibold text-sm sm:text-base">
                  {chartData.length > 0 
                    ? Math.max(...chartData.map(d => d.visits))
                    : 0
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Average Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm text-muted-foreground">Avg Daily Views</span>
                <span className="font-semibold text-sm sm:text-base">
                  {chartData.length > 0 
                    ? Math.round(chartData.reduce((sum, d) => sum + d.views, 0) / chartData.length)
                    : 0
                  }
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm text-muted-foreground">Avg Daily Visits</span>
                <span className="font-semibold text-sm sm:text-base">
                  {chartData.length > 0 
                    ? Math.round(chartData.reduce((sum, d) => sum + d.visits, 0) / chartData.length)
                    : 0
                  }
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm text-muted-foreground">Avg View Time</span>
                <span className="font-semibold text-sm sm:text-base">
                  {chartData.length > 0 
                    ? formatTime(Math.round(chartData.reduce((sum, d) => sum + d.avgViewTime, 0) / chartData.length))
                    : "0s"
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Engagement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm text-muted-foreground">Total Visits</span>
                <span className="font-semibold text-sm sm:text-base">
                  {globalVisitsQuery.data || 0}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm text-muted-foreground">Views/Visit Ratio</span>
                <span className="font-semibold text-sm sm:text-base">
                  {globalVisitsQuery.data && globalViewsQuery.data && globalVisitsQuery.data > 0
                    ? (globalViewsQuery.data / globalVisitsQuery.data).toFixed(2)
                    : "0"
                  }
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm text-muted-foreground">Period</span>
                <Badge className="text-xs w-fit">
                  {format(startDate, "MMM dd")} - {format(endDate, "MMM dd")}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </Show>
    </div>
  );
}
