import { memo, useMemo } from 'react';
import { FileX, FolderOpen } from 'lucide-react';
import { useFileUploadStore } from '../../store/useFileUploadStore';
import { FileItem } from './FileItem';

export const FileList = memo(() => {
  const { files } = useFileUploadStore();

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      // Sort by status priority: uploading > pending > processing > completed > failed > cancelled
      const statusPriority = {
        uploading: 0,
        pending: 1,
        processing: 2,
        completed: 3,
        failed: 4,
        cancelled: 5,
      };
      
      const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by name
      return a.name.localeCompare(b.name);
    });
  }, [files]);

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
          <FolderOpen className="w-8 h-8 text-surface-400" />
        </div>
        <h3 className="text-lg font-medium text-surface-700 mb-1">No files yet</h3>
        <p className="text-sm text-surface-500 text-center max-w-sm">
          Drag and drop files into the upload zone above, or click to browse your computer.
        </p>
      </div>
    );
  }

  const stats = useMemo(() => {
    const uploading = files.filter(f => f.status === 'uploading').length;
    const pending = files.filter(f => f.status === 'pending').length;
    const completed = files.filter(f => f.status === 'completed').length;
    const failed = files.filter(f => f.status === 'failed' || f.status === 'cancelled').length;
    return { uploading, pending, completed, failed, total: files.length };
  }, [files]);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium text-surface-700">
          {stats.total} file{stats.total !== 1 ? 's' : ''} in queue
        </h3>
        <div className="flex items-center gap-3 text-xs">
          {stats.uploading > 0 && (
            <span className="flex items-center gap-1 text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              {stats.uploading} uploading
            </span>
          )}
          {stats.pending > 0 && (
            <span className="text-surface-500">{stats.pending} pending</span>
          )}
          {stats.completed > 0 && (
            <span className="text-emerald-600">{stats.completed} completed</span>
          )}
          {stats.failed > 0 && (
            <span className="text-red-600">{stats.failed} failed</span>
          )}
        </div>
      </div>

      {/* File list */}
      <div className="grid gap-3">
        {sortedFiles.map((file) => (
          <FileItem key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
});

FileList.displayName = 'FileList';

