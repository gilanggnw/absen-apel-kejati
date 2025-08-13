import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File;
    const employeeNip = formData.get('employeeNip') as string;
    const oldFilename = formData.get('oldFilename') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!employeeNip) {
      return NextResponse.json({ error: 'Employee NIP is required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, JPEG, and PNG files are allowed' }, 
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' }, 
        { status: 400 }
      );
    }

    // Generate filename based on NIP and file extension
    const fileExtension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
    const filename = `${employeeNip}.${fileExtension}`;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define file path in public directory
    const filePath = path.join(process.cwd(), 'public', filename);

    // Delete old photo if it exists and is different from the new one
    if (oldFilename && oldFilename !== filename) {
      const oldFilePath = path.join(process.cwd(), 'public', oldFilename);
      if (existsSync(oldFilePath)) {
        try {
          await unlink(oldFilePath);
          console.log(`Deleted old photo: ${oldFilename}`);
        } catch (error) {
          console.error('Error deleting old photo:', error);
          // Don't fail the upload if we can't delete the old file
        }
      }
    }

    // Write new file
    await writeFile(filePath, buffer);
    console.log(`Photo uploaded successfully: ${filename}`);

    return NextResponse.json({ 
      success: true, 
      filename,
      message: 'Photo uploaded successfully' 
    });

  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Define file path in public directory
    const filePath = path.join(process.cwd(), 'public', filename);

    // Delete file if it exists
    if (existsSync(filePath)) {
      await unlink(filePath);
      console.log(`Deleted photo: ${filename}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Photo deleted successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: true, 
        message: 'Photo not found (already deleted)' 
      });
    }

  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' }, 
      { status: 500 }
    );
  }
}
