import { SourceReliability } from './types.ts';

export const SOURCE_RELIABILITY: SourceReliability[] = [
  { name: 'CBS Official', weight: 98 },
  { name: 'Wikipedia', weight: 95 },
  { name: 'Big Brother Network', weight: 90 },
  { name: 'Reality TV Fandom', weight: 85 },
  { name: 'Gold Derby', weight: 80 },
  { name: 'Reddit Live Feeds', weight: 70 },
  { name: 'Twitter Updates', weight: 65 }
];

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};