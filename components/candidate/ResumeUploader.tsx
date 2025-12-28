'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

interface ResumeUploaderProps {
  onUploadComplete?: (data: any) => void;
  maxSize?: number;
}

export default function ResumeUploader({
  onUploadComplete,
  maxSize = 10 * 1024 * 1024, // 10MB
}: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsing, setParsing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      // Validate file size
      if (selectedFile.size > maxSize) {
        toast.error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Only PDF and Word documents are allowed');
        return;
      }

      setFile(selectedFile);
    }
  }, [maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Start parsing
      setParsing(true);
      setProgress(0);

      // Simulate parsing progress
      const parseInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(parseInterval);
            setParsing(false);
            setProgress(100);
            
            // Call completion callback
            if (onUploadComplete) {
              onUploadComplete(data);
            }
            
            toast.success('Resume uploaded and parsed successfully!');
            return 90;
          }
          return prev + 10;
        });
      }, 150);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload resume');
      setUploading(false);
      setParsing(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setProgress(0);
    setUploading(false);
    setParsing(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your Resume</CardTitle>
        <CardDescription>
          Upload your resume to get AI-powered suggestions and apply for jobs faster
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {!file ? (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-primary hover:bg-primary/5"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your resume here'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX (Max {formatFileSize(maxSize)})
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)} • {file.type}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress */}
              {(uploading || parsing) && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{parsing ? 'Parsing resume...' : 'Uploading...'}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={uploading || parsing}
                  className="flex-1"
                >
                  {uploading ? 'Uploading...' : parsing ? 'Parsing...' : 'Upload & Parse'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRemove}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center p-4 rounded-lg bg-secondary">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium">AI-Powered Parsing</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Extract skills, experience, and education automatically
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium">Smart Suggestions</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Get personalized improvement suggestions
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium">Better Matches</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Increase your chances with optimized applications
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}