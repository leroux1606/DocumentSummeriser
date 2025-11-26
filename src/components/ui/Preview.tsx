import { memo, useEffect, useState, useCallback } from 'react';
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { useFileUploadStore } from '../../store/useFileUploadStore';
import { readFileAsText, readFileAsDataURL, formatFileSize } from '../../utils/fileUtils';

export const Preview = memo(() => {
  const { preview, closePreview } = useFileUploadStore();
  const { isOpen, file } = preview;

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  // Load file content
  useEffect(() => {
    if (!file) {
      setContent(null);
      setError(null);
      return;
    }

    const loadContent = async () => {
      setLoading(true);
      setError(null);

      try {
        if (file.category === 'image') {
          const dataUrl = await readFileAsDataURL(file.file);
          setContent(dataUrl);
        } else if (file.category === 'text' || file.extension === 'md' || file.extension === 'txt') {
          const text = await readFileAsText(file.file);
          setContent(text);
        } else if (file.category === 'document' && file.extension === 'pdf') {
          // For PDF, we'll create an object URL
          setContent(URL.createObjectURL(file.file));
        } else {
          setError('Preview not available for this file type');
        }
      } catch (err) {
        setError('Failed to load preview');
        console.error('Preview error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();

    // Cleanup
    return () => {
      if (content && file?.extension === 'pdf') {
        URL.revokeObjectURL(content);
      }
    };
  }, [file]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePreview();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, closePreview]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 25, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 25, 50));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(100);
  }, []);

  const handleDownload = useCallback(() => {
    if (!file) return;
    
    const url = file.url || URL.createObjectURL(file.file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (!file.url) {
      URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closePreview();
    }
  }, [closePreview]);

  if (!isOpen || !file) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 bg-surface-50">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-5 h-5 text-surface-500 flex-shrink-0" />
            <div className="min-w-0">
              <h2 id="preview-title" className="font-semibold text-surface-800 truncate">
                {file.name}
              </h2>
              <p className="text-sm text-surface-500">
                {formatFileSize(file.size)} • {file.extension.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom controls for images */}
            {file.category === 'image' && (
              <div className="flex items-center gap-1 mr-2 px-2 py-1 bg-white rounded-lg border border-surface-200">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className="p-1 rounded hover:bg-surface-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium text-surface-600 w-10 text-center">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className="p-1 rounded hover:bg-surface-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1 rounded hover:bg-surface-100"
                  title="Reset zoom"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={handleDownload}
              className="p-2 rounded-lg text-surface-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={closePreview}
              className="p-2 rounded-lg text-surface-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-surface-100 p-4">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-3" />
              <p className="text-surface-600">Loading preview...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <AlertCircle className="w-12 h-12 text-surface-400 mb-3" />
              <p className="text-surface-600 font-medium">{error}</p>
              <p className="text-sm text-surface-500 mt-1">
                You can still download the file to view it locally.
              </p>
            </div>
          )}

          {!loading && !error && content && (
            <>
              {/* Image preview */}
              {file.category === 'image' && (
                <div className="flex items-center justify-center min-h-[400px]">
                  <img
                    src={content}
                    alt={file.name}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg transition-transform duration-200"
                    style={{ transform: `scale(${zoom / 100})` }}
                  />
                </div>
              )}

              {/* Text/Markdown preview */}
              {(file.category === 'text' || file.extension === 'md' || file.extension === 'txt') && (
                <div className="bg-white rounded-xl border border-surface-200 shadow-sm">
                  <pre className="p-6 text-sm text-surface-700 font-mono whitespace-pre-wrap break-words overflow-auto max-h-[60vh]">
                    {content}
                  </pre>
                </div>
              )}

              {/* PDF preview */}
              {file.extension === 'pdf' && (
                <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
                  <iframe
                    src={content}
                    title={file.name}
                    className="w-full h-[70vh]"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

Preview.displayName = 'Preview';

