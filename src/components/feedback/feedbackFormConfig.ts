export const siteLocations = [
  'Dashboard',
  'Draft/Team Selection',
  'Leaderboard',
  'Admin Panel',
  'Pool Settings',
  'Navigation',
  'Chat',
  'User Profile',
  'Payment/Billing',
  'Mobile View',
  'Other'
];

export const getFormTitle = (type: 'bug' | 'feature' | 'comment') => {
  switch (type) {
    case 'bug': return 'Report a Bug';
    case 'feature': return 'Request a Feature';
    case 'comment': return 'General Feedback';
    default: return 'Feedback';
  }
};

export const getFormDescription = (type: 'bug' | 'feature' | 'comment') => {
  switch (type) {
    case 'bug': return 'Help us fix issues by describing what went wrong';
    case 'feature': return 'Tell us what new features would make your experience better';
    case 'comment': return 'Share your thoughts, suggestions, or general feedback';
    default: return 'Share your feedback with us';
  }
};