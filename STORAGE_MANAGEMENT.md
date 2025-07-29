# 🗂️ Storage Management System - "Time Bomb" Feature

## 📝 Overview

This system automatically manages database storage by removing old attendance photos while preserving all attendance records. It's designed as a "time bomb" that cleans up photos older than 3 months to prevent unlimited database growth.

## 🎯 Purpose

**Problem**: Attendance photos stored as BLOBs can quickly consume database storage
**Solution**: Automated cleanup of old photos while maintaining attendance history

## 🚀 Quick Start

### Web Interface (Recommended)

1. **Login as superadmin** → Navigate to "Storage" in sidebar
2. **View Statistics** → Check current storage usage and cleanup potential  
3. **Start Automation** → Enable 24-hour automatic cleanup cycle
4. **Monitor Progress** → Real-time status and cleanup reports

### Manual Cleanup (Web Interface)

1. Login as superadmin → Navigate to "Storage"
2. Scroll to "Manual Cleanup" section
3. View current storage statistics
4. Click "Bersihkan Foto Lama" to start cleanup
5. Confirm in dialog → Monitor progress

### API-Based Control (For Developers)

You can also control the automation via API endpoints:

```bash
# Start automation
curl "http://localhost:3000/api/storage/cleanup?action=start"

# Stop automation  
curl "http://localhost:3000/api/storage/cleanup?action=stop"

# Check status
curl "http://localhost:3000/api/storage/cleanup?action=status"

# Trigger manual cleanup
curl "http://localhost:3000/api/storage/cleanup?action=trigger"

# Initialize automation on app startup
curl -X POST "http://localhost:3000/api/storage/init"
```

## ⚙️ Configuration

### Time Threshold

The cleanup removes photos from attendance records older than **3 months**. To modify this:

1. Edit `app/database/actions.ts`
2. Find `cleanupOldAttendancePhotos()` function
3. Modify the line: `threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);`
4. Change `-3` to your desired number of months

### What Gets Cleaned

- ✅ Photo blobs from `attendance.photo` field
- ✅ Only records older than 3 months
- ❌ **NOT deleted**: attendance records, timestamps, NIP, status
- ❌ **NOT deleted**: employee photos (`employees.foto`)

## 🔒 Security & Access Control

### Web Interface Access

- Only `superadmin` role can access `/storage` page
- Confirmation dialog prevents accidental deletion
- Real-time statistics before cleanup

### Internal Security

- Safe database operations with transaction handling
- Comprehensive error logging
- Graceful failure handling
- Concurrent cleanup protection

## 📊 Monitoring & Logging

### Web Interface

- Real-time storage statistics
- Before/after cleanup reports
- Success/failure notifications
- Progress indicators during cleanup

### Console Logging

```
🕐 [2024-01-15T02:00:00.000Z] Starting automated storage cleanup...
📅 Cutoff date: 15/10/2023
📊 Found 150 old records with photos
💾 Estimated space to be saved: 42.91 MB
🗑️ Successfully removed photos from 150 records
💾 Space saved: 42.91 MB
✅ [2024-01-15T02:00:05.000Z] Automated storage cleanup completed successfully
```

## 🚨 Important Notes

### ⚠️ Data Safety

- **Irreversible**: Once photos are deleted, they cannot be recovered
- **Record Preservation**: Only photo blobs are deleted, attendance records remain
- **Verification Data**: Consider impact on verification workflows

### 💾 Storage Benefits

- Prevents unlimited database growth
- Maintains recent photos for verification
- Keeps historical attendance data
- Reduces backup sizes and transfer times

### 🔄 Best Practices

1. **Test First**: Run manual cleanup on test data
2. **Monitor Impact**: Check storage statistics regularly
3. **Backup Strategy**: Ensure database backups before major cleanups
4. **Schedule Wisely**: Automation runs every 24 hours automatically
5. **Log Review**: Regularly check console logs for issues

## 📈 Expected Storage Savings

Based on typical usage:

- **Average photo size**: 500 KB - 2 MB per attendance record
- **Daily records**: 50-200 attendance entries
- **Monthly growth**: 25-400 MB
- **Quarterly cleanup**: 75-1200 MB saved

## 🔧 Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure API routes have database access
2. **Memory Issues**: Large photo cleanups may require increased memory limits
3. **Lock Errors**: System prevents multiple cleanup processes automatically

### Error Recovery

- Automatic rollback on failures
- Web interface shows detailed error messages
- All operations are logged for debugging

## 📝 System Architecture

### Internal Automation

- **Timer-based**: Uses JavaScript `setInterval()` for 24-hour cycles
- **Self-contained**: No external dependencies (cron, Task Scheduler)
- **Serverless-ready**: Perfect for cloud deployment
- **State management**: Global variables track automation status

### File Structure

```
app/
├── storage/
│   └── page.tsx              # Web interface
├── api/storage/
│   ├── cleanup/route.ts      # Main automation API
│   └── init/route.ts         # Initialization endpoint
├── database/
│   └── actions.ts            # Core cleanup functions
└── components/
    └── Sidebar.tsx           # Storage menu item
```

## 📝 Maintenance

### Regular Tasks

1. **Monthly**: Review storage statistics via web interface
2. **Quarterly**: Verify cleanup effectiveness
3. **Annually**: Review time threshold settings
4. **As Needed**: Adjust automation based on storage growth

This time bomb feature ensures your database remains manageable while preserving essential attendance data for compliance and verification purposes.

## 🚀 Web-Based Advantages

- ✅ **No external scheduling needed** - Internal JavaScript timers
- ✅ **Real-time control** - Start/stop automation via web interface
- ✅ **Live monitoring** - Status updates and statistics
- ✅ **Serverless compatible** - Works in any hosting environment
- ✅ **User-friendly** - No command line or server access required
