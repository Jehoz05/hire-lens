import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// For production, use AWS S3 or similar cloud storage
// For development, we'll use local file system

export async function saveFile(file: File): Promise<{ url: string; buffer: Buffer }> {
  try {
    // In production, upload to S3
    if (process.env.NODE_ENV === 'production' && process.env.AWS_ACCESS_KEY_ID) {
      return await uploadToS3(file);
    }

    // In development, simulate upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate a unique filename
    const fileName = `${uuidv4()}-${file.name.replace(/\s+/g, '-')}`;
    const url = `/uploads/${fileName}`;
    
    // In a real app, you would save the file to disk or cloud storage
    // For now, we'll just return a mock URL
    return { url, buffer };
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error('Failed to upload file');
  }
}

async function uploadToS3(file: File): Promise<{ url: string; buffer: Buffer }> {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${uuidv4()}-${file.name.replace(/\s+/g, '-')}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: `resumes/${fileName}`,
    Body: buffer,
    ContentType: file.type,
    ACL: 'public-read',
  });

  await s3Client.send(command);

  const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/resumes/${fileName}`;
  
  return { url, buffer };
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only PDF and Word documents are allowed' };
  }

  // Check file extension
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    return { valid: false, error: 'Invalid file extension' };
  }

  return { valid: true };
}