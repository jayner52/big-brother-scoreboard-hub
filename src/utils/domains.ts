/**
 * Domain configuration for the application
 */
export const getDomainConfig = () => {
  return {
    // Custom domain for invite links and external sharing
    baseUrl: 'https://poolside-picks.com',
    // Use current domain for internal navigation and auth redirects
    currentDomain: window.location.origin,
  };
};

/**
 * Generate an invite link using the current domain for functionality
 */
export const generateInviteLink = (inviteCode: string): string => {
  const { currentDomain } = getDomainConfig();
  return `${currentDomain}/invite/${inviteCode.toUpperCase()}`;
};

/**
 * Generate auth redirect URL using current domain
 */
export const generateAuthRedirectUrl = (path: string = '/'): string => {
  const { currentDomain } = getDomainConfig();
  return `${currentDomain}${path}`;
};