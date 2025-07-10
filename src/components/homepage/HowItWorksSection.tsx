import React from 'react';
import { Users, Target, Award } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const HowItWorksSection: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-center text-dark mb-4`}>
          How Poolside Picks Works
        </h2>
        <p className="text-xl text-center text-dark/70 mb-16 max-w-2xl mx-auto">
          Fantasy sports meets reality TV in three simple steps
        </p>
        
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-12' : 'md:grid-cols-3 gap-12'}`}>
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-coral)' }}>
              <Users className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-dark mb-4">1. Join or Create</h3>
            <p className="text-dark/70 text-lg leading-relaxed">
              Start your own pool with custom rules and prizes, or join an existing pool with friends and family.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-teal)' }}>
              <Target className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-dark mb-4">2. Draft & Predict</h3>
            <p className="text-dark/70 text-lg leading-relaxed">
              Make your picks, draft your teams, and answer bonus questions. Your reality TV knowledge is about to pay off!
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-summer)' }}>
              <Award className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-dark mb-4">3. Win Big</h3>
            <p className="text-dark/70 text-lg leading-relaxed">
              Watch the season unfold as your picks earn points. Climb the leaderboard and claim your prizes!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};