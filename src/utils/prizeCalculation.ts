import { Pool } from '@/types/pool';

interface PrizeInfo {
  place: number;
  amount: number;
  description: string;
}

interface PrizeCalculationResult {
  prizes: PrizeInfo[];
  totalPrizePool: number;
  availablePrizePool: number;
  mode: 'percentage' | 'custom' | 'none';
}

export const calculatePrizes = (
  pool: Pool | null, 
  totalEntries: number
): PrizeCalculationResult => {
  console.log('🎯 Prize Calculation - Pool:', pool?.name, 'Entries:', totalEntries);
  
  if (!pool || !pool.has_buy_in || totalEntries === 0) {
    console.log('❌ Prize Calculation - No pool, no buy-in, or no entries');
    return {
      prizes: [],
      totalPrizePool: 0,
      availablePrizePool: 0,
      mode: 'none'
    };
  }

  const totalPot = totalEntries * pool.entry_fee_amount;
  const prizeConfig = pool.prize_distribution;
  const adminFee = prizeConfig?.admin_fee || 0;
  const availablePool = totalPot - adminFee;

  console.log('💰 Prize Calculation - Total Pot:', totalPot, 'Admin Fee:', adminFee, 'Available:', availablePool);
  console.log('⚙️ Prize Calculation - Mode:', prizeConfig?.mode);

  let prizes: PrizeInfo[] = [];
  let mode: 'percentage' | 'custom' | 'none' = 'none';

  if (prizeConfig?.mode === 'custom' && prizeConfig.custom_prizes) {
    console.log('🎨 Prize Calculation - Using custom mode with prizes:', prizeConfig.custom_prizes);
    mode = 'custom';
    prizes = prizeConfig.custom_prizes
      .filter(prize => prize.amount > 0) // Only show prizes with amount > 0
      .sort((a, b) => a.place - b.place)
      .map(prize => ({
        place: prize.place,
        amount: prize.amount,
        description: prize.description || getPlaceText(prize.place)
      }));
  } else if (prizeConfig?.mode === 'percentage' && prizeConfig.percentage_distribution) {
    console.log('📊 Prize Calculation - Using percentage mode');
    mode = 'percentage';
    const percentages = prizeConfig.percentage_distribution;
    prizes = [
      {
        place: 1,
        amount: Math.round((availablePool * percentages.first_place_percentage) / 100),
        description: '1st Place Winner'
      },
      {
        place: 2,
        amount: Math.round((availablePool * percentages.second_place_percentage) / 100),
        description: '2nd Place Runner-up'
      },
      {
        place: 3,
        amount: Math.round((availablePool * percentages.third_place_percentage) / 100),
        description: '3rd Place'
      }
    ].filter(prize => prize.amount > 0); // Only show prizes with amount > 0
  }

  console.log('✅ Prize Calculation - Final prizes:', prizes);

  return {
    prizes,
    totalPrizePool: totalPot,
    availablePrizePool: availablePool,
    mode
  };
};

export const getPlaceText = (place: number): string => {
  if (place === 1) return '1st Place';
  if (place === 2) return '2nd Place';
  if (place === 3) return '3rd Place';
  return `${place}th Place`;
};

export const formatPrize = (amount: number, currency: string = 'CAD'): string => {
  return `${currency} $${Math.round(amount).toFixed(2)}`;
};