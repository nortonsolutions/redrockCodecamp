module.exports.MEMBERSHIP_TIERS = {
  'copper-top': {
    key: 'copper-top',
    level: 0,
    name: 'Copper-Top',
    displayName: '🥉 Copper-Top',
    price: 0,
    features: ['baseline-content', 'community-forum', 'certificates']
  },
  'silver-hat': {
    key: 'silver-hat',
    level: 1,
    name: 'Silver-Hat',
    displayName: '🥈 Silver-Hat',
    price: 9.99,
    features: ['baseline-content', 'community-forum', 'certificates', 'advanced-modules', 'email-support', 'webinars']
  },
  'gold-star': {
    key: 'gold-star',
    level: 2,
    name: 'Gold-Star',
    displayName: '⭐ Gold-Star',
    price: 19.99,
    features: ['baseline-content', 'community-forum', 'certificates', 'advanced-modules', 'email-support', 'webinars', 'phone-support', 'consulting', 'mentoring']
  }
};

module.exports.getTierByKey = function(key) {
  return module.exports.MEMBERSHIP_TIERS[key] || module.exports.MEMBERSHIP_TIERS['copper-top'];
};

module.exports.hasMinimumTier = function(userTier, requiredTier) {
  var userLevel = module.exports.getTierByKey(userTier).level;
  var requiredLevel = module.exports.getTierByKey(requiredTier).level;
  return userLevel >= requiredLevel;
};