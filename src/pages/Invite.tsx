import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ArrowRight, Calendar, DollarSign, Clock, MapPin } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Pool } from '@/types/pool';
import { format } from 'date-fns';

const Invite = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { joinPoolByCode, setActivePool } = usePool();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [poolData, setPoolData] = useState<Pool | null>(null);
  const [poolLoading, setPoolLoading] = useState(true);
  const [memberCount, setMemberCount] = useState(0);
  const [ownerName, setOwnerName] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch pool details using the invite code
  useEffect(() => {
    const fetchPoolData = async () => {
      if (!code) return;
      
      setPoolLoading(true);
      try {
        console.log('Fetching pool with invite code:', code.toUpperCase());
        
        // Fetch pool by invite code
        const { data: pool, error: poolError } = await supabase
          .from('pools')
          .select('*')
          .eq('invite_code', code.toUpperCase())
          .single();

        if (poolError) {
          console.error('Pool fetch error:', poolError);
          console.error('Error details:', {
            code: poolError.code,
            details: poolError.details,
            hint: poolError.hint,
            message: poolError.message
          });
          setPoolLoading(false);
          return;
        }

        if (!pool) {
          console.error('No pool found with invite code:', code.toUpperCase());
          setPoolLoading(false);
          return;
        }

        console.log('Successfully fetched pool:', pool.name);

        setPoolData(pool);

        // Fetch member count
        const { count } = await supabase
          .from('pool_memberships')
          .select('*', { count: 'exact', head: true })
          .eq('pool_id', pool.id)
          .eq('active', true);

        setMemberCount(count || 0);

        // Fetch owner name
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', pool.owner_id)
          .single();

        setOwnerName(ownerProfile?.display_name || 'Pool Owner');
      } catch (error) {
        console.error('Error fetching pool data:', error);
      } finally {
        setPoolLoading(false);
      }
    };

    fetchPoolData();
  }, [code]);

  const handleJoinPool = async () => {
    if (!code) {
      toast({
        title: "Error",
        description: "Invalid invite code",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    if (!user) {
      // Store invite code for after authentication
      localStorage.setItem('pendingInviteCode', code);
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const result = await joinPoolByCode(code);
      
      if (result.success && result.data) {
        if (result.data) {
          setActivePool(result.data);
        }
        toast({
          title: "Success!",
          description: `Successfully joined the pool`,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to join pool",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join pool",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    // Store invite code in localStorage before navigating to auth
    if (code) {
      localStorage.setItem('pendingInviteCode', code);
    }
    navigate('/auth');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">You're Invited!</CardTitle>
            <CardDescription>
              {poolLoading ? 'Loading pool details...' : poolData ? `Join ${poolData.name}` : 'Sign in to join this Big Brother Fantasy Pool'}
            </CardDescription>
          </CardHeader>
          
          {poolLoading ? (
            <CardContent className="text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
              </div>
            </CardContent>
          ) : poolData ? (
            <CardContent className="space-y-6">
              {/* Pool Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-lg text-blue-900 mb-3">{poolData.name}</h3>
                {poolData.description && (
                  <p className="text-sm text-blue-700 mb-3">{poolData.description}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {/* Registration Deadline */}
                  {poolData.registration_deadline && (
                    <div className="flex items-center gap-2 text-blue-700">
                      <Calendar className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Draft Deadline</div>
                        <div>{format(new Date(poolData.registration_deadline), 'MMM d, yyyy \'at\' h:mm a')}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Buy-in Amount */}
                  {poolData.has_buy_in && (
                    <div className="flex items-center gap-2 text-blue-700">
                      <DollarSign className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Buy-in</div>
                        <div>{poolData.entry_fee_amount} {poolData.entry_fee_currency}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Team Size */}
                  <div className="flex items-center gap-2 text-blue-700">
                    <Users className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Team Size</div>
                      <div>{poolData.picks_per_team} players</div>
                    </div>
                  </div>
                  
                  {/* Members */}
                  <div className="flex items-center gap-2 text-blue-700">
                    <MapPin className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Current Members</div>
                      <div>{memberCount} {memberCount === 1 ? 'member' : 'members'}</div>
                    </div>
                  </div>
                </div>
                
                {/* Host Info */}
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600">
                    Hosted by <span className="font-medium">{ownerName}</span>
                  </p>
                </div>
              </div>
              
              {/* Action Button */}
              <Button onClick={handleSignIn} className="w-full" size="lg">
                <ArrowRight className="h-4 w-4 mr-2" />
                Sign In to Join Pool
              </Button>
              
              {/* Invite Code Reference */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Invite Code: <span className="font-mono">{code}</span>
                </p>
              </div>
            </CardContent>
          ) : (
            <CardContent className="text-center space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-700">
                  Invalid or expired invite code: <span className="font-mono">{code}</span>
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Join Pool</CardTitle>
          <CardDescription>
            {poolLoading ? 'Loading pool details...' : poolData ? `Ready to join ${poolData.name}!` : 'You\'re ready to join this fantasy pool!'}
          </CardDescription>
        </CardHeader>
        
        {poolLoading ? (
          <CardContent className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </CardContent>
        ) : poolData ? (
          <CardContent className="space-y-6">
            {/* Pool Info */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-lg text-green-900 mb-3">{poolData.name}</h3>
              {poolData.description && (
                <p className="text-sm text-green-700 mb-3">{poolData.description}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {/* Registration Deadline */}
                {poolData.registration_deadline && (
                  <div className="flex items-center gap-2 text-green-700">
                    <Calendar className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Draft Deadline</div>
                      <div>{format(new Date(poolData.registration_deadline), 'MMM d, yyyy \'at\' h:mm a')}</div>
                    </div>
                  </div>
                )}
                
                {/* Buy-in Amount */}
                {poolData.has_buy_in && (
                  <div className="flex items-center gap-2 text-green-700">
                    <DollarSign className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Buy-in</div>
                      <div>{poolData.entry_fee_amount} {poolData.entry_fee_currency}</div>
                    </div>
                  </div>
                )}
                
                {/* Team Size */}
                <div className="flex items-center gap-2 text-green-700">
                  <Users className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Team Size</div>
                    <div>{poolData.picks_per_team} players</div>
                  </div>
                </div>
                
                {/* Members */}
                <div className="flex items-center gap-2 text-green-700">
                  <MapPin className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Current Members</div>
                    <div>{memberCount} {memberCount === 1 ? 'member' : 'members'}</div>
                  </div>
                </div>
              </div>
              
              {/* Host Info */}
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs text-green-600">
                  Hosted by <span className="font-medium">{ownerName}</span>
                </p>
              </div>
            </div>
            
            {/* Action Button */}
            <Button onClick={handleJoinPool} disabled={loading} className="w-full" size="lg">
              {loading ? 'Processing...' : 'Join Pool & Start Playing'}
            </Button>
            
            {/* Invite Code Reference */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Invite Code: <span className="font-mono">{code}</span>
              </p>
            </div>
          </CardContent>
        ) : (
          <CardContent className="text-center space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">
                Invalid or expired invite code: <span className="font-mono">{code}</span>
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default Invite;