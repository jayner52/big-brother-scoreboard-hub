import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar as CalendarIcon, Filter, X, Users, Globe, CheckCircle, Shield, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FilterOptions {
  searchTerm: string;
  emailSource: string | null;
  accountAge: string | null;
  profileCompletion: string | null;
  activityLevel: string | null;
  registrationDateRange: { from: Date | undefined; to: Date | undefined };
}

interface EnhancedUserFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  totalUsers: number;
  filteredUsers: number;
}

export const EnhancedUserFilters: React.FC<EnhancedUserFiltersProps> = ({
  filters,
  onFiltersChange,
  totalUsers,
  filteredUsers
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: '',
      emailSource: null,
      accountAge: null,
      profileCompletion: null,
      activityLevel: null,
      registrationDateRange: { from: undefined, to: undefined }
    });
  };

  const hasActiveFilters = filters.searchTerm || 
    filters.emailSource || 
    filters.accountAge || 
    filters.profileCompletion || 
    filters.activityLevel ||
    filters.registrationDateRange.from ||
    filters.registrationDateRange.to;

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.emailSource) count++;
    if (filters.accountAge) count++;
    if (filters.profileCompletion) count++;
    if (filters.activityLevel) count++;
    if (filters.registrationDateRange.from || filters.registrationDateRange.to) count++;
    return count;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Quick Search and Results */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or user ID..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {filteredUsers} / {totalUsers} users
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Advanced
                {hasActiveFilters && (
                  <Badge variant="destructive" className="ml-1 px-1 min-w-5 h-5 text-xs">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.emailSource === 'google_oauth' ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('emailSource', filters.emailSource === 'google_oauth' ? null : 'google_oauth')}
              className="gap-2"
            >
              <Globe className="h-3 w-3" />
              Google Users
            </Button>
            <Button
              variant={filters.emailSource === 'manual_signup' ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('emailSource', filters.emailSource === 'manual_signup' ? null : 'manual_signup')}
              className="gap-2"
            >
              <Mail className="h-3 w-3" />
              Manual Signup
            </Button>
            <Button
              variant={filters.activityLevel === 'pool_members' ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('activityLevel', filters.activityLevel === 'pool_members' ? null : 'pool_members')}
              className="gap-2"
            >
              <Shield className="h-3 w-3" />
              Pool Members
            </Button>
            <Button
              variant={filters.activityLevel === 'high_profile' ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('activityLevel', filters.activityLevel === 'high_profile' ? null : 'high_profile')}
              className="gap-2"
            >
              <CheckCircle className="h-3 w-3" />
              Complete Profiles
            </Button>
          </div>

          {/* Advanced Filters Panel */}
          {isAdvancedOpen && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Email Source */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Source</label>
                  <Select value={filters.emailSource || ""} onValueChange={(value) => updateFilter('emailSource', value || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All sources</SelectItem>
                      <SelectItem value="google_oauth">Google OAuth</SelectItem>
                      <SelectItem value="manual_signup">Manual Signup</SelectItem>
                      <SelectItem value="email_list">Email List</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Account Age */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account Age</label>
                  <Select value={filters.accountAge || ""} onValueChange={(value) => updateFilter('accountAge', value || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All ages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All ages</SelectItem>
                      <SelectItem value="new">New (0-7 days)</SelectItem>
                      <SelectItem value="recent">Recent (8-30 days)</SelectItem>
                      <SelectItem value="established">Established (31-90 days)</SelectItem>
                      <SelectItem value="veteran">Veteran (90+ days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Profile Completion */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Profile Completion</label>
                  <Select value={filters.profileCompletion || ""} onValueChange={(value) => updateFilter('profileCompletion', value || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All levels</SelectItem>
                      <SelectItem value="low">Low (0-25%)</SelectItem>
                      <SelectItem value="medium">Medium (26-75%)</SelectItem>
                      <SelectItem value="high">High (76-100%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Activity Level */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Activity Level</label>
                  <Select value={filters.activityLevel || ""} onValueChange={(value) => updateFilter('activityLevel', value || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All levels</SelectItem>
                      <SelectItem value="pool_members">Pool Members</SelectItem>
                      <SelectItem value="high_profile">Complete Profiles</SelectItem>
                      <SelectItem value="email_opted_in">Email Subscribers</SelectItem>
                      <SelectItem value="terms_accepted">Terms Accepted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Range Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Registration Date Range</label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !filters.registrationDateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.registrationDateRange.from ? (
                          format(filters.registrationDateRange.from, "PPP")
                        ) : (
                          "From date"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.registrationDateRange.from}
                        onSelect={(date) => updateFilter('registrationDateRange', { ...filters.registrationDateRange, from: date })}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !filters.registrationDateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.registrationDateRange.to ? (
                          format(filters.registrationDateRange.to, "PPP")
                        ) : (
                          "To date"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.registrationDateRange.to}
                        onSelect={(date) => updateFilter('registrationDateRange', { ...filters.registrationDateRange, to: date })}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};