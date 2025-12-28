/**
 * Image Upload Component
 * Handles single or multiple image uploads with preview
 */

import { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import { formatFileSize, isValidImage, isValidDocument } from '../lib/utils';

const ImageUpload = ({ 
  onFileSelect, 
  accept = 'image/*', 
  maxSize = 5, // in MB
  label = 'Upload Images',
  maxFiles = 1,  // Default to 1 for single file upload
  required = false,
  allowDocuments = false 
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  // Determine if this is a single or multi-file upload
  const isSingleFileMode = maxFiles === 1;

  const validateFile = (file) => {
    setError('');

    // Check file type
    if (allowDocuments) {
      if (!isValidDocument(file)) {
        setError('Please upload a valid image or PDF file');
        return false;
      }
    } else {
      if (!isValidImage(file)) {
        setError('Please upload a valid image file (JPG, PNG, WEBP)');
        return false;
      }
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    setError('');
    
    // For single file mode, just take the first file
    if (isSingleFileMode) {
      const file = files[0];
      if (file && validateFile(file)) {
        setSelectedFiles([file]);
        
        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewUrls([reader.result]);
          };
          reader.readAsDataURL(file);
        } else {
          // For PDF, show a placeholder
          setPreviewUrls(['pdf']);
        }
        
        // Pass single file (not array) for single file mode
        onFileSelect(file);
      }
      return;
    }
    
    // Multi-file mode
    // Check max files limit
    if (selectedFiles.length + files.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} images`);
      return;
    }

    const validFiles = [];

    files.forEach(file => {
      if (validateFile(file)) {
        validFiles.push(file);
        
        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewUrls(prev => [...prev, reader.result]);
          };
          reader.readAsDataURL(file);
        }
      }
    });

    if (validFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(updatedFiles);
      // Pass array for multi-file mode
      onFileSelect(updatedFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
    
    // For single file mode, pass null when file is removed
    // For multi-file mode, pass the array
    if (isSingleFileMode) {
      onFileSelect(null);
    } else {
      onFileSelect(newFiles);
    }
    
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Preview Images */}
      {previewUrls.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <FiX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area - Show only if under max files */}
      {selectedFiles.length < maxFiles && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="text-gray-500">
            <FiUpload className="mx-auto text-3xl mb-2" />
            <p className="text-sm">
              Drag and drop or <span className="text-primary-500">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {allowDocuments
                ? `JPG, PNG, WEBP, PDF up to ${maxSize}MB`
                : `JPG, PNG, WEBP up to ${maxSize}MB`}
            </p>
            <p className="text-xs text-gray-400">
              {selectedFiles.length}/{maxFiles} images uploaded
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={allowDocuments ? 'image/*,.pdf' : accept}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default ImageUpload;
