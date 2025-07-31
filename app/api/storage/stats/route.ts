import { NextResponse } from 'next/server';
import { getAttendancePhotoStats } from '@/app/database/actions';

export async function GET(request: Request) {
  try {
    console.log('API route /api/storage/stats called');
    
    // Check for test mode parameter
    const { searchParams } = new URL(request.url);
    const testMode = searchParams.get('testMode') === 'true';
    
    console.log('Test mode:', testMode ? 'ENABLED (1 week)' : 'DISABLED (3 months)');
    
    const stats = await getAttendancePhotoStats(testMode);
    console.log('Stats retrieved from database:', stats);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in /api/storage/stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch storage statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
