import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileUp, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useFileUploadStore } from '../../store/useFileUploadStore';
import { formatFileSize } from '../../utils/fileUtils';

export function DropZone() {
  const { addFiles, config, files, isUploading } = useFileUploadStore();
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    addFiles(acceptedFiles);
  }, [addFiles]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: config.allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: config.maxFileSize,
    maxFiles: config.maxFiles - files.length,
    disabled: isUploading,
    multiple: true,
  });

  const remainingSlots = config.maxFiles - files.length;
  const isAtLimit = remainingSlots <= 0;

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer',
        'group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        {
          'border-primary-400 bg-primary-50/50': isDragActive && !isDragReject,
          'border-red-400 bg-red-50/50': isDragReject || isAtLimit,
          'border-surface-300 bg-white hover:border-primary-400 hover:bg-primary-50/30': !isDragActive && !isDragReject && !isAtLimit,
          'opacity-50 cursor-not-allowed': isUploading,
        }
      )}
    >
      <input {...getInputProps()} />
      
      {/* Animated background gradient */}
      <div 
        className={clsx(
          'absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none',
          'bg-gradient-to-br from-primary-100/50 via-transparent to-primary-100/50',
          { 'opacity-100': isDragActive }
        )}
      />

      <div className="relative z-10 px-8 py-12 text-center">
        {/* Icon */}
        <div 
          className={clsx(
            'mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300',
            {
              'bg-primary-100 text-primary-600 scale-110': isDragActive,
              'bg-red-100 text-red-600': isDragReject || isAtLimit,
              'bg-surface-100 text-surface-500 group-hover:bg-primary-100 group-hover:text-primary-600': !isDragActive && !isDragReject && !isAtLimit,
            }
          )}
        >
          {isDragReject || isAtLimit ? (
            <AlertCircle className="w-8 h-8" />
          ) : isDragActive ? (
            <FileUp className="w-8 h-8 animate-bounce" />
          ) : (
            <Upload className="w-8 h-8 transition-transform group-hover:scale-110" />
          )}
        </div>

        {/* Text */}
        <div className="space-y-2">
          {isAtLimit ? (
            <>
              <p className="text-lg font-semibold text-red-600">
                Maximum files reached
              </p>
              <p className="text-sm text-red-500">
                Remove some files to add more
              </p>
            </>
          ) : isDragReject ? (
            <>
              <p className="text-lg font-semibold text-red-600">
                Invalid file type
              </p>
              <p className="text-sm text-red-500">
                Please drop supported file types only
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-surface-800">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-surface-500">
                or <span className="text-primary-600 font-medium">browse</span> to select files
              </p>
            </>
          )}
        </div>

        {/* Supported formats */}
        {!isAtLimit && (
          <div className="mt-6 pt-6 border-t border-surface-200">
            <p className="text-xs text-surface-400 uppercase tracking-wider mb-2">
              Supported formats
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {config.allowedExtensions.slice(0, 8).map((ext) => (
                <span
                  key={ext}
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-100 text-surface-600 text-xs font-medium"
                >
                  .{ext}
                </span>
              ))}
              {config.allowedExtensions.length > 8 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-100 text-surface-500 text-xs">
                  +{config.allowedExtensions.length - 8} more
                </span>
              )}
            </div>
            <p className="mt-3 text-xs text-surface-400">
              Max file size: {formatFileSize(config.maxFileSize)} • Max files: {config.maxFiles}
              {remainingSlots < config.maxFiles && (
                <span className="text-primary-600 ml-1">
                  ({remainingSlots} slots remaining)
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

