import { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';

// Handles POST requests to the /api/revalidate endpoint
export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body and extract the 'tags' array
    const { tags } = await request.json();
    
    // If 'tags' is an array, revalidate each tag
    if (Array.isArray(tags)) {
      tags.forEach((tag: string) => {
        revalidateTag(tag); // Triggers cache revalidation for the tag
      });
    }
    
    // Respond with success and the list of revalidated tags
    return Response.json({ revalidated: true, tags });
  } catch (error) {
    // Log and respond with an error if something goes wrong
    console.error('Error revalidating cache:', error);
    return Response.json({ error: 'Failed to revalidate' }, { status: 500 });
  }
}