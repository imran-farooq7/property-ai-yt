import Stripe from "stripe";

let _stripe: Stripe | null = null;

export const getStripe = (): Stripe => {
    if (!_stripe) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("STRIPE_SECRET_KEY environment variable is not set");
        }
        _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2025-02-24.acacia",
            typescript: true,
        });
    }
    return _stripe;
};

export const STRIPE_PRICE_IDS: Record<string, string> = {
    basic: process.env.STRIPE_PRICE_BASIC || 'price_basic_placeholder',
    pro: process.env.STRIPE_PRICE_PRO || 'price_pro_placeholder',
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_placeholder',
};
export function getPlanFromPriceId(priceId: string): string {
    const entry = Object.entries(STRIPE_PRICE_IDS).find(([, id]) => id === priceId);
    return entry ? entry[0] : 'basic';
}
