import puppeteer from "puppeteer";
export const renderPdf = async (html: string): Promise<Buffer> => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 1696, deviceScaleFactor: 2 });
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
        const pdfUint8Array = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
        });
        return Buffer.from(pdfUint8Array);
    } catch (error) {
        console.error('Puppeteer PDF render error:', error);
        throw error;
    } finally {
        await browser.close();
    }
};