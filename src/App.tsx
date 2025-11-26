import { 
  DropZone, 
  FileList, 
  ActionBar, 
  Preview, 
  ToastContainer 
} from './components/ui';
import { FileUp, Github, Settings } from 'lucide-react';
import { useState } from 'react';
import { useFileUploadStore } from './store/useFileUploadStore';
import { formatFileSize } from './utils/fileUtils';

function SettingsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { config, updateConfig } = useFileUploadStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-surface-800 mb-4">Upload Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Max File Size
            </label>
            <select
              value={config.maxFileSize}
              onChange={(e) => updateConfig({ maxFileSize: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-surface-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={10 * 1024 * 1024}>10 MB</option>
              <option value={25 * 1024 * 1024}>25 MB</option>
              <option value={50 * 1024 * 1024}>50 MB</option>
              <option value={100 * 1024 * 1024}>100 MB</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Max Files
            </label>
            <select
              value={config.maxFiles}
              onChange={(e) => updateConfig({ maxFiles: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-surface-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={5}>5 files</option>
              <option value={10}>10 files</option>
              <option value={20}>20 files</option>
              <option value={50}>50 files</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Concurrent Uploads
            </label>
            <select
              value={config.concurrentUploads}
              onChange={(e) => updateConfig({ concurrentUploads: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-surface-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={1}>1 at a time</option>
              <option value={2}>2 at a time</option>
              <option value={3}>3 at a time</option>
              <option value={5}>5 at a time</option>
            </select>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-surface-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const { config } = useFileUploadStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50/30 to-surface-100">
      {/* Background pattern */}
      <div 
        className="fixed inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="relative">
        {/* Header */}
        <header className="border-b border-surface-200/50 bg-white/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
                  <FileUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-surface-800">Document Uploader</h1>
                  <p className="text-xs text-surface-500">Upload, manage & preview your documents</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 transition-colors"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <a
                  href="https://github.com/leroux1606/DocumentSummeriser"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 transition-colors"
                  title="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Info banner */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-xl shadow-primary-500/20">
              <h2 className="text-2xl font-bold mb-2">Upload Your Documents</h2>
              <p className="text-primary-100 text-sm mb-4">
                Drag and drop files or click to browse. Supports PDF, Word, text, images, and more.
              </p>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="bg-white/10 rounded-lg px-3 py-1.5">
                  Max size: {formatFileSize(config.maxFileSize)}
                </div>
                <div className="bg-white/10 rounded-lg px-3 py-1.5">
                  Max files: {config.maxFiles}
                </div>
                <div className="bg-white/10 rounded-lg px-3 py-1.5">
                  Concurrent: {config.concurrentUploads}
                </div>
              </div>
            </div>

            {/* Upload zone */}
            <DropZone />

            {/* Action bar */}
            <ActionBar />

            {/* File list */}
            <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
              <FileList />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-surface-200/50 bg-white/30 mt-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-surface-500">
              Built with React, TypeScript, and Tailwind CSS
            </p>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <Preview />
      <ToastContainer />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

export default App;

