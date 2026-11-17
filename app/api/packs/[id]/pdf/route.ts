import { auth } from '@/lib/auth';
import { getPackById } from '@/lib/pdf/packs';
import { getCurrentTenant } from '@/lib/tenant';
import { renderPdf } from '@/lib/pdf/renderer';
import { trackAnalyticsEvent } from '@/lib/pdf/analytics';
import { NextResponse } from 'next/server';

interface RouteProps {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(request: Request, { params }: RouteProps) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const tenant = await getCurrentTenant();
    if (!tenant) {
        return new NextResponse('No active organisation', { status: 403 });
    }

    const { id } = await params;
    const pack = await getPackById(tenant.org.id, id);

    if (!pack || !pack.latestHtml) {
        return new NextResponse('Pack not found or has no content', { status: 404 });
    }

    try {
        const pdfBuffer = await renderPdf(pack.latestHtml);
        const sanitizedTitle = pack.title.replace(/[^a-zA-Z0-9_-]/g, '_');

        // Track analytics event in the background
        await trackAnalyticsEvent(tenant.org.id, 'pdf_downloaded', {
            packId: pack.id,
            metadata: { version: pack.currentVersion, title: pack.title },
        });
        // return response
        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${sanitizedTitle}-${pack.currentVersion}.pdf"`,
                'Cache-Control': 'private, max-age=3600',
            },
        });

    } catch (err: any) {
        console.error('PDF generation error:', err.message);
        return new NextResponse('PDF generation failed: ' + err.message, { status: 500 });
    }
}
