// import { Observable } from 'rx';

const { MEMBERSHIP_TIERS } = require('../config.json');
const { Membership } = require(models)
export class MembershipFactory extends Membership {

    constructor(tier) {
        super();
        for (const key in MEMBERSHIP_TIERS[tier]) {
            this[key] = MEMBERSHIP_TIERS[tier][key];
        }
    }

    get() {
        return this;
    }

    static GetTierByKey(tierKey) {
        return MEMBERSHIP_TIERS[tierKey] || MEMBERSHIP_TIERS['copper-top'];
    };

    static GetAllMembershipTiers() {
        return MEMBERSHIP_TIERS;
    }

    static GetTierNames() { // Use MEMBERSHIP_TIERS to build tier names object like { 'copper-top': 'Copper-Top (Free)', 'silver-hat': 'Silver-Hat ($9.99/mo)', 'gold-star': 'Gold-Star ($19.99/mo)' }
        var tierNames = {};
        for (const key in MEMBERSHIP_TIERS) {
            const tier = MEMBERSHIP_TIERS[key];
            tierNames[key] = `${tier.displayName} (${tier.price === 0 ? 'Free' : '$' + tier.price + '/mo'})`;
        }
        return tierNames;
    }
};