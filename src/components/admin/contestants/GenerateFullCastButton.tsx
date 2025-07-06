import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePool } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';
import { Users, Shuffle } from 'lucide-react';

const BB26_CAST = [
  { name: "Angela Murray", bio: "Real estate agent from Utah", age: 50, hometown: "Syracuse, UT", occupation: "Real estate agent" },
  { name: "Brooklyn Rivera", bio: "Business administrator from Texas", age: 34, hometown: "Dallas, TX", occupation: "Business administrator" },
  { name: "Cam Sullivan-Brown", bio: "Physical therapist from Florida", age: 25, hometown: "Tampa, FL", occupation: "Physical therapist" },
  { name: "Cedric Hodges", bio: "Former Marine from Georgia", age: 21, hometown: "Atlanta, GA", occupation: "Former Marine" },
  { name: "Chelsie Baham", bio: "Nonprofit director from Louisiana", age: 27, hometown: "Baton Rouge, LA", occupation: "Nonprofit director" },
  { name: "Joseph Rodriguez", bio: "Video store clerk from Florida", age: 30, hometown: "Miami, FL", occupation: "Video store clerk" },
  { name: "Kimo Apaka", bio: "Mattress salesman from Hawaii", age: 35, hometown: "Honolulu, HI", occupation: "Mattress salesman" },
  { name: "Leah Peters", bio: "VIP cocktail server from Florida", age: 26, hometown: "Miami, FL", occupation: "VIP cocktail server" },
  { name: "Lisa Weintraub", bio: "Celebrity chef from California", age: 33, hometown: "Los Angeles, CA", occupation: "Celebrity chef" },
  { name: "Makensy Manbeck", bio: "Construction project manager from Texas", age: 22, hometown: "Houston, TX", occupation: "Construction project manager" },
  { name: "Matt Hardeman", bio: "Tech sales from Georgia", age: 25, hometown: "Savannah, GA", occupation: "Tech sales" },
  { name: "Quinn Martin", bio: "Nurse from Nebraska", age: 25, hometown: "Omaha, NE", occupation: "Nurse" },
  { name: "Rubina Bernabe", bio: "Event planner from California", age: 35, hometown: "Los Angeles, CA", occupation: "Event planner" },
  { name: "T'kor Clottey", bio: "Crochet business owner from Illinois", age: 23, hometown: "Chicago, IL", occupation: "Crochet business owner" },
  { name: "Tucker Des Lauriers", bio: "Marketing consultant from New York", age: 30, hometown: "Brooklyn, NY", occupation: "Marketing consultant" },
  { name: "Kenney Kelley", bio: "Former undercover cop from Massachusetts", age: 52, hometown: "Boston, MA", occupation: "Former undercover cop" }
];

interface GenerateFullCastButtonProps {
  onRefresh: () => void;
}

export const GenerateFullCastButton: React.FC<GenerateFullCastButtonProps> = ({ onRefresh }) => {
  const { toast } = useToast();
  const { activePool } = usePool();
  const [loading, setLoading] = useState(false);

  const generateFullCast = async () => {
    if (!activePool?.id) return;
    
    try {
      setLoading(true);
      
      // Get existing houseguests
      const { data: existing } = await supabase
        .from('contestants')
        .select('name')
        .eq('pool_id', activePool.id);
      
      const existingNames = existing?.map(h => h.name) || [];
      
      // Find missing houseguests
      const missingHouseguests = BB26_CAST.filter(
        hg => !existingNames.includes(hg.name)
      );
      
      if (missingHouseguests.length === 0) {
        toast({
          title: "All Set!",
          description: "All 16 Season 26 houseguests are already loaded",
        });
        return;
      }
      
      // Insert missing houseguests
      const toInsert = missingHouseguests.map((hg, index) => ({
        pool_id: activePool.id,
        name: hg.name,
        bio: hg.bio,
        age: hg.age,
        hometown: hg.hometown,
        occupation: hg.occupation,
        sort_order: existingNames.length + index + 1,
        is_active: true,
        season_number: 26,
        group_id: null
      }));
      
      const { error } = await supabase
        .from('contestants')
        .insert(toInsert);
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: `Added ${missingHouseguests.length} houseguests! Total: ${existingNames.length + missingHouseguests.length}/16`,
      });
      
      onRefresh();
      
    } catch (error) {
      console.error('Error generating cast:', error);
      toast({
        title: "Error",
        description: "Failed to generate houseguests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={generateFullCast}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      <Users className="h-4 w-4 mr-2" />
      {loading ? 'Generating...' : 'Generate Full BB26 Cast'}
    </Button>
  );
};