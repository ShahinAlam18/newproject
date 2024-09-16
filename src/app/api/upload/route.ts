import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import uniqid from 'uniqid';

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Initialize the S3 client
    const s3Client = new S3Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY as string,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      },
    });

    // Generate a unique filename
    const newFilename = `${uniqid()}-${file.name}`;

    // Get the file data as an array buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    const bucketName = 'shahin-job-board';
    
    // Send the file to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: newFilename,
      ACL: 'public-read', // Make file publicly readable
      Body: buffer,
      ContentType: file.type, // Ensure the correct content type
    }));

    // Return the uploaded file's URL
    return NextResponse.json({
      newFilename,
      url: `https://${bucketName}.s3.amazonaws.com/${newFilename}`,
    });
  } catch (error) {
    console.error("File upload failed:", error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
