// File upload status
export type FileStatus = 
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

// Supported file types
export type SupportedFileType = 
  | 'pdf'
  | 'docx'
  | 'doc'
  | 'txt'
  | 'md'
  | 'rtf'
  | 'csv'
  | 'xlsx'
  | 'xls'
  | 'png'
  | 'jpg'
  | 'jpeg'
  | 'gif'
  | 'webp'
  | 'svg';

// File category for grouping
export type FileCategory = 'document' | 'image' | 'spreadsheet' | 'text' | 'other';

// Upload file metadata
export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  extension: SupportedFileType | string;
  category: FileCategory;
  status: FileStatus;
  progress: number;
  error?: string;
  uploadedAt?: Date;
  url?: string;
  thumbnail?: string;
  abortController?: AbortController;
}

// Upload configuration
export interface UploadConfig {
  maxFileSize: number; // in bytes
  maxFiles: number;
  allowedTypes: string[];
  allowedExtensions: SupportedFileType[];
  concurrentUploads: number;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Upload progress event
export interface UploadProgress {
  fileId: string;
  loaded: number;
  total: number;
  percentage: number;
}

// API response types
export interface UploadResponse {
  success: boolean;
  fileId?: string;
  url?: string;
  error?: string;
}

// Preview state
export interface PreviewState {
  isOpen: boolean;
  file: UploadFile | null;
}

// Toast notification
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Store state
export interface FileUploadState {
  files: UploadFile[];
  config: UploadConfig;
  isUploading: boolean;
  uploadQueue: string[];
  completedCount: number;
  failedCount: number;
  preview: PreviewState;
  toasts: Toast[];
  
  // Actions
  addFiles: (files: File[]) => void;
  removeFile: (fileId: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  startUpload: () => void;
  cancelUpload: (fileId: string) => void;
  cancelAllUploads: () => void;
  retryUpload: (fileId: string) => void;
  retryAllFailed: () => void;
  updateFileProgress: (fileId: string, progress: number) => void;
  updateFileStatus: (fileId: string, status: FileStatus, error?: string) => void;
  setFileUrl: (fileId: string, url: string) => void;
  openPreview: (file: UploadFile) => void;
  closePreview: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  updateConfig: (config: Partial<UploadConfig>) => void;
}

