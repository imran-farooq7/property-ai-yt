export const APP_NAME = 'PropertyAI';
export const APP_DESCRIPTION = 'AI-powered real-estate marketing SaaS';

export const PLANS = [
    { id: 'basic', name: 'Basic', price: 29, credits: 50 },
    { id: 'pro', name: 'Pro', price: 79, credits: 500 },
    { id: 'enterprise', name: 'Enterprise', price: 199, credits: -1 },
] as const;
