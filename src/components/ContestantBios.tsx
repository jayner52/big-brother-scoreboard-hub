import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Briefcase, Calendar, Crown, Shield, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio } from '@/types/admin';
import { useEvictedContestants } from '@/hooks/useEvictedContestants';
import { useCurrentWeekStatus } from '@/hooks/useCurrentWeekStatus';
import { useEvictionWeeks } from '@/hooks/useEvictionWeeks';
import { ContestantProfileModal } from '@/components/admin/contestants/ContestantProfileModal';
import { useActivePool } from '@/hooks/useActivePool';
import { ContestantStatusProvider } from '@/contexts/ContestantStatusContext';
import { getContestantStatusStyling, getContestantStatusBadge } from '@/utils/contestantStatusUtils';

interface ContestantWithGroup extends ContestantWithBio {
  group_name?: string;
}

const ContestantBiosContent: React.FC = () => {
  const [contestants, setContestants] = useState<ContestantWithGroup[]>([]);
  const [selectedContestant, setSelectedContestant] = useState<ContestantWithGroup | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const activePool = useActivePool();
  const { evictedContestants } = useEvictedContestants();
  const { hohWinner, povWinner, nominees } = useCurrentWeekStatus();
  const { evictionWeeks } = useEvictionWeeks();

  const handleContestantClick = (contestant: ContestantWithGroup) => {
    setSelectedContestant(contestant);
    setShowProfileModal(true);
  };

  const getGroupBadge = (contestant: ContestantWithGroup) => {
    if (!contestant.group_name) return null;
    
    // **CRITICAL FIX: Show full group name, not just letters**
    // This works for both "Group A" and custom names like "The Young Guys"
    const groupName = contestant.group_name;
    
    // Color mapping based on group sort order or hash for custom names
    const colors = [
      'bg-red-100 text-red-700',
      'bg-blue-100 text-blue-700', 
      'bg-green-100 text-green-700',
      'bg-purple-100 text-purple-700',
      'bg-yellow-100 text-yellow-700',
      'bg-pink-100 text-pink-700',
      'bg-indigo-100 text-indigo-700',
      'bg-orange-100 text-orange-700',
    ];
    
    // Use hash of group name to get consistent color
    const hash = groupName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorClass = colors[hash % colors.length];
    
    return (
      <Badge className={`absolute top-2 left-2 text-xs px-2 py-1 font-medium ${colorClass}`}>
        {groupName}
      </Badge>
    );
  };

  useEffect(() => {
    if (activePool) {
      loadContestants();
    }
  }, [activePool, evictedContestants]); // Re-run when pool or evicted contestants change

  const loadContestants = async () => {
    if (!activePool) {
      setLoading(false);
      return;
    }
    
    try {
      // Load contestants with group information for the current pool
      const { data: contestantsData } = await supabase
        .from('contestants')
        .select(`
          *,
          contestant_groups!contestants_group_id_fkey (
            group_name
          )
        `)
        .eq('pool_id', activePool.id)
        .order('sort_order', { ascending: true });
      
      if (contestantsData) {
        const mappedContestants = contestantsData.map(c => ({
          id: c.id,
          name: c.name,
          isActive: !evictedContestants.includes(c.name),
          group_id: c.group_id,
          group_name: c.contestant_groups?.group_name,
          sort_order: c.sort_order,
          bio: c.bio,
          photo_url: c.photo_url,
          hometown: c.hometown,
          age: c.age,
          occupation: c.occupation
        }));
        
        // Sort: active contestants first, then eliminated
        mappedContestants.sort((a, b) => {
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          return a.sort_order - b.sort_order;
        });
        
        setContestants(mappedContestants);
      }
    } catch (error) {
      console.error('Error loading contestants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading houseguest information...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Meet the Houseguests
        </h2>
        <p className="text-muted-foreground">
          Get to know the houseguests competing in {activePool?.name || 'Big Brother'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
        {contestants.map((contestant) => (
          <Card 
            key={contestant.id} 
            className={`overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer transform hover:scale-105 ${
              !contestant.isActive ? 'opacity-60 border-destructive/20' : ''
            }`}
            onClick={() => handleContestantClick(contestant)}
          >
             <div className="relative">
                {getGroupBadge(contestant)}
                 {contestant.photo_url ? (
                    <img 
                      src={contestant.photo_url} 
                      alt={contestant.name}
                      className="w-full h-32 sm:h-36 md:h-40 object-cover object-top"
                     onError={(e) => {
                       // Fallback to initials avatar if photo fails to load
                       const target = e.target as HTMLImageElement;
                       target.style.display = 'none';
                       const fallback = target.nextElementSibling as HTMLDivElement;
                       if (fallback) fallback.style.display = 'flex';
                     }}
                   />
                 ) : null}
                 <div 
                   className="w-full h-32 sm:h-36 md:h-40 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center"
                   style={{ display: contestant.photo_url ? 'none' : 'flex' }}
                 >
                  {contestant.photo_url ? (
                     <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold">
                       {contestant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                     </div>
                  ) : (
                    <Users className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <Badge variant={getContestantStatusBadge(contestant.isActive).variant}>
                  {contestant.isActive 
                    ? 'Active' 
                    : evictionWeeks[contestant.name] 
                      ? `Evicted - Week ${evictionWeeks[contestant.name]}`
                      : 'Evicted'
                  }
                </Badge>
                {contestant.isActive && (
                  <>
                    {hohWinner === contestant.name && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        HOH
                      </Badge>
                    )}
                    {povWinner === contestant.name && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        POV
                      </Badge>
                    )}
                    {nominees.includes(contestant.name) && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Nominated
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className={`text-lg ${getContestantStatusStyling(contestant.isActive)}`}>
                {!contestant.isActive ? `Evicted: ${contestant.name}` : contestant.name}
              </CardTitle>
              {contestant.bio && (
                <CardDescription className="text-xs line-clamp-2">
                  {contestant.bio}
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="space-y-2 pt-0">
              {contestant.age && (
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>{contestant.age} years old</span>
                </div>
              )}
              
              {contestant.hometown && (
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span>{contestant.hometown}</span>
                </div>
              )}
              
              {contestant.occupation && (
                <div className="flex items-center gap-2 text-xs">
                  <Briefcase className="h-3 w-3 text-muted-foreground" />
                  <span>{contestant.occupation}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ContestantProfileModal
        contestant={selectedContestant}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export const ContestantBios: React.FC = () => {
  return (
    <ContestantStatusProvider>
      <ContestantBiosContent />
    </ContestantStatusProvider>
  );
};