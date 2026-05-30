import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side high-resolution export endpoint
 * Accepts canvas data URL and returns processed image via Sharp
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      dataUrl: string;
      format: 'png' | 'jpeg' | 'webp';
      quality: number;
      width: number;
      height: number;
    };

    const { dataUrl, format, quality, width, height } = body;

    if (!dataUrl || !format) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate dimensions (max 8000x8000)
    if (width > 8000 || height > 8000) {
      return NextResponse.json({ error: 'Dimensions exceed maximum (8000x8000)' }, { status: 400 });
    }

    // Extract base64 data
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Dynamic import of Sharp (server-side only)
    const sharp = (await import('sharp')).default;

    const pipeline = sharp(imageBuffer).resize(width, height, {
      fit: 'contain',
      background: format === 'png' ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 255, g: 255, b: 255 },
    });

    let outputBuffer: Buffer;
    let contentType: string;

    if (format === 'png') {
      outputBuffer = await pipeline.png({ compressionLevel: 6 }).toBuffer();
      contentType = 'image/png';
    } else if (format === 'jpeg') {
      outputBuffer = await pipeline.jpeg({ quality: Math.round(quality * 100) }).toBuffer();
      contentType = 'image/jpeg';
    } else {
      outputBuffer = await pipeline.webp({ quality: Math.round(quality * 100) }).toBuffer();
      contentType = 'image/webp';
    }

    return new NextResponse(outputBuffer.buffer as ArrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="export.${format}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
