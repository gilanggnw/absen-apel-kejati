import { NextResponse } from 'next/server';
import { getAttendancePhotoStats } from '@/app/database/actions';

export async function GET() {
  try {
    console.log('API route /api/storage/stats called');
    
    const stats = await getAttendancePhotoStats();
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
