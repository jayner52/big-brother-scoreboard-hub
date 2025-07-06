import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export interface PoolMember {
  id: string;
  name: string;
  email: string;
}

interface UserMentionDropdownProps {
  isVisible: boolean;
  filteredUsers: PoolMember[];
  onUserSelect: (user: PoolMember) => void;
}

export const UserMentionDropdown: React.FC<UserMentionDropdownProps> = ({
  isVisible,
  filteredUsers,
  onUserSelect
}) => {
  if (!isVisible || filteredUsers.length === 0) return null;

  return (
    <Card className="mx-4 mb-2 border-border shadow-lg">
      <CardContent className="p-2">
        <div className="text-xs text-muted-foreground mb-2 px-2">Select user to mention:</div>
        {filteredUsers.slice(0, 5).map((user) => (
          <button
            key={user.id}
            onClick={() => onUserSelect(user)}
            className="w-full text-left px-2 py-1 rounded hover:bg-muted transition-colors text-sm"
          >
            @{user.name}
          </button>
        ))}
      </CardContent>
    </Card>
  );
};