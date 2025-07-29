import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldAttendancePhotos } from '../../../database/actions';

// Global state for automation (in production, use Redis or database)
let automationInterval: NodeJS.Timeout | null = null;
let isAutomationRunning = false;
let isCleanupRunning = false;

async function performAutomatedCleanup() {
  if (isCleanupRunning) {
    console.log('⏳ Cleanup already in progress, skipping...');
    return;
  }

  try {
    isCleanupRunning = true;
    console.log('🕐 [' + new Date().toISOString() + '] Starting automated storage cleanup...');
    
    const result = await cleanupOldAttendancePhotos();
    
    if (result.success) {
      console.log(`✅ [${new Date().toISOString()}] Automated storage cleanup completed successfully`);
      console.log(`📊 Records cleaned: ${result.recordsCleaned}`);
      console.log(`💾 Space saved: ${result.estimatedSavingsMB} MB`);
    }
  } catch (error) {
    console.error('❌ [' + new Date().toISOString() + '] Automated storage cleanup failed:', error);
  } finally {
    isCleanupRunning = false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'start':
        if (isAutomationRunning) {
          return NextResponse.json({
            success: false,
            message: 'Automation is already running'
          });
        }

        // Start automation with 24-hour intervals
        automationInterval = setInterval(performAutomatedCleanup, 24 * 60 * 60 * 1000);
        isAutomationRunning = true;
        
        console.log('🚀 Storage automation started');
        return NextResponse.json({
          success: true,
          message: 'Automation started successfully',
          isRunning: true
        });

      case 'stop':
        if (automationInterval) {
          clearInterval(automationInterval);
          automationInterval = null;
        }
        isAutomationRunning = false;
        
        console.log('🛑 Storage automation stopped');
        return NextResponse.json({
          success: true,
          message: 'Automation stopped successfully',
          isRunning: false
        });

      case 'status':
        return NextResponse.json({
          success: true,
          isRunning: isAutomationRunning,
          isCleanupRunning,
          message: isAutomationRunning ? 'Automation is running' : 'Automation is stopped'
        });

      case 'trigger':
        // Manual trigger for immediate cleanup
        await performAutomatedCleanup();
        return NextResponse.json({
          success: true,
          message: 'Manual cleanup triggered successfully'
        });

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action. Use: start, stop, status, or trigger'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Storage cleanup API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Handle POST requests for trigger action
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'trigger') {
    try {
      await performAutomatedCleanup();
      return NextResponse.json({
        success: true,
        message: 'Manual cleanup triggered successfully'
      });
    } catch (error) {
      console.error('Manual cleanup failed:', error);
      return NextResponse.json({
        success: false,
        message: 'Manual cleanup failed'
      }, { status: 500 });
    }
  }

  return NextResponse.json({
    success: false,
    message: 'Invalid action for POST request'
  }, { status: 400 });
}
