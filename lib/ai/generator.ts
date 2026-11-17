import { db } from '@/lib/schema/index';
import { generatedContent } from '@/lib/schema/db/content';
import { getPropertyById } from '@/lib/properties';
import { checkCreditAllowance, recordUsage } from '@/lib/billing';
import { generateContent } from './llm-client';
import {
    buildDescriptionPrompt,
    buildBulletsPrompt,
    buildHeadlinePrompt,
    buildSocialPrompt,
    buildFullPackPrompt,
} from './prompt-builder';
import type { ContentTone } from '@/types';
import { desc, eq, and } from 'drizzle-orm';

export type AIContentType = 'description' | 'bullets' | 'headline' | 'social' | 'full_pack';

export interface GenerateOptions {
    orgId: string;
    propertyId: string;
    contentType: AIContentType;
    tone: ContentTone;
    customInstructions?: string;
}

/**
 * High-level AI generation pipeline:
 * 1. Checks credit allowance against plan limits
 * 2. Fetches property data
 * 3. Builds prompt tailored to tone & content type
 * 4. Calls LLM (OpenAI GPT-4o -> Claude 3.5 Sonnet -> Smart Fallback)
 * 5. Deducts credit in usage_records
 * 6. Stores generated copy in generated_content table
 */
export async function executeGeneration(options: GenerateOptions) {
    const { orgId, propertyId, contentType, tone, customInstructions } = options;

    // 1. Credit Check
    const allowance = await checkCreditAllowance(orgId);
    if (!allowance.allowed) {
        throw new Error(
            `AI generation limit reached for your plan (${allowance.used}/${allowance.limit} credits used). Please upgrade in Settings > Billing.`
        );
    }

    // 2. Fetch property details
    const property = await getPropertyById(orgId, propertyId);
    if (!property) {
        throw new Error('Property listing not found.');
    }

    const promptData = {
        title: property.title,
        address: property.address,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        country: property.country,
        price: property.price,
        currency: property.currency,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        sqft: property.sqft,
        lotSize: property.lotSize,
        yearBuilt: property.yearBuilt,
        propertyType: property.propertyType,
        amenities: property.amenitiesList,
        description: property.description,
    };

    // 3. Build prompt
    let prompt: string;
    switch (contentType) {
        case 'bullets':
            prompt = buildBulletsPrompt(promptData, tone, customInstructions);
            break;
        case 'headline':
            prompt = buildHeadlinePrompt(promptData, tone, customInstructions);
            break;
        case 'social':
            prompt = buildSocialPrompt(promptData, tone, customInstructions);
            break;
        case 'full_pack':
            prompt = buildFullPackPrompt(promptData, tone, customInstructions);
            break;
        case 'description':
        default:
            prompt = buildDescriptionPrompt(promptData, tone, customInstructions);
            break;
    }

    // 4. Generate with LLM
    const result = await generateContent(prompt);

    // 5. Record Usage (1 credit per generation)
    await recordUsage(orgId, 'ai_generation', 1, {
        propertyId,
        contentType,
        tone,
        model: result.model,
        tokens: result.usage?.totalTokens || 0,
    });

    // 6. Save generated content to database
    const [saved] = await db
        .insert(generatedContent)
        .values({
            orgId,
            propertyId,
            contentType,
            tone,
            content: result.text,
            tokensUsed: result.usage?.completionTokens || 0,
            model: result.model,
        })
        .returning();

    return {
        saved,
        text: result.text,
        model: result.model,
        // provider: result.provider,
    };
}

/**
 * Fetch all previous AI generations for a property.
 */
export async function getPropertyGenerations(orgId: string, propertyId: string) {
    return await db
        .select()
        .from(generatedContent)
        .where(and(eq(generatedContent.orgId, orgId), eq(generatedContent.propertyId, propertyId)))
        .orderBy(desc(generatedContent.createdAt));
}
