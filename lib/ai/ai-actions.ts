'use server';

import { auth } from '@/lib/auth';
import { executeGeneration } from '@/lib/ai/generator';
import { db } from '@/lib/schema/index';
import { generatedContent } from '@/lib/schema/db/content';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { ContentTone } from '@/types';

export async function generateAIContentAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const orgId = formData.get('orgId') as string;
    const propertyId = formData.get('propertyId') as string;
    const contentType = (formData.get('contentType') as any) || 'description';
    const tone = (formData.get('tone') as ContentTone) || 'luxury';
    const customInstructions = (formData.get('customInstructions') as string) || undefined;
    await executeGeneration({ orgId, propertyId, contentType, tone, customInstructions });
    revalidatePath(`/generate/${propertyId}`);
}

export async function deleteGeneratedContentAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const orgId = formData.get('orgId') as string;
    const propertyId = formData.get('propertyId') as string;
    const contentId = formData.get('contentId') as string;

    await db.delete(generatedContent).where(and(eq(generatedContent.id, contentId), eq(generatedContent.orgId, orgId)));
    revalidatePath(`/generate/${propertyId}`);
}
