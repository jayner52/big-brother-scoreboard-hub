-- Update scoring rules with professional wording
UPDATE detailed_scoring_rules 
SET description = CASE 
  WHEN description = 'Head of Household winner' THEN 'Head of Household (HOH) Winner'
  WHEN description = 'Power of Veto winner' THEN 'Power of Veto (POV) Winner'
  WHEN description = 'Americas Favorite Player' THEN 'America''s Favorite Houseguest (AFP)'
  WHEN description = 'Runner-up' THEN 'Runner-Up (2nd Place)'
  WHEN description = 'Won the game' THEN 'Season Winner (1st Place)'
  WHEN description = 'Made it to jury' THEN 'Reached Jury Phase'
  WHEN description = 'Surviving 4 weeks with no competition wins' THEN 'Survived 4+ Weeks Without Competition Wins'
  WHEN description = 'Surviving 2 rounds on the block without being voted out' THEN 'Survived 2+ Rounds as Nominee'
  WHEN description = 'Surviving 4 rounds on the block without being voted out' THEN 'Survived 4+ Rounds as Nominee'
  WHEN description = 'Comes back after being evicted' THEN 'Returned to Game After Eviction'
  WHEN description = 'Costume/Punishment/Consequence (not slop)' THEN 'Received Costume/Punishment (Non-Slop)'
  WHEN description = 'Granted safety for the week/team wins comp' THEN 'Won Safety Competition'
  WHEN description = 'In a showmance' THEN 'In a Showmance Relationship'
  WHEN description = 'Leaves not at eviction' THEN 'Left Game Outside Eviction'
  WHEN description = 'Given power/prize from other HG' THEN 'Received Power/Prize from Another Houseguest'
  WHEN description = 'Given/Wins Special Power' THEN 'Won Special Power/Advantage'
  WHEN description = 'Wins a prize (cash, vacation)' THEN 'Won Prize (Cash/Vacation/Other)'
  WHEN description = 'Won the BB Arena competition (removed from the block)' THEN 'Won BB Arena (Safety from Eviction)'
  WHEN description = 'Nominated for eviction' THEN 'Nominated for Eviction'
  WHEN description = 'Power of Veto used to save this player' THEN 'Saved by Power of Veto'
  WHEN description = 'Replacement nominee after POV' THEN 'Replacement Nominee (Post-Veto)'
  WHEN description = 'Survived the week' THEN 'Survived Eviction'
  ELSE description
END
WHERE description IN (
  'Head of Household winner',
  'Power of Veto winner', 
  'Americas Favorite Player',
  'Runner-up',
  'Won the game',
  'Made it to jury',
  'Surviving 4 weeks with no competition wins',
  'Surviving 2 rounds on the block without being voted out',
  'Surviving 4 rounds on the block without being voted out',
  'Comes back after being evicted',
  'Costume/Punishment/Consequence (not slop)',
  'Granted safety for the week/team wins comp',
  'In a showmance',
  'Leaves not at eviction',
  'Given power/prize from other HG',
  'Given/Wins Special Power',
  'Wins a prize (cash, vacation)',
  'Won the BB Arena competition (removed from the block)',
  'Nominated for eviction',
  'Power of Veto used to save this player',
  'Replacement nominee after POV',
  'Survived the week'
);