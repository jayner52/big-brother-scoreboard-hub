import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Briefcase, Calendar, Crown, Shield, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio } from '@/types/admin';
// Removed useEvictedContestants - using contestants.is_active as single source of truth
import { useCurrentWeekStatus } from '@/hooks/useCurrentWeekStatus';
import { ContestantProfileModal } from '@/components/admin/contestants/ContestantProfileModal';
import { useActivePool } from '@/hooks/useActivePool';
// Removed ContestantStatusProvider - using direct contestant.is_active checks
// REMOVED: All eviction status logic - will be reimplemented from scratch

interface ContestantWithGroup extends ContestantWithBio {
  group_name?: string;
}

const ContestantBiosContent: React.FC = () => {
  const [contestants, setContestants] = useState<ContestantWithGroup[]>([]);
  const [selectedContestant, setSelectedContestant] = useState<ContestantWithGroup | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const activePool = useActivePool();
  // REMOVED: All eviction status logic - will be reimplemented from scratch
  const { hohWinner, povWinner, nominees } = useCurrentWeekStatus();
  // REMOVED: evictionWeeks hook - will be reimplemented from scratch

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
  }, [activePool]); // Re-run when pool changes

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
          isActive: c.is_active, // Using database is_active field
          group_id: c.group_id,
          group_name: c.contestant_groups?.group_name,
          sort_order: c.sort_order,
          bio: c.bio,
          photo_url: c.photo_url,
          hometown: c.hometown,
          age: c.age,
          occupation: c.occupation
        }));
        
        // Sort active contestants first, then evicted by sort_order
        mappedContestants.sort((a, b) => {
          if (a.isActive !== b.isActive) {
            return a.isActive ? -1 : 1; // Active first
          }
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

      {/* Active Contestants */}
      {contestants.filter(c => c.isActive).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-green-700">Active Houseguests</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
            {contestants.filter(c => c.isActive).map((contestant) => (
              <ContestantCard key={contestant.id} contestant={contestant} />
            ))}
          </div>
        </div>
      )}

      {/* Evicted Contestants */}
      {contestants.filter(c => !c.isActive).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-red-600">Evicted Houseguests</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
            {contestants.filter(c => !c.isActive).map((contestant) => (
              <ContestantCard key={contestant.id} contestant={contestant} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Individual contestant card component to avoid duplication
const ContestantCard: React.FC<{ contestant: ContestantWithGroup }> = ({ contestant }) => {
  const [selectedContestant, setSelectedContestant] = useState<ContestantWithGroup | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { hohWinner, povWinner, nominees } = useCurrentWeekStatus();
  
  const handleContestantClick = (contestant: ContestantWithGroup) => {
    setSelectedContestant(contestant);
    setShowProfileModal(true);
  };

  const getGroupBadge = (contestant: ContestantWithGroup) => {
    if (!contestant.group_name) return null;
    
    const groupName = contestant.group_name;
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
    
    const hash = groupName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorClass = colors[hash % colors.length];
    
    return (
      <Badge className={`absolute top-2 left-2 text-xs px-2 py-1 font-medium ${colorClass}`}>
        {groupName}
      </Badge>
    );
  };

  const isEvicted = !contestant.isActive;

  return (
    <>
      <Card 
        className={`overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer transform hover:scale-105 ${
          isEvicted ? 'opacity-75 bg-red-50/50' : ''
        }`}
        onClick={() => handleContestantClick(contestant)}
      >
        <div className="relative">
          {getGroupBadge(contestant)}
          {contestant.photo_url ? (
            <img 
              src={contestant.photo_url} 
              alt={contestant.name}
              className={`w-full h-32 sm:h-36 md:h-40 object-cover object-top ${
                isEvicted ? 'grayscale' : ''
              }`}
              onError={(e) => {
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
            <Badge variant={isEvicted ? "destructive" : "default"}>
              {isEvicted ? "Evicted" : "Active"}
            </Badge>
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
          </div>
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className={`text-lg ${isEvicted ? 'text-red-600 line-through' : ''}`}>
            {contestant.name} {isEvicted ? '(Evicted)' : ''}
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

      <ContestantProfileModal
        contestant={selectedContestant}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};

export const ContestantBios: React.FC = () => {
  return (
    <div className="space-y-6">
      <ContestantBiosContent />
    </div>
  );
};

export default ContestantBios;