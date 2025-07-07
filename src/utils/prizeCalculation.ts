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
  
  // Check for new prize_configuration first, then fall back to old prize_distribution
  const prizeConfig = pool.prize_configuration || pool.prize_distribution;
  const adminFee = prizeConfig?.admin_fee || 0;
  const availablePool = totalPot - adminFee;

  console.log('💰 Prize Calculation - Total Pot:', totalPot, 'Admin Fee:', adminFee, 'Available:', availablePool);
  console.log('🔧 Prize Config:', prizeConfig);

  let prizes: PrizeInfo[] = [];
  let mode: 'percentage' | 'custom' | 'none' = 'none';

  if (!prizeConfig) {
    console.log('❌ No prize configuration found');
    return {
      prizes: [],
      totalPrizePool: totalPot,
      availablePrizePool: availablePool,
      mode: 'none'
    };
  }

  // Use prize configuration mode or fallback to pool's prize_mode
  const poolPrizeMode = prizeConfig.mode || pool.prize_mode || 'percentage';
  console.log('🎯 Prize Calculation - Pool prize mode:', poolPrizeMode);
  
  if (poolPrizeMode === 'custom' && prizeConfig.custom_prizes && prizeConfig.custom_prizes.length > 0) {
    console.log('🎨 Prize Calculation - Using custom prizes (mode-driven)');
    mode = 'custom';
    
    prizes = prizeConfig.custom_prizes
      .filter((prize: any) => prize.amount && prize.amount > 0)
      .map((prize: any) => ({
        place: prize.place,
        amount: prize.amount,
        description: prize.description || getPlaceText(prize.place)
      }));

  } else if (poolPrizeMode === 'percentage' && prizeConfig.percentage_distribution) {
    console.log('📊 Prize Calculation - Using percentage distribution');
    mode = 'percentage';
    
    const percentageConfig = prizeConfig.percentage_distribution;
    console.log('🔍 Percentage Config Keys:', Object.keys(percentageConfig));
    
    // Build prizes from ALL percentage distribution keys dynamically
    const percentagePrizes: { place: number; percentage: number }[] = [];
    
    // Add all percentage keys dynamically
    Object.entries(percentageConfig).forEach(([key, value]) => {
      if (key.endsWith('_place_percentage') && typeof value === 'number' && value > 0) {
        let place = 1;
        if (key.startsWith('first_')) place = 1;
        else if (key.startsWith('second_')) place = 2;
        else if (key.startsWith('third_')) place = 3;
        else if (key.startsWith('fourth_')) place = 4;
        else if (key.startsWith('fifth_')) place = 5;
        else if (key.startsWith('sixth_')) place = 6;
        else if (key.startsWith('seventh_')) place = 7;
        else if (key.startsWith('eighth_')) place = 8;
        else if (key.startsWith('ninth_')) place = 9;
        else if (key.startsWith('tenth_')) place = 10;
        
        percentagePrizes.push({ place, percentage: value });
      }
    });

    prizes = percentagePrizes
      .sort((a, b) => a.place - b.place)
      .map(prize => ({
        place: prize.place,
        amount: Math.round((availablePool * prize.percentage) / 100),
        description: getPlaceText(prize.place)
      }))
      .filter(prize => prize.amount > 0);

  } else {
    // Fallback: Check if custom amounts are configured (legacy structure)
    const hasCustomAmounts = [
      prizeConfig.first_place_amount,
      prizeConfig.second_place_amount,
      prizeConfig.third_place_amount,
      prizeConfig.fourth_place_amount,
      prizeConfig.fifth_place_amount
    ].some(amount => amount && amount > 0);

    // Check if percentages are configured (legacy structure)
    const hasPercentages = [
      prizeConfig.first_place_percentage,
      prizeConfig.second_place_percentage,
      prizeConfig.third_place_percentage,
      prizeConfig.fourth_place_percentage,
      prizeConfig.fifth_place_percentage
    ].some(percentage => percentage && percentage > 0);

    if (hasCustomAmounts) {
      console.log('🎨 Prize Calculation - Using legacy custom amounts');
      mode = 'custom';
      
      // Build prizes from custom amounts
      const customPrizes = [
        { place: 1, amount: prizeConfig.first_place_amount },
        { place: 2, amount: prizeConfig.second_place_amount },
        { place: 3, amount: prizeConfig.third_place_amount },
        { place: 4, amount: prizeConfig.fourth_place_amount },
        { place: 5, amount: prizeConfig.fifth_place_amount }
      ];

      prizes = customPrizes
        .filter(prize => prize.amount && prize.amount > 0)
        .map(prize => ({
          place: prize.place,
          amount: prize.amount,
          description: getPlaceText(prize.place)
        }));

    } else if (hasPercentages) {
      console.log('📊 Prize Calculation - Using legacy percentage distribution');
      mode = 'percentage';
      
      // Build prizes from percentages
      const percentagePrizes = [
        { place: 1, percentage: prizeConfig.first_place_percentage },
        { place: 2, percentage: prizeConfig.second_place_percentage },
        { place: 3, percentage: prizeConfig.third_place_percentage },
        { place: 4, percentage: prizeConfig.fourth_place_percentage },
        { place: 5, percentage: prizeConfig.fifth_place_percentage }
      ];

      prizes = percentagePrizes
        .filter(prize => prize.percentage && prize.percentage > 0)
        .map(prize => ({
          place: prize.place,
          amount: Math.round((availablePool * prize.percentage) / 100),
          description: getPlaceText(prize.place)
        }))
        .filter(prize => prize.amount > 0);
    }
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
  if (place === 4) return '4th Place';
  if (place === 5) return '5th Place';
  if (place <= 10) return `${place}th Place`;
  return `${place}th Place`;
};

export const formatPrize = (amount: number, currency: string = 'CAD'): string => {
  return `${currency} $${Math.round(amount).toFixed(2)}`;
};