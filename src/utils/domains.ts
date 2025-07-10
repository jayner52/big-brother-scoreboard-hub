/**
 * Domain configuration for the application
 */
export const getDomainConfig = () => {
  return {
    // Custom domain for invite links and external sharing
    baseUrl: 'https://poolside-picks-play.com',
    // Use current domain for internal navigation and auth redirects
    currentDomain: window.location.origin,
  };
};

/**
 * Generate an invite link using the custom domain
 */
export const generateInviteLink = (inviteCode: string): string => {
  const { baseUrl } = getDomainConfig();
  return `${baseUrl}/invite/${inviteCode}`;
};

/**
 * Generate auth redirect URL using current domain
 */
export const generateAuthRedirectUrl = (path: string = '/'): string => {
  const { currentDomain } = getDomainConfig();
  return `${currentDomain}${path}`;
};