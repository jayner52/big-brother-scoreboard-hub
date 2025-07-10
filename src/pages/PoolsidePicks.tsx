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
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream relative">
      {/* TEST BANNER - DELETE AFTER CONFIRMING CHANGES DEPLOY */}
      <h1 style={{fontSize: '72px', color: 'red', textAlign: 'center', backgroundColor: 'yellow', padding: '20px', zIndex: 9999}}>
        TEST - CAN YOU SEE THIS?
      </h1>
      <FloatingPoolElements />
      <HomepageNavigation user={user} />
      
      {/* Simple About Link - Always Visible */}
      <div className="fixed top-4 right-4 z-50">
        <Link 
          to="/about" 
          className="bg-white text-dark px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-brand-teal"
        >
          Learn How It Works
        </Link>
      </div>
      
      <HomepageHero user={user} />
      <AvailableShowsSection />
      <HowItWorksSection />
      <FinalCTASection user={user} />
      <HomepageFooter />
    </div>
  );
};

export default PoolsidePicks;