// Certification requirements lookup - maps superBlock names to required certs
// Keys use lowercase for case-insensitive matching across different data sources
// This is the single source of truth for certification requirements across the Map components
export const CERT_REQUIREMENTS = {
  '(1010) world wide web elements': { cert: null, name: 'user account' },
  '(1020) responsive web design': { cert: null, name: 'user account' },
  '(2030) javascript apprenticeship': { cert: 'isRespWebDesignCert', name: 'Responsive Web Design' },
  '(2040) javascript standards': { cert: 'isRespWebDesignCert', name: 'Responsive Web Design' },
  '(2050) javascript browser apis': { cert: 'isJsAlgoDataStructCert', name: 'JS Algorithms and Data Structures' },
  '(2060) javascript web citizenship': { cert: 'isJsAlgoDataStructCert', name: 'JS Algorithms and Data Structures' },
  '(3070) front end frameworks': { cert: 'isJsAlgoDataStructCert', name: 'JS Algorithms and Data Structures' },
  '(3080) back end web tech': { cert: 'isFrontEndCert', name: 'JavaScript Front-End Web Development' },
  '(3090) advanced server patterns': { cert: 'isFrontEndLibsCert', name: 'JavaScript Front-End Libraries' },
  '(4010) javascript for engineers': { cert: 'isInfosecQaCert', name: 'Information Security and QA' }
};

/**
 * Check if a user's membership tier bypasses certification requirements
 * @param {Object} user - The user object with membership property
 * @returns {Boolean} - True if user has silver-hat or higher membership
 */
export function hasPremiumMembership(user) {
  if (!user || !user.membership) {
    return false;
  }
  
  const { tier } = user.membership;
  
  // Premium tiers (silver-hat and above) bypass cert requirements
  // Tiers: copper-top (0), silver-hat (1), gold-star (2), platinum-sponsor (3)
  const premiumTiers = ['silver-hat', 'gold-star', 'platinum-sponsor'];
  
  return premiumTiers.includes(tier);
}

/**
 * Check if content should be locked based on certification requirements and membership
 * @param {Object} requirement - The cert requirement from CERT_REQUIREMENTS
 * @param {Object} user - The user object
 * @returns {Boolean} - True if content should be locked
 */
export function isContentLocked(requirement, user) {
  // No requirement means content is always accessible
  if (!requirement || requirement.cert === null) {
    return false;
  }
  
  // Premium members bypass all cert requirements
  if (hasPremiumMembership(user)) {
    return false;
  }
  
  // Check if user has the required certification
  const certProperty = requirement.cert;
  const hasCert = user && user[certProperty];
  
  return !hasCert;
}
