import type { ContentTone } from '@/types';

export interface PropertyPromptData {
    title: string;
    address: string;
    city: string;
    state: string;
    price: number;
    currency: string;
    bedrooms: number;
    bathrooms: number;
    sqft?: number | null;
    propertyType: string;
    amenities?: string[];
    description?: string | null;
}

const TONE_INSTRUCTIONS: Record<ContentTone, string> = {
    luxury: 'Use sophisticated, aspirational language. Emphasise exclusivity, architecture, and prestige lifestyle.',
    friendly: 'Use warm, welcoming language. Make the buyer feel at home. Emphasise community and comfort.',
    formal: 'Use clear, investor-focused language. Focus on ROI, specs, quality, and structural integrity.',
    neutral: 'Use objective, concise, and clean real-estate language.',
};

export function buildDescriptionPrompt(data: PropertyPromptData, tone: ContentTone, customInstructions?: string): string {
    return `You are an elite real estate copywriter. Write a compelling property listing description.
Property: ${data.title} at ${data.address}, ${data.city}, ${data.state}.
Specs: ${data.bedrooms} Beds, ${data.bathrooms} Baths, ${data.sqft || 'N/A'} sqft, Price: ${data.currency} ${data.price.toLocaleString()}.
Amenities: ${data.amenities?.join(', ') || 'Modern finishes'}.
Notes: ${data.description || ''}

Tone Style: ${TONE_INSTRUCTIONS[tone]}
${customInstructions ? `Special Instructions: ${customInstructions}` : ''}
Write 2-3 engaging paragraphs focusing on lifestyle benefits. Do not mention the exact numerical price in body copy.`;
}

export function buildBulletsPrompt(data: PropertyPromptData, tone: ContentTone, customInstructions?: string): string {
    return `Write 6-8 punchy feature bullet highlights for: ${data.title} in ${data.city}. Style: ${TONE_INSTRUCTIONS[tone]}. Start each bullet with an active verb or feature icon.`;
}

export function buildHeadlinePrompt(data: PropertyPromptData, tone: ContentTone, customInstructions?: string): string {
    return `Write 5 catchy, powerful headlines (under 10 words each) for: ${data.title} in ${data.city}. Style: ${TONE_INSTRUCTIONS[tone]}.`;
}

export function buildSocialPrompt(data: PropertyPromptData, tone: ContentTone, customInstructions?: string): string {
    return `Write social media posts for: ${data.title} in ${data.city}. Style: ${TONE_INSTRUCTIONS[tone]}.
Provide 3 distinct sections:
--- INSTAGRAM ---
(Engaging caption with emojis, key highlights, clear CTA, and 10 relevant hashtags)
--- FACEBOOK ---
(Storytelling post suitable for local community and homebuyers)
--- LINKEDIN ---
(Professional post highlighting design, architectural value, or investment opportunity)`;
}

export function buildFullPackPrompt(data: PropertyPromptData, tone: ContentTone, customInstructions?: string): string {
    return `Create a complete marketing pack for ${data.title}. Style: ${TONE_INSTRUCTIONS[tone]}.
Include: ### HEADLINES, ### DESCRIPTION, ### FEATURE HIGHLIGHTS, and ### SOCIAL MEDIA PACK.`;
}
