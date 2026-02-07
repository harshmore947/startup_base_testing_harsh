import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, FileText, Search, Eye, Hammer } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function AdminUserReports() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['admin-user-reports', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('user_reports')
        .select('id, idea_title, idea_description, status, created_at, user_id')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: reports, error } = await query;
      if (error) throw error;

      // Fetch user details separately
      const userIds = [...new Set(reports?.map(r => r.user_id) || [])];
      const { data: users } = await supabase
        .from('users')
        .select('id, email, subscription_status')
        .in('id', userIds);

      const userMap = new Map(users?.map(u => [u.id, u]) || []);

      return reports?.map(report => ({
        ...report,
        user: userMap.get(report.user_id) || null
      }));
    },
  });

  // Filter by search query
  const filteredReports = reportsData?.filter(report => {
    const searchLower = searchQuery.toLowerCase();
    return (
      report.idea_title?.toLowerCase().includes(searchLower) ||
      report.user?.email?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const totalPages = Math.ceil((filteredReports?.length || 0) / itemsPerPage);
  const paginatedReports = filteredReports?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'Completed', variant: 'default' as const },
      pending: { label: 'Pending', variant: 'secondary' as const },
      failed: { label: 'Failed', variant: 'destructive' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <h1 className="text-4xl font-bold">User Generated Reports</h1>
            <p className="text-muted-foreground mt-2">
              View and manage all user-generated idea reports
            </p>
          </div>
          <FileText className="h-12 w-12 text-primary" />
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by idea title or user email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Reports ({filteredReports?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : paginatedReports && paginatedReports.length > 0 ? (
              <>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Idea Title</TableHead>
                        <TableHead>User Email</TableHead>
                        <TableHead>Subscription</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium max-w-xs truncate">
                            {report.idea_title || 'Untitled'}
                          </TableCell>
                          <TableCell>{report.user?.email || 'Unknown'}</TableCell>
                          <TableCell>
                            <Badge variant={report.user?.subscription_status === 'premium' ? 'default' : 'secondary'}>
                              {report.user?.subscription_status || 'free'}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(report.status || 'unknown')}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(report.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/user-report/${report.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Report
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/user-build/${report.id}`)}
                            >
                              <Hammer className="h-4 w-4 mr-1" />
                              Build Plan
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'User reports will appear here once generated'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
