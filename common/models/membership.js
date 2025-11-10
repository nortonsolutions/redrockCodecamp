// import { Observable } from 'rx';

const { MEMBERSHIP_TIERS } = require('../config.json');
const membership = require('./membership.json')
export class MembershipFactory {

    constructor(tier, data) {
        var entries = Object.entries(membership.properties)
        for (const [key, value] of entries) {
            this[key] = value.default;
        }
        
        for (const key in MEMBERSHIP_TIERS[tier]) {
            this[key] = MEMBERSHIP_TIERS[tier][key];
        }

        if (data) {
            for (const key in data) {
                this[key] = data[key];
            }
        }
    }

    get() {
        return this;
    }

    static GetDefault() {
        return new MembershipFactory('copper-top').get()
    }

    static GetByTier(tier) {
        if (MEMBERSHIP_TIERS[tier]) {
            return new MembershipFactory(tier).get();
        }
        console.log(`MembershipFactory.GetByTier: Tier "${tier}" not found, returning default "copper-top"`);
        return new MembershipFactory('copper-top').get();
    }

    static GetAllMembershipTiers() {
        return MEMBERSHIP_TIERS;
    }

    static GetTierMap() { // Use MEMBERSHIP_TIERS to build tier names object like { 'copper-top': 'Copper-Top (Free)', 'silver-hat': 'Silver-Hat ($9.99/mo)', 'gold-star': 'Gold-Star ($19.99/mo)' }
        var tierNames = {};
        for (const key in MEMBERSHIP_TIERS) {
            const tier = MEMBERSHIP_TIERS[key];
            tierNames[key] = `${tier.displayName} (${tier.price === 0 ? 'Free' : '$' + tier.price + '/mo'})`;
        }
        return tierNames;
    }
};