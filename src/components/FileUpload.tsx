
import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  accept?: string;
  className?: string;
}

const FileUpload = ({ onFileSelect, onRemove, accept = "image/*,video/*", className = "" }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      setFileType('image');
    } else if (file.type.startsWith('video/')) {
      setFileType('video');
    }
    
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileSelect(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setFileType(null);
    onRemove();
  };

  if (preview) {
    return (
      <div className={`relative ${className}`}>
        {fileType === 'image' ? (
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg"
          />
        ) : (
          <video 
            src={preview} 
            className="w-full h-48 object-cover rounded-lg"
            controls
          />
        )}
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2"
          onClick={handleRemove}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleChange}
        accept={accept}
      />
      <label
        htmlFor="file-upload"
        className={`
          relative block w-full p-6 border-2 border-dashed rounded-lg cursor-pointer
          transition-colors duration-200
          ${dragActive 
            ? 'border-purple-400 bg-purple-50' 
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className="flex justify-center gap-2 mb-2">
            <ImageIcon className="w-8 h-8 text-gray-400" />
            <Video className="w-8 h-8 text-gray-400" />
          </div>
          <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            Drag and drop your files here, or{' '}
            <span className="text-purple-600 font-medium">browse</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supports images and videos
          </p>
        </div>
      </label>
    </div>
  );
};

export default FileUpload;
