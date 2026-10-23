export const prerender = false;

import { getGeneratedImages } from '../../server/gallery';

export async function GET() {
  try {
    const images = await getGeneratedImages();
    
    if (images.length === 0) {
      return new Response(JSON.stringify({
        timestamp: Date.now(),
        image: null,
        totalImages: 0
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
    }

    const latest = images[0];

    return new Response(JSON.stringify({
      timestamp: latest.timestamp || Date.now(),
      image: latest,
      totalImages: images.length,
      imageId: latest.id || latest.fileName
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Error getting latest image:', error);
    return new Response(JSON.stringify({
      error: 'Error loading images',
      timestamp: Date.now(),
      image: null,
      totalImages: 0
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
