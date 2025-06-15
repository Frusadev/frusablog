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
    color: "hsl(var(--chart-1))",
  },
  visits: {
    label: "Visits",
    color: "hsl(var(--chart-2))",
  },
  avgViewTime: {
    label: "Avg View Time (s)",
    color: "hsl(var(--chart-3))",
  },
  avgVisitTime: {
    label: "Avg Visit Time (s)",
    color: "hsl(var(--chart-4))",
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
          <p className="text-muted-foreground">
            Detailed analytics and insights for your blog
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={timeRange === 7 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(7)}
          >
            7 days
          </Button>
          <Button
            variant={timeRange === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(30)}
          >
            30 days
          </Button>
          <Button
            variant={timeRange === 90 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(90)}
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Views and Visits Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Views & Visits Trend
              </CardTitle>
              <CardDescription>
                Daily views and visits over the last {timeRange} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stackId="1"
                    stroke="var(--color-views)"
                    fill="var(--color-views)"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stackId="1"
                    stroke="var(--color-visits)"
                    fill="var(--color-visits)"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Engagement Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Average Time Metrics
              </CardTitle>
              <CardDescription>
                Average time spent viewing and visiting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
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
                    stroke="var(--color-avgViewTime)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgVisitTime"
                    stroke="var(--color-avgVisitTime)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Full Width Views Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily Views Breakdown
            </CardTitle>
            <CardDescription>
              Individual day performance over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[400px]">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="views" fill="var(--color-views)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="visits" fill="var(--color-visits)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Peak Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Best Day (Views)</span>
                <Badge variant="secondary">
                  {chartData.length > 0 
                    ? chartData.reduce((max, day) => day.views > max.views ? day : max).date
                    : "N/A"
                  }
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Peak Views</span>
                <span className="font-semibold">
                  {chartData.length > 0 
                    ? Math.max(...chartData.map(d => d.views))
                    : 0
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Peak Visits</span>
                <span className="font-semibold">
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
              <CardTitle className="text-lg">Average Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Daily Views</span>
                <span className="font-semibold">
                  {chartData.length > 0 
                    ? Math.round(chartData.reduce((sum, d) => sum + d.views, 0) / chartData.length)
                    : 0
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Daily Visits</span>
                <span className="font-semibold">
                  {chartData.length > 0 
                    ? Math.round(chartData.reduce((sum, d) => sum + d.visits, 0) / chartData.length)
                    : 0
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg View Time</span>
                <span className="font-semibold">
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
              <CardTitle className="text-lg">Engagement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Visits</span>
                <span className="font-semibold">
                  {globalVisitsQuery.data || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Views/Visit Ratio</span>
                <span className="font-semibold">
                  {globalVisitsQuery.data && globalViewsQuery.data && globalVisitsQuery.data > 0
                    ? (globalViewsQuery.data / globalVisitsQuery.data).toFixed(2)
                    : "0"
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Period</span>
                <Badge>
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
