import { create } from 'zustand';
import type { FileUploadState, UploadFile, FileStatus, Toast } from '../types';
import { 
  generateId, 
  getFileExtension, 
  getFileCategory, 
  validateFile, 
  isDuplicateFile,
  defaultUploadConfig 
} from '../utils/fileUtils';
import { uploadFiles } from '../services/uploadService';

export const useFileUploadStore = create<FileUploadState>((set, get) => ({
  files: [],
  config: defaultUploadConfig,
  isUploading: false,
  uploadQueue: [],
  completedCount: 0,
  failedCount: 0,
  preview: {
    isOpen: false,
    file: null,
  },
  toasts: [],

  addFiles: (newFiles: File[]) => {
    const { files, config } = get();
    const existingFiles = files.map(f => ({ name: f.name, size: f.size }));
    const addedFiles: UploadFile[] = [];
    const errors: string[] = [];

    // Check max files limit
    if (files.length + newFiles.length > config.maxFiles) {
      get().addToast({
        type: 'error',
        message: `Maximum ${config.maxFiles} files allowed. Remove some files first.`,
      });
      return;
    }

    for (const file of newFiles) {
      // Check for duplicates
      if (isDuplicateFile(file, existingFiles)) {
        errors.push(`"${file.name}" is already in the queue`);
        continue;
      }

      // Validate file
      const validation = validateFile(file, config);
      if (!validation.valid) {
        errors.push(validation.error!);
        continue;
      }

      const extension = getFileExtension(file.name);
      const category = getFileCategory(extension, file.type);

      const uploadFile: UploadFile = {
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        extension,
        category,
        status: 'pending',
        progress: 0,
      };

      addedFiles.push(uploadFile);
      existingFiles.push({ name: file.name, size: file.size });
    }

    if (addedFiles.length > 0) {
      set(state => ({
        files: [...state.files, ...addedFiles],
      }));
      
      get().addToast({
        type: 'success',
        message: `${addedFiles.length} file${addedFiles.length > 1 ? 's' : ''} added to queue`,
      });
    }

    if (errors.length > 0) {
      errors.forEach(error => {
        get().addToast({
          type: 'error',
          message: error,
        });
      });
    }
  },

  removeFile: (fileId: string) => {
    const { files } = get();
    const file = files.find(f => f.id === fileId);
    
    if (file) {
      // Cancel upload if in progress
      if (file.status === 'uploading' && file.abortController) {
        file.abortController.abort();
      }
      
      // Revoke blob URL if exists
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
      
      set(state => ({
        files: state.files.filter(f => f.id !== fileId),
        uploadQueue: state.uploadQueue.filter(id => id !== fileId),
      }));
    }
  },

  clearCompleted: () => {
    const { files } = get();
    
    // Revoke blob URLs for completed files
    files.filter(f => f.status === 'completed').forEach(file => {
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
    });
    
    set(state => ({
      files: state.files.filter(f => f.status !== 'completed'),
      completedCount: 0,
    }));
  },

  clearAll: () => {
    const { files } = get();
    
    // Cancel all uploads and revoke URLs
    files.forEach(file => {
      if (file.status === 'uploading' && file.abortController) {
        file.abortController.abort();
      }
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
    });
    
    set({
      files: [],
      uploadQueue: [],
      isUploading: false,
      completedCount: 0,
      failedCount: 0,
    });
  },

  startUpload: async () => {
    const { files, config, isUploading } = get();
    
    if (isUploading) return;
    
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      get().addToast({
        type: 'warning',
        message: 'No pending files to upload',
      });
      return;
    }

    // Create abort controllers for each file
    const filesToUpload = pendingFiles.map(file => {
      const abortController = new AbortController();
      
      // Update file with abort controller
      set(state => ({
        files: state.files.map(f => 
          f.id === file.id 
            ? { ...f, abortController, status: 'uploading' as FileStatus }
            : f
        ),
      }));
      
      return {
        id: file.id,
        file: file.file,
        abortController,
      };
    });

    set({
      isUploading: true,
      uploadQueue: filesToUpload.map(f => f.id),
    });

    await uploadFiles(
      filesToUpload,
      config.concurrentUploads,
      // Progress callback
      (fileId, progress) => {
        get().updateFileProgress(fileId, progress.percentage);
      },
      // Complete callback
      (fileId, response) => {
        if (response.success) {
          get().updateFileStatus(fileId, 'completed');
          get().setFileUrl(fileId, response.url!);
          set(state => ({ completedCount: state.completedCount + 1 }));
        } else {
          get().updateFileStatus(fileId, 'failed', response.error);
          set(state => ({ failedCount: state.failedCount + 1 }));
        }
      },
      // Error callback
      (fileId, error) => {
        const isCancelled = error.message === 'Upload cancelled';
        get().updateFileStatus(
          fileId, 
          isCancelled ? 'cancelled' : 'failed', 
          isCancelled ? undefined : error.message
        );
        if (!isCancelled) {
          set(state => ({ failedCount: state.failedCount + 1 }));
        }
      }
    );

    set(state => {
      const remaining = state.files.filter(f => f.status === 'uploading');
      return {
        isUploading: remaining.length > 0,
        uploadQueue: remaining.map(f => f.id),
      };
    });

    // Show completion toast
    const { completedCount, failedCount } = get();
    if (completedCount > 0 || failedCount > 0) {
      get().addToast({
        type: failedCount > 0 ? 'warning' : 'success',
        message: `Upload complete: ${completedCount} succeeded, ${failedCount} failed`,
      });
    }
  },

  cancelUpload: (fileId: string) => {
    const { files } = get();
    const file = files.find(f => f.id === fileId);
    
    if (file?.abortController) {
      file.abortController.abort();
    }
    
    set(state => ({
      files: state.files.map(f =>
        f.id === fileId ? { ...f, status: 'cancelled' as FileStatus, progress: 0 } : f
      ),
      uploadQueue: state.uploadQueue.filter(id => id !== fileId),
    }));
  },

  cancelAllUploads: () => {
    const { files } = get();
    
    files.forEach(file => {
      if (file.status === 'uploading' && file.abortController) {
        file.abortController.abort();
      }
    });
    
    set(state => ({
      files: state.files.map(f =>
        f.status === 'uploading' 
          ? { ...f, status: 'cancelled' as FileStatus, progress: 0 }
          : f
      ),
      isUploading: false,
      uploadQueue: [],
    }));
    
    get().addToast({
      type: 'info',
      message: 'All uploads cancelled',
    });
  },

  retryUpload: (fileId: string) => {
    set(state => ({
      files: state.files.map(f =>
        f.id === fileId 
          ? { ...f, status: 'pending' as FileStatus, progress: 0, error: undefined }
          : f
      ),
      failedCount: Math.max(0, state.failedCount - 1),
    }));
  },

  retryAllFailed: () => {
    set(state => ({
      files: state.files.map(f =>
        f.status === 'failed' || f.status === 'cancelled'
          ? { ...f, status: 'pending' as FileStatus, progress: 0, error: undefined }
          : f
      ),
      failedCount: 0,
    }));
    
    get().addToast({
      type: 'info',
      message: 'Failed uploads added back to queue',
    });
  },

  updateFileProgress: (fileId: string, progress: number) => {
    set(state => ({
      files: state.files.map(f =>
        f.id === fileId ? { ...f, progress } : f
      ),
    }));
  },

  updateFileStatus: (fileId: string, status: FileStatus, error?: string) => {
    set(state => ({
      files: state.files.map(f =>
        f.id === fileId 
          ? { 
              ...f, 
              status, 
              error,
              uploadedAt: status === 'completed' ? new Date() : f.uploadedAt,
            } 
          : f
      ),
    }));
  },

  setFileUrl: (fileId: string, url: string) => {
    set(state => ({
      files: state.files.map(f =>
        f.id === fileId ? { ...f, url } : f
      ),
    }));
  },

  openPreview: (file: UploadFile) => {
    set({
      preview: {
        isOpen: true,
        file,
      },
    });
  },

  closePreview: () => {
    set({
      preview: {
        isOpen: false,
        file: null,
      },
    });
  },

  addToast: (toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    const duration = toast.duration || 4000;
    
    set(state => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    
    // Auto-remove toast
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  removeToast: (id: string) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }));
  },

  updateConfig: (config: Partial<typeof defaultUploadConfig>) => {
    set(state => ({
      config: { ...state.config, ...config },
    }));
  },
}));

