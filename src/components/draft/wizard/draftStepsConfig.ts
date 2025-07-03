export const DRAFT_STEPS = [
  { id: 'info', title: 'Basic Info', description: 'Your name and team details' },
  { id: 'team', title: 'Draft Team', description: 'Select your 5 houseguests' },
  { id: 'bonus', title: 'Bonus Questions', description: 'Required strategic predictions' },
  { id: 'payment', title: 'Payment', description: 'Secure payment confirmation' }
];

export type StepId = 'info' | 'team' | 'bonus' | 'payment';