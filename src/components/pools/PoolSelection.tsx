import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, Shield, User, Plus, ArrowRight } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';

interface PoolSelectionProps {
  onSelectPool: (pool: any) => void;
  onCreatePool: () => void;
  onJoinPool: () => void;
}

export const PoolSelection: React.FC<PoolSelectionProps> = ({
  onSelectPool,
  onCreatePool,
  onJoinPool
}) => {
  const { userPools } = usePool();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-gradient-primary text-white';
      case 'admin':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-unified)' }}>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your Pool</h1>
          <p className="text-muted-foreground">Select a pool to view your dashboard and compete with friends!</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {userPools.map((userPool) => {
            const pool = userPool.pool;
            
            return (
              <Card key={pool.id} className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{pool.name}</CardTitle>
                      {pool.description && (
                        <CardDescription className="text-sm">{pool.description}</CardDescription>
                      )}
                    </div>
                    <Badge className={`ml-2 flex items-center gap-1 ${getRoleColor(userPool.role)}`}>
                      {getRoleIcon(userPool.role)}
                      <span className="capitalize">{userPool.role}</span>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Pool Members</span>
                    </div>
                    {pool.has_buy_in && (
                      <Badge variant="outline" className="text-xs">
                        ${pool.entry_fee_amount} {pool.entry_fee_currency}
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => onSelectPool(pool)}
                    className="w-full"
                    size="sm"
                  >
                    Enter Pool
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          {/* Create/Join Pool Actions */}
          <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors duration-200">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="rounded-full bg-muted p-3">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Join Another Pool</h3>
                <p className="text-sm text-muted-foreground mb-4">Create a new pool or join an existing one</p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Button onClick={onCreatePool} variant="outline" size="sm">
                  Create Pool
                </Button>
                <Button onClick={onJoinPool} variant="ghost" size="sm">
                  Join Pool
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};