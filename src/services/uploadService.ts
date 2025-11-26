import type { UploadResponse, UploadProgress } from '../types';

// Simulated upload delay range (ms)
const MIN_UPLOAD_TIME = 1500;
const MAX_UPLOAD_TIME = 4000;

// Simulate random failure rate (0-1)
const FAILURE_RATE = 0.05;

/**
 * Simulates file upload with progress tracking
 * In production, replace this with actual API calls
 */
export async function uploadFile(
  file: File,
  onProgress: (progress: UploadProgress) => void,
  abortController: AbortController
): Promise<UploadResponse> {
  const fileId = `file-${Date.now()}`;
  const totalSize = file.size;
  const uploadTime = MIN_UPLOAD_TIME + Math.random() * (MAX_UPLOAD_TIME - MIN_UPLOAD_TIME);
  const steps = 20;
  const stepTime = uploadTime / steps;
  
  return new Promise((resolve, reject) => {
    let currentStep = 0;
    let uploadedBytes = 0;
    
    const interval = setInterval(() => {
      // Check for abort
      if (abortController.signal.aborted) {
        clearInterval(interval);
        reject(new Error('Upload cancelled'));
        return;
      }
      
      currentStep++;
      uploadedBytes = Math.min(totalSize, Math.floor((currentStep / steps) * totalSize));
      const percentage = Math.floor((uploadedBytes / totalSize) * 100);
      
      onProgress({
        fileId,
        loaded: uploadedBytes,
        total: totalSize,
        percentage,
      });
      
      if (currentStep >= steps) {
        clearInterval(interval);
        
        // Simulate random failure
        if (Math.random() < FAILURE_RATE) {
          reject(new Error('Server error: Upload failed'));
          return;
        }
        
        // Simulate successful upload
        resolve({
          success: true,
          fileId,
          url: URL.createObjectURL(file), // In production, this would be the server URL
        });
      }
    }, stepTime);
    
    // Handle abort
    abortController.signal.addEventListener('abort', () => {
      clearInterval(interval);
      reject(new Error('Upload cancelled'));
    });
  });
}

/**
 * Batch upload multiple files with concurrency control
 */
export async function uploadFiles(
  files: { id: string; file: File; abortController: AbortController }[],
  concurrency: number,
  onProgress: (fileId: string, progress: UploadProgress) => void,
  onComplete: (fileId: string, response: UploadResponse) => void,
  onError: (fileId: string, error: Error) => void
): Promise<void> {
  const queue = [...files];
  const active: Promise<void>[] = [];
  
  const processNext = async (): Promise<void> => {
    if (queue.length === 0) return;
    
    const item = queue.shift()!;
    
    try {
      const response = await uploadFile(
        item.file,
        (progress) => onProgress(item.id, progress),
        item.abortController
      );
      onComplete(item.id, response);
    } catch (error) {
      onError(item.id, error instanceof Error ? error : new Error('Unknown error'));
    }
    
    // Process next item if queue is not empty
    if (queue.length > 0) {
      await processNext();
    }
  };
  
  // Start initial batch of concurrent uploads
  const initialBatch = Math.min(concurrency, files.length);
  for (let i = 0; i < initialBatch; i++) {
    active.push(processNext());
  }
  
  await Promise.all(active);
}

/**
 * Delete uploaded file
 * In production, this would call your API
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  return true;
}

/**
 * Get download URL for file
 * In production, this would return actual download URL
 */
export function getDownloadUrl(fileId: string, url?: string): string {
  return url || `#download-${fileId}`;
}

