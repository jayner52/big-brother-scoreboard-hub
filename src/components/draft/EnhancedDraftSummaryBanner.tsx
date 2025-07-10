import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, Trophy, Clock } from 'lucide-react';
import { Pool } from '@/types/pool';

interface EnhancedDraftSummaryBannerProps {
  poolSettings: Pool;
}

export const EnhancedDraftSummaryBanner: React.FC<EnhancedDraftSummaryBannerProps> = ({ poolSettings }) => {
  return (
    <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-black/10" />
      <CardContent className="p-6 relative">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* Main Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{poolSettings.name} Fantasy Pool</h2>
            <p className="text-blue-100 mb-4">
              Draft your team, make predictions, and compete for the prize pool!
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {poolSettings.has_buy_in && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-300" />
                  <div>
                    <p className="text-xs text-blue-200">Entry Fee</p>
                    <p className="font-semibold">{poolSettings.entry_fee_currency} ${poolSettings.entry_fee_amount}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-300" />
                <div>
                  <p className="text-xs text-blue-200">Team Size</p>
                  <p className="font-semibold">{poolSettings.picks_per_team || 5} Players</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-orange-300" />
                <div>
                  <p className="text-xs text-blue-200">Status</p>
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                    {poolSettings.draft_open ? 'Open' : 'Closed'}
                  </Badge>
                </div>
              </div>
              
              {poolSettings.registration_deadline && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-pink-300" />
                  <div>
                    <p className="text-xs text-blue-200">Draft Due</p>
                    <p className="font-semibold text-sm">
                      {new Date(poolSettings.registration_deadline).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                    {new Date(poolSettings.registration_deadline).getTime() - Date.now() < 24 * 60 * 60 * 1000 && (
                      <p className="text-xs text-red-200 font-medium">⚠️ Due Soon!</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          {poolSettings.has_buy_in && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[280px]">
              <h3 className="font-semibold mb-3 text-center">Payment Options</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{poolSettings.payment_method_1}</span>
                  <code className="text-xs bg-white/20 px-2 py-1 rounded">{poolSettings.payment_details_1}</code>
                </div>
                {poolSettings.payment_method_2 && poolSettings.payment_details_2 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{poolSettings.payment_method_2}</span>
                    <code className="text-xs bg-white/20 px-2 py-1 rounded">{poolSettings.payment_details_2}</code>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};