import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

const FileUploader = ({
  label,
  name,
  accept = 'image/*',
  multiple = false,
  required = false,
  error,
  value = null,
  onChange,
  maxFiles = 10,
}) => {
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const prevPreviewsRef = useRef([]);

  // Sync previews with value prop (only when value changes externally, e.g., form reset)
  useEffect(() => {
    // Cleanup previous previews
    prevPreviewsRef.current.forEach(preview => {
      if (preview.preview && preview.preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview.preview);
      }
    });

    let newPreviews = [];
    
    if (multiple && Array.isArray(value) && value.length > 0) {
      newPreviews = value.map((file) => ({
        file,
        preview: file instanceof File ? URL.createObjectURL(file) : file,
        name: file instanceof File ? file.name : 'image',
      }));
      setPreviews(newPreviews);
      prevPreviewsRef.current = newPreviews;
    } else if (!multiple && value) {
      const file = Array.isArray(value) ? value[0] : value;
      newPreviews = [{
        file,
        preview: file instanceof File ? URL.createObjectURL(file) : file,
        name: file instanceof File ? file.name : 'image',
      }];
      setPreviews(newPreviews);
      prevPreviewsRef.current = newPreviews;
    } else if (!value) {
      setPreviews([]);
      prevPreviewsRef.current = [];
    }
  }, [value, multiple]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      prevPreviewsRef.current.forEach(preview => {
        if (preview.preview && preview.preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview.preview);
        }
      });
    };
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Limit number of files
    const filesToProcess = multiple ? files.slice(0, maxFiles - previews.length) : files.slice(0, 1);
    
    if (filesToProcess.length === 0) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Create previews
    const newPreviews = filesToProcess.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    if (multiple) {
      const updatedPreviews = [...previews, ...newPreviews];
      setPreviews(updatedPreviews);
      prevPreviewsRef.current = updatedPreviews;
      onChange(updatedPreviews.map(p => p.file));
    } else {
      // Clear previous previews for single file
      previews.forEach(preview => {
        if (preview.preview && preview.preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview.preview);
        }
      });
      setPreviews(newPreviews);
      prevPreviewsRef.current = newPreviews;
      onChange(newPreviews[0].file);
    }
  };

  const removePreview = (index) => {
    const previewToRemove = previews[index];
    if (previewToRemove.preview && previewToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRemove.preview);
    }
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
    prevPreviewsRef.current = updatedPreviews;
    onChange(multiple ? updatedPreviews.map(p => p.file) : null);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Button */}
      <button
        type="button"
        onClick={handleClick}
        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 text-sm sm:text-base"
      >
        <Upload className="w-5 h-5" />
        <span>{multiple ? `Upload Images (${previews.length}/${maxFiles})` : 'Upload Logo'}</span>
      </button>

      {/* Previews */}
      {previews.length > 0 && (
        <div className={`mt-4 grid gap-4 ${multiple ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'}`}>
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={preview.preview}
                  alt={preview.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removePreview(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              {!multiple && (
                <p className="mt-1 text-xs text-gray-500 truncate">{preview.name}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;

