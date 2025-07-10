
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, ChevronDown, Bug, Lightbulb, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useFeedbackForm } from '@/hooks/useFeedbackForm';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserDropdownProps {
  user: SupabaseUser | null;
  profile: any;
  displayName: string;
  initials: string;
  userRank: number | null;
  isAdmin: boolean;
  onSignOut: () => void;
  onProfileModalOpen: () => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  user,
  profile,
  displayName,
  initials,
  userRank,
  isAdmin,
  onSignOut,
  onProfileModalOpen,
}) => {
  const isMobile = useIsMobile();
  const { isOpen: isFeedbackOpen, feedbackType, openForm: openFeedbackForm, closeForm: closeFeedbackForm } = useFeedbackForm();

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-3 py-2 h-10 rounded-full hover:bg-muted/50 transition-all duration-200"
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className={`text-white font-semibold text-sm ${
                profile?.background_color ? `bg-gradient-to-br ${profile.background_color}` : 'bg-gradient-to-br from-coral to-brand-teal'
              }`}>
                {profile?.avatar_url ? (
                  <span className="text-lg">{profile.avatar_url}</span>
                ) : (
                  initials
                )}
              </AvatarFallback>
            </Avatar>
            {!isMobile && (
              <>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium text-foreground truncate max-w-32">
                    {displayName}
                  </span>
                  {userRank && (
                    <span className="text-xs text-muted-foreground">
                      Rank #{userRank}
                    </span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-background/95 backdrop-blur-sm border shadow-lg"
        >
          <DropdownMenuItem onClick={onProfileModalOpen} className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            Edit Profile
          </DropdownMenuItem>
          
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  Admin Panel
                </Link>
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => openFeedbackForm('bug')} className="flex items-center gap-2 cursor-pointer">
              <Bug className="h-4 w-4" />
              Report Bug
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openFeedbackForm('feature')} className="flex items-center gap-2 cursor-pointer">
              <Lightbulb className="h-4 w-4" />
              Request Feature
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openFeedbackForm('comment')} className="flex items-center gap-2 cursor-pointer">
              <MessageSquare className="h-4 w-4" />
              General Feedback
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSignOut} className="flex items-center gap-2 cursor-pointer text-destructive">
            <LogOut className="h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Feedback Form Modal */}
      {isFeedbackOpen && (
        <FeedbackForm
          type={feedbackType}
          onClose={closeFeedbackForm}
        />
      )}
    </>
  );
};
