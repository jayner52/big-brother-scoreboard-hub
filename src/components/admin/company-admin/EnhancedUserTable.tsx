import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserAvatar } from './UserAvatar';
import { EnhancedUserData } from './types';
import { 
  UserCheck,
  Trash2,
  Clock,
  Calendar,
  Globe,
  CheckCircle,
  XCircle,
  Shield,
  Mail,
  MessageSquare,
  Trophy,
  Activity
} from 'lucide-react';


interface EnhancedUserTableProps {
  users: EnhancedUserData[];
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
  onDeleteUser: (user: EnhancedUserData) => void;
}

export const EnhancedUserTable: React.FC<EnhancedUserTableProps> = ({
  users,
  selectedUserIds,
  onSelectionChange,
  onDeleteUser
}) => {
  const handleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(users.map(user => user.user_id));
    }
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onSelectionChange(selectedUserIds.filter(id => id !== userId));
    } else {
      onSelectionChange([...selectedUserIds, userId]);
    }
  };

  const getEmailSourceBadge = (source: string, verified: boolean) => {
    switch (source) {
      case 'google_oauth':
        return (
          <div className="flex items-center gap-1">
            <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
              <Globe className="h-3 w-3 mr-1" />
              Google
            </Badge>
            {verified && <CheckCircle className="h-3 w-3 text-green-600" />}
          </div>
        );
      case 'manual_signup':
        return (
          <div className="flex items-center gap-1">
            <Badge variant="outline">
              <Mail className="h-3 w-3 mr-1" />
              Manual
            </Badge>
            {verified ? (
              <CheckCircle className="h-3 w-3 text-green-600" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
          </div>
        );
      case 'email_list':
        return <Badge variant="secondary">Email List</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getActivityLevel = (user: EnhancedUserData) => {
    const hasPoolActivity = user.pool_memberships.length > 0;
    const hasChatActivity = (user.chat_messages_count || 0) > 0;
    const isComplete = user.profile_completion > 75;
    
    if (hasPoolActivity && hasChatActivity && isComplete) {
      return <Badge variant="default" className="bg-green-100 text-green-800">High</Badge>;
    } else if (hasPoolActivity || hasChatActivity) {
      return <Badge variant="outline" className="border-orange-300 text-orange-700">Medium</Badge>;
    } else {
      return <Badge variant="outline" className="border-gray-300 text-gray-600">Low</Badge>;
    }
  };

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No users found matching your filters.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          User Details ({users.length} users)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={users.length > 0 && selectedUserIds.length === users.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>User & Profile</TableHead>
                <TableHead>Contact & Verification</TableHead>
                <TableHead>Activity & Engagement</TableHead>
                <TableHead>Pool Activity</TableHead>
                <TableHead>Metrics</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className={selectedUserIds.includes(user.user_id) ? "bg-muted/50" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUserIds.includes(user.user_id)}
                      onCheckedChange={() => handleSelectUser(user.user_id)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} size="md" />
                      <div>
                        <p className="font-medium">{user.display_name || 'Anonymous User'}</p>
                        <p className="text-xs text-muted-foreground">ID: {user.user_id.slice(0, 8)}...</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {user.account_age_days}d
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {user.profile_completion}% complete
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{user.email || 'No email'}</p>
                      {getEmailSourceBadge(user.email_source, user.email_verified)}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.registration_date).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2">
                      {getActivityLevel(user)}
                      {user.last_login && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Activity className="h-3 w-3" />
                          Last: {new Date(user.last_login).toLocaleDateString()}
                        </div>
                      )}
                      {(user.chat_messages_count || 0) > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          <MessageSquare className="h-3 w-3 text-blue-600" />
                          {user.chat_messages_count} messages
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {user.pool_memberships.length > 0 ? (
                        user.pool_memberships.map((membership, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <Badge 
                              variant={membership.role === 'owner' ? 'default' : 'outline'} 
                              className="text-xs"
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              {membership.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground truncate max-w-20">
                              {membership.pool_name}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No pools</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {user.total_points && user.total_points > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          <Trophy className="h-3 w-3 text-amber-600" />
                          {user.total_points} pts
                        </div>
                      )}
                      {user.pools_owned && user.pools_owned > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          <Shield className="h-3 w-3 text-purple-600" />
                          {user.pools_owned} owned
                        </div>
                      )}
                      {user.feedback_count && user.feedback_count > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          <MessageSquare className="h-3 w-3 text-orange-600" />
                          {user.feedback_count} feedback
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteUser(user)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};