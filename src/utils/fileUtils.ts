import type { SupportedFileType, FileCategory, ValidationResult, UploadConfig } from '../types';

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Get file extension
export function getFileExtension(filename: string): string {
  const parts = filename.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

// Get file category based on extension/type
export function getFileCategory(extension: string, mimeType: string): FileCategory {
  const documentExtensions = ['pdf', 'docx', 'doc', 'rtf'];
  const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
  const spreadsheetExtensions = ['xlsx', 'xls', 'csv'];
  const textExtensions = ['txt', 'md'];

  if (documentExtensions.includes(extension) || mimeType.includes('pdf') || mimeType.includes('word')) {
    return 'document';
  }
  if (imageExtensions.includes(extension) || mimeType.startsWith('image/')) {
    return 'image';
  }
  if (spreadsheetExtensions.includes(extension) || mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return 'spreadsheet';
  }
  if (textExtensions.includes(extension) || mimeType.startsWith('text/')) {
    return 'text';
  }
  return 'other';
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  // Remove special characters but keep extension
  const extension = getFileExtension(filename);
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
  
  const sanitized = nameWithoutExt
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
  
  return extension ? `${sanitized}.${extension}` : sanitized;
}

// Validate single file
export function validateFile(file: File, config: UploadConfig): ValidationResult {
  const extension = getFileExtension(file.name) as SupportedFileType;
  
  // Check file size
  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds maximum size of ${formatFileSize(config.maxFileSize)}`,
    };
  }
  
  // Check file size is not zero
  if (file.size === 0) {
    return {
      valid: false,
      error: `File "${file.name}" is empty`,
    };
  }
  
  // Check file extension
  if (!config.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File type ".${extension}" is not supported. Allowed types: ${config.allowedExtensions.join(', ')}`,
    };
  }
  
  return { valid: true };
}

// Check for duplicate files
export function isDuplicateFile(file: File, existingFiles: { name: string; size: number }[]): boolean {
  return existingFiles.some(
    existing => existing.name === file.name && existing.size === file.size
  );
}

// Get MIME type icon color
export function getFileTypeColor(category: FileCategory): string {
  const colors: Record<FileCategory, string> = {
    document: 'text-red-500',
    image: 'text-green-500',
    spreadsheet: 'text-emerald-500',
    text: 'text-blue-500',
    other: 'text-gray-500',
  };
  return colors[category];
}

// Get file type background color
export function getFileTypeBgColor(category: FileCategory): string {
  const colors: Record<FileCategory, string> = {
    document: 'bg-red-50',
    image: 'bg-green-50',
    spreadsheet: 'bg-emerald-50',
    text: 'bg-blue-50',
    other: 'bg-gray-50',
  };
  return colors[category];
}

// Read file as text
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Read file as data URL
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Read file as array buffer
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// Create object URL with cleanup function
export function createObjectURL(file: File): { url: string; revoke: () => void } {
  const url = URL.createObjectURL(file);
  return {
    url,
    revoke: () => URL.revokeObjectURL(url),
  };
}

// Format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Default upload configuration
export const defaultUploadConfig: UploadConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxFiles: 20,
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  allowedExtensions: ['pdf', 'docx', 'doc', 'txt', 'md', 'rtf', 'csv', 'xlsx', 'xls', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'],
  concurrentUploads: 3,
};

