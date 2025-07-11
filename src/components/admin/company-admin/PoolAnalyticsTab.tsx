import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MultiSelectFilter } from '@/components/ui/multi-select-filter';
import { 
  Download, 
  Search, 
  Crown,
  Users, 
  DollarSign,
  Trophy,
  Calendar,
  TrendingUp,
  Database,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';

interface PoolData {
  id: string;
  name: string;
  owner_display_name: string;
  owner_id: string;
  member_count: number;
  entry_count: number;
  prize_pool_total: number;
  entry_fee_amount: number;
  entry_fee_currency: string;
  created_at: string;
  draft_open: boolean;
  draft_locked: boolean;
  season_complete: boolean;
  has_buy_in: boolean;
}

interface PoolStats {
  total_pools: number;
  active_pools: number;
  total_members: number;
  total_prize_money: number;
  total_entries: number;
  avg_pool_size: number;
}

export const PoolAnalyticsTab: React.FC = () => {
  const [pools, setPools] = useState<PoolData[]>([]);
  const [filteredPools, setFilteredPools] = useState<PoolData[]>([]);
  const [stats, setStats] = useState<PoolStats>({
    total_pools: 0,
    active_pools: 0,
    total_members: 0,
    total_prize_money: 0,
    total_entries: 0,
    avg_pool_size: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: [] as string[],
    type: [] as string[],
    entryFeeRange: [] as string[],
    poolSize: [] as string[],
    creationDate: [] as string[]
  });
  const [deletePoolId, setDeletePoolId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPoolData();
  }, []);

  useEffect(() => {
    filterPools();
  }, [pools, searchTerm, filters]);

  const loadPoolData = async () => {
    try {
      console.log('COMPANY_ADMIN: Loading enhanced pool analytics...');
      
      // Try to load enhanced data via edge function first
      try {
        const { data: enhancedData, error: enhancedError } = await supabase.functions.invoke('company-admin-data', {
          body: { action: 'get_pool_analytics' }
        });

        if (enhancedError) {
          console.warn('COMPANY_ADMIN: Enhanced pool data failed, falling back to basic data:', enhancedError);
          throw enhancedError;
        }

        console.log('COMPANY_ADMIN: Enhanced pool data loaded successfully');
        
        setPools(enhancedData.pools || []);
        setStats(enhancedData.stats || stats);
        return;
        
      } catch (enhancedError) {
        console.log('COMPANY_ADMIN: Falling back to basic pool data loading...');
      }

      // Fallback to basic data loading
      const { data: poolsData, error: poolsError } = await supabase
        .from('pools')
        .select(`
          id,
          name,
          owner_id,
          entry_fee_amount,
          entry_fee_currency,
          created_at,
          draft_open,
          draft_locked,
          season_complete,
          has_buy_in
        `);

      if (poolsError) {
        console.error('COMPANY_ADMIN: Error loading pools:', poolsError);
        throw poolsError;
      }

      console.log('COMPANY_ADMIN: Loaded pools:', poolsData?.length || 0);

      // Get owner profiles separately to handle RLS gracefully
      let ownerProfiles = null;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, display_name');
        
        if (error) {
          console.warn('COMPANY_ADMIN: Cannot access profiles due to RLS:', error.message);
        } else {
          ownerProfiles = data;
          console.log('COMPANY_ADMIN: Loaded owner profiles:', data?.length || 0);
        }
      } catch (err) {
        console.warn('COMPANY_ADMIN: Failed to load owner profiles:', err);
      }

      // Get member counts for each pool
      const { data: memberData, error: memberError } = await supabase
        .from('pool_memberships')
        .select('pool_id')
        .eq('active', true);

      if (memberError) {
        console.warn('COMPANY_ADMIN: Error loading memberships:', memberError);
      }

      // Get entry counts for each pool
      const { data: entryData, error: entryError } = await supabase
        .from('pool_entries')
        .select('pool_id, payment_confirmed');

      if (entryError) {
        console.warn('COMPANY_ADMIN: Error loading entries:', entryError);
      }

      // Process the data
      const processedPools: PoolData[] = (poolsData || []).map((pool: any) => {
        const memberCount = memberData?.filter(m => m.pool_id === pool.id).length || 0;
        const entryCount = entryData?.filter(e => e.pool_id === pool.id).length || 0;
        const confirmedEntries = entryData?.filter(e => e.pool_id === pool.id && e.payment_confirmed).length || 0;
        
        // Calculate total prize pool (confirmed entries * entry fee)
        const prizePoolTotal = pool.has_buy_in ? (confirmedEntries * pool.entry_fee_amount) : 0;

        // Find owner profile
        const ownerProfile = ownerProfiles?.find(p => p.user_id === pool.owner_id);

        return {
          id: pool.id,
          name: pool.name,
          owner_display_name: ownerProfile?.display_name || 'Unknown Owner',
          owner_id: pool.owner_id,
          member_count: memberCount,
          entry_count: entryCount,
          prize_pool_total: prizePoolTotal,
          entry_fee_amount: pool.entry_fee_amount,
          entry_fee_currency: pool.entry_fee_currency,
          created_at: pool.created_at,
          draft_open: pool.draft_open,
          draft_locked: pool.draft_locked,
          season_complete: pool.season_complete,
          has_buy_in: pool.has_buy_in,
        };
      });

      setPools(processedPools);

      // Calculate stats
      const totalPools = processedPools.length;
      const activePools = processedPools.filter(p => !p.season_complete).length;
      const totalMembers = processedPools.reduce((sum, p) => sum + p.member_count, 0);
      const totalPrizeMoney = processedPools.reduce((sum, p) => sum + p.prize_pool_total, 0);
      const totalEntries = processedPools.reduce((sum, p) => sum + p.entry_count, 0);
      const avgPoolSize = totalPools > 0 ? totalMembers / totalPools : 0;

      setStats({
        total_pools: totalPools,
        active_pools: activePools,
        total_members: totalMembers,
        total_prize_money: totalPrizeMoney,
        total_entries: totalEntries,
        avg_pool_size: Math.round(avgPoolSize * 100) / 100,
      });

      console.log('COMPANY_ADMIN: Pool analytics loaded successfully');

    } catch (error: any) {
      console.error('Error loading pool analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load pool analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPools = () => {
    let filtered = pools;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pool => 
        pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.owner_display_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filters (OR logic within category)
    if (filters.status.length > 0) {
      filtered = filtered.filter(pool => {
        return filters.status.some(status => {
          switch (status) {
            case 'active':
              return !pool.season_complete && pool.draft_open;
            case 'draft_locked':
              return pool.draft_locked;
            case 'completed':
              return pool.season_complete;
            default:
              return false;
          }
        });
      });
    }

    // Type filters (OR logic within category)
    if (filters.type.length > 0) {
      filtered = filtered.filter(pool => {
        return filters.type.some(type => {
          switch (type) {
            case 'has_buy_in':
              return pool.has_buy_in;
            case 'free':
              return !pool.has_buy_in;
            default:
              return false;
          }
        });
      });
    }

    // Entry fee range filters
    if (filters.entryFeeRange.length > 0) {
      filtered = filtered.filter(pool => {
        return filters.entryFeeRange.some(range => {
          const fee = pool.entry_fee_amount;
          switch (range) {
            case 'under_20':
              return fee < 20;
            case '20_50':
              return fee >= 20 && fee <= 50;
            case '50_100':
              return fee > 50 && fee <= 100;
            case 'over_100':
              return fee > 100;
            default:
              return false;
          }
        });
      });
    }

    // Pool size filters
    if (filters.poolSize.length > 0) {
      filtered = filtered.filter(pool => {
        return filters.poolSize.some(size => {
          const members = pool.member_count;
          switch (size) {
            case 'small':
              return members <= 5;
            case 'medium':
              return members > 5 && members <= 15;
            case 'large':
              return members > 15;
            default:
              return false;
          }
        });
      });
    }

    // Creation date filters
    if (filters.creationDate.length > 0) {
      const now = new Date();
      filtered = filtered.filter(pool => {
        const createdDate = new Date(pool.created_at);
        return filters.creationDate.some(range => {
          switch (range) {
            case 'last_week':
              return (now.getTime() - createdDate.getTime()) <= (7 * 24 * 60 * 60 * 1000);
            case 'last_month':
              return (now.getTime() - createdDate.getTime()) <= (30 * 24 * 60 * 60 * 1000);
            case 'last_3_months':
              return (now.getTime() - createdDate.getTime()) <= (90 * 24 * 60 * 60 * 1000);
            case 'older':
              return (now.getTime() - createdDate.getTime()) > (90 * 24 * 60 * 60 * 1000);
            default:
              return false;
          }
        });
      });
    }

    setFilteredPools(filtered);
  };

  const exportPoolsToCsv = () => {
    const headers = [
      'Pool Name', 'Owner', 'Members', 'Entries', 'Prize Pool', 'Entry Fee', 
      'Currency', 'Status', 'Created Date', 'Draft Open', 'Draft Locked', 'Season Complete'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredPools.map(pool => [
        `"${pool.name}"`,
        `"${pool.owner_display_name}"`,
        pool.member_count,
        pool.entry_count,
        pool.prize_pool_total,
        pool.entry_fee_amount,
        pool.entry_fee_currency,
        pool.season_complete ? 'Completed' : pool.draft_locked ? 'Draft Locked' : 'Active',
        new Date(pool.created_at).toLocaleDateString(),
        pool.draft_open ? 'Yes' : 'No',
        pool.draft_locked ? 'Yes' : 'No',
        pool.season_complete ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pool-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Exported ${filteredPools.length} pools to CSV`,
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getPoolStatus = (pool: PoolData) => {
    if (pool.season_complete) return { label: 'Completed', variant: 'secondary' as const };
    if (pool.draft_locked) return { label: 'Draft Locked', variant: 'destructive' as const };
    if (pool.draft_open) return { label: 'Active', variant: 'default' as const };
    return { label: 'Unknown', variant: 'outline' as const };
  };

  const deletePool = async (poolId: string) => {
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('company-admin-data', {
        body: { action: 'delete_pool', pool_id: poolId }
      });

      if (error) throw error;

      toast({
        title: "Pool Deleted",
        description: data.message,
      });

      // Reload pool data
      await loadPoolData();
    } catch (error: any) {
      console.error('Error deleting pool:', error);
      toast({
        title: "Error",
        description: "Failed to delete pool",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletePoolId(null);
    }
  };

  const deleteAllTestPools = async () => {
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('company-admin-data', {
        body: { action: 'delete_test_pools' }
      });

      if (error) throw error;

      toast({
        title: "Test Pools Deleted",
        description: data.message,
      });

      // Reload pool data
      await loadPoolData();
    } catch (error: any) {
      console.error('Error deleting test pools:', error);
      toast({
        title: "Error",
        description: "Failed to delete test pools",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteAllPools = async () => {
    if (!confirm('⚠️ DANGER: Are you sure you want to delete ALL pools? This will delete every single pool in the database and cannot be undone!')) {
      return;
    }

    if (!confirm('This is your final warning. Type "DELETE ALL" in the next prompt to confirm.')) {
      return;
    }

    const confirmText = prompt('Type "DELETE ALL" to confirm:');
    if (confirmText !== 'DELETE ALL') {
      toast({
        title: "Deletion Cancelled",
        description: "Confirmation text did not match",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('company-admin-data', {
        body: { action: 'delete_all_pools' }
      });

      if (error) throw error;

      toast({
        title: "All Pools Deleted",
        description: data.message,
      });

      // Reload pool data
      await loadPoolData();
    } catch (error: any) {
      console.error('Error deleting all pools:', error);
      toast({
        title: "Error",
        description: "Failed to delete all pools",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading pool analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pool Analytics</h3>
        <div className="flex gap-2">
          <Button onClick={exportPoolsToCsv} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={deleteAllTestPools} 
            variant="destructive" 
            size="sm"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Test Pools
          </Button>
          <Button 
            onClick={deleteAllPools} 
            variant="destructive" 
            size="sm"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete ALL Pools
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Pools</p>
                <p className="text-2xl font-bold">{stats.total_pools}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Pools</p>
                <p className="text-2xl font-bold text-green-600">{stats.active_pools}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold text-purple-600">{stats.total_members}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold text-orange-600">{stats.total_entries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-700" />
              <div>
                <p className="text-sm text-muted-foreground">Total Prize Money</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(stats.total_prize_money, 'CAD')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Pool Size</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.avg_pool_size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search pools by name or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            {/* Multiselect Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <MultiSelectFilter
                title="Pool Status"
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'draft_locked', label: 'Draft Locked' },
                  { value: 'completed', label: 'Completed' }
                ]}
                selectedValues={filters.status}
                onChange={(values) => setFilters(prev => ({ ...prev, status: values }))}
                placeholder="Select status..."
              />

              <MultiSelectFilter
                title="Pool Type"
                options={[
                  { value: 'has_buy_in', label: 'Buy-in Pools' },
                  { value: 'free', label: 'Free Pools' }
                ]}
                selectedValues={filters.type}
                onChange={(values) => setFilters(prev => ({ ...prev, type: values }))}
                placeholder="Select type..."
              />

              <MultiSelectFilter
                title="Entry Fee Range"
                options={[
                  { value: 'under_20', label: 'Under $20' },
                  { value: '20_50', label: '$20 - $50' },
                  { value: '50_100', label: '$50 - $100' },
                  { value: 'over_100', label: 'Over $100' }
                ]}
                selectedValues={filters.entryFeeRange}
                onChange={(values) => setFilters(prev => ({ ...prev, entryFeeRange: values }))}
                placeholder="Select fee range..."
              />

              <MultiSelectFilter
                title="Pool Size"
                options={[
                  { value: 'small', label: 'Small (1-5)' },
                  { value: 'medium', label: 'Medium (6-15)' },
                  { value: 'large', label: 'Large (16+)' }
                ]}
                selectedValues={filters.poolSize}
                onChange={(values) => setFilters(prev => ({ ...prev, poolSize: values }))}
                placeholder="Select pool size..."
              />

              <MultiSelectFilter
                title="Creation Date"
                options={[
                  { value: 'last_week', label: 'Last Week' },
                  { value: 'last_month', label: 'Last Month' },
                  { value: 'last_3_months', label: 'Last 3 Months' },
                  { value: 'older', label: 'Older' }
                ]}
                selectedValues={filters.creationDate}
                onChange={(values) => setFilters(prev => ({ ...prev, creationDate: values }))}
                placeholder="Select date range..."
              />

              {/* Clear All Filters */}
              {(searchTerm || 
                filters.status.length > 0 || 
                filters.type.length > 0 || 
                filters.entryFeeRange.length > 0 || 
                filters.poolSize.length > 0 || 
                filters.creationDate.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({
                      status: [],
                      type: [],
                      entryFeeRange: [],
                      poolSize: [],
                      creationDate: []
                    });
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>

            {/* Active Filters Summary */}
            {(filters.status.length > 0 || 
              filters.type.length > 0 || 
              filters.entryFeeRange.length > 0 || 
              filters.poolSize.length > 0 || 
              filters.creationDate.length > 0) && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {filters.status.map(status => (
                  <Badge key={status} variant="secondary" className="text-xs">
                    {status === 'active' ? 'Active' : status === 'draft_locked' ? 'Draft Locked' : 'Completed'}
                  </Badge>
                ))}
                {filters.type.map(type => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type === 'has_buy_in' ? 'Buy-in' : 'Free'}
                  </Badge>
                ))}
                {filters.entryFeeRange.map(range => (
                  <Badge key={range} variant="secondary" className="text-xs">
                    {range === 'under_20' ? 'Under $20' : 
                     range === '20_50' ? '$20-$50' : 
                     range === '50_100' ? '$50-$100' : 'Over $100'}
                  </Badge>
                ))}
                {filters.poolSize.map(size => (
                  <Badge key={size} variant="secondary" className="text-xs">
                    {size === 'small' ? 'Small' : size === 'medium' ? 'Medium' : 'Large'}
                  </Badge>
                ))}
                {filters.creationDate.map(date => (
                  <Badge key={date} variant="secondary" className="text-xs">
                    {date === 'last_week' ? 'Last Week' : 
                     date === 'last_month' ? 'Last Month' : 
                     date === 'last_3_months' ? 'Last 3 Months' : 'Older'}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pools Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Pool Details ({filteredPools.length} of {pools.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPools.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pools found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Pool Name</th>
                    <th className="text-left py-2 px-4">Owner</th>
                    <th className="text-left py-2 px-4">Members</th>
                    <th className="text-left py-2 px-4">Entries</th>
                    <th className="text-left py-2 px-4">Entry Fee</th>
                    <th className="text-left py-2 px-4">Prize Pool</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Created</th>
                    <th className="text-left py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPools.map((pool) => {
                    const status = getPoolStatus(pool);
                    return (
                      <tr key={pool.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4 font-medium">{pool.name}</td>
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-1">
                            <Crown className="h-3 w-3 text-yellow-600" />
                            {pool.owner_display_name}
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {pool.member_count}
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {pool.entry_count}
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          {pool.has_buy_in ? (
                            <span className="font-mono text-sm">
                              {formatCurrency(pool.entry_fee_amount, pool.entry_fee_currency)}
                            </span>
                          ) : (
                            <Badge variant="secondary">Free</Badge>
                          )}
                        </td>
                        <td className="py-2 px-4">
                          {pool.has_buy_in ? (
                            <span className="font-mono text-sm font-semibold text-green-700">
                              {formatCurrency(pool.prize_pool_total, pool.entry_fee_currency)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-2 px-4">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="py-2 px-4 text-sm text-muted-foreground">
                          {new Date(pool.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeletePoolId(pool.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Pool Confirmation Dialog */}
      <AlertDialog open={!!deletePoolId} onOpenChange={() => setDeletePoolId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Pool
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this pool? This action cannot be undone and will permanently remove:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The pool and all its settings</li>
                <li>All participant entries</li>
                <li>All pool memberships</li>
                <li>All weekly results and scoring data</li>
                <li>All chat messages</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePoolId && deletePool(deletePoolId)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Pool'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};