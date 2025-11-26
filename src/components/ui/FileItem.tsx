import { memo } from 'react';
import { 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  File, 
  X, 
  RefreshCw, 
  Download, 
  Eye,
  Loader2,
  Check,
  AlertCircle,
  Pause
} from 'lucide-react';
import { clsx } from 'clsx';
import type { UploadFile, FileCategory } from '../../types';
import { formatFileSize, formatDate, getFileTypeColor, getFileTypeBgColor } from '../../utils/fileUtils';
import { useFileUploadStore } from '../../store/useFileUploadStore';

interface FileItemProps {
  file: UploadFile;
}

const FileIcon = memo(({ category }: { category: FileCategory }) => {
  const iconClass = clsx('w-6 h-6', getFileTypeColor(category));
  
  switch (category) {
    case 'document':
      return <FileText className={iconClass} />;
    case 'image':
      return <FileImage className={iconClass} />;
    case 'spreadsheet':
      return <FileSpreadsheet className={iconClass} />;
    case 'text':
      return <FileText className={iconClass} />;
    default:
      return <File className={iconClass} />;
  }
});

FileIcon.displayName = 'FileIcon';

const StatusBadge = memo(({ status, error }: { status: UploadFile['status']; error?: string }) => {
  const badges = {
    pending: { bg: 'bg-surface-100', text: 'text-surface-600', label: 'Pending' },
    uploading: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Uploading' },
    processing: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Processing' },
    completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed' },
    failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
    cancelled: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Cancelled' },
  };

  const badge = badges[status];

  return (
    <div className="flex items-center gap-1.5">
      <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', badge.bg, badge.text)}>
        {status === 'uploading' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
        {status === 'completed' && <Check className="w-3 h-3 mr-1" />}
        {status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
        {status === 'cancelled' && <Pause className="w-3 h-3 mr-1" />}
        {badge.label}
      </span>
      {error && (
        <span className="text-xs text-red-500 truncate max-w-[150px]" title={error}>
          {error}
        </span>
      )}
    </div>
  );
});

StatusBadge.displayName = 'StatusBadge';

const ProgressBar = memo(({ progress, status }: { progress: number; status: UploadFile['status'] }) => {
  if (status !== 'uploading' && status !== 'processing') return null;

  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-xs text-surface-500 mb-1">
        <span>Uploading...</span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-300 ease-out',
            progress === 100 ? 'bg-emerald-500' : 'bg-primary-500'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

export const FileItem = memo(({ file }: FileItemProps) => {
  const { removeFile, cancelUpload, retryUpload, openPreview } = useFileUploadStore();

  const handleRemove = () => {
    if (file.status === 'uploading') {
      cancelUpload(file.id);
    } else {
      removeFile(file.id);
    }
  };

  const handleRetry = () => {
    retryUpload(file.id);
  };

  const handlePreview = () => {
    openPreview(file);
  };

  const handleDownload = () => {
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const canPreview = ['image', 'text', 'document'].includes(file.category);
  const canDownload = file.status === 'completed' && file.url;
  const canRetry = file.status === 'failed' || file.status === 'cancelled';

  return (
    <div 
      className={clsx(
        'group relative bg-white rounded-xl border transition-all duration-200',
        'hover:shadow-md hover:border-surface-300',
        {
          'border-surface-200': file.status !== 'failed',
          'border-red-200 bg-red-50/30': file.status === 'failed',
        }
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* File icon */}
          <div className={clsx('flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center', getFileTypeBgColor(file.category))}>
            <FileIcon category={file.category} />
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-surface-800 truncate" title={file.name}>
                  {file.name}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-sm text-surface-500">
                  <span>{formatFileSize(file.size)}</span>
                  <span className="text-surface-300">•</span>
                  <span className="uppercase text-xs">{file.extension}</span>
                  {file.uploadedAt && (
                    <>
                      <span className="text-surface-300">•</span>
                      <span>{formatDate(file.uploadedAt)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Status badge */}
              <StatusBadge status={file.status} error={file.error} />
            </div>

            {/* Progress bar */}
            <ProgressBar progress={file.progress} status={file.status} />
          </div>
        </div>

        {/* Actions */}
        <div 
          className={clsx(
            'flex items-center justify-end gap-1 mt-3 pt-3 border-t border-surface-100',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
          )}
        >
          {canPreview && (
            <button
              onClick={handlePreview}
              className="p-2 rounded-lg text-surface-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          
          {canDownload && (
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg text-surface-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          
          {canRetry && (
            <button
              onClick={handleRetry}
              className="p-2 rounded-lg text-surface-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              title="Retry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={handleRemove}
            className="p-2 rounded-lg text-surface-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            title={file.status === 'uploading' ? 'Cancel' : 'Remove'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

FileItem.displayName = 'FileItem';

