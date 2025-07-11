import React from 'react';
import { Link } from 'react-router-dom';
// import { useAuth } from '@/hooks/useAuth'; // Temporarily disabled
import { FloatingPoolElements } from '@/components/homepage/FloatingPoolElements';
import { HomepageNavigation } from '@/components/homepage/HomepageNavigation';
import { HomepageHero } from '@/components/homepage/HomepageHero';
import { AvailableShowsSection } from '@/components/homepage/AvailableShowsSection';
import { HowItWorksSection } from '@/components/homepage/HowItWorksSection';
import { FinalCTASection } from '@/components/homepage/FinalCTASection';
import { HomepageFooter } from '@/components/homepage/HomepageFooter';

const PoolsidePicks = () => {
  // Temporarily bypass auth to test if the app loads
  console.log('PoolsidePicks render - bypassing auth hooks');
  
  const user = null; // Simulate no user for now
  const loading = false; // Simulate not loading

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
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