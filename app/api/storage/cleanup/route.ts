import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldAttendancePhotos } from '../../../database/actions';

// ================================
// GLOBAL AUTOMATION STATE
// ================================
// In production, use Redis or database for persistence
let automationInterval: NodeJS.Timeout | null = null;
let isAutomationRunning = false;
let isCleanupRunning = false;
let automationTestMode = false;

// ================================
// CORE CLEANUP FUNCTION
// ================================
async function performAutomatedCleanup() {
  // Prevent concurrent cleanups
  if (isCleanupRunning) {
    console.log('⏳ Cleanup already in progress, skipping...');
    return;
  }

  try {
    isCleanupRunning = true;
    const timestamp = new Date().toISOString();
    const mode = automationTestMode ? 'TEST (1 day)' : 'PRODUCTION (3 months)';
    
    console.log(`🕐 [${timestamp}] Starting automated storage cleanup...`);
    console.log(`⚙️ Automation mode: ${mode}`);
    
    const result = await cleanupOldAttendancePhotos(automationTestMode);
    
    if (result.success) {
      console.log(`✅ [${timestamp}] Automated storage cleanup completed successfully`);
      console.log(`📊 Records cleaned: ${result.recordsCleaned}`);
      console.log(`💾 Space saved: ${result.estimatedSavingsMB} MB`);
    } else {
      console.log(`ℹ️ [${timestamp}] No cleanup needed: ${result.message}`);
    }
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Automated storage cleanup failed:`, error);
  } finally {
    isCleanupRunning = false;
  }
}

// ================================
// AUTOMATION CONTROL HELPERS
// ================================
async function startAutomation(runImmediately: boolean, testInterval: boolean) {
  // Set test mode for automation
  automationTestMode = testInterval;
  
  // Run immediate cleanup if requested
  if (runImmediately) {
    console.log('🚀 Starting automation with immediate first run');
    await performAutomatedCleanup();
  }

  // Configure interval timing
  const intervalMs = testInterval ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000; // 5min vs 24h
  const intervalLabel = testInterval ? '5-minute' : '24-hour';
  const cutoffLabel = automationTestMode ? '1-day' : '3-month';

  // Start the automation timer
  automationInterval = setInterval(performAutomatedCleanup, intervalMs);
  isAutomationRunning = true;
  
  console.log(`🚀 Storage automation started with ${intervalLabel} interval`);
  console.log(`🔧 Automation will use ${cutoffLabel} cutoff for photo deletion`);
  
  return {
    success: true,
    message: runImmediately 
      ? `Automation started with immediate cleanup completed (${intervalLabel} interval)`
      : `Automation started successfully (${intervalLabel} interval)`,
    isRunning: true,
    immediateRun: runImmediately,
    testMode: testInterval
  };
}

function stopAutomation() {
  if (automationInterval) {
    clearInterval(automationInterval);
    automationInterval = null;
  }
  isAutomationRunning = false;
  automationTestMode = false;
  
  console.log('🛑 Storage automation stopped');
  
  return {
    success: true,
    message: 'Automation stopped successfully',
    isRunning: false
  };
}

function getAutomationStatus() {
  const mode = automationTestMode ? '1-day test mode' : '3-month production mode';
  
  return {
    success: true,
    isRunning: isAutomationRunning,
    isCleanupRunning,
    testMode: automationTestMode,
    message: isAutomationRunning 
      ? `Automation is running (${mode})`
      : 'Automation is stopped'
  };
}

// ================================
// API ROUTE HANDLERS
// ================================
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'start': {
        if (isAutomationRunning) {
          return NextResponse.json({
            success: false,
            message: 'Automation is already running'
          });
        }

        const runImmediately = searchParams.get('immediate') === 'true';
        const testInterval = searchParams.get('testInterval') === 'true';
        
        const result = await startAutomation(runImmediately, testInterval);
        return NextResponse.json(result);
      }

      case 'stop': {
        const result = stopAutomation();
        return NextResponse.json(result);
      }

      case 'status': {
        const result = getAutomationStatus();
        return NextResponse.json(result);
      }

      case 'trigger': {
        await performAutomatedCleanup();
        return NextResponse.json({
          success: true,
          message: 'Manual cleanup triggered successfully'
        });
      }

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
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'trigger': {
        await performAutomatedCleanup();
        return NextResponse.json({
          success: true,
          message: 'Manual cleanup triggered successfully'
        });
      }

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action for POST request. Use: trigger'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Manual cleanup failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Manual cleanup failed'
    }, { status: 500 });
  }
}
