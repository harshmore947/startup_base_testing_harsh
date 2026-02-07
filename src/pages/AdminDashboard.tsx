import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { logger } from '@/lib/logger';

import { AdminStatCard } from '@/components/AdminStatCard';
import { AdminCharts } from '@/components/AdminCharts';
import { AdminTables } from '@/components/AdminTables';
import { DateRangeFilter, DateRange } from '@/components/DateRangeFilter';
import { Button } from '@/components/ui/button';
import { Users, Crown, FileText, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subDays, startOfDay } from 'date-fns';

export default function AdminDashboard() {
  logger.log('AdminDashboard component is rendering');
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  // Calculate date filter based on selected range
  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case '7d':
        return startOfDay(subDays(now, 7)).toISOString();
      case '30d':
        return startOfDay(subDays(now, 30)).toISOString();
      default:
        return null;
    }
  };

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats', dateRange],
    queryFn: async () => {
      const dateFilter = getDateFilter();
      
      // Total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Pro plan users  
      const { count: proUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'premium');

      // Total reports
      const { count: totalReports } = await supabase
        .from('user_reports')
        .select('*', { count: 'exact', head: true });

      // Reports in progress
      const { count: reportsInProgress } = await supabase
        .from('user_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      return {
        totalUsers: totalUsers || 0,
        proUsers: proUsers || 0,
        totalReports: totalReports || 0,
        reportsInProgress: reportsInProgress || 0,
        freeUsers: (totalUsers || 0) - (proUsers || 0),
      };
    },
  });

  // Fetch chart data
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['admin-charts', dateRange],
    queryFn: async () => {
      const dateFilter = getDateFilter();
      const baseQuery = dateFilter ? `created_at.gte.${dateFilter}` : '';
      
      // New signups over time
      let signupsQuery = supabase
        .from('users')
        .select('created_at')
        .order('created_at');
      
      if (dateFilter) {
        signupsQuery = signupsQuery.gte('created_at', dateFilter);
      }
      
      const { data: signupsRaw } = await signupsQuery;

      // Reports over time  
      let reportsQuery = supabase
        .from('user_reports')
        .select('created_at')
        .order('created_at');
        
      if (dateFilter) {
        reportsQuery = reportsQuery.gte('created_at', dateFilter);
      }
      
      const { data: reportsRaw } = await reportsQuery;

      // Process signups data
      const signupsMap = new Map<string, number>();
      signupsRaw?.forEach(item => {
        const date = format(new Date(item.created_at), 'MMM d');
        signupsMap.set(date, (signupsMap.get(date) || 0) + 1);
      });

      // Process reports data
      const reportsMap = new Map<string, number>();
      reportsRaw?.forEach(item => {
        const date = format(new Date(item.created_at), 'MMM d');
        reportsMap.set(date, (reportsMap.get(date) || 0) + 1);
      });

      const signupsData = Array.from(signupsMap.entries()).map(([date, count]) => ({
        date,
        count,
      }));

      const reportsData = Array.from(reportsMap.entries()).map(([date, count]) => ({
        date, 
        count,
      }));

      const planDistribution = [
        { name: 'Free Users', value: stats?.freeUsers || 0, color: 'hsl(var(--muted))' },
        { name: 'Pro Users', value: stats?.proUsers || 0, color: 'hsl(var(--primary))' },
      ];

      return { signupsData, reportsData, planDistribution };
    },
    enabled: !!stats,
  });

  // Fetch recent data for tables
  const { data: recentData, isLoading: recentLoading } = useQuery({
    queryKey: ['admin-recent'],
    queryFn: async () => {
      // Recent users
      const { data: recentUsers } = await supabase
        .from('users')
        .select('id, email, created_at, subscription_status')
        .order('created_at', { ascending: false })
        .limit(10);

      // Recent reports with user email
      const { data: recentReports } = await supabase
        .from('user_reports')
        .select(`
          id,
          idea_title,
          status,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get user emails for reports
      const userIds = recentReports?.map(r => r.user_id) || [];
      const { data: users } = await supabase
        .from('users')
        .select('id, email')
        .in('id', userIds);

      const userEmailMap = new Map(users?.map(u => [u.id, u.email]) || []);
      
      const reportsWithEmail = recentReports?.map(report => ({
        ...report,
        user_email: userEmailMap.get(report.user_id) || 'Unknown',
      })) || [];

      return {
        recentUsers: recentUsers || [],
        recentReports: reportsWithEmail,
      };
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1">Zero to One Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Monitor user activity and key business metrics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link to="/admin/user-reports">
                <FileText className="mr-2 h-4 w-4" />
                View User Reports
              </Link>
            </Button>
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))
          ) : (
            <>
              <AdminStatCard
                title="Total Users"
                value={stats?.totalUsers || 0}
                icon={Users}
              />
              <AdminStatCard
                title="Pro Plan Users" 
                value={stats?.proUsers || 0}
                subtitle={`${stats?.freeUsers || 0} free users`}
                icon={Crown}
              />
              <AdminStatCard
                title="Total Reports Generated"
                value={stats?.totalReports || 0}
                icon={FileText}
              />
              <AdminStatCard
                title="Reports in Progress"
                value={stats?.reportsInProgress || 0}
                icon={Clock}
              />
            </>
          )}
        </div>

        {/* Charts */}
        {chartLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            <Skeleton className="h-80 lg:col-span-2" />
          </div>
        ) : chartData ? (
          <AdminCharts
            signupsData={chartData.signupsData}
            reportsData={chartData.reportsData}
            planDistribution={chartData.planDistribution}
            dateRange={dateRange}
          />
        ) : null}

        {/* Tables */}
        {recentLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        ) : recentData ? (
          <AdminTables
            recentUsers={recentData.recentUsers}
            recentReports={recentData.recentReports}
          />
        ) : null}
      </div>
    </div>
  );
}