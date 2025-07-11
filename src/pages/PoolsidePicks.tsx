import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FloatingPoolElements } from '@/components/homepage/FloatingPoolElements';
import { HomepageNavigation } from '@/components/homepage/HomepageNavigation';
import { HomepageHero } from '@/components/homepage/HomepageHero';
import { AvailableShowsSection } from '@/components/homepage/AvailableShowsSection';
import { HowItWorksSection } from '@/components/homepage/HowItWorksSection';
import { FinalCTASection } from '@/components/homepage/FinalCTASection';
import { HomepageFooter } from '@/components/homepage/HomepageFooter';

const PoolsidePicks = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-pale-yellow flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--gradient-unified)' }}>
      <FloatingPoolElements />
      <HomepageNavigation user={user} />
      
      <HomepageHero user={user} />
      <AvailableShowsSection />
      <HowItWorksSection />
      <FinalCTASection user={user} />
      <HomepageFooter />
    </div>
  );
};

export default PoolsidePicks;