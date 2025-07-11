import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useIsMobile } from '@/hooks/use-mobile';

interface FinalCTASectionProps {
  user: SupabaseUser | null;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({ user }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="py-20 px-4 relative">
      <div className="container mx-auto text-center">
        <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-cream mb-6`}>
          Ready to Dive In?
        </h2>
        <p className="text-xl text-cream/80 mb-12 max-w-2xl mx-auto">
          Join the smartest way to watch dumb TV. Your couch commentary just got competitive.
        </p>
        
        <Button
          onClick={handleGetStarted}
          size={isMobile ? "default" : "lg"}
          className={`${isMobile ? 'w-full max-w-md text-lg' : 'px-16 py-6 text-2xl'} font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110`}
          style={{ 
            background: 'var(--gradient-coral)',
            color: 'hsl(var(--coral-foreground))'
          }}
        >
          <Sparkles className="mr-3 h-8 w-8" />
          Start Your First Pool
        </Button>
      </div>
    </section>
  );
};