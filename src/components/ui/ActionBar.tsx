import { memo, useMemo } from 'react';
import { 
  Upload, 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  XCircle,
  Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { useFileUploadStore } from '../../store/useFileUploadStore';

export const ActionBar = memo(() => {
  const { 
    files, 
    isUploading, 
    startUpload, 
    cancelAllUploads, 
    clearCompleted, 
    clearAll,
    retryAllFailed 
  } = useFileUploadStore();

  const counts = useMemo(() => ({
    pending: files.filter(f => f.status === 'pending').length,
    uploading: files.filter(f => f.status === 'uploading').length,
    completed: files.filter(f => f.status === 'completed').length,
    failed: files.filter(f => f.status === 'failed' || f.status === 'cancelled').length,
    total: files.length,
  }), [files]);

  const hasFiles = counts.total > 0;
  const hasPending = counts.pending > 0;
  const hasCompleted = counts.completed > 0;
  const hasFailed = counts.failed > 0;

  if (!hasFiles) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-surface-50 rounded-xl border border-surface-200">
      {/* Upload button */}
      <button
        onClick={startUpload}
        disabled={isUploading || !hasPending}
        className={clsx(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
          hasPending && !isUploading
            ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow'
            : 'bg-surface-200 text-surface-400 cursor-not-allowed'
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading... ({counts.uploading})
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload {hasPending ? `(${counts.pending})` : 'All'}
          </>
        )}
      </button>

      {/* Cancel all */}
      {isUploading && (
        <button
          onClick={cancelAllUploads}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                     bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          <XCircle className="w-4 h-4" />
          Cancel All
        </button>
      )}

      {/* Retry failed */}
      {hasFailed && !isUploading && (
        <button
          onClick={retryAllFailed}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                     bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Failed ({counts.failed})
        </button>
      )}

      <div className="flex-1" />

      {/* Clear completed */}
      {hasCompleted && (
        <button
          onClick={clearCompleted}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                     bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          Clear Completed ({counts.completed})
        </button>
      )}

      {/* Clear all */}
      <button
        onClick={clearAll}
        disabled={isUploading}
        className={clsx(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
          isUploading
            ? 'bg-surface-100 text-surface-400 cursor-not-allowed'
            : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
        )}
      >
        <Trash2 className="w-4 h-4" />
        Clear All
      </button>
    </div>
  );
});

ActionBar.displayName = 'ActionBar';

