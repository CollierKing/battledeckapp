import { NextRequest, NextResponse } from 'next/server';

interface ImageProxyRequest {
  imageUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as ImageProxyRequest;
    const { imageUrl } = data;
    
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'Invalid image URL' },
        { status: 400 }
      );
    }
    
    // Add custom headers to avoid being blocked
    const headers = new Headers();
    headers.append('User-Agent', 'Mozilla/5.0 (compatible; BattledeckApp/1.0)');
    headers.append('Accept', 'image/*, */*');
    headers.append('Referer', 'https://battledeckapp.com');
    
    // Fetch the image from the source
    const imageResponse = await fetch(imageUrl, {
      headers,
      // Pass cookies and credentials if necessary for some sites
      credentials: 'omit',
    });
    
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${imageResponse.statusText}` },
        { status: imageResponse.status }
      );
    }
    
    // Get the image data as an array buffer
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    
    // Create a new response with the image data
    const response = new NextResponse(imageArrayBuffer);
    
    // Set appropriate headers for the image
    const contentType = imageResponse.headers.get('Content-Type');
    if (contentType) {
      response.headers.set('Content-Type', contentType);
    } else {
      // Default to JPEG if content type is not available
      response.headers.set('Content-Type', 'image/jpeg');
    }
    
    // Cache the image for better performance
    response.headers.set('Cache-Control', 'public, max-age=86400');
    
    return response;
  } catch (error) {
    console.error('Error in proxy-image API:', error);
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 }
    );
  }
} 