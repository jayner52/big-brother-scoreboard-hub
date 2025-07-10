
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { EnhancedChatIcon } from '@/components/chat/EnhancedChatIcon';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { PoolsidePicksLogo } from '@/components/brand/PoolsidePicksLogo';
import { UserDropdown } from './UserDropdown';
import { MobileMenu } from './MobileMenu';
import { NavigationButtons } from './NavigationButtons';
import { usePool } from '@/contexts/PoolContext';
import { useUserPoolRole } from '@/hooks/useUserPoolRole';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useIsMobile } from '@/hooks/use-mobile';
import { BottomNav } from '@/components/ui/bottom-nav';
import { InstallPrompt } from '@/components/ui/install-prompt';
import { usePaymentNotifications } from '@/hooks/usePaymentNotifications';
import { useFeedbackForm } from '@/hooks/useFeedbackForm';
import { supabase } from '@/integrations/supabase/client';

interface ProfessionalNavigationProps {
  user: SupabaseUser | null;
  userEntry: any;
  userRank: number | null;
  onSignOut: () => void;
  onJoinPool: () => void;
}

export const ProfessionalNavigation: React.FC<ProfessionalNavigationProps> = ({
  user,
  userEntry,
  userRank,
  onSignOut,
  onJoinPool,
}) => {
  const { activePool } = usePool();
  const [userId, setUserId] = React.useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { profile, refreshProfile } = useUserProfile(user);
  const { hasUnreadNotifications, hasOutstandingPayment, totalUnread } = usePaymentNotifications();
  const { isOpen: isFeedbackOpen, feedbackType, closeForm: closeFeedbackForm } = useFeedbackForm();
  
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  const { isAdmin } = useUserPoolRole(activePool?.id, userId || undefined);

  const displayName = profile?.display_name || userEntry?.participant_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.charAt(0).toUpperCase();


  if (!user) {
    return (
      <nav className="flex items-center justify-between py-4 px-6 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-foreground">
            {activePool?.name || 'Poolside Picks'}
          </h3>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/about">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Info className="h-4 w-4" />
              How It Works
            </Button>
          </Link>
          
          <Link to="/auth">
            <Button className="bg-coral hover:bg-coral/90 text-white">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Install Prompt for PWA */}
      {isMobile && <InstallPrompt />}
      
      <nav className="sticky top-0 z-40 flex items-center justify-between py-3 px-6 bg-background/80 backdrop-blur-sm border-b border-border/50 shadow-sm">
        {/* LEFT SECTION - Pool Identity */}
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <PoolsidePicksLogo size="sm" />
          </button>
          <h3 className="text-lg font-semibold text-foreground min-w-0 flex-1">
            <span className={`${isMobile ? 'line-clamp-2 text-sm leading-tight' : 'truncate'}`}>
              {activePool?.name || 'Poolside Picks'}
            </span>
          </h3>
        </div>

        {/* CENTER SECTION - Core Actions (Hidden on mobile) */}
        {!isMobile && user && (
          <NavigationButtons
            hasUnreadNotifications={hasUnreadNotifications}
            hasOutstandingPayment={hasOutstandingPayment}
          />
        )}

        {/* RIGHT SECTION - User Menu */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isMobile && <EnhancedChatIcon />}
          
          <UserDropdown
            user={user}
            profile={profile}
            displayName={displayName}
            initials={initials}
            userRank={userRank}
            isAdmin={isAdmin}
            onSignOut={onSignOut}
            onProfileModalOpen={() => setProfileModalOpen(true)}
          />

          {isMobile && (
            <MobileMenu
              user={user}
              isAdmin={isAdmin}
              hasUnreadNotifications={hasUnreadNotifications}
              hasOutstandingPayment={hasOutstandingPayment}
              onProfileModalOpen={() => setProfileModalOpen(true)}
            />
          )}
        </div>
        
        {/* Profile Modal */}
        {user && (
          <ProfileModal
            isOpen={profileModalOpen}
            onClose={() => setProfileModalOpen(false)}
            user={user}
            userProfile={profile || undefined}
            onProfileUpdate={refreshProfile}
          />
        )}

        {/* Feedback Form Modal */}
        {isFeedbackOpen && (
          <FeedbackForm
            type={feedbackType}
            onClose={closeFeedbackForm}
          />
        )}
      </nav>
      
      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <BottomNav 
          badgeCount={{
            standings: hasUnreadNotifications ? 1 : 0,
            picks: hasOutstandingPayment ? 1 : 0,
          }}
        />
      )}
    </>
  );
};
