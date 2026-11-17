import { db } from '@/lib/schema';
import { comments, activityLog } from '@/lib/schema/db/collaboration';
import { users } from '@/lib/schema/db/users';
import { eq, desc, asc } from 'drizzle-orm';

/**
 * Fetch all comments for a marketing pack with author details.
 */
export async function getPackComments(packId: string) {
    const list = await db
        .select({
            id: comments.id,
            packId: comments.packId,
            content: comments.content,
            createdAt: comments.createdAt,
            userId: users.id,
            userName: users.name,
            userEmail: users.email,
            userImage: users.image,
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.packId, packId))
        .orderBy(asc(comments.createdAt));

    return list;
}

/**
 * Fetch the chronological activity log for a marketing pack.
 */
export async function getPackActivity(packId: string) {
    const list = await db
        .select({
            id: activityLog.id,
            packId: activityLog.packId,
            action: activityLog.action,
            details: activityLog.details,
            createdAt: activityLog.createdAt,
            userId: users.id,
            userName: users.name,
            userEmail: users.email,
            userImage: users.image,
        })
        .from(activityLog)
        .leftJoin(users, eq(activityLog.userId, users.id))
        .where(eq(activityLog.packId, packId))
        .orderBy(desc(activityLog.createdAt));

    return list;
}

/**
 * Record an audit log entry for a marketing pack.
 */
export async function logPackActivity(params: {
    packId: string;
    userId?: string | null;
    action: string;
    details?: string | null;
}) {
    await db.insert(activityLog).values({
        packId: params.packId,
        userId: params.userId || null,
        action: params.action,
        details: params.details || null,
    });
}

/**
 * Add a comment and write an activity log entry.
 */
export async function addPackComment(params: {
    packId: string;
    userId: string;
    content: string;
}) {
    const [newComment] = await db
        .insert(comments)
        .values({
            packId: params.packId,
            userId: params.userId,
            content: params.content,
        })
        .returning();

    await logPackActivity({
        packId: params.packId,
        userId: params.userId,
        action: 'commented',
        details: params.content.length > 60 ? `${params.content.slice(0, 60)}...` : params.content,
    });

    return newComment;
}
