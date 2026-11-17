import type { SubscriptionPlan } from '@/types';

const PLAN_LIMITS: Record<
    SubscriptionPlan,
    {
        aiCredits: number;
        maxProperties: number;
        batchGeneration: boolean;
        customTemplates: boolean;
    }
> = {
    // Basic: 50 AI credits, 20 properties
    basic: {
        aiCredits: 50,
        maxProperties: 20,
        batchGeneration: false,
        customTemplates: false,
    },
    // Pro: 500 AI credits, 200 properties, batch AI generation
    pro: {
        aiCredits: 500,
        maxProperties: 200,
        batchGeneration: true,
        customTemplates: true,
    },
    // Enterprise: Unlimited (-1)
    enterprise: {
        aiCredits: -1,
        maxProperties: -1,
        batchGeneration: true,
        customTemplates: true,
    },
};

export function getPlanLimits(plan: SubscriptionPlan) {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.basic;
}

export function canUseBatchGeneration(plan: SubscriptionPlan): boolean {
    return (PLAN_LIMITS[plan] || PLAN_LIMITS.basic).batchGeneration;
}

export function canUseCustomTemplates(plan: SubscriptionPlan): boolean {
    return (PLAN_LIMITS[plan] || PLAN_LIMITS.basic).customTemplates;
}

export function getAiCreditLimit(plan: SubscriptionPlan): number {
    return (PLAN_LIMITS[plan] || PLAN_LIMITS.basic).aiCredits;
}
