export const getDraftStepsConfig = (picksPerTeam: number) => [
  { id: 'info', title: 'Basic Info', description: 'Your name and team details' },
  { id: 'team', title: 'Draft Team', description: `Select your ${picksPerTeam} houseguests` },
  { id: 'bonus', title: 'Bonus Questions', description: 'Required strategic predictions' },
  { id: 'payment', title: 'Payment', description: 'Secure payment confirmation' }
];

export type StepId = 'info' | 'team' | 'bonus' | 'payment';