# Document Uploader

A modern, production-ready document uploader application built with React 18, TypeScript, and Tailwind CSS.

## Features

- **Multi-file Upload**: Drag & drop or click to upload multiple files
- **File Type Validation**: Supports PDF, Word, text, markdown, images, and more
- **File Size Limits**: Configurable max file size (default 50MB)
- **Progress Tracking**: Real-time upload progress for each file
- **Batch Upload**: Upload multiple files with configurable concurrency
- **Document Preview**: Preview images, PDFs, and text files inline
- **File Management**: Download, delete, retry failed uploads
- **Status Indicators**: Visual feedback for pending, uploading, completed, failed states
- **Toast Notifications**: User-friendly error and success messages
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Keyboard navigation and screen reader support

## Supported File Types

- **Documents**: PDF, DOCX, DOC, RTF
- **Text**: TXT, MD (Markdown)
- **Spreadsheets**: XLSX, XLS, CSV
- **Images**: PNG, JPG, JPEG, GIF, WebP, SVG

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **react-dropzone** - Drag & drop handling
- **Lucide React** - Icons
- **Vite** - Build tool

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/leroux1606/DocumentSummeriser.git
   cd DocumentSummeriser
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser** at `http://localhost:3000`

## Configuration

Click the settings icon in the header to configure:

- **Max File Size**: 10MB, 25MB, 50MB, or 100MB
- **Max Files**: 5, 10, 20, or 50 files
- **Concurrent Uploads**: 1-5 simultaneous uploads

## Project Structure

```
src/
├── components/
│   └── ui/
│       ├── DropZone.tsx      # Drag & drop upload zone
│       ├── FileList.tsx      # File queue display
│       ├── FileItem.tsx      # Individual file card
│       ├── ActionBar.tsx     # Upload actions (start, cancel, clear)
│       ├── Preview.tsx       # Document preview modal
│       ├── Toast.tsx         # Notification toasts
│       └── index.ts          # Component exports
├── services/
│   └── uploadService.ts      # Upload API service (mock)
├── store/
│   └── useFileUploadStore.ts # Zustand state management
├── types/
│   └── index.ts              # TypeScript type definitions
├── utils/
│   └── fileUtils.ts          # File utility functions
├── App.tsx                   # Main application
├── main.tsx                  # Entry point
└── index.css                 # Global styles
```

## API Integration

The current implementation uses a mock upload service. To connect to a real API:

1. Update `src/services/uploadService.ts`
2. Replace the simulated upload with actual `fetch`/`axios` calls
3. Configure your API endpoint and authentication

Example:
```typescript
export async function uploadFile(file: File, onProgress: (progress: UploadProgress) => void) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    // Add headers, auth tokens, etc.
  });

  return response.json();
}
```

## Building for Production

```bash
pnpm build
```

The built files will be in the `dist/` directory.

## Preview Production Build

```bash
pnpm preview
```

## License

MIT License - feel free to use this project for personal or commercial purposes.
