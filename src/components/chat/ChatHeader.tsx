import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users } from 'lucide-react';

interface ChatHeaderProps {
  poolName: string;
  activeChat: 'group' | string;
  memberCount: number;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  poolName,
  activeChat,
  memberCount
}) => {
  const navigate = useNavigate();

  return (
    <Card className="rounded-none border-x-0 border-t-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {activeChat === 'group' ? `${poolName} - Group Chat` : `Private Chat`}
            </CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{memberCount} members</span>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};